// Indicateurs de consommation d'ENAF de la carte nationale, d'après le premier tableau
// de https://github.com/MTES-MCT/sparte/issues/1621. Le jeton {{end}} des libellés est
// remplacé par l'année qui suit le dernier millésime disponible (« 20XX » dans l'issue) :
// « entre 2021 et 2025 » couvre du 1er janvier 2021 au 1er janvier 2025. Les identifiants
// des cartes sont les clés de la réponse de l'endpoint des indicateurs.
// Les cumuls et les moyennes annuelles à années fixes du tableau n'ont pas de carte : ce sont la
// carte en hectares sur une période donnée, que le sélecteur de période propose toute prête.
import { ALL_DESTINATIONS, ColoredDestination, DESTINATION_COLORS } from './domain/grid/consoColors';

export type IndicatorType = 'map' | 'bivariate_map' | 'chart';
export type IndicatorUnit = 'ha' | '%' | 'ha/an' | '%/an';

// Version relative d'une valeur en hectares : la même grandeur rapportée à la surface du territoire,
// servie sous la clé `key` par la réponse des valeurs par commune. Elle est dessinée à la place des
// hectares là où des symboles proportionnels ne seraient pas lisibles : toutes les communes du pays.
export type RelativeVersion = {
    key: string;
    label: string;
    unit: '%' | '%/an';
    decimals: number;
    // Clé des hectares donnés au survol à côté de la version relative ; sans elle, l'identifiant de la carte
    amount?: string;
};

// Destinations de la consommation d'espaces que les données carroyées distinguent, sous le code
// que portent leurs attributs et leurs fichiers de tuiles
export type GridDestination = 'habitat' | 'activite' | 'mixte' | 'route' | 'ferroviaire' | 'inconnu';

// Cartes d'une même famille : le menu les range sur une seule ligne, et pose sous elle, quand elle
// est sélectionnée, un choix à boutons qui mène à chacune
type MenuChoice = {
    // Identifiant de la carte dont la ligne porte le libellé
    line: string;
    // Titre du choix (« Destination »), puis libellé du bouton de la carte
    title: string;
    option: string;
    // Couleur de la carte, rappelée par une pastille dans son bouton ; sans elle, pas de pastille
    color?: string;
};

export type Indicator = {
    id: string;
    label: string;
    description: string;
    type: IndicatorType;
    unit?: IndicatorUnit;
    decimals?: number;
    palette?: 'sequential' | 'diverging';
    usesPeriod?: boolean;
    // Mailles carrées servies en tuiles vectorielles, et non valeurs par territoire : carreaux de
    // 1 km × 1 km de la consommation, mailles des sols artificialisés
    gridded?: boolean;
    // Carte carroyée d'une seule destination de la consommation ; sans elle, toutes les destinations
    destination?: GridDestination;
    // Pour une carte qui partage sa ligne du menu avec d'autres : sa place dans leur choix
    menuChoice?: MenuChoice;
    // Maille à laquelle la carte s'ouvre, par niveau de zone (NATION, REGION…), quand ce n'est pas
    // celle de la zone (voir defaultScale) : pour une carte dont les territoires ne portent pas de
    // valeur et ne servent qu'à se repérer et à ouvrir une zone
    openingScales?: Record<string, string>;
    // Source OCS GE (artificialisation) : millésimes propres à chaque département, sans période à choisir
    source?: 'ocsge';
    // Valeur qui peut être négative : en cercles proportionnels, la taille porte la valeur absolue et la couleur le signe
    signed?: boolean;
    // Carte en anneaux : deux flux de sens contraire par territoire. La taille de l'anneau porte
    // leur somme, ses deux arcs leur partage ; la valeur nette est leur différence.
    rings?: boolean;
    // Pour une carte en hectares ou en hectares par an : sa version relative
    relative?: RelativeVersion;
    // Pour une carte : identifiants des graphiques qui peuvent l'accompagner
    charts?: string[];
};

export const UNIT_LABELS: Record<IndicatorUnit, string> = {
    ha: 'ha',
    '%': '%',
    'ha/an': 'ha par an',
    '%/an': '% par an',
};

export const INDICATOR_TYPE_LABELS: Record<IndicatorType, string> = {
    map: 'Carte',
    bivariate_map: 'Carte bivariée',
    chart: 'Graphique',
};

// Graphiques compatibles selon la nature de la carte, dans l'ordre où la colonne les affiche
const PERIOD_CHARTS = ['conso_by_year_and_destination', 'destination_share'];
// Évolution entre les deux périodes de référence : chaque année depuis 2011 et le rythme moyen de
// chaque période, quelle que soit la période choisie, que la carte ne lit pas
const REFERENCE_PERIODS_CHARTS = ['conso_by_year'];
// Cartes d'une destination : sa consommation dans le temps devant le total, puis sa part
const HABITAT_CHARTS = ['conso_habitat_by_year', 'destination_share', 'conso_and_population_by_year'];
const ACTIVITY_CHARTS = ['conso_activite_by_year', 'destination_share'];
// Nuage de points des territoires affichés par une carte bivariée : la page le dessine elle-même
// à partir de la carte, sans rien demander au serveur
export const CROSSED_RATES_SCATTER = 'crossed_rates_scatter';
// Cartes bivariées : le nuage des territoires selon les deux grandeurs que la carte croise, puis
// l'évolution dans le temps de ces grandeurs. Aucun graphique ne suit l'emploi et la consommation
// ensemble : deux graphiques se complètent.
const HABITAT_POPULATION_CHARTS = [CROSSED_RATES_SCATTER, 'conso_and_population_by_year'];
const HABITAT_HOUSEHOLDS_CHARTS = [CROSSED_RATES_SCATTER, 'conso_and_households_by_year'];
const ACTIVITY_EMPLOYMENT_CHARTS = [CROSSED_RATES_SCATTER, 'conso_activite_by_year', 'employment_by_census'];

// Ce que le menu et les textes des cartes disent de chaque destination du carroyage : le libellé
// de son bouton, et le complément qui la désigne (« consommation à destination de l'habitat »).
// L'ordre est celui des boutons.
export const GRID_DESTINATIONS: Record<GridDestination, { option: string; complement: string }> = {
    habitat: { option: 'Habitat', complement: "à destination de l'habitat" },
    activite: { option: 'Activité', complement: "à destination de l'activité" },
    mixte: { option: 'Mixte', complement: 'à destination mixte' },
    route: { option: 'Routes', complement: 'à destination des routes' },
    ferroviaire: { option: 'Voies ferrées', complement: 'à destination des voies ferrées' },
    inconnu: { option: 'Inconnue', complement: 'sans destination connue' },
};

// Les cartes carroyées partagent la ligne de celle de toutes les destinations
const GRID_LINE = 'conso_ha_gridded';
// Chaque bouton porte la couleur de sa carte, celle de la destination (voir domain/grid/consoColors.ts)
const gridChoice = (option: string, destination: ColoredDestination): MenuChoice => ({
    line: GRID_LINE,
    title: 'Destination',
    option,
    color: DESTINATION_COLORS[destination],
});

// Carte carroyée d'une seule destination : le rendu, les bornes des classes et l'unité de la carte
// de toutes les destinations, pour que les sept cartes se comparent ; seule la couleur change
// (voir domain/grid/consoColors.ts)
const griddedDestinationMap = (destination: GridDestination): Indicator => {
    const { option, complement } = GRID_DESTINATIONS[destination];
    return {
        id: `conso_${destination}_ha_gridded`,
        label: `Consommation d'ENAF ${complement} (en hectares), données carroyées`,
        description: `Nouvelles surfaces urbanisées ${complement}, sur la période sélectionnée, en carreaux de 1 km × 1 km (Hexagone et Corse).`,
        type: 'map',
        unit: 'ha',
        decimals: 2,
        usesPeriod: true,
        gridded: true,
        destination,
        menuChoice: gridChoice(option, destination),
        charts: PERIOD_CHARTS,
    };
};

// L'ordre du catalogue est celui du menu, et sa première carte est celle de l'ouverture de la page.
// Les représentations relatives passent avant les absolues : elles comparent les territoires
// quelle que soit leur taille.
export const CONSO_INDICATORS: Indicator[] = [
    // Représentations relatives : part de la surface, densité au km², évolution, croisements de taux
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
        id: 'conso_ha_gridded',
        label: "Consommation d'ENAF (en hectares), données carroyées",
        description: 'Nouvelles surfaces urbanisées sur la période sélectionnée, en carreaux de 1 km × 1 km (Hexagone et Corse).',
        type: 'map',
        unit: 'ha',
        decimals: 2,
        usesPeriod: true,
        gridded: true,
        menuChoice: gridChoice('Toutes', ALL_DESTINATIONS),
        charts: PERIOD_CHARTS,
    },
    ...(Object.keys(GRID_DESTINATIONS) as GridDestination[]).map(griddedDestinationMap),
    {
        id: 'conso_evolution_between_periods',
        label: "Évolution de la consommation d'ENAF (en pourcentage) entre 2011-2021 et 2021-{{end}}",
        description:
            '(Rythme annuel de la période 2 − rythme annuel de la période 1) / rythme annuel de la période 1, les deux périodes n’ayant pas la même durée.',
        type: 'map',
        unit: '%',
        decimals: 1,
        palette: 'diverging',
        charts: REFERENCE_PERIODS_CHARTS,
    },
    {
        id: 'bivariate_activite_emplois',
        label: "Rythme annuel de consommation pour l'activité et évolution des emplois",
        description:
            "Croise, pour chaque territoire, le rythme annuel de consommation d'ENAF à destination de l'activité et l'évolution du nombre d'emplois sur la période sélectionnée, classés chacun en trois niveaux.",
        type: 'bivariate_map',
        usesPeriod: true,
        charts: ACTIVITY_EMPLOYMENT_CHARTS,
    },
    {
        id: 'bivariate_habitat_menages',
        label: "Rythme annuel de consommation pour l'habitat et évolution des ménages",
        description:
            "Croise, pour chaque territoire, le rythme annuel de consommation d'ENAF à destination de l'habitat et l'évolution du nombre de ménages sur la période sélectionnée, classés chacun en trois niveaux.",
        type: 'bivariate_map',
        usesPeriod: true,
        charts: HABITAT_HOUSEHOLDS_CHARTS,
    },
    {
        id: 'bivariate_habitat_population',
        label: "Rythme annuel de consommation pour l'habitat et évolution de la population",
        description:
            "Croise, pour chaque territoire, le rythme annuel de consommation d'ENAF à destination de l'habitat et l'évolution de la population sur la période sélectionnée, classés chacun en trois niveaux.",
        type: 'bivariate_map',
        usesPeriod: true,
        charts: HABITAT_POPULATION_CHARTS,
    },
    // Représentations absolues : hectares
    {
        id: 'conso_ha',
        label: "Consommation d'ENAF (en hectares)",
        description: 'Nouvelles surfaces urbanisées sur la période sélectionnée.',
        type: 'map',
        unit: 'ha',
        decimals: 0,
        relative: {
            key: 'conso_pct_surface',
            label: "Consommation d'ENAF (en pourcentage de la surface communale)",
            unit: '%',
            decimals: 2,
        },
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
        relative: {
            key: 'conso_habitat_pct_surface',
            label: "Consommation d'ENAF à destination de l'habitat (en pourcentage de la surface communale)",
            unit: '%',
            decimals: 2,
        },
        usesPeriod: true,
        charts: HABITAT_CHARTS,
    },
    {
        id: 'conso_activite_ha',
        label: "Consommation d'ENAF à destination de l'activité (en hectares)",
        description: 'Nouvelles surfaces urbanisées pour la destination « activité », sur la période sélectionnée.',
        type: 'map',
        unit: 'ha',
        decimals: 0,
        relative: {
            key: 'conso_activite_pct_surface',
            label: "Consommation d'ENAF à destination de l'activité (en pourcentage de la surface communale)",
            unit: '%',
            decimals: 2,
        },
        usesPeriod: true,
        charts: ACTIVITY_CHARTS,
    },
    // Graphiques complémentaires, dans l'ordre où le menu les propose
    {
        id: CROSSED_RATES_SCATTER,
        label: 'Territoires affichés selon les deux taux que la carte croise (nuage de points)',
        description:
            "Un point par territoire affiché, placé selon les deux taux que la carte croise sur la période sélectionnée et coloré comme sur la carte ; les tirets sont les seuils de ses classes. Dessiné à partir de dix territoires, sauf pour l'ensemble des communes du pays.",
        type: 'chart',
    },
    {
        id: 'conso_by_year_and_destination',
        label: "Consommation d'ENAF (en hectares) par année et par destination",
        description: 'Nouvelles surfaces urbanisées par destination, année par année, entre le 1er janvier 2011 et le 1er janvier {{end}} (diagramme en barres).',
        type: 'chart',
    },
    {
        id: 'conso_habitat_by_year',
        label: "Consommation d'ENAF à destination de l'habitat (en hectares), par année",
        description: 'Nouvelles surfaces urbanisées pour la destination « habitat », année par année sur la période sélectionnée, devant la consommation totale (diagramme en barres).',
        type: 'chart',
    },
    {
        id: 'conso_activite_by_year',
        label: "Consommation d'ENAF à destination de l'activité (en hectares), par année",
        description: 'Nouvelles surfaces urbanisées pour la destination « activité », année par année sur la période sélectionnée, devant la consommation totale (diagramme en barres).',
        type: 'chart',
    },
    {
        id: 'conso_by_year',
        label: "Consommation d'ENAF (en hectares) par année depuis 2011 et rythme moyen des deux périodes",
        description:
            'Nouvelles surfaces urbanisées année par année entre le 1er janvier 2011 et le 1er janvier {{end}}, avec la moyenne annuelle de chacune des deux périodes que la carte compare (diagramme en barres). Ne dépend pas de la période sélectionnée.',
        type: 'chart',
    },
    {
        id: 'destination_share',
        label: "Répartition de la consommation d'ENAF par destination",
        description: "Parts de chaque destination dans la consommation d'ENAF de la période sélectionnée (diagramme circulaire).",
        type: 'chart',
    },
    {
        id: 'conso_and_population_by_year',
        label: "Consommation d'ENAF (en hectares) et population, par année",
        description:
            'Nouvelles surfaces urbanisées, au total et pour la destination « habitat », année par année sur la période sélectionnée, et population aux recensements de 2011, 2016 et 2022 (barres et courbe, l’une sous l’autre).',
        type: 'chart',
    },
    {
        id: 'conso_and_households_by_year',
        label: "Consommation d'ENAF (en hectares) et nombre de ménages, par année",
        description:
            'Nouvelles surfaces urbanisées, au total et pour la destination « habitat », année par année sur la période sélectionnée, et nombre de ménages aux recensements de 2011, 2016 et 2022 (barres et courbe, l’une sous l’autre). Disponible pour une région, un département ou un EPCI.',
        type: 'chart',
    },
    {
        id: 'employment_by_census',
        label: 'Emploi et chômage des 15-64 ans aux recensements de 2011, 2016 et 2022',
        description:
            "Actifs occupés, chômeurs et inactifs de 15 à 64 ans (diagramme en barres) : l'évolution des emplois de la carte est celle des actifs occupés. Disponible pour une région, un département ou un EPCI.",
        type: 'chart',
    },
];

// Une valeur absolue (hectares) se lit à la taille d'un symbole, cercle ou anneau ; les aplats de
// couleur sont réservés aux valeurs relatives (parts, évolutions), qui ne dépendent pas de la taille
// du territoire. Les carreaux ont tous la même surface : leurs hectares sont une densité,
// représentée en aplat.
export const usesSymbols = (indicator: Indicator): boolean =>
    indicator.type === 'map' && !indicator.gridded && !indicator.rings && (indicator.unit === 'ha' || indicator.unit === 'ha/an');

// Représentation cartographique d'un indicateur : aplat de couleur par territoire, croisement de
// deux taux en neuf classes, cercles proportionnels, anneaux partagés entre deux flux ou carreaux
export type RenderMode = 'choropleth' | 'bivariate' | 'symbols' | 'rings' | 'grid';

export const renderModeOf = (indicator: Indicator): RenderMode => {
    if (indicator.gridded) return 'grid';
    if (indicator.type === 'bivariate_map') return 'bivariate';
    if (indicator.rings) return 'rings';
    return usesSymbols(indicator) ? 'symbols' : 'choropleth';
};

export const MAP_INDICATORS = CONSO_INDICATORS.filter((i) => i.type !== 'chart');

// Ligne du menu : une carte seule, ou la première d'une famille et le choix qui mène à chacune
type MenuLine = {
    // Carte dont la ligne porte l'identifiant et le libellé
    head: Indicator;
    // Cartes de la famille, celle de la ligne comprise, dans l'ordre des boutons ; vide pour une carte seule
    choices: Indicator[];
};

// Lignes du menu pour une liste de cartes, dans l'ordre du catalogue
export const menuLinesOf = (maps: Indicator[]): MenuLine[] =>
    maps
        .filter((map) => !map.menuChoice || map.menuChoice.line === map.id)
        .map((head) => ({ head, choices: maps.filter((map) => map.menuChoice?.line === head.id) }));
export const DEFAULT_INDICATOR = MAP_INDICATORS[0];

// Libellés avec l'année réelle ; tant que l'année n'est pas connue, le jeton reste générique.
// Un indicateur sans jeton est rendu tel quel : la carte qui l'affiche n'a pas à être redessinée
// quand l'année devient connue.
export const withEndYear = (indicators: Indicator[], lastYear?: number): Indicator[] => {
    const end = lastYear === undefined ? 'la dernière année disponible' : String(lastYear + 1);
    const resolve = (text: string) => text.replace(/\{\{end\}\}/g, end);
    return indicators.map((indicator) => {
        const label = resolve(indicator.label);
        const description = resolve(indicator.description);
        return label === indicator.label && description === indicator.description ? indicator : { ...indicator, label, description };
    });
};
