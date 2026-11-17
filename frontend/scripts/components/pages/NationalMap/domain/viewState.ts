// Vue demandée de la carte nationale : la zone, la maille, la période et la carte choisies, telles
// que les portent les commandes, le menu et l'URL. Chaque changement passe par `viewReducer`, qui
// rend le même objet quand rien ne change : un choix sans effet ne redessine rien.
import { ARTIF_FLUX_CHARTS, ARTIF_FLUX_INDICATORS, ARTIF_INDICATORS, ARTIF_STOCK_CHARTS, ARTIF_STOCK_INDICATORS } from '../artifIndicators';
import { CONSO_INDICATORS, DEFAULT_INDICATOR, Indicator, MAP_INDICATORS } from '../indicators';
import { ZONE_FRANCE, ZoneNames, availableScales, defaultScale, isValidZone, ownOpeningScale } from '../zones';

// Rubriques du menu, dans l'ordre d'affichage ; une rubrique est désignée par son libellé
export const LAYERS = [
    "Visualiser la consommation d'ENAF",
    'Visualiser les espaces artificialisés',
    "Visualiser l'artificialisation",
];

// Indicateurs des rubriques d'artificialisation (OCS GE), par libellé de rubrique : leurs cartes,
// puis leurs graphiques complémentaires
export const ARTIF_LAYERS: Record<string, Indicator[]> = {
    [LAYERS[1]]: [...ARTIF_STOCK_INDICATORS, ...ARTIF_STOCK_CHARTS],
    [LAYERS[2]]: [...ARTIF_FLUX_INDICATORS, ...ARTIF_FLUX_CHARTS],
};

// Graphiques complémentaires des trois rubriques
const CHARTS = [...CONSO_INDICATORS.filter((i) => i.type === 'chart'), ...ARTIF_STOCK_CHARTS, ...ARTIF_FLUX_CHARTS];

// Rubrique d'un indicateur cartographique : la consommation par défaut
const layerOf = (indicatorId: string): string =>
    Object.keys(ARTIF_LAYERS).find((label) => ARTIF_LAYERS[label].some((i) => i.id === indicatorId)) ?? LAYERS[0];

// Cartes que la vue peut demander : celles des trois rubriques
const MAPS = [...MAP_INDICATORS, ...ARTIF_INDICATORS];

// Ligne du menu qu'une carte partage avec d'autres (voir MenuChoice) ; null pour une carte seule sur sa ligne
const sharedLineOf = (indicatorId: string): string | null => MAPS.find((i) => i.id === indicatorId)?.menuChoice?.line ?? null;

// Maille propre à une carte pour une zone (voir `openingScales`) ; null si elle suit la règle commune
const ownScaleOf = (indicatorId: string, zone: string): string | null => ownOpeningScale(zone, MAPS.find((i) => i.id === indicatorId)?.openingScales);

// Carte affichée à l'ouverture d'une rubrique
const defaultIndicatorOf = (layer: string): string => ARTIF_LAYERS[layer]?.[0].id ?? DEFAULT_INDICATOR.id;

// Période par défaut, resserrée sur les années disponibles dès que l'API répond
export const DEFAULT_START_YEAR = 2011;
export const DEFAULT_END_YEAR = 2024;

// Paramètres d'URL qui décrivent la vue, pour la rouvrir à l'identique
const URL_PARAMS = { zone: 'zone', scale: 'scale', startYear: 'start', endYear: 'end', indicator: 'indicator' };

export type ViewRequest = { zone: string; scale: string; startYear: number; endYear: number; indicatorId: string };

export type ViewState = {
    request: ViewRequest;
    // Une seule rubrique dépliée à la fois
    openRubrique: string | null;
    // Dernière carte choisie dans chaque rubrique, retrouvée quand on rouvre la rubrique
    lastIndicatorByRubrique: Record<string, string>;
    // Dernière carte choisie sur chaque ligne du menu qui en regroupe plusieurs (les destinations
    // du carroyage), retrouvée quand on revient sur la ligne
    lastIndicatorByLine: Record<string, string>;
    // Graphiques affichés en complément de la carte
    activeCharts: string[];
    // Noms des territoires rencontrés (cliqués sur la carte, parents chargés) : le titre et le fil
    // d'Ariane nomment ainsi la zone tout de suite, sans attendre son fond de carte
    names: ZoneNames;
};

export type ViewAction =
    | { type: 'zoneChanged'; zone: string; name?: string }
    | { type: 'scaleChanged'; scale: string }
    | { type: 'startYearChanged' | 'endYearChanged'; year: number }
    | { type: 'periodChanged'; startYear: number; endYear: number }
    | { type: 'periodClamped'; years: { min: number; max: number } }
    | { type: 'indicatorSelected' | 'lineSelected'; id: string }
    | { type: 'rubriqueToggled'; id: string }
    | { type: 'chartToggled'; id: string }
    | { type: 'namesLearned'; names: ZoneNames };

// Vue décrite par les paramètres d'une URL, avec des valeurs sûres si l'un d'eux est absent ou invalide
export const parseView = (search: string): ViewRequest => {
    const params = new URLSearchParams(search);
    const zoneParam = params.get(URL_PARAMS.zone);
    const zone = zoneParam && isValidZone(zoneParam) ? zoneParam : ZONE_FRANCE;
    const year = (key: string, fallback: number) => {
        const value = Number(params.get(key));
        return Number.isInteger(value) && value > 1900 ? value : fallback;
    };
    const startYear = year(URL_PARAMS.startYear, DEFAULT_START_YEAR);
    const endYear = Math.max(startYear, year(URL_PARAMS.endYear, DEFAULT_END_YEAR));
    const indicatorParam = params.get(URL_PARAMS.indicator);
    const indicatorId = MAPS.some((i) => i.id === indicatorParam) ? (indicatorParam as string) : DEFAULT_INDICATOR.id;
    // Sans maille valide dans l'adresse : celle à laquelle la carte s'ouvre sur cette zone
    const scaleParam = params.get(URL_PARAMS.scale);
    const scale = scaleParam && availableScales(zone).includes(scaleParam) ? scaleParam : (ownScaleOf(indicatorId, zone) ?? defaultScale(zone));
    return { zone, scale, startYear, endYear, indicatorId };
};

// Carte demandée, telle que le catalogue la déclare : ses requêtes en découlent. Ses libellés ne
// portent pas encore l'année du dernier millésime, connue par la première réponse.
export const requestedIndicator = ({ indicatorId }: ViewRequest): Indicator => MAPS.find((i) => i.id === indicatorId) ?? DEFAULT_INDICATOR;

// Paramètres d'URL de la vue ; ceux qui ne la décrivent pas (comme `showinfo`) sont conservés
export const serializeView = (search: string, request: ViewRequest): string => {
    const params = new URLSearchParams(search);
    params.set(URL_PARAMS.zone, request.zone);
    params.set(URL_PARAMS.scale, request.scale);
    params.set(URL_PARAMS.startYear, String(request.startYear));
    params.set(URL_PARAMS.endYear, String(request.endYear));
    params.set(URL_PARAMS.indicator, request.indicatorId);
    return `?${params}`;
};

// État d'ouverture de la page : la rubrique de l'indicateur demandé est dépliée, tous les graphiques sont cochés
export const initialViewState = (search: string): ViewState => {
    const request = parseView(search);
    const rubrique = layerOf(request.indicatorId);
    const line = sharedLineOf(request.indicatorId);
    return {
        request,
        openRubrique: rubrique,
        lastIndicatorByRubrique: { [rubrique]: request.indicatorId },
        lastIndicatorByLine: line ? { [line]: request.indicatorId } : {},
        activeCharts: CHARTS.map((i) => i.id),
        names: {},
    };
};

const withRequest = (state: ViewState, changes: Partial<ViewRequest>): ViewState => {
    const changed = (Object.keys(changes) as (keyof ViewRequest)[]).some((key) => changes[key] !== state.request[key]);
    return changed ? { ...state, request: { ...state.request, ...changes } } : state;
};

const withNames = (state: ViewState, names: ZoneNames): ViewState =>
    Object.entries(names).every(([zone, name]) => state.names[zone] === name) ? state : { ...state, names: { ...state.names, ...names } };

// Mémoire où `key` mène à `id` ; la même si c'est déjà le cas, ou sans clé à retenir
const remembering = (memory: Record<string, string>, key: string | null, id: string): Record<string, string> =>
    key === null || memory[key] === id ? memory : { ...memory, [key]: id };

const withIndicator = (state: ViewState, id: string): ViewState => {
    const lastIndicatorByRubrique = remembering(state.lastIndicatorByRubrique, layerOf(id), id);
    const lastIndicatorByLine = remembering(state.lastIndicatorByLine, sharedLineOf(id), id);
    const unchanged = lastIndicatorByRubrique === state.lastIndicatorByRubrique && lastIndicatorByLine === state.lastIndicatorByLine;
    // Une carte qui a sa propre maille d'ouverture pour la zone affichée s'y ouvre
    const ownScale = ownScaleOf(id, state.request.zone);
    return withRequest(unchanged ? state : { ...state, lastIndicatorByRubrique, lastIndicatorByLine }, { indicatorId: id, ...(ownScale ? { scale: ownScale } : {}) });
};

export const viewReducer = (state: ViewState, action: ViewAction): ViewState => {
    switch (action.type) {
        case 'zoneChanged': {
            // Changer de zone garde la maille en cours si la nouvelle zone la propose, sinon prend sa
            // maille d'ouverture ; une carte qui a la sienne pour cette zone s'y ouvre toujours
            const { scale, indicatorId } = state.request;
            const named = action.name ? withNames(state, { [action.zone]: action.name }) : state;
            const kept = availableScales(action.zone).includes(scale) ? scale : defaultScale(action.zone);
            return withRequest(named, { zone: action.zone, scale: ownScaleOf(indicatorId, action.zone) ?? kept });
        }
        case 'scaleChanged':
            return withRequest(state, { scale: action.scale });
        case 'startYearChanged':
            return withRequest(state, { startYear: action.year });
        case 'endYearChanged':
            return withRequest(state, { endYear: action.year });
        case 'periodChanged':
            // Les deux années d'un coup : une seule vue demandée, là où deux changements d'année en demanderaient deux
            return withRequest(state, { startYear: action.startYear, endYear: action.endYear });
        case 'periodClamped':
            // Resserre la période sur les années réellement disponibles
            return withRequest(state, {
                startYear: Math.max(state.request.startYear, action.years.min),
                endYear: Math.min(state.request.endYear, action.years.max),
            });
        case 'indicatorSelected':
            return withIndicator(state, action.id);
        case 'lineSelected':
            // Revenir sur une ligne qui regroupe plusieurs cartes retrouve la dernière qui y a été choisie
            return withIndicator(state, state.lastIndicatorByLine[action.id] ?? action.id);
        case 'rubriqueToggled': {
            // Ouvrir une rubrique affiche sa carte ; la refermer laisse la carte en place
            if (state.openRubrique === action.id) return { ...state, openRubrique: null };
            const opened = { ...state, openRubrique: action.id };
            if (layerOf(state.request.indicatorId) === action.id) return opened;
            return withIndicator(opened, state.lastIndicatorByRubrique[action.id] ?? defaultIndicatorOf(action.id));
        }
        case 'chartToggled': {
            const { activeCharts } = state;
            return { ...state, activeCharts: activeCharts.includes(action.id) ? activeCharts.filter((id) => id !== action.id) : [...activeCharts, action.id] };
        }
        case 'namesLearned':
            return withNames(state, action.names);
    }
};
