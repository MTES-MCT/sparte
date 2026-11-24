// Fonds de carte et réponses d'essai partagés par les tests de la carte nationale, à la forme
// exacte des réponses de l'API. Les valeurs sont celles de territoires réels (millésime 2024 des
// fichiers fonciers), sauf les deux flux d'artificialisation provoqués et signalés plus bas.
// Les géométries sont de simples carrés en coordonnées projetées : aucun test ne dépend de la
// forme des territoires.
import type {
    NationalMapArtifIndicators,
    NationalMapArtifLand,
    NationalMapBaseMap,
    NationalMapBivariateMeta,
    NationalMapFeature,
    NationalMapIndicators,
    NationalMapInset,
    NationalMapLandIndicators,
} from '@services/api';

// --- Fonds de carte ----------------------------------------------------------------------

// Côté d'un territoire d'essai, en mètres
const SIDE = 100_000;

type LandSeed = { land_id: string; name: string; zone: string; region: string; has_conso?: boolean };

// Territoires carrés, rangés côte à côte dans l'ordre donné
const featuresOf = (land_type: string, lands: LandSeed[]): NationalMapFeature[] =>
    lands.map(({ land_id, name, zone, region, has_conso = true }, column) => {
        const x = column * 2 * SIDE;
        return {
            type: 'Feature',
            properties: { land_id, land_type, name, has_conso, zone, region },
            geometry: { type: 'Polygon', coordinates: [[[x, 0], [x + SIDE, 0], [x + SIDE, SIDE], [x, SIDE], [x, 0]]] },
        };
    });

// Cartouche d'un territoire d'outre-mer rapproché de l'Hexagone : son emprise est celle de son carré
const insetOf = (features: NationalMapFeature[], zone: string): NationalMapInset => {
    const column = features.findIndex((feature) => feature.properties.zone === zone);
    const x = column * 2 * SIDE;
    // Position réelle fictive du territoire : loin à l'ouest, de mêmes proportions que son cartouche
    return { zone, name: features[column].properties.name, bbox: [x, 0, x + SIDE, SIDE], source_bbox: [x - 6_000_000, 0, x - 6_000_000 + 2 * SIDE, 2 * SIDE] };
};

type BaseMapRest = Pick<NationalMapBaseMap, 'separation' | 'no_conso_data' | 'parent'> & Partial<Pick<NationalMapBaseMap, 'parent_boundary'>> & { insetZones?: string[] };

const baseMapOf = (scale: string, lands: LandSeed[], { insetZones = [], ...rest }: BaseMapRest): NationalMapBaseMap => {
    const features = featuresOf(scale, lands);
    return { scale, geojson: { type: 'FeatureCollection', features }, insets: insetZones.map((zone) => insetOf(features, zone)), parent_boundary: null, ...rest };
};

// France entière par région (extrait de sept régions) : deux territoires d'outre-mer en cartouche,
// séparés de l'Hexagone par une ligne ; Mayotte n'a pas de données de consommation
export const FRANCE_BY_REGION = baseMapOf(
    'REGION',
    [
        { land_id: '03', name: 'Guyane', zone: '03', region: '03' },
        { land_id: '06', name: 'Mayotte', zone: '06', region: '06', has_conso: false },
        { land_id: '11', name: 'Île-de-France', zone: 'HEXAGONE', region: '11' },
        { land_id: '53', name: 'Bretagne', zone: 'HEXAGONE', region: '53' },
        { land_id: '75', name: 'Nouvelle-Aquitaine', zone: 'HEXAGONE', region: '75' },
        { land_id: '84', name: 'Auvergne-Rhône-Alpes', zone: 'HEXAGONE', region: '84' },
        { land_id: '94', name: 'Corse', zone: 'CORSE', region: '94' },
    ],
    {
        insetZones: ['06', '03'],
        separation: [
            [3.5 * SIDE, 2 * SIDE],
            [3.5 * SIDE, -SIDE],
        ],
        no_conso_data: ['Mayotte'],
        parent: null,
    },
);

const DEPARTEMENTS: LandSeed[] = [
    { land_id: '22', name: "Côtes-d'Armor", zone: 'HEXAGONE', region: '53' },
    { land_id: '29', name: 'Finistère', zone: 'HEXAGONE', region: '53' },
    { land_id: '35', name: 'Ille-et-Vilaine', zone: 'HEXAGONE', region: '53' },
    { land_id: '56', name: 'Morbihan', zone: 'HEXAGONE', region: '53' },
    { land_id: '75', name: 'Paris', zone: 'HEXAGONE', region: '11' },
    { land_id: '84', name: 'Vaucluse', zone: 'HEXAGONE', region: '93' },
];

const departements = (...ids: string[]): LandSeed[] => DEPARTEMENTS.filter((departement) => ids.includes(departement.land_id));

// France entière par département (extrait de quatre départements). Paris et le Vaucluse portent
// les codes 75 et 84, qui sont aussi ceux de deux régions du fond précédent.
export const FRANCE_BY_DEPARTEMENT = baseMapOf('DEPART', departements('22', '35', '75', '84'), { separation: [], no_conso_data: [], parent: null });

// Bretagne par département. L'API renvoie une ligne de séparation même pour une région :
// elle ne doit être tracée que sur la France entière.
export const BRETAGNE_BY_DEPARTEMENT = baseMapOf('DEPART', departements('22', '29', '35', '56'), {
    separation: [
        [-SIDE, 2 * SIDE],
        [-SIDE, -SIDE],
    ],
    no_conso_data: [],
    parent: { land_type: 'REGION', land_id: '53', name: 'Bretagne', ancestors: [] },
});

// France entière par EPCI (extrait de deux EPCI) : la vue sur laquelle la page s'ouvre
export const FRANCE_BY_EPCI = baseMapOf(
    'EPCI',
    [
        { land_id: '200046977', name: 'Métropole de Lyon', zone: 'HEXAGONE', region: '84' },
        { land_id: '243500139', name: 'Rennes Métropole', zone: 'HEXAGONE', region: '53' },
    ],
    { separation: [], no_conso_data: [], parent: null },
);

// Rhône par EPCI (extrait de deux EPCI). Le second est à cheval sur le Rhône et l'Isère : il est
// dessiné en entier, et le fond porte la limite du département, qui le traverse.
export const RHONE_BY_EPCI = baseMapOf(
    'EPCI',
    [
        { land_id: '200046977', name: 'Métropole de Lyon', zone: 'HEXAGONE', region: '84' },
        { land_id: '200077014', name: 'CA Vienne Condrieu', zone: 'HEXAGONE', region: '84' },
    ],
    {
        separation: [],
        no_conso_data: [],
        parent: { land_type: 'DEPART', land_id: '69', name: 'Rhône', ancestors: [{ land_type: 'REGION', land_id: '84', name: 'Auvergne-Rhône-Alpes' }] },
        parent_boundary: [
            [
                [0, 0],
                [2.5 * SIDE, 0],
                [2.5 * SIDE, SIDE],
                [0, SIDE],
                [0, 0],
            ],
        ],
    },
);

// Mayotte par EPCI (extrait de deux EPCI) : une région d'outre-mer, sans aucune donnée de consommation
export const MAYOTTE_BY_EPCI = baseMapOf(
    'EPCI',
    [
        { land_id: '200050532', name: 'CC de Petite-Terre', zone: '06', region: '06', has_conso: false },
        { land_id: '200060457', name: 'CA de Dembeni / Mamoudzou', zone: '06', region: '06', has_conso: false },
    ],
    {
        separation: [],
        no_conso_data: ['CA de Dembeni / Mamoudzou', 'CC de Petite-Terre'],
        parent: { land_type: 'REGION', land_id: '06', name: 'Mayotte', ancestors: [] },
    },
);

// --- Consommation d'espaces --------------------------------------------------------------

const BIVARIATE_DESCRIPTIONS = {
    bivariate_activite_emplois: {
        palette: ['#b5b8d9', '#7f66af', '#4a1486', '#cc8186', '#b77585', '#a36985', '#e34a33', '#f0845c', '#fdbe85'],
        conso_label: "Consommation annuelle pour l'activité",
        indicator_label: "Évolution de l'emploi",
        indicator_unit: '%',
    },
    bivariate_habitat_menages: {
        palette: ['#99d8c9', '#4ca092', '#00695c', '#be917e', '#9e9578', '#7e9a73', '#e34a33', '#f08b5e', '#fdcc8a'],
        conso_label: "Consommation annuelle pour l'habitat",
        indicator_label: 'Évolution du nombre de ménages',
        indicator_unit: '%',
    },
    bivariate_habitat_population: {
        palette: ['#74c476', '#3a9851', '#006d2c', '#ab8754', '#949157', '#7e9c5b', '#e34a33', '#f08b5e', '#fdcc8a'],
        conso_label: "Consommation annuelle pour l'habitat",
        indicator_label: 'Évolution de la population',
        indicator_unit: '%',
    },
};

type BivariateId = keyof typeof BIVARIATE_DESCRIPTIONS;
// Seuils nationaux d'une maille pour une période : bornes hautes des deux premiers tiers
type BivariateThresholds = Record<BivariateId, { conso: [number, number]; indic: [number, number] }>;

// Sans seuils (période d'une seule année), l'API décrit quand même les cartes bivariées
const bivariateMeta = (thresholds: BivariateThresholds | null): Record<string, NationalMapBivariateMeta> =>
    Object.fromEntries(
        (Object.keys(BIVARIATE_DESCRIPTIONS) as BivariateId[]).map((id) => [
            id,
            { ...BIVARIATE_DESCRIPTIONS[id], conso_thresholds: thresholds?.[id].conso ?? null, indic_thresholds: thresholds?.[id].indic ?? null },
        ]),
    );

const REGION_THRESHOLDS: BivariateThresholds = {
    bivariate_activite_emplois: { conso: [0.0066, 0.0085], indic: [0.0542, 0.7487] },
    bivariate_habitat_menages: { conso: [0.0189, 0.0276], indic: [0.6706, 1.1359] },
    bivariate_habitat_population: { conso: [0.0189, 0.0276], indic: [0.0658, 0.5794] },
};

const DEPARTEMENT_THRESHOLDS: BivariateThresholds = {
    bivariate_activite_emplois: { conso: [0.0057, 0.0105], indic: [-0.0011, 0.4836] },
    bivariate_habitat_menages: { conso: [0.017, 0.0305], indic: [0.6049, 1.0015] },
    bivariate_habitat_population: { conso: [0.017, 0.0305], indic: [0.0374, 0.4368] },
};

const EPCI_THRESHOLDS: BivariateThresholds = {
    bivariate_activite_emplois: { conso: [0.0036, 0.0098], indic: [-0.1269, 0.477] },
    bivariate_habitat_menages: { conso: [0.0147, 0.0325], indic: [0.4737, 1.025] },
    bivariate_habitat_population: { conso: [0.0147, 0.0325], indic: [-0.1275, 0.4152] },
};

const consoResponse = (
    scale: string,
    period: { start_year: number; end_year: number },
    thresholds: BivariateThresholds | null,
    lands: Record<string, NationalMapLandIndicators>,
): NationalMapIndicators => ({
    scale,
    ...period,
    years: { min: 2011, max: 2024 },
    fixed_periods: { p1: [2011, 2020], p2: [2021, 2024], total: [2011, 2024] },
    lands,
    bivariate: bivariateMeta(thresholds),
});

// Territoire sans données de consommation (Mayotte) : l'API renvoie des zéros, pas d'évolution
// et, faute de taux de l'indicateur croisé, la classe bivariée du taux intermédiaire
const withoutConso = (surface_ha: number): NationalMapLandIndicators => {
    const bivariate = { class: 1, conso_rate: 0, indic_rate: null as number | null };
    return {
        surface_ha,
        conso_ha: 0,
        conso_pct_surface: 0,
        conso_habitat_ha: 0,
        conso_activite_ha: 0,
        conso_mixte_ha: 0,
        conso_route_ha: 0,
        conso_ferroviaire_ha: 0,
        conso_inconnu_ha: 0,
        conso_evolution_between_periods: null,
        bivariate_activite_emplois: bivariate,
        bivariate_habitat_menages: bivariate,
        bivariate_habitat_population: bivariate,
    };
};

const REGION_CONSO: Record<string, NationalMapLandIndicators> = {
    '03': {
        surface_ha: 8320076.41,
        conso_ha: 1895.68,
        conso_pct_surface: 0.02,
        conso_habitat_ha: 1096.78,
        conso_activite_ha: 597.29,
        conso_mixte_ha: 75.07,
        conso_route_ha: 52.3,
        conso_ferroviaire_ha: 0,
        conso_inconnu_ha: 74.24,
        conso_evolution_between_periods: 16.25,
        bivariate_activite_emplois: { class: 2, conso_rate: 0.0005, indic_rate: 2.3821 },
        bivariate_habitat_menages: { class: 2, conso_rate: 0.0009, indic_rate: 2.5195 },
        bivariate_habitat_population: { class: 2, conso_rate: 0.0009, indic_rate: 1.9454 },
    },
    '06': withoutConso(36618.64),
    '11': {
        surface_ha: 1206495.98,
        conso_ha: 11357.29,
        conso_pct_surface: 0.94,
        conso_habitat_ha: 4461.35,
        conso_activite_ha: 4811.77,
        conso_mixte_ha: 236.85,
        conso_route_ha: 1113.85,
        conso_ferroviaire_ha: 51.7,
        conso_inconnu_ha: 681.78,
        conso_evolution_between_periods: -26.72,
        bivariate_activite_emplois: { class: 7, conso_rate: 0.0285, indic_rate: 0.3436 },
        bivariate_habitat_menages: { class: 4, conso_rate: 0.0264, indic_rate: 0.7207 },
        bivariate_habitat_population: { class: 4, conso_rate: 0.0264, indic_rate: 0.4051 },
    },
    '53': {
        surface_ha: 2744641.84,
        conso_ha: 22824.26,
        conso_pct_surface: 0.83,
        conso_habitat_ha: 15870.98,
        conso_activite_ha: 4364.08,
        conso_mixte_ha: 265.51,
        conso_route_ha: 1907.97,
        conso_ferroviaire_ha: 6.47,
        conso_inconnu_ha: 409.26,
        conso_evolution_between_periods: -13.17,
        bivariate_activite_emplois: { class: 7, conso_rate: 0.0114, indic_rate: 0.6561 },
        bivariate_habitat_menages: { class: 7, conso_rate: 0.0413, indic_rate: 1.1081 },
        bivariate_habitat_population: { class: 7, conso_rate: 0.0413, indic_rate: 0.5794 },
    },
    '75': {
        surface_ha: 8509818.07,
        conso_ha: 47150.91,
        conso_pct_surface: 0.55,
        conso_habitat_ha: 32891.84,
        conso_activite_ha: 9319.87,
        conso_mixte_ha: 591.17,
        conso_route_ha: 1927.69,
        conso_ferroviaire_ha: 293.97,
        conso_inconnu_ha: 2126.38,
        conso_evolution_between_periods: -27.68,
        bivariate_activite_emplois: { class: 4, conso_rate: 0.0078, indic_rate: 0.6547 },
        bivariate_habitat_menages: { class: 4, conso_rate: 0.0276, indic_rate: 1.086 },
        bivariate_habitat_population: { class: 4, conso_rate: 0.0276, indic_rate: 0.5359 },
    },
    '84': {
        surface_ha: 7079698.06,
        conso_ha: 37610.37,
        conso_pct_surface: 0.53,
        conso_habitat_ha: 25087.2,
        conso_activite_ha: 8262.21,
        conso_mixte_ha: 654.9,
        conso_route_ha: 2495.53,
        conso_ferroviaire_ha: 19.92,
        conso_inconnu_ha: 1090.61,
        conso_evolution_between_periods: -19.96,
        bivariate_activite_emplois: { class: 4, conso_rate: 0.0083, indic_rate: 0.7487 },
        bivariate_habitat_menages: { class: 4, conso_rate: 0.0253, indic_rate: 1.1359 },
        bivariate_habitat_population: { class: 5, conso_rate: 0.0253, indic_rate: 0.6307 },
    },
    '94': {
        surface_ha: 875184.61,
        conso_ha: 2909.25,
        conso_pct_surface: 0.33,
        conso_habitat_ha: 2213.82,
        conso_activite_ha: 292.72,
        conso_mixte_ha: 68.43,
        conso_route_ha: 115.92,
        conso_ferroviaire_ha: 0,
        conso_inconnu_ha: 218.35,
        conso_evolution_between_periods: 4.27,
        bivariate_activite_emplois: { class: 2, conso_rate: 0.0024, indic_rate: 1.2923 },
        bivariate_habitat_menages: { class: 2, conso_rate: 0.0181, indic_rate: 1.6387 },
        bivariate_habitat_population: { class: 2, conso_rate: 0.0181, indic_rate: 1.0635 },
    },
};

export const CONSO_FRANCE_BY_REGION = consoResponse('REGION', { start_year: 2011, end_year: 2024 }, REGION_THRESHOLDS, REGION_CONSO);

// Consommation de la seule année 2024, par région : [totale, part de la surface, habitat, activité, mixte, route, ferroviaire, inconnue]
const REGION_CONSO_IN_2024: Record<string, number[]> = {
    '03': [135.44, 0, 102.23, 23.24, 3.37, 4.73, 0, 1.87],
    '06': [0, 0, 0, 0, 0, 0, 0, 0],
    '11': [604.22, 0.05, 215.64, 327.12, 9.02, 23.5, 1.91, 27.05],
    '53': [1158.01, 0.04, 838.23, 229.18, 11.16, 62.95, 0.2, 16.28],
    '75': [2057.49, 0.02, 1421.31, 468.81, 27.22, 55.01, 13.47, 71.68],
    '84': [1793.98, 0.03, 1197.17, 440.23, 36.66, 65.64, 1.8, 52.47],
    '94': [146.54, 0.02, 117.73, 20.01, 3.22, 2.64, 0, 2.93],
};

// Période d'une seule année : la consommation de la sélection change, pas l'évolution entre les
// périodes de référence, et les cartes bivariées n'ont ni seuils ni classes
const inSingleYear = (land: NationalMapLandIndicators, selection: number[]): NationalMapLandIndicators => {
    const [conso_ha, conso_pct_surface, conso_habitat_ha, conso_activite_ha, conso_mixte_ha, conso_route_ha, conso_ferroviaire_ha, conso_inconnu_ha] = selection;
    return {
        ...land,
        conso_ha,
        conso_pct_surface,
        conso_habitat_ha,
        conso_activite_ha,
        conso_mixte_ha,
        conso_route_ha,
        conso_ferroviaire_ha,
        conso_inconnu_ha,
        bivariate_activite_emplois: null,
        bivariate_habitat_menages: null,
        bivariate_habitat_population: null,
    };
};

export const CONSO_FRANCE_BY_REGION_IN_2024 = consoResponse(
    'REGION',
    { start_year: 2024, end_year: 2024 },
    null,
    Object.fromEntries(Object.entries(REGION_CONSO).map(([land_id, land]) => [land_id, inSingleYear(land, REGION_CONSO_IN_2024[land_id])])),
);

const DEPARTEMENT_CONSO: Record<string, NationalMapLandIndicators> = {
    '22': {
        surface_ha: 697850.69,
        conso_ha: 5244.75,
        conso_pct_surface: 0.75,
        conso_habitat_ha: 3898.2,
        conso_activite_ha: 823.46,
        conso_mixte_ha: 51.78,
        conso_route_ha: 358.98,
        conso_ferroviaire_ha: 0.51,
        conso_inconnu_ha: 111.82,
        conso_evolution_between_periods: -21.7,
        bivariate_activite_emplois: { class: 4, conso_rate: 0.0084, indic_rate: 0.2555 },
        bivariate_habitat_menages: { class: 7, conso_rate: 0.0399, indic_rate: 0.7372 },
        bivariate_habitat_population: { class: 7, conso_rate: 0.0399, indic_rate: 0.2328 },
    },
    '29': {
        surface_ha: 676548.36,
        conso_ha: 5584.22,
        conso_pct_surface: 0.83,
        conso_habitat_ha: 3973.1,
        conso_activite_ha: 994.86,
        conso_mixte_ha: 59.47,
        conso_route_ha: 458.02,
        conso_ferroviaire_ha: 0,
        conso_inconnu_ha: 98.77,
        conso_evolution_between_periods: -22,
        bivariate_activite_emplois: { class: 4, conso_rate: 0.0105, indic_rate: 0.3267 },
        bivariate_habitat_menages: { class: 7, conso_rate: 0.0419, indic_rate: 0.8381 },
        bivariate_habitat_population: { class: 7, conso_rate: 0.0419, indic_rate: 0.2833 },
    },
    '35': {
        surface_ha: 683129.38,
        conso_ha: 6801.74,
        conso_pct_surface: 1,
        conso_habitat_ha: 4348.73,
        conso_activite_ha: 1520.63,
        conso_mixte_ha: 100.38,
        conso_route_ha: 739.5,
        conso_ferroviaire_ha: 5.87,
        conso_inconnu_ha: 86.63,
        conso_evolution_between_periods: 6.74,
        bivariate_activite_emplois: { class: 8, conso_rate: 0.0159, indic_rate: 1.202 },
        bivariate_habitat_menages: { class: 8, conso_rate: 0.0455, indic_rate: 1.5226 },
        bivariate_habitat_population: { class: 8, conso_rate: 0.0455, indic_rate: 1.0291 },
    },
    '56': {
        surface_ha: 687113.42,
        conso_ha: 5193.55,
        conso_pct_surface: 0.76,
        conso_habitat_ha: 3650.95,
        conso_activite_ha: 1025.12,
        conso_mixte_ha: 53.89,
        conso_route_ha: 351.47,
        conso_ferroviaire_ha: 0.08,
        conso_inconnu_ha: 112.04,
        conso_evolution_between_periods: -19.11,
        bivariate_activite_emplois: { class: 8, conso_rate: 0.0107, indic_rate: 0.5693 },
        bivariate_habitat_menages: { class: 8, conso_rate: 0.038, indic_rate: 1.1999 },
        bivariate_habitat_population: { class: 8, conso_rate: 0.038, indic_rate: 0.6129 },
    },
    '75': {
        surface_ha: 10543.15,
        conso_ha: 0.02,
        conso_pct_surface: 0,
        conso_habitat_ha: 0,
        conso_activite_ha: 0,
        conso_mixte_ha: 0.01,
        conso_route_ha: 0.01,
        conso_ferroviaire_ha: 0,
        conso_inconnu_ha: 0,
        conso_evolution_between_periods: -100,
        bivariate_activite_emplois: { class: 0, conso_rate: 0, indic_rate: -0.4225 },
        bivariate_habitat_menages: { class: 0, conso_rate: 0, indic_rate: -0.3125 },
        bivariate_habitat_population: { class: 0, conso_rate: 0, indic_rate: -0.5506 },
    },
    '84': {
        surface_ha: 357779.13,
        conso_ha: 2894.3,
        conso_pct_surface: 0.81,
        conso_habitat_ha: 1867.27,
        conso_activite_ha: 609.03,
        conso_mixte_ha: 81.56,
        conso_route_ha: 209.68,
        conso_ferroviaire_ha: 67.5,
        conso_inconnu_ha: 59.26,
        conso_evolution_between_periods: -17.72,
        bivariate_activite_emplois: { class: 7, conso_rate: 0.0122, indic_rate: 0.4146 },
        bivariate_habitat_menages: { class: 7, conso_rate: 0.0373, indic_rate: 0.921 },
        bivariate_habitat_population: { class: 7, conso_rate: 0.0373, indic_rate: 0.3671 },
    },
};

// Réponse limitée aux territoires d'un fond, comme celle de l'API pour un parent
const landsOf = <T>(baseMap: NationalMapBaseMap, lands: Record<string, T>): Record<string, T> =>
    Object.fromEntries(baseMap.geojson.features.map(({ properties }) => [properties.land_id, lands[properties.land_id]]));

export const CONSO_FRANCE_BY_DEPARTEMENT = consoResponse(
    'DEPART',
    { start_year: 2011, end_year: 2024 },
    DEPARTEMENT_THRESHOLDS,
    landsOf(FRANCE_BY_DEPARTEMENT, DEPARTEMENT_CONSO),
);

export const CONSO_BRETAGNE_BY_DEPARTEMENT = consoResponse(
    'DEPART',
    { start_year: 2011, end_year: 2024 },
    DEPARTEMENT_THRESHOLDS,
    landsOf(BRETAGNE_BY_DEPARTEMENT, DEPARTEMENT_CONSO),
);

export const CONSO_FRANCE_BY_EPCI = consoResponse('EPCI', { start_year: 2011, end_year: 2024 }, EPCI_THRESHOLDS, {
    '200046977': {
        surface_ha: 53745.54,
        conso_ha: 970.34,
        conso_pct_surface: 1.81,
        conso_habitat_ha: 447.61,
        conso_activite_ha: 389.61,
        conso_mixte_ha: 22.66,
        conso_route_ha: 93.31,
        conso_ferroviaire_ha: 0.19,
        conso_inconnu_ha: 16.95,
        conso_evolution_between_periods: -46.39,
        bivariate_activite_emplois: { class: 8, conso_rate: 0.0518, indic_rate: 1.1094 },
        bivariate_habitat_menages: { class: 8, conso_rate: 0.0595, indic_rate: 1.2732 },
        bivariate_habitat_population: { class: 8, conso_rate: 0.0595, indic_rate: 0.8572 },
    },
    '243500139': {
        surface_ha: 71087.75,
        conso_ha: 1596.86,
        conso_pct_surface: 2.25,
        conso_habitat_ha: 928.86,
        conso_activite_ha: 380.8,
        conso_mixte_ha: 36.64,
        conso_route_ha: 224.77,
        conso_ferroviaire_ha: 5.39,
        conso_inconnu_ha: 20.4,
        conso_evolution_between_periods: -15.99,
        bivariate_activite_emplois: { class: 8, conso_rate: 0.0383, indic_rate: 1.4129 },
        bivariate_habitat_menages: { class: 8, conso_rate: 0.0933, indic_rate: 1.7238 },
        bivariate_habitat_population: { class: 8, conso_rate: 0.0933, indic_rate: 1.3181 },
    },
});

export const CONSO_MAYOTTE_BY_EPCI = consoResponse('EPCI', { start_year: 2011, end_year: 2024 }, EPCI_THRESHOLDS, {
    '200050532': withoutConso(1076.23),
    '200060457': withoutConso(7984.17),
});

// --- Artificialisation (OCS GE) ----------------------------------------------------------

// Territoire sans couverture OCS GE complète (Guyane)
const withoutOcsge = (surface_ha: number): NationalMapArtifLand => ({
    surface_ha,
    artif_ha: null,
    artif_pct: null,
    artif_years: [],
    artif_index: null,
    artif_net_ha: null,
    artif_net_pct_surface: null,
    artif_net_annual_ha: null,
    artif_net_annual_pct_surface: null,
    artif_gross_ha: null,
    desartif_gross_ha: null,
    artif_net_years_old: [],
    artif_net_years_new: [],
    artif_net_index_old: null,
    artif_net_index_new: null,
});

// France entière par région. Deux flux sont provoqués pour couvrir les trois signes, toutes les
// régions réelles s'artificialisant : celui de Mayotte est annulé (désartificialisation égale à
// l'artificialisation) et celui de la Corse inversé (artificialisation et désartificialisation échangées).
export const ARTIF_FRANCE_BY_REGION: NationalMapArtifIndicators = {
    scale: 'REGION',
    lands: {
        '03': withoutOcsge(8320076.41),
        '06': {
            surface_ha: 36618.64,
            artif_ha: 4242.4,
            artif_pct: 11.59,
            artif_years: [2023],
            artif_index: 2,
            artif_net_ha: 0,
            artif_net_pct_surface: 0,
            artif_net_annual_ha: 0,
            artif_net_annual_pct_surface: 0,
            artif_gross_ha: 167.21,
            desartif_gross_ha: 167.21,
            artif_net_years_old: [2020],
            artif_net_years_new: [2023],
            artif_net_index_old: 1,
            artif_net_index_new: 2,
        },
        '11': {
            surface_ha: 1206495.98,
            artif_ha: 252566.22,
            artif_pct: 20.93,
            artif_years: [2021],
            artif_index: 2,
            artif_net_ha: 2857.82,
            artif_net_pct_surface: 0.2369,
            artif_net_annual_ha: 834.9,
            artif_net_annual_pct_surface: 0.0692,
            artif_gross_ha: 3522.63,
            desartif_gross_ha: 664.81,
            artif_net_years_old: [2017, 2018],
            artif_net_years_new: [2021],
            artif_net_index_old: 1,
            artif_net_index_new: 2,
        },
        '53': {
            surface_ha: 2744641.84,
            artif_ha: 336528.89,
            artif_pct: 12.26,
            artif_years: [2020, 2021, 2022],
            artif_index: 2,
            artif_net_ha: 4273.81,
            artif_net_pct_surface: 0.1557,
            artif_net_annual_ha: 1424.6,
            artif_net_annual_pct_surface: 0.0519,
            artif_gross_ha: 5103.95,
            desartif_gross_ha: 830.14,
            artif_net_years_old: [2017, 2018, 2019],
            artif_net_years_new: [2020, 2021, 2022],
            artif_net_index_old: 1,
            artif_net_index_new: 2,
        },
        '75': {
            surface_ha: 8509818.07,
            artif_ha: 706149.72,
            artif_pct: 8.3,
            artif_years: [2021, 2023],
            artif_index: 2,
            artif_net_ha: 9736.3,
            artif_net_pct_surface: 0.1144,
            artif_net_annual_ha: 3070.9,
            artif_net_annual_pct_surface: 0.0361,
            artif_gross_ha: 11816.94,
            desartif_gross_ha: 2080.65,
            artif_net_years_old: [2017, 2018, 2020],
            artif_net_years_new: [2021, 2023],
            artif_net_index_old: 1,
            artif_net_index_new: 2,
        },
        '84': {
            surface_ha: 7079698.06,
            artif_ha: 588819.44,
            artif_pct: 8.32,
            artif_years: [2020, 2021, 2022, 2023],
            artif_index: 2,
            artif_net_ha: 6052.63,
            artif_net_pct_surface: 0.0855,
            artif_net_annual_ha: 2047.55,
            artif_net_annual_pct_surface: 0.0289,
            artif_gross_ha: 7400.16,
            desartif_gross_ha: 1347.53,
            artif_net_years_old: [2017, 2018, 2019, 2020],
            artif_net_years_new: [2020, 2021, 2022, 2023],
            artif_net_index_old: 1,
            artif_net_index_new: 2,
        },
        '94': {
            surface_ha: 875184.61,
            artif_ha: 31895.5,
            artif_pct: 3.64,
            artif_years: [2021],
            artif_index: 2,
            artif_net_ha: -491.11,
            artif_net_pct_surface: -0.0561,
            artif_net_annual_ha: -245.56,
            artif_net_annual_pct_surface: -0.0281,
            artif_gross_ha: 52.48,
            desartif_gross_ha: 543.59,
            artif_net_years_old: [2019],
            artif_net_years_new: [2021],
            artif_net_index_old: 1,
            artif_net_index_new: 2,
        },
    },
};

// France entière par département : les quatre départements du fond, chacun à ses millésimes
export const ARTIF_FRANCE_BY_DEPARTEMENT: NationalMapArtifIndicators = {
    scale: 'DEPART',
    lands: {
        '22': {
            surface_ha: 697850.69,
            artif_ha: 77755.11,
            artif_pct: 11.14,
            artif_years: [2021],
            artif_index: 2,
            artif_net_ha: 864.87,
            artif_net_pct_surface: 0.1239,
            artif_net_annual_ha: 288.29,
            artif_net_annual_pct_surface: 0.0413,
            artif_gross_ha: 1039.88,
            desartif_gross_ha: 175.01,
            artif_net_years_old: [2018],
            artif_net_years_new: [2021],
            artif_net_index_old: 1,
            artif_net_index_new: 2,
        },
        '35': {
            surface_ha: 683129.38,
            artif_ha: 86746.95,
            artif_pct: 12.7,
            artif_years: [2020],
            artif_index: 2,
            artif_net_ha: 1468.19,
            artif_net_pct_surface: 0.2149,
            artif_net_annual_ha: 489.4,
            artif_net_annual_pct_surface: 0.0716,
            artif_gross_ha: 1620.13,
            desartif_gross_ha: 151.94,
            artif_net_years_old: [2017],
            artif_net_years_new: [2020],
            artif_net_index_old: 1,
            artif_net_index_new: 2,
        },
        '75': {
            surface_ha: 10543.15,
            artif_ha: 8783.49,
            artif_pct: 83.31,
            artif_years: [2021],
            artif_index: 2,
            artif_net_ha: 1.44,
            artif_net_pct_surface: 0.0137,
            artif_net_annual_ha: 0.48,
            artif_net_annual_pct_surface: 0.0046,
            artif_gross_ha: 3.71,
            desartif_gross_ha: 2.27,
            artif_net_years_old: [2018],
            artif_net_years_new: [2021],
            artif_net_index_old: 1,
            artif_net_index_new: 2,
        },
        '84': {
            surface_ha: 357779.13,
            artif_ha: 45507.67,
            artif_pct: 12.72,
            artif_years: [2021],
            artif_index: 2,
            artif_net_ha: 364.38,
            artif_net_pct_surface: 0.1018,
            artif_net_annual_ha: 121.46,
            artif_net_annual_pct_surface: 0.0339,
            artif_gross_ha: 553.24,
            desartif_gross_ha: 188.86,
            artif_net_years_old: [2018],
            artif_net_years_new: [2021],
            artif_net_index_old: 1,
            artif_net_index_new: 2,
        },
    },
};
