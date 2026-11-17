// Effets de la carte de mailles (voir GriddedMap) : chacun tient une famille de couches à jour de
// ce que la carte doit dessiner (voir gridLayers). Le fond des territoires vient d'abord : l'image,
// son masque et les mailles se glissent entre ses couches. C'est pourquoi le fond (`lands`) figure
// dans les dépendances de leurs effets, même quand ils ne le lisent pas : ce qui se glisse dans ses
// couches est revu quand il change.
import { MutableRefObject, RefObject, useCallback, useEffect, useMemo, useRef } from 'react';
import type * as maplibregl from 'maplibre-gl';
import type { NationalMapFeature, NationalMapInset } from '@services/api';
import { insetMapLabels } from '../../domain/frame/base';
import type { GridCells, GridDetail, GridImage } from '../../domain/grid/cells';
import type { BoundaryLines } from '../../domain/parentBoundary';
import { separationLine } from '../../gridded';
import {
    DrawnCells,
    GRID_FILL,
    GridLands,
    LANDS_FILL,
    LANDS_LINE,
    LANDS_SOURCE,
    LAST_ZOOM,
    LayerAbove,
    ShownCells,
    addImage,
    addInsetImages,
    cellsFromZoom,
    drawCells,
    drawImageMask,
    drawLands,
    drawSeparation,
    imageMaskOf,
    insetImagesOf,
    landsColor,
    placedImage,
    removeImage,
    removeStaleInsetImages,
    showHiddenCells,
    styleBordersOnImage,
} from './gridLayers';
import { addLabels } from './mapLibre';
import { drawParentBoundary } from './parentBoundaryLayer';

type MapRef = RefObject<maplibregl.Map | null>;

type LandsLayers = {
    lands: GridLands;
    features: NationalMapFeature[];
    scale: string;
    // Couleur de l'aplat à sa création : elle suit ensuite les mailles et l'image (voir useLandsOnImage)
    landColor: string;
};

// Fond des territoires. `onDrawn` : la carte a fini de dessiner le fond de ces territoires.
export const useLandsLayers = (mapRef: MapRef, ready: boolean, { lands, features, scale, landColor }: LandsLayers, onDrawn: (features: NationalMapFeature[]) => void): void => {
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ready) return undefined;
        drawLands(map, lands, landColor, scale);
        // Le fond est dessiné par la première image rendue une fois sa source chargée
        const confirmDrawn = () => {
            if (!map.isSourceLoaded(LANDS_SOURCE)) return;
            map.off('render', confirmDrawn);
            onDrawn(features);
        };
        map.on('render', confirmDrawn);
        return () => {
            map.off('render', confirmDrawn);
        };
    }, [mapRef, ready, lands, features, scale, onDrawn]);
};

type LandsOnImage = {
    lands: GridLands;
    scale: string;
    landColor: string;
    // Image de la carte, et le fait qu'elle soit dessinée à la place des mailles
    image: GridImage | null;
    imageShown: boolean;
};

// Ce que l'image change au fond des territoires : l'opacité de ses limites et sa couleur
export const useLandsOnImage = (mapRef: MapRef, ready: boolean, { lands, scale, landColor, image, imageShown }: LandsOnImage): void => {
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ready || !map.getLayer(LANDS_LINE)) return;
        styleBordersOnImage(map, scale, imageShown);
    }, [mapRef, ready, lands, scale, imageShown]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ready || !map.getLayer(LANDS_FILL)) return;
        map.setPaintProperty(LANDS_FILL, 'fill-color', landsColor(landColor, image));
    }, [mapRef, ready, lands, landColor, image]);
};

// Image : sa source suit ses tuiles et son emprise
export const useImageLayers = (mapRef: MapRef, ready: boolean, { lands, image }: { lands: GridLands; image: GridImage | null }, layerAbove: LayerAbove): void => {
    const placed = useMemo(() => placedImage(image, lands.bounds), [image, lands]);
    const shownKey = useRef<string | null>(null);
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ready || !map.getLayer(LANDS_FILL)) return;
        const key = placed ? placed.key : null;
        if (shownKey.current === key) return;
        removeImage(map);
        shownKey.current = key;
        if (placed) addImage(map, placed, layerAbove(map));
    }, [mapRef, ready, lands, image, placed, layerAbove]);
};

type ImageMask = {
    lands: GridLands;
    // Territoires dessinés, au contour desquels l'image est rognée
    features: NationalMapFeature[];
    image: GridImage | null;
};

// Masque de l'image, quand elle est rognée sur les territoires dessinés
export const useImageMask = (mapRef: MapRef, ready: boolean, { lands, features, image }: ImageMask, layerAbove: LayerAbove): void => {
    const clipped = image?.clipped ?? false;
    const mask = useMemo(() => imageMaskOf(clipped, features), [clipped, features]);
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ready || !map.getLayer(LANDS_FILL)) return;
        drawImageMask(map, mask, layerAbove);
    }, [mapRef, ready, lands, mask, layerAbove]);
};

type InsetImages = { lands: GridLands; image: GridImage | null; insets: NationalMapInset[] };

// Image des cartouches d'outre-mer
export const useInsetImages = (mapRef: MapRef, ready: boolean, { lands, image, insets }: InsetImages, layerAbove: LayerAbove): void => {
    const shown = useRef(new Map<string, string>());
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ready || !map.getLayer(LANDS_FILL)) return;
        const wanted = insetImagesOf(image, insets);
        removeStaleInsetImages(map, shown.current, wanted);
        if (image) addInsetImages(map, { image, insets, wanted, shown: shown.current }, layerAbove(map));
    }, [mapRef, ready, lands, image, insets, layerAbove]);
};

// La carte dit quand elle franchit le zoom de l'image : la légende et le survol en dépendent
export const useImageRange = (mapRef: MapRef, ready: boolean, image: GridImage | null, onChange: (inRange: boolean) => void): void => {
    const fromZoom = image?.fromZoom ?? null;
    useEffect(() => {
        const map = mapRef.current;
        // Sans image, l'état ne sert pas : il garde sa valeur pour la prochaine carte qui en a une
        if (!map || !ready || fromZoom === null) return undefined;
        const update = () => onChange(map.getZoom() >= fromZoom);
        update();
        map.on('zoom', update);
        return () => {
            map.off('zoom', update);
        };
    }, [mapRef, ready, fromZoom, onChange]);
};

type ZoneMarks = {
    separation: [number, number][];
    parentBoundary: BoundaryLines;
    insets: NationalMapInset[];
    numberedInsets: boolean;
};

// Repères de la zone, posés sur ses territoires
export const useZoneMarks = (mapRef: MapRef, ready: boolean, { separation, parentBoundary, insets, numberedInsets }: ZoneMarks): void => {
    // Territoires d'outre-mer rapprochés de l'Hexagone : la ligne qui les en sépare, et leurs noms
    // ou leurs numéros sur une petite carte
    const separationFeature = useMemo(() => separationLine(separation), [separation]);
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ready) return;
        drawSeparation(map, separationFeature);
    }, [mapRef, ready, separationFeature]);
    // Limite de la zone, par-dessus les territoires qui débordent d'elle (EPCI à cheval sur
    // plusieurs départements), leurs mailles, leur image et leurs objets. Elle ne change qu'avec
    // le fond : ni une autre carte ni une autre période ne la redessinent.
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ready) return;
        drawParentBoundary(map, parentBoundary);
    }, [mapRef, ready, parentBoundary]);
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return undefined;
        return addLabels(map, insetMapLabels(insets, numberedInsets));
    }, [mapRef, insets, numberedInsets]);
};

type CellsMemory = {
    drawn: MutableRefObject<DrawnCells>;
    // Les mailles cachées sous les objets sont dessinées de nouveau, sans attendre le prochain rendu
    showCells: () => void;
};

// Ce que la carte porte de ses mailles. À part de l'effet qui les dessine (useCellsLayer) : les
// objets, suivis avant lui, rendent les mailles dès que la carte repasse sous leur zoom.
export const useCellsMemory = (mapRef: MapRef, cells: GridCells): CellsMemory => {
    const drawn = useRef<DrawnCells>({ sourceKey: null, styled: cells, visibleOpacity: 1, hidden: false, fromZoom: 0 });
    const showCells = useCallback(() => {
        if (mapRef.current) showHiddenCells(mapRef.current, drawn.current);
    }, [mapRef]);
    return { drawn, showCells };
};

type CellsLayer = ShownCells & {
    lands: GridLands;
    image: GridImage | null;
    // Objets qui remplacent les mailles aux grands zooms ; null : la carte n'en a pas
    detail: GridDetail | null;
};

// Mailles, et zooms où leurs tuiles sont demandées. `onLoading` : des mailles à lire ou à classer
// chargent.
export const useCellsLayer = (mapRef: MapRef, ready: boolean, drawn: MutableRefObject<DrawnCells>, shown: CellsLayer, onLoading: (loading: boolean) => void): void => {
    const { lands, tilesUrl, cells, highlightedClass, pictured, hidden, image, detail } = shown;
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ready || !map.getLayer(LANDS_LINE)) return;
        if (drawCells(map, drawn.current, { tilesUrl, cells, highlightedClass, pictured, hidden })) onLoading(true);
    }, [mapRef, ready, drawn, lands, tilesUrl, cells, highlightedClass, hidden, image, pictured, onLoading]);

    const fromZoom = cellsFromZoom(pictured, detail);
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ready || !map.getLayer(GRID_FILL) || drawn.current.fromZoom === fromZoom) return;
        map.setLayerZoomRange(GRID_FILL, fromZoom, LAST_ZOOM);
        drawn.current.fromZoom = fromZoom;
    }, [mapRef, ready, drawn, lands, tilesUrl, cells, fromZoom]);
};
