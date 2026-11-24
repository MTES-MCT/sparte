import React, { Dispatch, ForwardedRef, MutableRefObject, RefObject, SetStateAction, forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type * as maplibregl from 'maplibre-gl';
import { useGetEnvironmentQuery } from '@services/api';
import type { NationalMapFeature } from '@services/api';
import type { HoveredLand } from './ClassLegend';
import TipSheet from './components/stage/TipSheet';
import { DIMMED_OPACITY, GRID_FILL, IMAGE_MASK_FILL, IMAGE_SOURCE_PREFIX, LANDS_FILL, LANDS_HALO } from './components/stage/gridLayers';
import type { GridLands } from './components/stage/gridLayers';
import { followPointer } from './components/stage/gridPointer';
import type { GridPointer, LiveGrid, TouchedReading } from './components/stage/gridPointer';
import { MapContainer, StageMapStatus, createStageMap, useTilesAvailability } from './components/stage/mapLibre';
import { exportMapPng } from './components/stage/exportPng';
import OverviewButton, { ZoomControlsCorner } from './components/stage/OverviewButton';
import { useGridDetail } from './components/stage/useGridDetail';
import type { GridDetailView } from './components/stage/useGridDetail';
import { useCellsLayer, useCellsMemory, useImageLayers, useImageMask, useImageRange, useInsetImages, useLandsLayers, useLandsOnImage, useZoneMarks } from './components/stage/useGridLayers';
import { useOverviewCamera } from './components/stage/useOverviewCamera';
import type { ExportLegend, MapImageInfo } from './domain/frame/exportImage';
import type { GridRender } from './domain/frame/types';
import type { GridCells, GridImage, GridStage } from './domain/grid/cells';
import { tipOf } from './domain/tip';
import { toLngLatCollection } from './gridded';

// Carte MapLibre de mailles carrées en aplat, sur le fond des territoires de la zone (contours et
// clic pour descendre d'un niveau, comme la carte Highcharts). Elle ne sait pas ce que sont ses
// mailles : leur fichier, leur valeur et leurs classes lui sont décrits (voir GridCells). La même
// carte sert la consommation carroyée, toutes destinations comprises, et les sols artificialisés :
// passer de l'une à l'autre remplace ses mailles, pas elle. Aux grands zooms, une carte qui en
// décrit dessine les objets réels à la place des mailles (voir useGridDetail). Ses couches sont
// tenues à jour par les effets de useGridLayers, son pointeur par gridPointer.

// Réponse de l'éditeur de l'image pour une tuile sans donnée : ce n'est pas une panne
const NOTHING_HERE_STATUS = 404;
// Marge laissée autour des territoires cadrés, en pixels, quand la carte passe sous la légende
const FRAME_MARGIN_PX = 24;
// Coin des boutons de zoom et du retour à la vue d'ensemble : le haut de la carte est à la légende
const ZOOM_CONTROLS: ZoomControlsCorner = 'bottom-left';

const NOTICE_UNSUPPORTED = "Cette carte ne peut pas être affichée : votre navigateur ne prend pas en charge WebGL.";


export interface GriddedMapHandle {
    exportPng: () => void;
}

interface GriddedMapProps {
    // Zone dessinée : la carte est recadrée sur ses territoires quand elle change
    zone: string;
    // Ce que la carte dessine : territoires en coordonnées projetées (EPSG:3857), mailles, objets
    render: GridRender;
    // Maille des territoires dessinés
    scale: string;
    // Place de la légende sous laquelle la carte passe, en pixels : la carte occupe toute la scène,
    // et cadre ses territoires hors de cette place. Sans elle, la carte s'arrête à la légende.
    covered?: { top: number; left: number };
    // Petite carte : les territoires d'outre-mer rapprochés de l'Hexagone sont désignés par des numéros
    numberedInsets: boolean;
    // Classe des mailles mise en avant, puis classe des objets : l'une ou l'autre, selon la légende affichée
    highlightedClass: number | null;
    highlightedDetailClass: number | null;
    // Un clic sur un territoire en fait la zone affichée
    clickable: boolean;
    // La vue demandée est en cours de chargement : la carte est estompée et les clics ignorés
    busy: boolean;
    // Textes et légende de l'image exportée : ceux de ce que la carte dessine à cet instant
    exportInfo: MapImageInfo;
    exportLegend: ExportLegend;
    ariaLabel: string;
    onHover: (cell: HoveredLand | null) => void;
    // Le dernier geste a-t-il été fait au doigt ? Lu à chaque survol et à chaque clic ; sans lui, jamais
    touching?: () => boolean;
    // Emplacement de la page où la fiche de lecture des écrans tactiles est rendue
    sheetSlot?: HTMLElement | null;
    onZoneChange?: (zone: string, name?: string) => void;
    // `ready` : le fond des territoires reçus est dessiné, même sans ses mailles
    onStatusChange: (status: StageMapStatus) => void;
    // Ce que la carte dessine : ses mailles, l'image qui les remplace, ou les objets ; avec
    // l'identité de l'image de la carte, null si elle n'en a pas
    onStageChange: (stage: GridStage, imageKey: string | null) => void;
}

// La carte, et ce qu'elle pose sous le pointeur et sous le doigt : null tant qu'elle n'est pas créée
type MapHandles = {
    mapRef: MutableRefObject<maplibregl.Map | null>;
    pointerRef: MutableRefObject<GridPointer | null>;
};

type Live = MutableRefObject<LiveGrid>;

// Fichier de tuiles des mailles
type CellsTiles = {
    // Adresse du dossier des fichiers de tuiles ; null tant qu'elle n'est pas connue
    location: string | null;
    // La zone est dans l'emprise des mailles ; hors d'elle, rien à charger
    covered: boolean;
    // Présence du fichier : null tant qu'elle n'est pas connue
    available: boolean | null;
    // Adresse du fichier à dessiner ; null : la carte n'a pas de mailles à dessiner
    shownUrl: string | null;
};

const useCellsTiles = (cells: GridCells): CellsTiles => {
    const { data: environment } = useGetEnvironmentQuery({});
    const location: string | null = environment?.vector_tiles_location ?? null;
    const url = location ? `${location}/${cells.file}` : null;
    const covered = cells.texts.outside === null;
    const available = useTilesAvailability(covered ? url : null);
    return { location, covered, available, shownUrl: covered && available ? url : null };
};

// Image de la carte, sauf celle dont les tuiles ne répondent pas : la carte s'en passe et dessine
// ses mailles
const answeringImage = (image: GridImage | null, failedKey: string | null): GridImage | null => (image && image.key !== failedKey ? image : null);

type TileError = { sourceId?: string; error?: { status?: number } };

// Une tuile de l'image qui ne répond pas, autrement que par « rien à cet endroit » (404)
const isImageFailure = ({ sourceId, error }: TileError): boolean => Boolean(sourceId?.startsWith(IMAGE_SOURCE_PREFIX)) && error?.status !== NOTHING_HERE_STATUS;

// Ce que la carte fait savoir de sa vie au composant
type MapSignals = {
    setReady: Dispatch<SetStateAction<boolean>>;
    setTilesLoading: Dispatch<SetStateAction<boolean>>;
    setFailed: Dispatch<SetStateAction<boolean>>;
    setUnsupported: Dispatch<SetStateAction<boolean>>;
    setFailedImageKey: Dispatch<SetStateAction<string | null>>;
    setTouched: Dispatch<SetStateAction<TouchedReading | null>>;
};

// Création de la carte, une seule fois : ses gestionnaires d'événements lisent le dernier rendu
// dans `live`
const useStageMap = (containerRef: RefObject<HTMLDivElement>, { mapRef, pointerRef }: MapHandles, live: Live, signals: MapSignals): void => {
    useEffect(() => {
        const { setReady, setTilesLoading, setFailed, setUnsupported, setFailedImageKey, setTouched } = signals;
        if (!containerRef.current) return undefined;
        // Boutons de zoom en bas : le haut de la carte reçoit les messages (voir Banner dans
        // NationalMapChart). À gauche : sur la France entière, le coin de droite est celui de la Corse.
        const map = createStageMap(containerRef.current, { controls: ZOOM_CONTROLS });
        if (!map) {
            setUnsupported(true);
            return undefined;
        }
        mapRef.current = map;
        map.on('load', () => setReady(true));
        map.on('idle', () => setTilesLoading(false));
        map.on('error', (event) => {
            setFailed(true);
            // Une tuile de l'image qui ne répond pas : l'image est abandonnée pour cette vue, la
            // carte revient à ses mailles
            const failedImage = live.current.render.image;
            if (failedImage && isImageFailure(event as TileError)) setFailedImageKey(failedImage.key);
        });
        const pointer = followPointer(map, live, setTouched);
        pointerRef.current = pointer;

        return () => {
            mapRef.current = null;
            // L'infobulle est retirée avec la carte : restée ouverte, elle garderait ses nœuds
            pointer.tooltip.hide();
            map.remove();
        };
    }, []);
};

// Vue dessinée : ce que le pointeur et le doigt y ont lu ne vaut que pour elle
type DrawnView = { features: NationalMapFeature[]; cells: GridCells; objectsShown: boolean };

type TouchSheet = {
    touched: TouchedReading | null;
    setTouched: Dispatch<SetStateAction<TouchedReading | null>>;
};

// Ce que le pointeur et le doigt ont lu sur la vue dessinée. Rend de quoi fermer la fiche de
// lecture des écrans tactiles, et de quoi ouvrir le territoire qu'elle propose.
const useViewReadings = ({ mapRef, pointerRef }: MapHandles, live: Live, { features, cells, objectsShown }: DrawnView, { touched, setTouched }: TouchSheet) => {
    // L'infobulle et le pointeur décrivent une maille ou un objet de la vue précédente : ils
    // s'effacent quand la vue change, jusqu'au prochain mouvement du pointeur
    useEffect(() => {
        pointerRef.current?.tooltip.hide();
        const canvas = mapRef.current?.getCanvas();
        if (canvas) canvas.style.cursor = '';
    }, [mapRef, pointerRef, features, cells, objectsShown]);

    // La fiche de lecture et son repère aussi : ils décrivent ce qu'un appui a lu sur cette vue
    const closeTouched = useCallback(() => {
        pointerRef.current?.touchMark.hide();
        pointerRef.current?.outline.hide();
        setTouched(null);
    }, [pointerRef, setTouched]);
    useEffect(closeTouched, [features, cells, objectsShown, closeTouched]);
    const opens = touched?.opens ?? null;
    const openTouched = useCallback(() => {
        const { busy, onZoneChange } = live.current;
        if (opens && !busy) onZoneChange?.(opens.zone, opens.name);
    }, [live, opens]);
    return { closeTouched, openTouched };
};

// Vue d'ensemble de la zone : ses territoires, cadrés hors de la place de la légende quand la
// carte passe sous elle ; null sans territoire
const useOverview = (lands: GridLands, covered: GriddedMapProps['covered']) => {
    const top = covered?.top ?? null;
    const left = covered?.left ?? null;
    return useMemo(() => {
        if (!lands.bounds) return null;
        if (top === null || left === null) return { bounds: lands.bounds };
        const padding = { top: FRAME_MARGIN_PX + top, left: FRAME_MARGIN_PX + left, right: FRAME_MARGIN_PX, bottom: FRAME_MARGIN_PX };
        return { bounds: lands.bounds, padding };
    }, [lands, top, left]);
};

// La légende suit ce qui est dessiné : les objets priment sur l'image, l'image sur les mailles
const stageOf = (imageShown: boolean, objectsShown: boolean): GridStage => {
    if (objectsShown) return 'objects';
    return imageShown ? 'image' : 'cells';
};

// Message des objets ou de l'image ; null : aucun. `wanted` : l'image de la carte, même abandonnée.
const partialNoticeOf = (objects: GridDetailView, wanted: GridImage | null, image: GridImage | null): string | null => {
    // Sur une carte à image, des objets qui manquent ne laissent pas des mailles mais l'image
    const notice = objects.notice && image ? image.partialNotice : objects.notice;
    // L'image ne répond pas : la carte le dit, sous ses mailles de secours
    if (notice === null && wanted && !image) return wanted.failedNotice;
    return notice;
};

// Ce que la carte sait de sa vie
type MapHealth = {
    // Territoires dont la carte a fini de dessiner le fond
    drawnFeatures: NationalMapFeature[] | null;
    // Erreur signalée par la carte
    failed: boolean;
    // Le navigateur n'a pas pu créer la carte (WebGL absent)
    unsupported: boolean;
    tilesLoading: boolean;
};

type Shown = {
    render: GridRender;
    tiles: CellsTiles;
    objects: GridDetailView;
    // Image de la carte, quand ses tuiles répondent
    image: GridImage | null;
};

const noticeOf = ({ render, tiles, objects, image }: Shown, unsupported: boolean): string | null => {
    if (unsupported) return NOTICE_UNSUPPORTED;
    if (render.features.length > 0 && !tiles.covered) return render.cells.texts.outside;
    // Sans ses mailles, la carte le dit ; plus quand elle dessine à leur place tous les objets de la vue
    const objectsSuffice = objects.shown && objects.notice === null;
    if (tiles.available === false && !objectsSuffice) return render.cells.texts.missing;
    return partialNoticeOf(objects, render.image, image);
};

// État communiqué au parent, qui affiche le message ou l'indicateur de chargement sur la carte
const statusOf = (shown: Shown, { drawnFeatures, failed, unsupported, tilesLoading }: MapHealth): StageMapStatus => {
    const { render, tiles } = shown;
    const notice = noticeOf(shown, unsupported);
    const tilesPending = tiles.covered && tiles.available === null;
    return {
        ready: drawnFeatures === render.features || failed || unsupported,
        loading: notice === null && (tilesLoading || tilesPending),
        notice,
    };
};

// L'image exportée porte les textes et la légende du dernier rendu
const useExportHandle = (ref: ForwardedRef<GriddedMapHandle>, { mapRef, pointerRef }: MapHandles, info: MapImageInfo, legend: ExportLegend): void => {
    const exported = useRef({ info, legend });
    exported.current = { info, legend };
    useImperativeHandle(
        ref,
        () => ({
            exportPng: () => {
                const map = mapRef.current;
                if (!map) return;
                // Le contour d'un élément touché, que rien n'a effacé depuis, ne figure pas dans l'image
                pointerRef.current?.outline.hide();
                exportMapPng(map, () => exported.current);
            },
        }),
        [mapRef, pointerRef],
    );
};

const GriddedMap = forwardRef<GriddedMapHandle, GriddedMapProps>((props, ref) => {
    const { zone, render, scale, covered, numberedInsets, highlightedClass, highlightedDetailClass, clickable, busy, exportInfo, exportLegend, ariaLabel } = props;
    const { onHover, touching, sheetSlot, onZoneChange, onStatusChange, onStageChange } = props;
    const { features, insets, separation, parentBoundary, cells, detail } = render;
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    // Infobulle, repère du point touché et contour de l'élément survolé, ou touché tant que sa
    // fiche est ouverte
    const pointerRef = useRef<GridPointer | null>(null);
    const handles: MapHandles = { mapRef, pointerRef };
    // Ce qu'un appui du doigt a lu, avec le territoire que sa fiche propose d'ouvrir
    const [touched, setTouched] = useState<TouchedReading | null>(null);
    const [ready, setReady] = useState(false);
    const [tilesLoading, setTilesLoading] = useState(false);
    // Territoires dont la carte a fini de dessiner le fond, et erreur signalée par la carte
    const [drawnFeatures, setDrawnFeatures] = useState<NationalMapFeature[] | null>(null);
    const [failed, setFailed] = useState(false);
    // Le navigateur n'a pas pu créer la carte (WebGL absent)
    const [unsupported, setUnsupported] = useState(false);
    // Image dont les tuiles ne répondent pas : la carte s'en passe et dessine ses mailles
    const [failedImageKey, setFailedImageKey] = useState<string | null>(null);
    const image = answeringImage(render.image, failedImageKey);
    // Image dessinée à la place des mailles : la carte a atteint le zoom où elle existe. Tenu pour
    // vrai tant que la carte n'a pas dit son zoom : la légende n'annonce pas des mailles pour rien.
    const [imageInRange, setImageInRange] = useState(true);
    const imageShown = image !== null && imageInRange;

    const tiles = useCellsTiles(cells);
    const lands = useMemo(() => toLngLatCollection(features), [features]);
    const { drawn: drawnCells, showCells } = useCellsMemory(mapRef, cells);

    const detailView = useGridDetail(mapRef, {
        ready,
        detail,
        tilesLocation: tiles.location,
        cellsLayer: GRID_FILL,
        cellsMissing: tiles.available === false,
        landsLayer: LANDS_FILL,
        beforeLayer: LANDS_HALO,
        highlightedClass: highlightedDetailClass,
        dimmedOpacity: DIMMED_OPACITY,
        onObjectsHidden: showCells,
    });

    // Les gestionnaires d'événements de la carte lisent toujours les props et les objets du dernier rendu
    const shown: LiveGrid = { render, scale, clickable, busy, onHover, touching, onZoneChange, detailView, cellsMissing: tiles.available === false, imageShown };
    const live = useRef(shown);
    useLayoutEffect(() => {
        live.current = shown;
    });

    useStageMap(containerRef, handles, live, { setReady, setTilesLoading, setFailed, setUnsupported, setFailedImageKey, setTouched });
    const { closeTouched, openTouched } = useViewReadings(handles, live, { features, cells, objectsShown: detailView.shown }, { touched, setTouched });

    // Cadrage sur les territoires de la zone ; un endroit exploré (jusqu'aux objets d'une rue)
    // n'est pas perdu quand la scène change de taille ou que la maille des territoires change
    const overview = useOverview(lands, covered);
    const { moved, showOverview } = useOverviewCamera(mapRef, containerRef, { zone, overview });

    // Première couche posée au-dessus de l'image, sous laquelle elle se glisse : son masque, sinon
    // les mailles, sinon les objets, sinon les limites
    const layerAboveImage = useCallback(
        (map: maplibregl.Map): string | undefined => [IMAGE_MASK_FILL, GRID_FILL, ...live.current.detailView.layerIds(), LANDS_HALO].find((id) => map.getLayer(id)),
        [],
    );

    // Les couches, dans l'ordre où elles se glissent les unes sous les autres : le fond d'abord
    useLandsLayers(mapRef, ready, { lands, features, scale, landColor: cells.landColor }, setDrawnFeatures);
    useLandsOnImage(mapRef, ready, { lands, scale, landColor: cells.landColor, image, imageShown });
    useImageLayers(mapRef, ready, { lands, image }, layerAboveImage);
    useImageMask(mapRef, ready, { lands, features, image }, layerAboveImage);
    useInsetImages(mapRef, ready, { lands, image, insets }, layerAboveImage);
    useImageRange(mapRef, ready, image, setImageInRange);
    useZoneMarks(mapRef, ready, { separation, parentBoundary, insets, numberedInsets });
    const shownCells = { lands, tilesUrl: tiles.shownUrl, cells, highlightedClass, pictured: imageShown, hidden: detailView.replacesCells, image, detail };
    useCellsLayer(mapRef, ready, drawnCells, shownCells, setTilesLoading);

    const stage = stageOf(imageShown, detailView.shown);
    // L'identité annoncée est celle de l'image de la carte, même abandonnée : c'est pour elle que
    // l'étape « mailles » vaut alors
    const imageKey = render.image?.key ?? null;
    useEffect(() => {
        onStageChange(stage, imageKey);
    }, [stage, imageKey, onStageChange]);

    const { ready: landsDrawn, loading, notice } = statusOf({ render, tiles, objects: detailView, image }, { drawnFeatures, failed, unsupported, tilesLoading });
    useEffect(() => {
        onStatusChange({ ready: landsDrawn, loading, notice });
    }, [landsDrawn, loading, notice, onStatusChange]);

    useExportHandle(ref, handles, exportInfo, exportLegend);

    return (
        <>
            <MapContainer ref={containerRef} style={{ opacity: busy ? 0.5 : 1 }} role="img" aria-label={ariaLabel} />
            {moved && <OverviewButton onClick={showOverview} zoomControls={ZOOM_CONTROLS} />}
            {touched && (
                <TipSheet
                    slot={sheetSlot}
                    tip={tipOf(touched.reading)}
                    action={touched.opens && { label: 'Ouvrir ce territoire', onClick: openTouched }}
                    onClose={closeTouched}
                />
            )}
        </>
    );
});

GriddedMap.displayName = 'GriddedMap';

export default GriddedMap;
