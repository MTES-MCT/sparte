// Mise en évidence de l'élément survolé sur une carte MapLibre : son contour, d'un trait sombre
// sur un liseré clair, posé au-dessus de tout le reste. Le trait se lit sur les teintes claires
// comme sur les foncées, sans changer la couleur de l'élément, qui porte la donnée ; plus épais que
// les limites administratives, il ne se confond pas avec elles, ni avec l'estompage d'une classe
// de la légende. Le contour est dessiné dans une source à part, d'une seule entité : survoler ne
// touche ni aux tuiles, ni au style de leurs couches, ni à leurs états d'entité, quel que soit le
// nombre d'entités de la carte. Les tuiles n'ont pas à porter d'identifiant (les carreaux et les
// objets OCS GE n'en ont pas).
import type { FilterSpecification, GeoJSONSource, LayerSpecification, Map as MapLibreMap } from 'maplibre-gl';
import { outlineOf } from '../../domain/hoverOutline';

export const HOVER_SOURCE = 'national-map-hover';
export const HOVER_HALO = 'national-map-hover-halo';
export const HOVER_LINE = 'national-map-hover-line';
// Les couleurs du territoire survolé sur la carte par territoire (voir territoryOptions)
export const HOVER_COLOR = '#1a1a1a';
export const HOVER_HALO_COLOR = '#ffffff';
const LINE_WIDTH_PX = 2;
const HALO_WIDTH_PX = 5;

const ROUNDED = { 'line-join': 'round', 'line-cap': 'round' } as const;
const EMPTY: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

export const HOVER_LAYERS: LayerSpecification[] = [
    { id: HOVER_HALO, type: 'line', source: HOVER_SOURCE, layout: ROUNDED, paint: { 'line-color': HOVER_HALO_COLOR, 'line-width': HALO_WIDTH_PX } },
    { id: HOVER_LINE, type: 'line', source: HOVER_SOURCE, layout: ROUNDED, paint: { 'line-color': HOVER_COLOR, 'line-width': LINE_WIDTH_PX } },
];

export type HoverOutline = {
    // `key` : identité de l'élément ; tant qu'elle ne change pas, rien n'est recalculé ni redessiné.
    // `pieces` : les géométries que les tuiles dessinent de l'élément, lues seulement s'il a changé.
    show: (key: string, pieces: () => unknown[]) => void;
    hide: () => void;
};

type OutlinedMap = Pick<MapLibreMap, 'getSource' | 'addSource' | 'addLayer' | 'setPaintProperty'>;

// La source et ses couches ne sont posées qu'au premier contour à tracer : au-dessus de toutes
// les couches de la carte, et jamais sur une carte que personne ne survole
export const createHoverOutline = (map: OutlinedMap): HoverOutline => {
    let shown: string | null = null;
    // Les données de la source changent à l'image suivante au plus tôt ; l'opacité, tout de suite :
    // un contour effacé ne reste dans aucune image, pas même celle d'un export
    let visible = true;
    const reveal = (wanted: boolean): void => {
        if (wanted === visible || !map.getSource(HOVER_SOURCE)) return;
        visible = wanted;
        HOVER_LAYERS.forEach(({ id }) => map.setPaintProperty(id, 'line-opacity', wanted ? 1 : 0));
    };
    const draw = (data: GeoJSON.FeatureCollection | GeoJSON.Feature): void => {
        const source = map.getSource(HOVER_SOURCE) as GeoJSONSource | undefined;
        if (source) {
            source.setData(data);
            return;
        }
        map.addSource(HOVER_SOURCE, { type: 'geojson', data });
        HOVER_LAYERS.forEach((layer) => map.addLayer(layer));
    };
    return {
        show: (key, pieces) => {
            if (key === shown) return;
            shown = key;
            const outline = outlineOf(pieces());
            if (outline) draw({ type: 'Feature', properties: {}, geometry: outline });
            else if (map.getSource(HOVER_SOURCE)) draw(EMPTY);
            reveal(outline !== null);
        },
        hide: () => {
            if (shown === null) return;
            shown = null;
            reveal(false);
            if (map.getSource(HOVER_SOURCE)) draw(EMPTY);
        },
    };
};

// Filtre des entités qui portent exactement ces attributs : les morceaux d'une même entité dans
// des tuiles voisines, quand les tuiles ne lui donnent pas d'identifiant
export const sameFeatureFilter = (properties: Record<string, unknown>): FilterSpecification =>
    ['all', ...Object.entries(properties).map(([name, value]) => ['==', ['get', name], value])] as FilterSpecification;

type Point = { x: number; y: number };
type QueriedMap = Pick<MapLibreMap, 'queryRenderedFeatures' | 'project'>;
// Marge autour des morceaux sous le pointeur, en pixels : leurs voisins les touchent
const NEIGHBOUR_PX = 2;

const positionsOf = (geometry: unknown): [number, number][] => {
    const { type, coordinates } = (geometry ?? {}) as { type?: string; coordinates?: unknown[] };
    if (type === 'Polygon') return (coordinates as [number, number][][]).flat();
    return type === 'MultiPolygon' ? (coordinates as [number, number][][][]).flat(2) : [];
};

// Géométries de l'entité dessinée sous un point : ses morceaux sous le point, et ceux qui les
// prolongent dans les tuiles voisines. La recherche des seconds se limite au cadre des premiers :
// elle ne parcourt pas les entités de toute la vue, des dizaines de milliers au cadrage du pays.
export const piecesAround = (map: QueriedMap, point: Point, layers: string[], filter: FilterSpecification): unknown[] => {
    const under = map.queryRenderedFeatures([point.x, point.y], { layers, filter }).map((feature) => feature.geometry as unknown);
    const pixels = under.flatMap(positionsOf).map((position) => map.project(position));
    if (pixels.length === 0) return under;
    const xs = pixels.map(({ x }) => x);
    const ys = pixels.map(({ y }) => y);
    const frame: [[number, number], [number, number]] = [
        [Math.min(...xs) - NEIGHBOUR_PX, Math.min(...ys) - NEIGHBOUR_PX],
        [Math.max(...xs) + NEIGHBOUR_PX, Math.max(...ys) + NEIGHBOUR_PX],
    ];
    return map.queryRenderedFeatures(frame, { layers, filter }).map((feature) => feature.geometry as unknown);
};
