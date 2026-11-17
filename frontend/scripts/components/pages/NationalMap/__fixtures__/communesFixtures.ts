// Réponses d'essai de l'appel des valeurs par commune, à la forme exacte de celles de l'API : des
// colonnes alignées sur la liste triée des identifiants. Treize communes réelles et leurs valeurs
// réelles (millésime 2024 des fichiers fonciers, OCS GE), choisies pour couvrir l'Hexagone, la
// Corse, deux régions d'outre-mer et les communes sans donnée.
import type { NationalMapBivariateColumns, NationalMapBivariateMeta, NationalMapValueColumns, NationalMapYearSet } from '@services/api';

type Commune = { id: string; name: string; region: string };

// Dans l'ordre des identifiants. Suzan, Île-de-Sein et les deux communes de Mayotte n'ont pas de
// données de consommation ; les deux communes de Guyane n'ont pas d'OCS GE. Mayotte et la Guyane
// sont ainsi entièrement sans donnée, l'Occitanie et la Bretagne en partie seulement.
const COMMUNES: Commune[] = [
    { id: '09304', name: 'Suzan', region: '76' },
    { id: '22278', name: 'Saint-Brieuc', region: '53' },
    { id: '29083', name: 'Île-de-Sein', region: '53' },
    { id: '2A004', name: 'Ajaccio', region: '94' },
    { id: '31555', name: 'Toulouse', region: '76' },
    { id: '35238', name: 'Rennes', region: '53' },
    { id: '69123', name: 'Lyon', region: '84' },
    { id: '75056', name: 'Paris', region: '11' },
    { id: '84007', name: 'Avignon', region: '93' },
    { id: '97302', name: 'Cayenne', region: '03' },
    { id: '97304', name: 'Kourou', region: '03' },
    { id: '97608', name: 'Dzaoudzi', region: '06' },
    { id: '97611', name: 'Mamoudzou', region: '06' },
];

const WITHOUT_CONSO = ['09304', '29083', '97608', '97611'];
const WITHOUT_OCSGE = ['97302', '97304'];

type Period = { start_year: number; end_year: number };
const NO_PERIOD = { start_year: null as number | null, end_year: null as number | null };
const FROM_2011_TO_2024: Period = { start_year: 2011, end_year: 2024 };

// Ce que toute réponse dit de sa demande et des communes : `withoutData` sont les identifiants
// des communes dont la source manque
const header = (key: string, amount: string | null, period: Period | typeof NO_PERIOD, withoutData: string[]) => {
    const noData = COMMUNES.filter(({ id }) => withoutData.includes(id)).map(({ id, name }): [string, string] => [id, name]);
    return {
        scale: 'COMM',
        key,
        amount,
        ...period,
        ids: COMMUNES.map(({ id }) => id),
        regions: COMMUNES.map(({ region }) => region),
        no_data: noData,
        no_data_count: noData.length,
    };
};

const N = null as number | null;

// Part de la surface communale consommée de 2011 à 2024, et hectares correspondants
const CONSO_SHARE = [N, 1.54, N, 1.19, 2.95, 2.45, 0.2, 0, 2.86, 3.94, 0.02, N, N];
const CONSO_HA = [N, 29.57, N, 98.9, 348.74, 123.32, 9.49, 0.02, 186.27, 99.77, 40.59, N, N];

// Carte en pourcentage de la surface : la colonne seule
export const COMMUNES_CONSO_SHARE: NationalMapValueColumns = { ...header('conso_pct_surface', null, FROM_2011_TO_2024, WITHOUT_CONSO), values: CONSO_SHARE };

// Carte en hectares : sa version relative, accompagnée des hectares
export const COMMUNES_CONSO_HA: NationalMapValueColumns = {
    ...header('conso_pct_surface', 'conso_ha', FROM_2011_TO_2024, WITHOUT_CONSO),
    values: CONSO_SHARE,
    amounts: CONSO_HA,
};

// Évolution entre les deux périodes de référence : elle ne dépend pas de la période choisie
export const COMMUNES_CONSO_EVOLUTION: NationalMapValueColumns = {
    ...header('conso_evolution_between_periods', null, NO_PERIOD, WITHOUT_CONSO),
    values: [N, -78.08, N, 2.63, 28.59, -54.89, -30.03, -100, -72.8, 3.84, 96.02, N, N],
};

const HOUSEHOLDS: NationalMapBivariateMeta = {
    palette: ['#99d8c9', '#4ca092', '#00695c', '#be917e', '#9e9578', '#7e9a73', '#e34a33', '#f08b5e', '#fdcc8a'],
    conso_thresholds: [0.0086, 0.0276],
    indic_thresholds: [0.3828, 1.1364],
    conso_label: "Consommation annuelle pour l'habitat",
    indicator_label: 'Évolution du nombre de ménages',
    indicator_unit: '%',
};

export const COMMUNES_HABITAT_MENAGES: NationalMapBivariateColumns = {
    ...header('bivariate_habitat_menages', null, FROM_2011_TO_2024, WITHOUT_CONSO),
    classes: [N, 6, N, 8, 8, 7, 1, 0, 6, 8, 1, N, N],
    conso_rates: [N, 0.0572, N, 0.0394, 0.0793, 0.0778, 0.0073, 0, 0.0861, 0.1288, 0.0006, N, N],
    indic_rates: [N, 0.1215, N, 1.2999, 1.6816, 1.0197, 0.8906, -0.3125, 0.3547, 2.317, 0.6015, N, N],
    bivariate: HOUSEHOLDS,
};

// Millésimes du stock d'artificialisation : un jeu par millésime rencontré, le dernier pour les communes sans OCS GE
const STOCK_YEARS: NationalMapYearSet[] = [{ artif_years: [2022], artif_index: 2 }, { artif_years: [2021], artif_index: 2 }, { artif_years: [2020], artif_index: 2 }, { artif_years: [2023], artif_index: 2 }, { artif_years: [] }];

// Carte en hectares de la surface artificialisée : la part du territoire, accompagnée des hectares
export const COMMUNES_ARTIF_HA: NationalMapValueColumns = {
    ...header('artif_pct', 'artif_ha', NO_PERIOD, WITHOUT_OCSGE),
    values: [2.06, 70.53, 37.43, 19.87, 81.45, 71.74, 84.7, 83.31, 48.12, N, N, 41.04, 19.12],
    amounts: [4.94, 1355.93, 20.71, 1644.88, 9618.88, 3609.58, 4057.01, 8783.49, 3130.23, N, N, 262.61, 799.99],
    year_sets: STOCK_YEARS,
    year_set_index: [0, 1, 1, 1, 0, 2, 2, 1, 1, 4, 4, 3, 3],
};

const FLUX_YEARS: NationalMapYearSet[] = [
    { artif_net_years_old: [2019], artif_net_years_new: [2022], artif_net_index_old: 1, artif_net_index_new: 2 },
    { artif_net_years_old: [2018], artif_net_years_new: [2021], artif_net_index_old: 1, artif_net_index_new: 2 },
    { artif_net_years_old: [2019], artif_net_years_new: [2021], artif_net_index_old: 1, artif_net_index_new: 2 },
    { artif_net_years_old: [2017], artif_net_years_new: [2020], artif_net_index_old: 1, artif_net_index_new: 2 },
    { artif_net_years_old: [2020], artif_net_years_new: [2023], artif_net_index_old: 1, artif_net_index_new: 2 },
    { artif_net_years_old: [], artif_net_years_new: [] },
];

// Artificialisation nette en part de la surface. Le flux de Paris est inversé pour couvrir les
// trois signes, toutes ces communes s'artificialisant : celui de l'Île-de-Sein est réellement nul.
export const COMMUNES_ARTIF_NET_SHARE: NationalMapValueColumns = {
    ...header('artif_net_pct_surface', null, NO_PERIOD, WITHOUT_OCSGE),
    values: [0.0697, 0.2407, 0, 0.1791, 0.4174, 0.4987, 0.1787, -0.0137, 0.085, N, N, 1.1836, 0.4593],
    year_sets: FLUX_YEARS,
    year_set_index: [0, 1, 1, 2, 0, 3, 3, 1, 1, 5, 5, 4, 4],
};

// --- Valeurs en nombre ---------------------------------------------------------------------

// Générateur pseudo-aléatoire à graine (mulberry32) : les mêmes valeurs à chaque exécution
const seededRandom = (seed: number): (() => number) => {
    let state = seed;
    return () => {
        state = (state + 0x6d2b79f5) | 0;
        let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
        mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
        return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
    };
};

// Parts de surface consommée réalistes, en % à deux décimales : une distribution log-normale
// calée sur les quintiles réels des communes (0,09 ; 0,22 ; 0,43 et 0,9 %), avec 3 % de communes
// à zéro. Les ex æquo y sont nombreux, comme dans les données.
export const realisticShares = (count: number, seed = 1): number[] => {
    const random = seededRandom(seed);
    // Loi normale centrée réduite (Box-Muller)
    const normal = (): number => Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());
    return Array.from({ length: count }, () => (random() < 0.03 ? 0 : Math.round(Math.exp(Math.log(0.31) + 1.27 * normal()) * 100) / 100));
};

// Colonne de communes fictives, une par valeur, toutes dans une région de l'Hexagone
export const communesColumn = (key: string, values: (number | null)[]): NationalMapValueColumns => ({
    scale: 'COMM',
    key,
    amount: null,
    start_year: 2011,
    end_year: 2024,
    ids: values.map((_, rank) => String(rank).padStart(5, '0')),
    regions: values.map(() => '53'),
    no_data: [],
    no_data_count: 0,
    values,
});
