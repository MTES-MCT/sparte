// Indicateurs de consommation d'ENAF de la carte nationale, d'après le premier tableau
// de https://github.com/MTES-MCT/sparte/issues/1621. Le jeton {{end}} des libellés est
// remplacé par l'année qui suit le dernier millésime disponible (« 20XX » dans l'issue) :
// « entre 2021 et 2025 » couvre du 1er janvier 2021 au 1er janvier 2025. Les identifiants
// des cartes sont les clés de la réponse de l'endpoint des indicateurs.
export type IndicatorType = 'map' | 'bivariate_map' | 'chart';
export type IndicatorUnit = 'ha' | '%' | 'ha/an';

export type Indicator = {
    id: string;
    label: string;
    description: string;
    type: IndicatorType;
    unit?: IndicatorUnit;
    decimals?: number;
    palette?: 'sequential' | 'diverging';
    usesPeriod?: boolean;
    // Indicateur déclaré mais pas encore affichable dans cette vue
    unavailable?: string;
    // Pour une carte : identifiants des graphiques qui peuvent l'accompagner
    charts?: string[];
};

export const UNIT_LABELS: Record<IndicatorUnit, string> = {
    ha: 'ha',
    '%': '%',
    'ha/an': 'ha par an',
};

export const INDICATOR_TYPE_LABELS: Record<IndicatorType, string> = {
    map: 'Carte',
    bivariate_map: 'Carte bivariée',
    chart: 'Graphique',
};

// Graphiques compatibles selon la nature de la carte
const PERIOD_CHARTS = ['conso_by_year_and_destination', 'destination_share'];
const SERIES_CHARTS = ['conso_by_year_and_destination'];

export const CONSO_INDICATORS: Indicator[] = [
    {
        id: 'conso_ha',
        label: "Consommation d'ENAF (en hectares)",
        description: 'Nouvelles surfaces urbanisées sur la période sélectionnée.',
        type: 'map',
        unit: 'ha',
        decimals: 0,
        usesPeriod: true,
        charts: PERIOD_CHARTS,
    },
    {
        id: 'conso_ha_gridded',
        label: "Consommation d'ENAF (en hectares), données carroyées",
        description: 'Nouvelles surfaces urbanisées sur la période sélectionnée, en carreaux de 1 km × 1 km.',
        type: 'map',
        unit: 'ha',
        decimals: 0,
        usesPeriod: true,
        unavailable: 'Les données carroyées ne sont pas encore affichables sur la carte nationale.',
        charts: PERIOD_CHARTS,
    },
    {
        id: 'conso_pct_surface',
        label: "Consommation d'ENAF (en pourcentage de la surface communale)",
        description: 'Nouvelles surfaces urbanisées sur la période sélectionnée, rapportées à la superficie du territoire.',
        type: 'map',
        unit: '%',
        decimals: 2,
        usesPeriod: true,
        charts: PERIOD_CHARTS,
    },
    {
        id: 'conso_habitat_ha',
        label: "Consommation d'ENAF à destination de l'habitat (en hectares)",
        description: 'Nouvelles surfaces urbanisées pour la destination « habitat », sur la période sélectionnée.',
        type: 'map',
        unit: 'ha',
        decimals: 0,
        usesPeriod: true,
        charts: PERIOD_CHARTS,
    },
    {
        id: 'conso_activite_ha',
        label: "Consommation d'ENAF à destination de l'activité (en hectares)",
        description: 'Nouvelles surfaces urbanisées pour la destination « activité », sur la période sélectionnée.',
        type: 'map',
        unit: 'ha',
        decimals: 0,
        usesPeriod: true,
        charts: PERIOD_CHARTS,
    },
    {
        id: 'bivariate_activite_emplois',
        label: "Rythme annuel de consommation pour l'activité et évolution des emplois",
        description:
            "Croise, pour chaque territoire, le rythme annuel de consommation d'ENAF à destination de l'activité et l'évolution du nombre d'emplois sur la période sélectionnée, classés chacun en trois niveaux.",
        type: 'bivariate_map',
        usesPeriod: true,
    },
    {
        id: 'bivariate_habitat_menages',
        label: "Rythme annuel de consommation pour l'habitat et évolution des ménages",
        description:
            "Croise, pour chaque territoire, le rythme annuel de consommation d'ENAF à destination de l'habitat et l'évolution du nombre de ménages sur la période sélectionnée, classés chacun en trois niveaux.",
        type: 'bivariate_map',
        usesPeriod: true,
    },
    {
        id: 'bivariate_habitat_population',
        label: "Rythme annuel de consommation pour l'habitat et évolution de la population",
        description:
            "Croise, pour chaque territoire, le rythme annuel de consommation d'ENAF à destination de l'habitat et l'évolution de la population sur la période sélectionnée, classés chacun en trois niveaux.",
        type: 'bivariate_map',
        usesPeriod: true,
    },
    {
        id: 'annual_conso_2011_2021',
        label: "Consommation annuelle d'ENAF (en hectares) entre 2011 et 2021",
        description: 'Moyenne annuelle des nouvelles surfaces urbanisées entre le 1er janvier 2011 et le 1er janvier 2021.',
        type: 'map',
        unit: 'ha/an',
        decimals: 0,
        charts: SERIES_CHARTS,
    },
    {
        id: 'annual_conso_2021_end',
        label: "Consommation annuelle d'ENAF (en hectares) entre 2021 et {{end}}",
        description: 'Moyenne annuelle des nouvelles surfaces urbanisées entre le 1er janvier 2021 et le 1er janvier {{end}}.',
        type: 'map',
        unit: 'ha/an',
        decimals: 0,
        charts: SERIES_CHARTS,
    },
    {
        id: 'conso_evolution_between_periods',
        label: "Évolution de la consommation d'ENAF (en pourcentage) entre 2011-2021 et 2021-{{end}}",
        description:
            '(Rythme annuel de la période 2 − rythme annuel de la période 1) / rythme annuel de la période 1, les deux périodes n’ayant pas la même durée.',
        type: 'map',
        unit: '%',
        decimals: 1,
        palette: 'diverging',
        charts: SERIES_CHARTS,
    },
    {
        id: 'conso_2011_end',
        label: "Consommation d'ENAF (en hectares) entre le 1er janvier 2011 et le 1er janvier {{end}}",
        description: 'Nouvelles surfaces urbanisées entre le 1er janvier 2011 et le 1er janvier {{end}}.',
        type: 'map',
        unit: 'ha',
        decimals: 0,
        charts: PERIOD_CHARTS,
    },
    {
        id: 'conso_2011_2021',
        label: "Consommation d'ENAF (en hectares) entre le 1er janvier 2011 et le 1er janvier 2021",
        description: 'Nouvelles surfaces urbanisées entre le 1er janvier 2011 et le 1er janvier 2021.',
        type: 'map',
        unit: 'ha',
        decimals: 0,
        charts: SERIES_CHARTS,
    },
    {
        id: 'conso_2021_end',
        label: "Consommation d'ENAF (en hectares) entre le 1er janvier 2021 et le 1er janvier {{end}}",
        description: 'Nouvelles surfaces urbanisées entre le 1er janvier 2021 et le 1er janvier {{end}}.',
        type: 'map',
        unit: 'ha',
        decimals: 0,
        charts: SERIES_CHARTS,
    },
    {
        id: 'conso_by_year_and_destination',
        label: "Consommation d'ENAF (en hectares) par année et par destination",
        description: 'Nouvelles surfaces urbanisées par destination, année par année, entre le 1er janvier 2011 et le 1er janvier {{end}} (diagramme en barres).',
        type: 'chart',
    },
    {
        id: 'destination_share',
        label: "Répartition de la consommation d'ENAF par destination",
        description: "Parts de chaque destination dans la consommation d'ENAF de la période sélectionnée (diagramme circulaire).",
        type: 'chart',
    },
];

export const MAP_INDICATORS = CONSO_INDICATORS.filter((i) => i.type !== 'chart');
export const DEFAULT_INDICATOR = MAP_INDICATORS[0];

// Libellés avec l'année réelle ; tant que l'année n'est pas connue, le jeton reste générique
export const withEndYear = (indicators: Indicator[], lastYear?: number): Indicator[] => {
    const end = lastYear === undefined ? 'la dernière année disponible' : String(lastYear + 1);
    const resolve = (text: string) => text.replace(/\{\{end\}\}/g, end);
    return indicators.map((i) => ({ ...i, label: resolve(i.label), description: resolve(i.description) }));
};
