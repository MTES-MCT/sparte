// Style MapLibre de la carte de toutes les communes du pays : ses sources et ses couches, fixés à
// la création. La couleur de chaque commune est un état d'entité (`color`) posé sur les tuiles ;
// rien d'autre ne change quand la carte, la période, la zone nationale ou la classe mise en avant
// changent.
//
// Deux règles mesurées dans le navigateur tiennent le changement de carte sous 60 ms :
// - une seule couche de la source des communes lit l'état d'entité, l'aplat. Chaque couche qui le
//   lit fait reprendre toutes les entités modifiées : une seconde coûte 70 % de plus ;
// - après la création, ni filtre ni propriété de dessin ne change sur cette source pour un
//   changement de carte : l'un comme l'autre fait analyser de nouveau toutes les tuiles en vue.
//   Seul le contour de la commune sélectionnée change un filtre, au clic.
import type { ExpressionSpecification, FilterSpecification, GeoJSONSourceSpecification, LayerSpecification, VectorSourceSpecification } from 'maplibre-gl';
import { LAND_BORDER_COLOR, LAND_HALO_COLOR } from '../../gridded';
import { DIMMED_NO_DATA_COLOR } from '../../domain/communes/colors';
import { NO_DATA_PATTERN_ID } from '../../domain/noData';
import { NO_DATA_COLOR } from '../../values';
import { SEPARATION_COLOR, TERRITORY_COLOR } from './territoryOptions';

const COMMUNES_TILES_FILE = 'communes_national.pmtiles';
// Adresse du fichier de tuiles des communes, dans le dossier des tuiles du site
export const communesTilesUrl = (tilesLocation: string): string => `${tilesLocation}/${COMMUNES_TILES_FILE}`;
export const COMMUNES_SOURCE = 'national-map-communes';
export const COMMUNES_SOURCE_LAYER = 'communes_national';
export const COMMUNES_FILL = 'national-map-communes-fill';
export const COMMUNES_NO_DATA = 'national-map-communes-no-data';
// Opacité des hachures d'une commune sans donnée estompée par une mise en avant de la légende
const NO_DATA_DIMMED_OPACITY = 0.3;
const COMMUNES_LINE = 'national-map-communes-line';
export const COMMUNE_OUTLINE = 'national-map-commune-outline';

export const DEPARTMENTS_SOURCE = 'national-map-departments';
const DEPARTMENTS_HALO = 'national-map-departments-halo';
const DEPARTMENTS_LINE = 'national-map-departments-line';
const DEPARTMENT_FOCUS = 'national-map-department-focus';
export const SEPARATION_SOURCE = 'national-map-separation';
const SEPARATION_LINE = 'national-map-separation-line';

// Zoom à partir duquel les contours des communes sont dessinés : en deçà, ils couvriraient les aplats
const COMMUNES_LINE_MIN_ZOOM = 7;
const COMMUNES_LINE_COLOR = '#ffffff';
// Limites des départements, trait foncé sur liseré clair : ce sont les seuls repères géographiques
// au cadrage du pays, où une commune fait un à deux pixels.
// Largeur que le liseré ajoute au trait, en pixels
const DEPARTMENTS_HALO_EXTRA_PX = 1;
const FOCUS_COLOR = '#1a1a1a';

// Trait des limites des départements : fin au cadrage du pays sur un téléphone (zoom 3,5), où un
// département fait une vingtaine de pixels, plus épais à mesure que le zoom les écarte
const departmentsLineWidth = (extra = 0): ExpressionSpecification => ['interpolate', ['linear'], ['zoom'], 3.5, 0.4 + extra, 5.5, 0.7 + extra, 9, 1.2 + extra];

// Les tuiles portent l'identifiant de la commune dans l'attribut `land_id` : c'est par lui que
// l'état d'entité la rejoint
export const communesSource = (tilesUrl: string): VectorSourceSpecification => ({ type: 'vector', url: `pmtiles://${tilesUrl}`, promoteId: 'land_id' });

const EMPTY_COLLECTION: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

// Départements de la zone et ligne de séparation de l'outre-mer : leurs données suivent la zone affichée
export const FRAME_SOURCES: Record<string, GeoJSONSourceSpecification> = {
    [DEPARTMENTS_SOURCE]: { type: 'geojson', data: EMPTY_COLLECTION, promoteId: 'land_id' },
    [SEPARATION_SOURCE]: { type: 'geojson', data: EMPTY_COLLECTION },
};

const ROUNDED = { 'line-join': 'round', 'line-cap': 'round' } as const;

const isDepartment = (state: string): ExpressionSpecification => ['boolean', ['feature-state', state], false];

// Repères dessinés sur les communes. Le département survolé ou sélectionné est mis en avant par
// un état d'entité de sa propre source, petite : celle des communes n'est pas touchée.
export const FRAME_LAYERS: LayerSpecification[] = [
    {
        id: DEPARTMENTS_HALO,
        type: 'line',
        source: DEPARTMENTS_SOURCE,
        layout: ROUNDED,
        paint: { 'line-color': LAND_HALO_COLOR, 'line-width': departmentsLineWidth(DEPARTMENTS_HALO_EXTRA_PX), 'line-opacity': 0.6 },
    },
    {
        id: DEPARTMENTS_LINE,
        type: 'line',
        source: DEPARTMENTS_SOURCE,
        layout: ROUNDED,
        paint: { 'line-color': LAND_BORDER_COLOR, 'line-width': departmentsLineWidth() },
    },
    { id: SEPARATION_LINE, type: 'line', source: SEPARATION_SOURCE, paint: { 'line-color': SEPARATION_COLOR, 'line-width': 1 } },
    {
        id: DEPARTMENT_FOCUS,
        type: 'line',
        source: DEPARTMENTS_SOURCE,
        layout: ROUNDED,
        paint: {
            'line-color': ['case', isDepartment('selected'), TERRITORY_COLOR, FOCUS_COLOR],
            'line-width': ['case', isDepartment('selected'), 2.5, 1.5],
            'line-opacity': ['case', ['any', isDepartment('hover'), isDepartment('selected')], 1, 0],
        },
    },
];

// Contour de la commune sélectionnée : aucune tant que l'identifiant est vide
export const communeOutlineFilter = (landId: string | null): FilterSpecification => ['==', ['get', 'land_id'], landId ?? ''];

// Couches de la source des communes, avec celle sous laquelle chacune se glisse (au-dessus de
// tout sans cela) : les aplats et les contours passent sous les repères, le contour de la
// sélection par-dessus.
export const COMMUNES_LAYERS: { layer: LayerSpecification; beforeId?: string }[] = [
    {
        layer: {
            id: COMMUNES_FILL,
            type: 'fill',
            source: COMMUNES_SOURCE,
            'source-layer': COMMUNES_SOURCE_LAYER,
            paint: {
                'fill-color': ['to-color', ['feature-state', 'color'], NO_DATA_COLOR],
                // Sans lissage : il borderait chaque commune d'un pixel qui déborde sur ses voisines
                'fill-antialias': false,
            },
        },
        beforeId: DEPARTMENTS_HALO,
    },
    {
        // Hachures des communes sans donnée, par-dessus leur aplat : la couleur posée sur une commune
        // dit si elle est sans donnée, et si elle est estompée par une mise en avant de la légende.
        // Une commune sans couleur posée est sans donnée, comme pour l'aplat.
        layer: {
            id: COMMUNES_NO_DATA,
            type: 'fill',
            source: COMMUNES_SOURCE,
            'source-layer': COMMUNES_SOURCE_LAYER,
            paint: {
                'fill-pattern': NO_DATA_PATTERN_ID,
                'fill-opacity': [
                    'match',
                    ['coalesce', ['feature-state', 'color'], NO_DATA_COLOR],
                    NO_DATA_COLOR,
                    1,
                    DIMMED_NO_DATA_COLOR,
                    NO_DATA_DIMMED_OPACITY,
                    0,
                ],
                'fill-antialias': false,
            },
        },
        beforeId: DEPARTMENTS_HALO,
    },
    {
        layer: {
            id: COMMUNES_LINE,
            type: 'line',
            source: COMMUNES_SOURCE,
            'source-layer': COMMUNES_SOURCE_LAYER,
            minzoom: COMMUNES_LINE_MIN_ZOOM,
            paint: { 'line-color': COMMUNES_LINE_COLOR, 'line-width': ['interpolate', ['linear'], ['zoom'], COMMUNES_LINE_MIN_ZOOM, 0.3, 10, 0.8] },
        },
        beforeId: DEPARTMENTS_HALO,
    },
    {
        layer: {
            id: COMMUNE_OUTLINE,
            type: 'line',
            source: COMMUNES_SOURCE,
            'source-layer': COMMUNES_SOURCE_LAYER,
            filter: communeOutlineFilter(null),
            layout: ROUNDED,
            paint: { 'line-color': FOCUS_COLOR, 'line-width': 2 },
        },
    },
];
