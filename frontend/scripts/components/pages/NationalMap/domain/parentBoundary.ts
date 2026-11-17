// Limite du territoire affiché, redessinée sur les cartes dont les entités débordent de lui : un
// département à la maille EPCI, où les EPCI à cheval sur plusieurs départements sont dessinés en
// entier. Le tracé vient du fond (`parent_boundary`), précalculé sur les limites d'EPCI de ce même
// fond : il se confond avec elles partout où il les longe, et ne s'en écarte que pour traverser un
// EPCI à cheval. Les autres fonds n'en portent pas : la carte n'a rien à décider.
import type { NationalMapBaseMap } from '@services/api';
import { mercatorToLngLat } from '../gridded';

// Lignes de la limite, en coordonnées projetées (EPSG:3857) comme les territoires du fond
export type BoundaryLines = [number, number][][];

// Le même tableau pour tous les fonds sans limite : une carte qui compare ses données par
// identité ne redessine rien en passant de l'un à l'autre
const NO_LINES: BoundaryLines = [];

export const parentBoundaryOf = ({ parent_boundary: lines }: Pick<NationalMapBaseMap, 'parent_boundary'>): BoundaryLines =>
    lines && lines.length > 0 ? lines : NO_LINES;

// Aspect du trait, le même sur les cartes Highcharts et MapLibre. Un tireté sombre sur un liseré
// clair : le liseré couvre les limites d'EPCI que le trait longe (un seul trait, pas deux) et le
// détache des teintes foncées qu'il traverse dans un EPCI à cheval ; le tireté le distingue du
// territoire survolé, cerné d'un trait plein (voir hoverOutline), et des limites d'EPCI.
// `dash` : longueurs du tiret et de l'intervalle, en épaisseurs de trait, l'unité commune aux deux
// moteurs ; `highchartsDash` est le nom que Highcharts donne à ces mêmes longueurs.
export const PARENT_BOUNDARY_STYLE = {
    color: '#161616',
    widthPx: 1.5,
    casingColor: '#ffffff',
    casingWidthPx: 3.5,
    dash: [4, 3],
    highchartsDash: 'Dash',
} as const;

// Ce que la légende dit du trait, d'après le type du territoire affiché
const KEY_LABELS: Record<string, string> = { DEPART: 'Limite du département', REGION: 'Limite de la région' };
const DEFAULT_KEY_LABEL = 'Limite du territoire';

// Ligne de la légende qui explique le trait ; null quand le fond ne porte pas de limite
export const parentBoundaryKey = (lines: BoundaryLines, parentType: string | undefined): string | null =>
    lines.length === 0 ? null : (KEY_LABELS[parentType ?? ''] ?? DEFAULT_KEY_LABEL);

// La limite pour une carte MapLibre : une seule entité, en longitude et latitude. Sans ligne,
// l'entité est vide et ne dessine rien.
export const parentBoundaryFeature = (lines: BoundaryLines): GeoJSON.Feature<GeoJSON.MultiLineString> => ({
    type: 'Feature',
    properties: {},
    geometry: { type: 'MultiLineString', coordinates: lines.map((line) => line.map(mercatorToLngLat)) },
});
