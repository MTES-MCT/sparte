// Couches de la carte de mailles (voir GriddedMap) : leurs identifiants, et ce que chacune pose sur
// la carte MapLibre. Rien ici ne décide du moment : les effets de useGridLayers disent quand
// dessiner, ces fonctions disent quoi.
import type * as maplibregl from 'maplibre-gl';
import type { NationalMapFeature, NationalMapInset } from '@services/api';
import { cellColorExpression, cellOpacityExpression } from '../../domain/grid/cells';
import type { GridCells, GridDetail, GridImage } from '../../domain/grid/cells';
import { imageMask } from '../../domain/grid/imageClip';
import {
    LAND_BORDER_COLOR,
    LAND_HALO_COLOR,
    borderOpacityOverData,
    haloOpacityExpression,
    haloOpacityOverData,
    landBorderStyle,
    lineWidthExpression,
    mercatorToLngLat,
    toLngLatCollection,
} from '../../gridded';
import { NO_DATA_PATTERN_ID } from '../../domain/noData';
import type { Bounds } from '../../gridded';
import { NO_DATA_COLOR } from '../../values';
import { STAGE_BACKGROUND_COLOR } from './mapLibre';
import { SEPARATION_COLOR } from './territoryOptions';

export const LANDS_SOURCE = 'national-map-lands';
export const LANDS_FILL = 'national-map-lands-fill';
// Hachures du fond, là où il signifie « pas de donnée » (voir landsHatchOpacity)
export const LANDS_NO_DATA = 'national-map-lands-no-data';
export const LANDS_HALO = 'national-map-lands-halo';
export const LANDS_LINE = 'national-map-lands-line';
const SEPARATION_SOURCE = 'national-map-grid-separation';
const SEPARATION_LINE = 'national-map-grid-separation-line';
const GRID_SOURCE = 'national-map-grid';
export const GRID_FILL = 'national-map-grid-fill';
// Une source par palier de l'image, et une couche par passe
export const IMAGE_SOURCE_PREFIX = 'national-map-image-';
const imageSourceId = (tier: number): string => `${IMAGE_SOURCE_PREFIX}${tier}`;
const imageLayerId = (tier: number, pass: number): string => `national-map-image-${tier}-${pass}`;
// Nombre de paliers et de passes au plus : ceux d'une image précédente sont retirés jusqu'à ces rangs
const MAX_IMAGE_TIERS = 3;
const MAX_IMAGE_PASSES = 3;
// Masque d'une image rognée sur les territoires dessinés : tout ce qui les entoure
const IMAGE_MASK_SOURCE = 'national-map-image-mask';
export const IMAGE_MASK_FILL = 'national-map-image-mask-fill';
// Image d'un cartouche d'outre-mer : une source par territoire, et une couche par passe
const insetSourceId = (zone: string): string => `national-map-inset-${zone}`;
const insetLayerId = (zone: string, pass: number): string => `national-map-inset-${zone}-${pass}`;

// Sous une image, les mailles ne sont plus dessinées : leurs tuiles ne sont demandées qu'un niveau
// de zoom avant les objets, à qui leurs attributs disent les départements en vue
const CELLS_ZOOMS_BEFORE_OBJECTS = 1;
export const LAST_ZOOM = 24;
// Largeur que le liseré ajoute au trait, en pixels
const LAND_HALO_EXTRA_PX = 2;
// Opacité des mailles et des objets hors de la classe mise en avant dans la légende
export const DIMMED_OPACITY = 0.12;

// Territoires de la zone en longitudes et latitudes, avec leur emprise ; null s'il n'y en a pas
export type GridLands = { collection: { type: 'FeatureCollection'; features: NationalMapFeature[] }; bounds: Bounds | null };

// Première couche posée au-dessus de l'image, sous laquelle elle se glisse
export type LayerAbove = (map: maplibregl.Map) => string | undefined;

const dropLayer = (map: maplibregl.Map, id: string): void => {
    if (map.getLayer(id)) map.removeLayer(id);
};

const dropSource = (map: maplibregl.Map, id: string): void => {
    if (map.getSource(id)) map.removeSource(id);
};

// Fond des territoires : aplat neutre sous les mailles, limites administratives par-dessus.
// `landColor` ne sert qu'à poser l'aplat : sa couleur suit ensuite les mailles et l'image (voir
// landsColor).
export const drawLands = (map: maplibregl.Map, lands: GridLands, landColor: string, scale: string): void => {
    const data = lands.collection as unknown as GeoJSON.FeatureCollection;
    const source = map.getSource(LANDS_SOURCE) as maplibregl.GeoJSONSource | undefined;
    if (source) {
        source.setData(data);
    } else {
        map.addSource(LANDS_SOURCE, { type: 'geojson', data });
        map.addLayer({ id: LANDS_FILL, type: 'fill', source: LANDS_SOURCE, paint: { 'fill-color': landColor } });
        map.addLayer({
            id: LANDS_NO_DATA,
            type: 'fill',
            source: LANDS_SOURCE,
            paint: { 'fill-pattern': NO_DATA_PATTERN_ID, 'fill-opacity': landsHatchOpacity(landColor, null) },
        });
        const joined = { 'line-join': 'round', 'line-cap': 'round' } as const;
        map.addLayer({ id: LANDS_HALO, type: 'line', source: LANDS_SOURCE, layout: joined, paint: { 'line-color': LAND_HALO_COLOR } });
        map.addLayer({ id: LANDS_LINE, type: 'line', source: LANDS_SOURCE, layout: joined, paint: { 'line-color': LAND_BORDER_COLOR } });
    }
    // Le trait suit la maille : épais pour quelques régions, léger pour des centaines de communes
    const border = landBorderStyle(scale);
    map.setPaintProperty(LANDS_LINE, 'line-width', lineWidthExpression(border.width, border.thinBelow));
    map.setPaintProperty(LANDS_HALO, 'line-width', lineWidthExpression(border.width + LAND_HALO_EXTRA_PX));
    map.setPaintProperty(LANDS_HALO, 'line-opacity', haloOpacityExpression(border));
};

// Les limites sont dessinées par-dessus la donnée : elles s'effacent aux vues larges, où elles la
// recouvriraient, que la carte montre des carreaux, des mailles ou l'image
export const fadeBordersOverData = (map: maplibregl.Map, scale: string): void => {
    map.setPaintProperty(LANDS_LINE, 'line-opacity', borderOpacityOverData(scale));
    map.setPaintProperty(LANDS_HALO, 'line-opacity', haloOpacityOverData(scale));
};

// Couleur des territoires là où aucune maille n'est dessinée : elle dépend de ce que les mailles
// mesurent. Sous l'image, translucide, le fond est celui qu'elle attend.
export const landsColor = (landColor: string, image: GridImage | null): maplibregl.ExpressionSpecification | string =>
    image ? (['step', ['zoom'], landColor, image.fromZoom, image.landColor] as maplibregl.ExpressionSpecification) : landColor;

// Opacité des hachures du fond : pleines là où le fond signifie « pas de donnée », c'est-à-dire
// sous l'image, visible où elle est transparente, et sous des mailles dont le fond est celui du
// « sans donnée » (sols artificialisés) ; nulles sous les carreaux de la consommation, dont le
// fond dit « aucune consommation ».
export const landsHatchOpacity = (landColor: string, image: GridImage | null): maplibregl.ExpressionSpecification | number => {
    const underCells = landColor === NO_DATA_COLOR ? 1 : 0;
    return image ? (['step', ['zoom'], underCells, image.fromZoom, 1] as maplibregl.ExpressionSpecification) : underCells;
};

// Image à dessiner, avec l'emprise de ses tuiles. `key` : la source suit l'adresse de ses tuiles
// et leur emprise, non la zone : d'une zone à l'autre d'une même génération, les tuiles déjà
// chargées restent dessinées, rognées par le nouveau masque, le temps que les suivantes arrivent.
export type PlacedImage = { image: GridImage; bounds: [number, number, number, number]; key: string };

// null sans image, ou sans territoire dont elle suivrait l'emprise
export const placedImage = (image: GridImage | null, lands: Bounds | null): PlacedImage | null => {
    if (!image || !lands) return null;
    const bounds = image.boundsOf(lands);
    return { image, bounds, key: `${image.tiles}|${bounds.join(',')}` };
};

export const removeImage = (map: maplibregl.Map): void => {
    for (let tier = 0; tier < MAX_IMAGE_TIERS; tier += 1) {
        for (let pass = 0; pass < MAX_IMAGE_PASSES; pass += 1) dropLayer(map, imageLayerId(tier, pass));
        dropSource(map, imageSourceId(tier));
    }
};

// L'image se glisse juste au-dessus du fond des territoires, sous les mailles, les objets et les
// limites administratives. Son emprise ne la rogne pas sur les territoires affichés : son masque
// le fait (voir drawImageMask).
export const addImage = (map: maplibregl.Map, { image, bounds }: PlacedImage, above: string | undefined): void => {
    image.tiers.slice(0, MAX_IMAGE_TIERS).forEach(({ tileSize, fromZoom }, tier) => {
        map.addSource(imageSourceId(tier), {
            type: 'raster',
            tiles: [image.tiles],
            tileSize,
            minzoom: image.minZoom,
            maxzoom: image.maxZoom,
            bounds,
            attribution: image.attribution,
        });
        // Chaque palier s'efface au zoom du suivant
        const untilZoom = image.tiers[tier + 1]?.fromZoom;
        for (let pass = 0; pass < Math.min(image.passes, MAX_IMAGE_PASSES); pass += 1) {
            map.addLayer(
                {
                    id: imageLayerId(tier, pass),
                    type: 'raster',
                    source: imageSourceId(tier),
                    minzoom: fromZoom,
                    ...(untilZoom === undefined ? {} : { maxzoom: untilZoom }),
                    paint: { 'raster-saturation': image.saturation, 'raster-contrast': image.contrast, 'raster-fade-duration': 0 },
                },
                above,
            );
        }
    });
};

// Masque d'une image rognée, au contour de ces territoires ; null : l'image n'est pas rognée, ou
// la carte n'a pas encore de fond à rogner
export const imageMaskOf = (clipped: boolean, features: NationalMapFeature[]): GeoJSON.FeatureCollection | null => {
    const around = clipped ? imageMask(features) : null;
    return around && (toLngLatCollection([around]).collection as unknown as GeoJSON.FeatureCollection);
};

// Masque d'une image rognée : un aplat de la couleur du fond de la carte, percé au contour des
// territoires dessinés, juste au-dessus de l'image. Il suit les territoires dessinés et non la
// zone : à la maille EPCI, ceux qui débordent de la zone sont dessinés en entier, image
// comprise, comme leurs objets aux grands zooms. Les mailles, les objets et les limites
// restent au-dessus de lui. Il change avec le fond, par un simple remplacement de ses
// données : ce qui est dessiné reste jusqu'à ce que la suite soit prête.
export const drawImageMask = (map: maplibregl.Map, mask: GeoJSON.FeatureCollection | null, layerAbove: LayerAbove): void => {
    const source = map.getSource(IMAGE_MASK_SOURCE) as maplibregl.GeoJSONSource | undefined;
    if (!mask) {
        dropLayer(map, IMAGE_MASK_FILL);
        if (source) map.removeSource(IMAGE_MASK_SOURCE);
        return;
    }
    if (source) {
        source.setData(mask);
        return;
    }
    map.addSource(IMAGE_MASK_SOURCE, { type: 'geojson', data: mask });
    map.addLayer({ id: IMAGE_MASK_FILL, type: 'fill', source: IMAGE_MASK_SOURCE, paint: { 'fill-color': STAGE_BACKGROUND_COLOR } }, layerAbove(map));
};

// Adresse de l'image de chaque cartouche d'outre-mer, par territoire ; aucune sans image
export const insetImagesOf = (image: GridImage | null, insets: NationalMapInset[]): Map<string, string> =>
    new Map<string, string>(image ? insets.filter((inset) => inset.source_bbox).map((inset) => [inset.zone, image.insetImage(inset.source_bbox)]) : []);

// Retire les images de cartouche qui ne sont plus celles attendues. `shown` : celles que la carte
// porte, tenu à jour.
export const removeStaleInsetImages = (map: maplibregl.Map, shown: Map<string, string>, wanted: Map<string, string>): void => {
    shown.forEach((url, zone) => {
        if (wanted.get(zone) === url) return;
        for (let pass = 0; pass < MAX_IMAGE_PASSES; pass += 1) dropLayer(map, insetLayerId(zone, pass));
        dropSource(map, insetSourceId(zone));
        shown.delete(zone);
    });
};

type InsetImages = {
    image: GridImage;
    insets: NationalMapInset[];
    wanted: Map<string, string>;
    // Images que la carte porte déjà, tenu à jour
    shown: Map<string, string>;
};

// Cartouches d'outre-mer : l'image de chaque territoire à sa position réelle, posée sur son
// cartouche. Les tuiles de l'image n'ont rien à cet endroit.
export const addInsetImages = (map: maplibregl.Map, { image, insets, wanted, shown }: InsetImages, above: string | undefined): void => {
    insets.forEach(({ zone, bbox: [xmin, ymin, xmax, ymax] }) => {
        const url = wanted.get(zone);
        if (!url || shown.has(zone)) return;
        const [west, north] = mercatorToLngLat([xmin, ymax]);
        const [east, south] = mercatorToLngLat([xmax, ymin]);
        map.addSource(insetSourceId(zone), { type: 'image', url, coordinates: [[west, north], [east, north], [east, south], [west, south]] });
        for (let pass = 0; pass < Math.min(image.passes, MAX_IMAGE_PASSES); pass += 1) {
            map.addLayer(
                {
                    id: insetLayerId(zone, pass),
                    type: 'raster',
                    source: insetSourceId(zone),
                    minzoom: image.fromZoom,
                    paint: { 'raster-saturation': image.saturation, 'raster-contrast': image.contrast, 'raster-fade-duration': 0 },
                },
                above,
            );
        }
        shown.set(zone, url);
    });
};

// Ligne qui sépare de l'Hexagone les territoires d'outre-mer rapprochés de lui
export const drawSeparation = (map: maplibregl.Map, line: GeoJSON.Feature): void => {
    const source = map.getSource(SEPARATION_SOURCE) as maplibregl.GeoJSONSource | undefined;
    if (source) {
        source.setData(line);
        return;
    }
    map.addSource(SEPARATION_SOURCE, { type: 'geojson', data: line });
    map.addLayer({ id: SEPARATION_LINE, type: 'line', source: SEPARATION_SOURCE, paint: { 'line-color': SEPARATION_COLOR, 'line-width': 1 } });
};

// Ce que la carte porte de ses mailles, d'un dessin au suivant
export type DrawnCells = {
    // Identité de la source posée ; null : aucune
    sourceKey: string | null;
    // Mailles du dernier style posé
    styled: GridCells;
    // Opacité des mailles quand elles sont dessinées, et opacité nulle posée sous les objets
    visibleOpacity: maplibregl.ExpressionSpecification | number;
    hidden: boolean;
    // Premier zoom où la couche des mailles demande ses tuiles ; une couche neuve les demande à tous
    fromZoom: number;
};

export type ShownCells = {
    // Adresse du fichier de tuiles ; null : la carte n'a pas de mailles à dessiner
    tilesUrl: string | null;
    cells: GridCells;
    highlightedClass: number | null;
    // L'image est dessinée à la place des mailles
    pictured: boolean;
    // Les objets de la vue, tous chargés, remplacent les mailles
    hidden: boolean;
};

const removeCells = (map: maplibregl.Map): void => {
    dropLayer(map, GRID_FILL);
    dropSource(map, GRID_SOURCE);
};

// Mailles : la source suit leur identité (fichier, zone, grandeur), le style suit leur filtre,
// leur valeur et la légende. Quand l'identité change, la source est recréée : un simple
// changement de filtre ou d'attribut laisserait dessinées, le temps que les tuiles déjà chargées
// soient retraitées, les mailles de l'ancienne zone autour des nouveaux contours, ou celles de
// l'ancienne carte sous la nouvelle légende. Rend vrai quand les mailles à lire ou à classer
// changent : l'indicateur de chargement ne suit qu'elles.
export const drawCells = (map: maplibregl.Map, drawn: DrawnCells, { tilesUrl, cells, highlightedClass, pictured, hidden }: ShownCells): boolean => {
    const sourceKey = tilesUrl ? `${tilesUrl}|${cells.key}` : null;
    if (drawn.sourceKey !== sourceKey) {
        removeCells(map);
        drawn.sourceKey = null;
    }
    if (!tilesUrl) return false;
    const color = cellColorExpression(cells);
    // Sous l'image, les mailles ne sont plus dessinées. L'opacité suit l'état de la carte et non
    // une expression de zoom : mêlée aux attributs des mailles, celle-ci ne serait évaluée qu'aux
    // zooms entiers, et les mailles resteraient sur l'image entre deux.
    drawn.visibleOpacity = pictured ? 0 : cellOpacityExpression(cells, highlightedClass, DIMMED_OPACITY);
    // Sous les objets qui les remplacent, les mailles ne sont plus dessinées, mais restent
    // chargées : leurs attributs disent les départements en vue
    drawn.hidden = hidden;
    const opacity = hidden ? 0 : drawn.visibleOpacity;
    const changed = !map.getLayer(GRID_FILL) || drawn.styled !== cells;
    drawn.styled = cells;
    if (map.getLayer(GRID_FILL)) {
        map.setFilter(GRID_FILL, cells.filter as maplibregl.FilterSpecification);
        map.setPaintProperty(GRID_FILL, 'fill-color', color);
        map.setPaintProperty(GRID_FILL, 'fill-opacity', opacity);
        // Un rendu est toujours demandé, pour que l'événement « idle » lève l'indicateur de chargement
        map.triggerRepaint();
        return changed;
    }
    map.addSource(GRID_SOURCE, { type: 'vector', url: `pmtiles://${tilesUrl}` });
    map.addLayer(
        {
            id: GRID_FILL,
            type: 'fill',
            source: GRID_SOURCE,
            'source-layer': cells.layer,
            filter: cells.filter as maplibregl.FilterSpecification,
            paint: { 'fill-color': color, 'fill-opacity': opacity, 'fill-antialias': cells.antialias },
        },
        // Sous les limites administratives et leur liseré
        LANDS_HALO,
    );
    drawn.fromZoom = 0;
    drawn.sourceKey = sourceKey;
    return changed;
};

// Les mailles cachées sous les objets sont dessinées de nouveau
export const showHiddenCells = (map: maplibregl.Map, drawn: DrawnCells): void => {
    if (!drawn.hidden || !map.getLayer(GRID_FILL)) return;
    map.setPaintProperty(GRID_FILL, 'fill-opacity', drawn.visibleOpacity);
    drawn.hidden = false;
};

// Tuiles des mailles : demandées à tous les zooms quand la carte les dessine ; sous une image,
// seulement à l'approche des objets, ou jamais si la carte n'a pas d'objets
export const cellsFromZoom = (pictured: boolean, detail: GridDetail | null): number => {
    if (!pictured) return 0;
    return detail ? detail.minZoom - CELLS_ZOOMS_BEFORE_OBJECTS : LAST_ZOOM;
};
