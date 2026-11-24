import React, { useEffect, useSyncExternalStore } from 'react';
import { act, render, renderHook, screen } from '@testing-library/react';
import type * as Highcharts from 'highcharts';
import ConsoCharts, { usePrefetchConsoCharts } from './ConsoCharts';
import { ARTIF_FLUX_CHARTS, ARTIF_INDICATORS, ARTIF_STOCK_CHARTS } from './artifIndicators';
import type { CrossedScatter, ScatterModel, ShownOcsge } from './domain/frame/types';
import { LandHighlight, createLandHighlight } from './domain/landHighlight';
import { CONSO_INDICATORS, CROSSED_RATES_SCATTER } from './indicators';
import { ZONE_FRANCE, ZONE_HEXAGONE } from './zones';

// Les graphiques complémentaires, avec quatre bouchons : GenericChart et le nuage de points, qui
// consignent ce qu'on leur remet, l'API, dont les réponses arrivent quand le test les remet, et le
// magasin Redux, qui consigne les requêtes qu'on lui remet (abonnements de la colonne,
// préchargements) et dit pour lesquelles le serveur a répondu.

jest.mock('@components/charts/GenericChart', () => ({ __esModule: true, default: MockGenericChart }));
jest.mock('./components/ScatterChart', () => ({ __esModule: true, default: MockScatterChart }));
jest.mock('react-redux', () => ({
    __esModule: true,
    useDispatch: () => mockDispatch,
    useSelector: (selector: (state: undefined) => unknown) => mockUseSelector(selector),
}));
jest.mock('@services/api', () => ({
    __esModule: true,
    useGetLandQuery: (land: Land, options: { skip: boolean }) => mockUseLandQuery(land, options),
    djangoApi: {
        endpoints: {
            getChartConfig: {
                // La requête d'un graphique, telle que le magasin la reçoit : ses arguments et ses options
                initiate: (query: ChartQuery, options?: object): ChartRequest => ({ query, options }),
                // Ce que le magasin sait de la réponse à une requête
                select: (query: ChartQuery) => () => mockAnswerOf(query),
            },
        },
    },
}));

type Land = { land_type: string; land_id: string };
// Sans paramètre : un graphique qui ne dépend que du territoire
type ChartParams = { start_date?: string; end_date?: string; index?: number; millesime_new_index?: number; millesime_old_index?: number };
type ChartQuery = Land & ChartParams & { id: string };
type ChartProps = Land & {
    id: string;
    params: ChartParams;
    sources: string[];
    containerProps: { style: { minHeight: string } };
    transformOptions: (options: Highcharts.Options) => Highcharts.Options;
};

const mockCharts = {
    // Props de chaque rendu de GenericChart, dans l'ordre
    renders: [] as ChartProps[],
    // Nombre de montages de chaque graphique
    mounts: {} as Record<string, number>,
};

// Nuage de points : son titre, et le canal de mise en avant qu'il a reçu
const mockScatter = { highlights: [] as LandHighlight[] };

function MockScatterChart({ model, highlight }: { model: ScatterModel; highlight: LandHighlight }) {
    mockScatter.highlights.push(highlight);
    return <div data-testid="scatter-chart">{model.title}</div>;
}

function MockGenericChart(props: ChartProps) {
    mockCharts.renders.push(props);
    useEffect(() => {
        mockCharts.mounts[props.id] = (mockCharts.mounts[props.id] ?? 0) + 1;
    }, [props.id]);
    return <div data-testid="generic-chart">{`${props.id} ${props.land_type}/${props.land_id} ${paramsText(props.params)}`}</div>;
}

// --- API d'essai -------------------------------------------------------------------------

type ChartRequest = { query: ChartQuery; options?: object };
// Ce que la fiche d'un territoire dit de l'OCS GE
type LandDetail = { name: string; surface: number; has_ocsge: boolean; millesimes: { index: number; year: number; departement: string }[] };

const mockServer = {
    outcomes: new Map<string, 'data' | 'error'>(),
    // Fiches de territoire : absentes tant que le serveur n'a pas répondu
    lands: new Map<string, LandDetail | 'error'>(),
    landsQueried: [] as string[],
    unsubscribed: [] as ChartQuery[],
    listeners: new Set<() => void>(),
    version: 0,
};

// La colonne se désabonne des requêtes d'une vue quand la carte en montre une autre
const mockDispatch = jest.fn((request: ChartRequest) => ({ unsubscribe: () => mockServer.unsubscribed.push(request.query) }));

// Ce que les paramètres d'une requête désignent : une période, un millésime, deux millésimes, ou rien
const paramsText = ({ start_date, end_date, index, millesime_new_index, millesime_old_index }: ChartParams): string => {
    if (start_date) return `${start_date}-${end_date}`;
    if (index !== undefined) return `millésime ${index}`;
    if (millesime_new_index !== undefined) return `millésimes ${millesime_old_index} et ${millesime_new_index}`;
    return 'sans période';
};

const requestKey = (query: ChartQuery): string => `${query.id} ${query.land_type}/${query.land_id} ${paramsText(query)}`;
const landKey = ({ land_type, land_id }: Land): string => `${land_type}/${land_id}`;

const mockSubscribe = (listener: () => void) => {
    mockServer.listeners.add(listener);
    return () => {
        mockServer.listeners.delete(listener);
    };
};

// Lecture du magasin, refaite à chaque réponse du serveur
function mockUseSelector(selector: (state: undefined) => unknown) {
    useSyncExternalStore(mockSubscribe, () => mockServer.version);
    return selector(undefined);
}

const mockAnswerOf = (query: ChartQuery) => {
    const outcome = mockServer.outcomes.get(requestKey(query));
    return { isSuccess: outcome === 'data', isError: outcome === 'error' };
};

// Ce que la colonne lit du hook de la fiche d'un territoire
function mockUseLandQuery(land: Land, { skip }: { skip: boolean }) {
    useSyncExternalStore(mockSubscribe, () => mockServer.version);
    if (skip) return { currentData: undefined, isError: false };
    mockServer.landsQueried.push(landKey(land));
    const outcome = mockServer.lands.get(landKey(land));
    return { currentData: outcome === 'error' ? undefined : outcome, isError: outcome === 'error' };
}

const notify = (): void => {
    mockServer.version += 1;
    mockServer.listeners.forEach((listener) => listener());
};

// `ocsge` : la vue est celle d'une carte de l'OCS GE, sans période, dont les territoires affichés ont cette étendue.
// `scatter` : ce que la carte donne à dessiner en nuage de points.
type View = { zone?: string; land: Land; startYear?: number; endYear?: number; charts?: string[]; ocsge?: ShownOcsge; scatter?: CrossedScatter | null };

const BOTH_CHARTS = ['conso_by_year_and_destination', 'destination_share'];
const STOCK_CHARTS = ['artif_share_by_millesime', 'artif_by_cover'];
const FLUX_CHARTS = ['artif_and_desartif', 'artif_flux_by_cover'];
const NATION = { land_type: 'NATION', land_id: 'NATION' };
const BRETAGNE = { land_type: 'REGION', land_id: '53' };
const GUYANE = { land_type: 'REGION', land_id: '03' };

// Graphiques du serveur qui dessinent ceux du catalogue : trois d'entre eux présentent chacun à sa
// façon la consommation par année et par destination
const SERVER_CHARTS: Record<string, string> = {
    conso_by_year_and_destination: 'chart_determinant_national_map',
    conso_habitat_by_year: 'chart_determinant_national_map',
    conso_activite_by_year: 'chart_determinant_national_map',
    conso_by_year: 'conso_annual_national_map',
    destination_share: 'pie_determinant_national_map',
    conso_and_population_by_year: 'population_conso_progression_chart_national_map',
    conso_and_households_by_year: 'dc_menages_evolution_national_map',
    employment_by_census: 'dc_emploi_chomage_national_map',
    artif_share_by_millesime: 'artif_synthese_national_map',
    artif_by_cover: 'pie_artif_by_couverture_national_map',
    artif_and_desartif: 'artif_net_flux_national_map',
    artif_flux_by_cover: 'artif_flux_by_couverture_national_map',
};
// Graphiques demandés sans paramètre : ils ne dépendent que du territoire
const TIMELESS_CHARTS = ['conso_by_year', 'employment_by_census', 'artif_share_by_millesime'];
// Graphiques de l'OCS GE qui désignent au serveur le dernier millésime du territoire, ou les deux derniers
const LAST_MILLESIME_CHARTS = ['artif_by_cover'];
const LAST_TWO_MILLESIMES_CHARTS = ['artif_and_desartif', 'artif_flux_by_cover'];

// Index du dernier millésime des territoires d'essai, sauf mention contraire
const LAST_INDEX = 2;

const paramsOf = (id: string, startYear: number, endYear: number, lastIndex: number): ChartParams => {
    if (TIMELESS_CHARTS.includes(id)) return {};
    if (LAST_MILLESIME_CHARTS.includes(id)) return { index: lastIndex };
    if (LAST_TWO_MILLESIMES_CHARTS.includes(id)) return { millesime_new_index: lastIndex, millesime_old_index: lastIndex - 1 };
    return { start_date: String(startYear), end_date: String(endYear) };
};

// Requêtes des graphiques d'une vue, telles que le serveur les reçoit ; le nuage de points, que la
// page dessine elle-même, n'en a pas
const queriesOf = ({ land, startYear = 2011, endYear = 2024, charts = BOTH_CHARTS }: View, lastIndex = LAST_INDEX): ChartQuery[] =>
    charts.filter((id) => id in SERVER_CHARTS).map((id) => ({ id: SERVER_CHARTS[id], ...land, ...paramsOf(id, startYear, endYear, lastIndex) }));

// Le serveur répond aux graphiques d'une vue
const answer = (view: View, outcome: 'data' | 'error' = 'data'): void =>
    act(() => {
        queriesOf(view).forEach((query) => mockServer.outcomes.set(requestKey(query), outcome));
        notify();
    });

// Fiche d'un territoire couvert par l'OCS GE, à un millésime par index
const landDetail = (name: string, surface: number, years: number[] = [2018, 2021]): LandDetail => ({
    name,
    surface,
    has_ocsge: true,
    millesimes: years.map((year, position) => ({ index: position + 1, year, departement: '35' })),
});

const BRETAGNE_DETAIL = landDetail('Bretagne', 2_744_642);
const FRANCE_DETAIL = landDetail('France', 63_764_822);
// Les territoires affichés couvrent exactement la Bretagne, tous avec des données
const BRETAGNE_SHOWN: ShownOcsge = { surfaceHa: 2_744_642, hasMissing: false };

// Le serveur répond pour la fiche d'un territoire
const describeLand = (land: Land, detail: LandDetail | 'error'): void =>
    act(() => {
        mockServer.lands.set(landKey(land), detail);
        notify();
    });

// Canal de mise en avant de la page
const HIGHLIGHT = createLandHighlight();

// Les graphiques tels que la page les monte ; les tableaux et les objets sont neufs à chaque rendu, comme
// dans la page, sauf le nuage de points, que le cadre affiché garde
const chartsElement = ({ zone = ZONE_FRANCE, land, startYear = 2011, endYear = 2024, charts = BOTH_CHARTS, ocsge, scatter = null }: View) => (
    <ConsoCharts
        zone={zone}
        land={{ ...land }}
        period={ocsge ? null : { startYear, endYear }}
        shownOcsge={ocsge ? { ...ocsge } : null}
        scatter={scatter}
        highlight={HIGHLIGHT}
        charts={[...charts]}
    />
);

// Requêtes que le magasin a reçues : celles auxquelles la colonne s'abonne, et les préchargements, sans abonnement
const requests = (prefetch: boolean): ChartQuery[] => mockDispatch.mock.calls.filter(([request]) => (request.options !== undefined) === prefetch).map(([request]) => request.query);
const subscribed = (): ChartQuery[] => requests(false);
const prefetched = (): ChartQuery[] => requests(true);

const shownCharts = (): string[] => screen.queryAllByTestId('generic-chart').map((chart) => chart.textContent);
// Emplacements signalés comme occupés : leur graphique est celui d'une vue précédente
const busySlots = (): boolean[] => screen.getAllByTestId('generic-chart').map((chart) => chart.parentElement.getAttribute('aria-busy') === 'true');
const lastRenderOf = (id: string): ChartProps => mockCharts.renders.filter((props) => props.id === id).pop();
// Props qui n'ont pas la même identité d'un rendu à l'autre : GenericChart, mémorisé, n'est rendu de nouveau que s'il y en a
const changedProps = (before: ChartProps, after: ChartProps): string[] =>
    (Object.keys(after) as (keyof ChartProps)[]).filter((name) => !Object.is(before[name], after[name]));
// Titre et sous-titre que le serveur donne à un graphique, dans sa variante « carte nationale »
const SERVER_TITLE = 'Titre du serveur';
const SERVER_SUBTITLE = 'Sous-titre du serveur';
// Titre et sous-titre qu'un graphique étroit affiche d'une réponse du serveur : les siens, que la
// colonne ne complète ou ne remplace que là où elle ne montre pas la même chose
const narrowTexts = (id: string, server: Highcharts.Options = {}): string[] => {
    const options = lastRenderOf(id).transformOptions({ title: { text: SERVER_TITLE }, subtitle: { text: SERVER_SUBTITLE }, ...server });
    const { title, subtitle } = options.responsive.rules[0].chartOptions;
    return [title.text ?? options.title.text, subtitle.text ?? options.subtitle.text];
};
// Séries que le graphique dessine d'une réponse du serveur
const drawnSeries = (id: string, server: Highcharts.Options): string[] => lastRenderOf(id).transformOptions(server).series.map((serie) => serie.name);

beforeEach(() => {
    mockCharts.renders = [];
    mockCharts.mounts = {};
    mockScatter.highlights = [];
    mockServer.outcomes.clear();
    mockServer.lands.clear();
    mockServer.landsQueried = [];
    mockServer.unsubscribed = [];
    mockDispatch.mockClear();
});

describe('graphiques complémentaires', () => {
    it('affiche les graphiques demandés, dans l’ordre, avec leur nombre', () => {
        answer({ land: NATION });
        render(chartsElement({ land: NATION }));

        expect(screen.getByRole('heading', { name: 'Graphiques complémentaires (2)' })).toBeInTheDocument();
        expect(shownCharts()).toEqual(['chart_determinant_national_map NATION/NATION 2011-2024', 'pie_determinant_national_map NATION/NATION 2011-2024']);
    });

    it('n’affiche rien sans graphique, et ignore un identifiant inconnu', () => {
        const { container } = render(chartsElement({ land: NATION, charts: ['inconnu'] }));

        expect(container).toBeEmptyDOMElement();
    });

    it('annonce un seul graphique sans le compter', () => {
        answer({ land: NATION });
        render(chartsElement({ land: NATION, charts: ['destination_share'] }));

        expect(screen.getByRole('heading', { name: 'Graphiques complémentaires' })).toBeInTheDocument();
        expect(shownCharts()).toEqual(['pie_determinant_national_map NATION/NATION 2011-2024']);
    });

    it('signale que les graphiques de l’Hexagone sont ceux de la France entière', () => {
        answer({ land: NATION });
        const { rerender } = render(chartsElement({ land: NATION }));

        expect(screen.queryByText(/Hexagone seul/)).not.toBeInTheDocument();

        rerender(chartsElement({ zone: ZONE_HEXAGONE, land: NATION }));

        expect(screen.getByText("Les graphiques de l'Hexagone seul ne sont pas disponibles : ceux de la France entière sont affichés.")).toBeInTheDocument();
    });

    it('garde le titre et le sous-titre du serveur, sauf le sous-titre d’une répartition, lue en parts dans la colonne', () => {
        answer({ land: NATION });
        render(chartsElement({ land: NATION }));

        expect(narrowTexts('chart_determinant_national_map')).toEqual([SERVER_TITLE, SERVER_SUBTITLE]);
        expect(narrowTexts('pie_determinant_national_map')).toEqual([SERVER_TITLE, 'En\u00a0% de la consommation']);
    });
});

describe('rendu sans changement de vue', () => {
    it('ne rend pas les graphiques de nouveau quand la page est rendue de nouveau', () => {
        answer({ land: NATION });
        const { rerender } = render(chartsElement({ land: NATION }));
        rerender(chartsElement({ land: NATION }));

        expect(mockCharts.renders).toHaveLength(2);
    });

    it('ne rend pas les graphiques de nouveau quand le serveur répond à une requête qu’ils ne lisent pas', () => {
        answer({ land: NATION });
        render(chartsElement({ land: NATION }));
        answer({ land: BRETAGNE });

        expect(mockCharts.renders).toHaveLength(2);
    });
});

describe('changement de vue', () => {
    it('garde l’ancien graphique en place, atténué, tant que le serveur n’a pas répondu pour la nouvelle vue', () => {
        answer({ land: NATION });
        const { rerender } = render(chartsElement({ land: NATION }));
        const before = lastRenderOf('chart_determinant_national_map');
        rerender(chartsElement({ land: BRETAGNE }));

        expect(shownCharts()).toEqual(['chart_determinant_national_map NATION/NATION 2011-2024', 'pie_determinant_national_map NATION/NATION 2011-2024']);
        expect(busySlots()).toEqual([true, true]);
        expect(changedProps(before, lastRenderOf('chart_determinant_national_map'))).toEqual([]);
    });

    it('affiche le graphique de la nouvelle vue dès la réponse du serveur, sans le remonter', () => {
        answer({ land: NATION });
        const { rerender } = render(chartsElement({ land: NATION }));
        rerender(chartsElement({ land: BRETAGNE }));
        answer({ land: BRETAGNE });

        expect(shownCharts()).toEqual(['chart_determinant_national_map REGION/53 2011-2024', 'pie_determinant_national_map REGION/53 2011-2024']);
        expect(busySlots()).toEqual([false, false]);
        expect(mockCharts.mounts).toEqual({ chart_determinant_national_map: 1, pie_determinant_national_map: 1 });
    });

    it('affiche tout de suite une vue dont la réponse est déjà en cache', () => {
        answer({ land: NATION });
        answer({ land: BRETAGNE });
        const { rerender } = render(chartsElement({ land: NATION }));
        rerender(chartsElement({ land: BRETAGNE }));

        expect(shownCharts()).toEqual(['chart_determinant_national_map REGION/53 2011-2024', 'pie_determinant_national_map REGION/53 2011-2024']);
        expect(busySlots()).toEqual([false, false]);
    });

    it('garde le graphique de l’ancienne période jusqu’à la réponse de la nouvelle', () => {
        answer({ land: NATION });
        const { rerender } = render(chartsElement({ land: NATION }));
        rerender(chartsElement({ land: NATION, startYear: 2015 }));

        expect(shownCharts()).toEqual(['chart_determinant_national_map NATION/NATION 2011-2024', 'pie_determinant_national_map NATION/NATION 2011-2024']);

        answer({ land: NATION, startYear: 2015 });

        expect(shownCharts()).toEqual(['chart_determinant_national_map NATION/NATION 2015-2024', 'pie_determinant_national_map NATION/NATION 2015-2024']);
    });

    it('laisse en place le graphique conservé quand l’autre est décoché', () => {
        answer({ land: NATION });
        const { rerender } = render(chartsElement({ land: NATION }));
        rerender(chartsElement({ land: NATION, charts: ['destination_share'] }));
        rerender(chartsElement({ land: NATION }));

        expect(mockCharts.mounts).toEqual({ chart_determinant_national_map: 2, pie_determinant_national_map: 1 });
    });
});

describe('premier affichage et échec', () => {
    it('remet la vue à GenericChart, qui affiche son chargeur, tant qu’aucune réponse n’est arrivée', () => {
        render(chartsElement({ land: NATION }));

        expect(shownCharts()).toEqual(['chart_determinant_national_map NATION/NATION 2011-2024', 'pie_determinant_national_map NATION/NATION 2011-2024']);
        expect(busySlots()).toEqual([false, false]);
    });

    it('remet à GenericChart la vue dont la requête a échoué, pour qu’il l’annonce', () => {
        answer({ land: NATION });
        const { rerender } = render(chartsElement({ land: NATION }));
        rerender(chartsElement({ land: BRETAGNE }));
        answer({ land: BRETAGNE }, 'error');

        expect(shownCharts()).toEqual(['chart_determinant_national_map REGION/53 2011-2024', 'pie_determinant_national_map REGION/53 2011-2024']);
        expect(busySlots()).toEqual([false, false]);
    });
});

const chartsOf = (mapId: string): string[] => CONSO_INDICATORS.find((indicator) => indicator.id === mapId).charts ?? [];

// Nuage de points d'une carte bivariée, réduit à son titre
const scatterOf = (title: string): CrossedScatter => {
    const axis = { label: '', unit: '', min: 0, max: 1, thresholds: [0, 1] as [number, number] };
    return { kind: 'points', model: { title, subtitle: '', description: '', method: '', filename: '', x: axis, y: axis, points: [] } };
};
// Titre du nuage affiché, s'il y en a un, et état de son emplacement
const shownScatter = (): string | null => screen.queryByTestId('scatter-chart')?.textContent ?? null;
const scatterIsBusy = (): boolean => screen.getByTestId('scatter-chart').parentElement.getAttribute('aria-busy') === 'true';
const HABITAT_POPULATION = chartsOf('bivariate_habitat_population');
const HABITAT_MENAGES = chartsOf('bivariate_habitat_menages');
const ACTIVITE_EMPLOIS = chartsOf('bivariate_activite_emplois');

describe('graphiques de chaque carte de consommation', () => {
    const DETERMINANT = 'chart_determinant_national_map REGION/53 2011-2024';
    const PIE = 'pie_determinant_national_map REGION/53 2011-2024';
    const POPULATION = 'population_conso_progression_chart_national_map REGION/53 2011-2024';

    it.each([
        ['conso_pct_surface', [DETERMINANT, PIE]],
        ['conso_ha_gridded', [DETERMINANT, PIE]],
        ['conso_habitat_ha_gridded', [DETERMINANT, PIE]],
        ['conso_evolution_between_periods', ['conso_annual_national_map REGION/53 sans période']],
        ['bivariate_activite_emplois', [DETERMINANT, 'dc_emploi_chomage_national_map REGION/53 sans période']],
        ['bivariate_habitat_menages', ['dc_menages_evolution_national_map REGION/53 2011-2024']],
        ['bivariate_habitat_population', [POPULATION]],
        ['conso_ha', [DETERMINANT, PIE]],
        ['conso_habitat_ha', [DETERMINANT, PIE, POPULATION]],
        ['conso_activite_ha', [DETERMINANT, PIE]],
    ])('affiche pour une région les graphiques que le catalogue donne à la carte %s', (mapId, expected) => {
        render(chartsElement({ land: BRETAGNE, charts: chartsOf(mapId) }));

        expect(shownCharts()).toEqual(expected);
    });

    it('donne au moins un graphique à chaque carte', () => {
        const maps = CONSO_INDICATORS.filter((indicator) => indicator.type !== 'chart');

        expect(maps.filter((map) => (map.charts ?? []).length === 0).map((map) => map.id)).toEqual([]);
    });

    it('sait dessiner chaque graphique que le catalogue décrit, et le catalogue décrit chacun de ceux qu’il donne à une carte', () => {
        const described = CONSO_INDICATORS.filter((indicator) => indicator.type === 'chart').map((indicator) => indicator.id);
        const given = CONSO_INDICATORS.flatMap((indicator) => indicator.charts ?? []);
        render(chartsElement({ land: BRETAGNE, charts: described, scatter: scatterOf('Un point par département') }));

        expect(given.filter((id) => !described.includes(id))).toEqual([]);
        expect(described.filter((id) => !given.includes(id))).toEqual([]);
        // Le serveur dessine tous les graphiques, sauf le nuage de points, que la page dessine elle-même
        expect(mockCharts.renders.map((props) => props.id)).toEqual(described.filter((id) => id !== CROSSED_RATES_SCATTER).map((id) => SERVER_CHARTS[id]));
        expect(shownScatter()).toBe('Un point par département');
    });

    it('range les graphiques d’une carte dans l’ordre où le menu les propose', () => {
        const described = CONSO_INDICATORS.filter((indicator) => indicator.type === 'chart').map((indicator) => indicator.id);
        const maps = CONSO_INDICATORS.filter((indicator) => indicator.type !== 'chart');

        maps.forEach((map) => expect(chartsOf(map.id)).toEqual(described.filter((id) => chartsOf(map.id).includes(id))));
    });

    it('demande chaque graphique avec la période, sauf ceux qui n’en dépendent pas, demandés sans paramètre', () => {
        render(chartsElement({ land: BRETAGNE, startYear: 2015, endYear: 2020, charts: [...ACTIVITE_EMPLOIS, ...chartsOf('conso_evolution_between_periods')] }));

        expect(subscribed()).toEqual([
            { id: 'chart_determinant_national_map', land_type: 'REGION', land_id: '53', start_date: '2015', end_date: '2020' },
            { id: 'dc_emploi_chomage_national_map', land_type: 'REGION', land_id: '53' },
            { id: 'conso_annual_national_map', land_type: 'REGION', land_id: '53' },
        ]);
        expect(lastRenderOf('dc_emploi_chomage_national_map').params).toEqual({});
        expect(lastRenderOf('conso_annual_national_map').params).toEqual({});
    });

    it('cite les sources de chaque graphique : fichiers fonciers, Insee, ou les deux', () => {
        render(chartsElement({ land: BRETAGNE, charts: [...HABITAT_POPULATION, ...HABITAT_MENAGES, ...ACTIVITE_EMPLOIS, 'conso_by_year'] }));

        expect(mockCharts.renders.map((props) => [props.id, props.sources])).toEqual([
            ['population_conso_progression_chart_national_map', ['majic', 'insee']],
            ['dc_menages_evolution_national_map', ['majic', 'insee']],
            ['chart_determinant_national_map', ['majic']],
            ['dc_emploi_chomage_national_map', ['insee']],
            ['conso_annual_national_map', ['majic']],
        ]);
    });

    it('garde le titre du serveur, sauf pour une destination devant le total, que le serveur ne dessine pas', () => {
        const destinations = { series: ['Habitat', 'Activité', 'Total'].map((name) => ({ name })) } as Highcharts.Options;
        render(chartsElement({ land: BRETAGNE, charts: [...HABITAT_POPULATION, ...HABITAT_MENAGES, ...ACTIVITE_EMPLOIS, 'conso_by_year'] }));

        expect(narrowTexts('population_conso_progression_chart_national_map')[0]).toBe(SERVER_TITLE);
        expect(narrowTexts('dc_menages_evolution_national_map')[0]).toBe(SERVER_TITLE);
        expect(narrowTexts('chart_determinant_national_map', destinations)).toEqual(["Consommation d'ENAF à destination de l'activité, par année", `${SERVER_SUBTITLE}, devant le total`]);
        expect(narrowTexts('dc_emploi_chomage_national_map')).toEqual([SERVER_TITLE, SERVER_SUBTITLE]);
        expect(narrowTexts('conso_annual_national_map')).toEqual([SERVER_TITLE, SERVER_SUBTITLE]);
    });

    it('présente le même graphique du serveur à la façon de chaque carte : toutes les destinations, ou une seule devant le total', () => {
        const server = { series: ['Habitat', 'Activité', 'Mixte', 'Total'].map((name) => ({ name })) } as Highcharts.Options;
        const { rerender } = render(chartsElement({ land: BRETAGNE, charts: chartsOf('conso_ha') }));

        expect(drawnSeries('chart_determinant_national_map', server)).toEqual(['Habitat', 'Activité', 'Mixte', 'Total']);

        rerender(chartsElement({ land: BRETAGNE, charts: chartsOf('conso_habitat_ha') }));

        expect(drawnSeries('chart_determinant_national_map', server)).toEqual(['Habitat', 'Total']);

        rerender(chartsElement({ land: BRETAGNE, charts: chartsOf('conso_activite_ha') }));

        expect(drawnSeries('chart_determinant_national_map', server)).toEqual(['Activité', 'Total']);
    });

    it('donne à chaque graphique la hauteur minimale de son emplacement', () => {
        render(chartsElement({ land: BRETAGNE, charts: chartsOf('conso_habitat_ha') }));

        expect(mockCharts.renders.map((props) => [props.id, props.containerProps.style.minHeight])).toEqual([
            ['chart_determinant_national_map', '300px'],
            ['pie_determinant_national_map', '300px'],
            ['population_conso_progression_chart_national_map', '300px'],
        ]);
    });

    it('ne rend pas de nouveau les graphiques sans période quand elle change', () => {
        const charts = [...ACTIVITE_EMPLOIS, 'conso_by_year'];
        answer({ land: BRETAGNE, charts });
        const { rerender } = render(chartsElement({ land: BRETAGNE, charts }));
        const before = [lastRenderOf('dc_emploi_chomage_national_map'), lastRenderOf('conso_annual_national_map')];
        rerender(chartsElement({ land: BRETAGNE, startYear: 2015, charts }));

        expect(busySlots()).toEqual([true, false, false]);
        expect(changedProps(before[0], lastRenderOf('dc_emploi_chomage_national_map'))).toEqual([]);
        expect(changedProps(before[1], lastRenderOf('conso_annual_national_map'))).toEqual([]);

        answer({ land: BRETAGNE, startYear: 2015, charts });

        expect(shownCharts()).toEqual(['chart_determinant_national_map REGION/53 2015-2024', 'dc_emploi_chomage_national_map REGION/53 sans période', 'conso_annual_national_map REGION/53 sans période']);
        expect(changedProps(before[0], lastRenderOf('dc_emploi_chomage_national_map'))).toEqual([]);
        expect(changedProps(before[1], lastRenderOf('conso_annual_national_map'))).toEqual([]);
    });

    it('garde le graphique des recensements de l’ancien territoire, atténué, jusqu’à la réponse du nouveau', () => {
        const FINISTERE = { land_type: 'DEPART', land_id: '29' };
        answer({ land: BRETAGNE, charts: ACTIVITE_EMPLOIS });
        const { rerender } = render(chartsElement({ land: BRETAGNE, charts: ACTIVITE_EMPLOIS }));
        rerender(chartsElement({ land: FINISTERE, charts: ACTIVITE_EMPLOIS }));

        expect(shownCharts()).toEqual(['chart_determinant_national_map REGION/53 2011-2024', 'dc_emploi_chomage_national_map REGION/53 sans période']);
        expect(busySlots()).toEqual([true, true]);

        answer({ land: FINISTERE, charts: ACTIVITE_EMPLOIS });

        expect(shownCharts()).toEqual(['chart_determinant_national_map DEPART/29 2011-2024', 'dc_emploi_chomage_national_map DEPART/29 sans période']);
        expect(busySlots()).toEqual([false, false]);
    });
});

describe('à l’échelle de la nation, où le serveur n’a pas les graphiques du dossier complet de l’Insee', () => {
    const UNAVAILABLE = "Les graphiques de cette carte ne sont pas disponibles à l'échelle nationale : choisissez une région, un département ou un EPCI.";

    it.each([
        ['bivariate_habitat_population', ['population_conso_progression_chart_national_map NATION/NATION 2011-2024']],
        ['bivariate_activite_emplois', ['chart_determinant_national_map NATION/NATION 2011-2024']],
        ['conso_habitat_ha', ['chart_determinant_national_map NATION/NATION 2011-2024', 'pie_determinant_national_map NATION/NATION 2011-2024', 'population_conso_progression_chart_national_map NATION/NATION 2011-2024']],
        ['conso_evolution_between_periods', ['conso_annual_national_map NATION/NATION sans période']],
    ])('n’affiche et ne demande pour la carte %s que les graphiques que le serveur sait dessiner', (mapId, expected) => {
        render(chartsElement({ land: NATION, charts: chartsOf(mapId) }));
        renderHook(() => usePrefetchConsoCharts(ZONE_FRANCE, 2011, 2024, chartsOf(mapId)));

        expect(shownCharts()).toEqual(expected);
        expect(subscribed().map(requestKey)).toEqual(expected);
        expect(prefetched().map(requestKey)).toEqual(expected);
        expect(screen.queryByText(UNAVAILABLE)).not.toBeInTheDocument();
    });

    it('ne demande rien pour la carte des ménages, et le dit à la place des graphiques', () => {
        render(chartsElement({ land: NATION, charts: HABITAT_MENAGES }));
        renderHook(() => usePrefetchConsoCharts(ZONE_FRANCE, 2011, 2024, HABITAT_MENAGES));
        renderHook(() => usePrefetchConsoCharts(ZONE_HEXAGONE, 2011, 2024, HABITAT_MENAGES));

        expect(shownCharts()).toEqual([]);
        expect(mockDispatch).not.toHaveBeenCalled();
        expect(screen.getByRole('heading', { name: 'Graphiques complémentaires' })).toBeInTheDocument();
        expect(screen.getByText(UNAVAILABLE)).toBeInTheDocument();
    });

    it('ne signale que l’absence des graphiques pour l’Hexagone, sans annoncer ceux de la France entière', () => {
        render(chartsElement({ zone: ZONE_HEXAGONE, land: NATION, charts: HABITAT_MENAGES }));

        expect(screen.getByText(UNAVAILABLE)).toBeInTheDocument();
        expect(screen.queryByText(/Hexagone seul/)).not.toBeInTheDocument();
    });

    it('ne dit rien de tel pour une région', () => {
        render(chartsElement({ land: BRETAGNE, charts: HABITAT_MENAGES }));

        expect(screen.queryByText(UNAVAILABLE)).not.toBeInTheDocument();
    });

    it('ne compte que les graphiques affichés', () => {
        render(chartsElement({ land: NATION, charts: [...BOTH_CHARTS, ...HABITAT_MENAGES] }));

        expect(screen.getByRole('heading', { name: 'Graphiques complémentaires (2)' })).toBeInTheDocument();
    });
});

// Pour une période d'une seule année, le serveur répond par une erreur aux graphiques de la
// consommation par année, de la répartition et de la population
describe('période d’une seule année', () => {
    const ALL_HIDDEN = "Les graphiques de cette carte ne sont disponibles que pour une période d'au moins deux années.";
    const SOME_HIDDEN = "Certains graphiques de cette carte ne sont disponibles que pour une période d'au moins deux années.";
    const singleYear = (land: View['land'], charts: string[]) => chartsElement({ land, startYear: 2023, endYear: 2023, charts });

    it.each([
        ['conso_pct_surface', []],
        ['conso_ha', []],
        ['conso_habitat_ha', []],
        ['conso_activite_ha', []],
        ['bivariate_habitat_population', []],
        ['bivariate_habitat_menages', ['dc_menages_evolution_national_map REGION/53 2023-2023']],
        ['bivariate_activite_emplois', ['dc_emploi_chomage_national_map REGION/53 sans période']],
        ['conso_evolution_between_periods', ['conso_annual_national_map REGION/53 sans période']],
    ])('n’affiche et ne demande pour la carte %s que les graphiques que le serveur sait dessiner', (mapId, expected) => {
        render(singleYear(BRETAGNE, chartsOf(mapId)));
        renderHook(() => usePrefetchConsoCharts('REGION_53', 2023, 2023, chartsOf(mapId)));

        expect(shownCharts()).toEqual(expected);
        expect(subscribed().map(requestKey)).toEqual(expected);
        expect(prefetched().map(requestKey)).toEqual(expected);
    });

    it('dit à la place des graphiques qu’il faut une période plus longue quand aucun ne peut être dessiné', () => {
        render(singleYear(BRETAGNE, BOTH_CHARTS));

        expect(screen.getByRole('heading', { name: 'Graphiques complémentaires' })).toBeInTheDocument();
        expect(screen.getByText(ALL_HIDDEN)).toBeInTheDocument();
    });

    it('le dit aussi quand une partie seulement des graphiques manque', () => {
        render(singleYear(BRETAGNE, ACTIVITE_EMPLOIS));

        expect(screen.getByText(SOME_HIDDEN)).toBeInTheDocument();
        expect(screen.queryByText(ALL_HIDDEN)).not.toBeInTheDocument();
    });

    it('ne dit rien quand tous les graphiques de la carte sont dessinés, ni pour une période de deux années', () => {
        const { rerender } = render(singleYear(BRETAGNE, HABITAT_MENAGES));

        expect(screen.queryByText(/au moins deux années/)).not.toBeInTheDocument();

        rerender(chartsElement({ land: BRETAGNE, startYear: 2023, endYear: 2024 }));

        expect(shownCharts()).toEqual(['chart_determinant_national_map REGION/53 2023-2024', 'pie_determinant_national_map REGION/53 2023-2024']);
        expect(screen.queryByText(/au moins deux années/)).not.toBeInTheDocument();
    });

    it('à l’échelle de la nation, demande une période plus longue pour le graphique qui y existe, et rien d’autre', () => {
        render(singleYear(NATION, ACTIVITE_EMPLOIS));

        expect(shownCharts()).toEqual([]);
        expect(subscribed()).toEqual([]);
        expect(screen.getByText(ALL_HIDDEN)).toBeInTheDocument();
        expect(screen.queryByText(/échelle nationale/)).not.toBeInTheDocument();
    });

    it('retrouve les graphiques dès que la période s’allonge, sans garder la note', () => {
        const { rerender } = render(singleYear(BRETAGNE, BOTH_CHARTS));
        rerender(chartsElement({ land: BRETAGNE, startYear: 2022, endYear: 2023 }));

        expect(shownCharts()).toEqual(['chart_determinant_national_map REGION/53 2022-2023', 'pie_determinant_national_map REGION/53 2022-2023']);
        expect(screen.queryByText(ALL_HIDDEN)).not.toBeInTheDocument();
    });
});

describe('préchargement des graphiques d’une vue demandée', () => {
    it('demande les graphiques de la zone et de la période, avec les arguments mêmes que leur emplacement lira', () => {
        renderHook(() => usePrefetchConsoCharts('REGION_53', 2015, 2020, BOTH_CHARTS));
        render(chartsElement({ land: BRETAGNE, startYear: 2015, endYear: 2020 }));

        expect(prefetched()).toEqual(queriesOf({ land: BRETAGNE, startYear: 2015, endYear: 2020 }));
        expect(subscribed()).toEqual(prefetched());
    });

    it.each([ZONE_FRANCE, ZONE_HEXAGONE])('demande les graphiques de la nation pour la zone %s', (zone) => {
        renderHook(() => usePrefetchConsoCharts(zone, 2011, 2024, BOTH_CHARTS));

        expect(prefetched()).toEqual(queriesOf({ land: NATION }));
    });

    it('ne redemande rien tant que la vue demandée ne change pas, puis demande la suivante', () => {
        const { rerender } = renderHook(({ startYear }) => usePrefetchConsoCharts(ZONE_FRANCE, startYear, 2024, BOTH_CHARTS), { initialProps: { startYear: 2011 } });
        rerender({ startYear: 2011 });

        expect(prefetched()).toHaveLength(2);

        rerender({ startYear: 2015 });

        expect(prefetched().slice(2)).toEqual(queriesOf({ land: NATION, startYear: 2015 }));
    });

    it('ne s’abonne pas aux réponses : celles d’une vue quittée ne restent pas en cache tant que la page est ouverte', () => {
        renderHook(() => usePrefetchConsoCharts(ZONE_FRANCE, 2011, 2024, BOTH_CHARTS));

        expect(mockDispatch.mock.calls.map(([request]) => request.options)).toEqual([{ subscribe: false }, { subscribe: false }]);
        expect(mockServer.landsQueried).toEqual([]);
    });

    it('demande sans paramètre le graphique qui ne dépend pas de la période, avec les arguments mêmes que son emplacement lira', () => {
        const charts = ['conso_activite_by_year', 'employment_by_census'];
        renderHook(() => usePrefetchConsoCharts('REGION_53', 2015, 2020, charts));
        render(chartsElement({ land: BRETAGNE, startYear: 2015, endYear: 2020, charts }));

        expect(prefetched()).toEqual(queriesOf({ land: BRETAGNE, startYear: 2015, endYear: 2020, charts }));
        expect(subscribed()).toEqual(prefetched());
    });

    it('ne demande rien pour une carte sans graphique', () => {
        renderHook(() => usePrefetchConsoCharts(ZONE_FRANCE, 2011, 2024, []));

        expect(mockDispatch).not.toHaveBeenCalled();
    });
});

// Les cartes de l'OCS GE n'ont pas de période : leurs graphiques lisent les millésimes du
// territoire, que sa fiche donne, comme le font les diagnostics
describe('graphiques de chaque carte de l’OCS GE', () => {
    const artifChartsOf = (mapId: string): string[] => ARTIF_INDICATORS.find((indicator) => indicator.id === mapId).charts ?? [];
    const ocsgeElement = (view: Omit<View, 'ocsge'>, ocsge: ShownOcsge = BRETAGNE_SHOWN) => chartsElement({ ...view, ocsge });

    const STOCK = ['artif_synthese_national_map REGION/53 sans période', 'pie_artif_by_couverture_national_map REGION/53 millésime 2'];
    const FLUX = ['artif_net_flux_national_map REGION/53 millésimes 1 et 2', 'artif_flux_by_couverture_national_map REGION/53 millésimes 1 et 2'];

    it.each([
        ['artif_pct', STOCK],
        ['artif_soils', STOCK],
        ['artif_net_annual_pct_surface', FLUX],
        ['artif_desartif_ha', FLUX],
    ])('affiche pour une région les graphiques que le catalogue donne à la carte %s', (mapId, expected) => {
        describeLand(BRETAGNE, BRETAGNE_DETAIL);
        render(ocsgeElement({ land: BRETAGNE, charts: artifChartsOf(mapId) }));

        expect(shownCharts()).toEqual(expected);
        expect(screen.getByRole('heading', { name: 'Graphiques complémentaires (2)' })).toBeInTheDocument();
    });

    it('donne deux graphiques à chaque carte, dans l’ordre où le menu les propose, et le catalogue décrit chacun d’eux', () => {
        const described = [...ARTIF_STOCK_CHARTS, ...ARTIF_FLUX_CHARTS].map((chart) => chart.id);

        expect(described).toEqual([...STOCK_CHARTS, ...FLUX_CHARTS]);
        expect(ARTIF_INDICATORS.map((map) => [map.id, artifChartsOf(map.id)])).toEqual([
            ['artif_soils', STOCK_CHARTS],
            ['artif_pct', STOCK_CHARTS],
            ['artif_net_annual_pct_surface', FLUX_CHARTS],
            ['artif_desartif_ha', FLUX_CHARTS],
        ]);
    });

    it('désigne au serveur les millésimes par leur index : le dernier pour le stock, les deux derniers pour les flux, aucun pour la synthèse', () => {
        describeLand(BRETAGNE, BRETAGNE_DETAIL);
        render(ocsgeElement({ land: BRETAGNE, charts: [...STOCK_CHARTS, ...FLUX_CHARTS] }));

        expect(subscribed()).toEqual([
            { id: 'artif_synthese_national_map', land_type: 'REGION', land_id: '53' },
            { id: 'pie_artif_by_couverture_national_map', land_type: 'REGION', land_id: '53', index: 2 },
            { id: 'artif_net_flux_national_map', land_type: 'REGION', land_id: '53', millesime_new_index: 2, millesime_old_index: 1 },
            { id: 'artif_flux_by_couverture_national_map', land_type: 'REGION', land_id: '53', millesime_new_index: 2, millesime_old_index: 1 },
        ]);
        expect(mockCharts.renders.map((props) => props.params)).toEqual([{}, { index: 2 }, { millesime_new_index: 2, millesime_old_index: 1 }, { millesime_new_index: 2, millesime_old_index: 1 }]);
    });

    it('suit l’index du dernier millésime le jour où un troisième arrive', () => {
        describeLand(BRETAGNE, landDetail('Bretagne', 2_744_642, [2018, 2021, 2024]));
        render(ocsgeElement({ land: BRETAGNE, charts: [...STOCK_CHARTS, ...FLUX_CHARTS] }));

        expect(shownCharts()).toEqual([
            'artif_synthese_national_map REGION/53 sans période',
            'pie_artif_by_couverture_national_map REGION/53 millésime 3',
            'artif_net_flux_national_map REGION/53 millésimes 2 et 3',
            'artif_flux_by_couverture_national_map REGION/53 millésimes 2 et 3',
        ]);
    });

    it('cite l’OCS GE pour source de chaque graphique', () => {
        describeLand(BRETAGNE, BRETAGNE_DETAIL);
        render(ocsgeElement({ land: BRETAGNE, charts: [...STOCK_CHARTS, ...FLUX_CHARTS] }));

        expect(mockCharts.renders.map((props) => props.sources)).toEqual([['ocsge'], ['ocsge'], ['ocsge'], ['ocsge']]);
    });

    it('donne à chaque graphique le titre et le sous-titre du serveur, qui lit les millésimes dans ses données, et la hauteur de ses barres', () => {
        describeLand(BRETAGNE, BRETAGNE_DETAIL);
        render(ocsgeElement({ land: BRETAGNE, charts: [...STOCK_CHARTS, ...FLUX_CHARTS] }));

        ['artif_synthese_national_map', 'pie_artif_by_couverture_national_map', 'artif_net_flux_national_map', 'artif_flux_by_couverture_national_map'].forEach((id) =>
            expect(narrowTexts(id)).toEqual([SERVER_TITLE, SERVER_SUBTITLE]),
        );
        expect(mockCharts.renders.map((props) => props.containerProps.style.minHeight)).toEqual(['260px', '300px', '300px', '400px']);
    });

    it('ne demande la fiche du territoire que pour une carte de l’OCS GE', () => {
        render(chartsElement({ land: BRETAGNE }));

        expect(mockServer.landsQueried).toEqual([]);

        render(ocsgeElement({ land: BRETAGNE, charts: STOCK_CHARTS }));

        expect(mockServer.landsQueried).toContain('REGION/53');
    });

    it('n’affiche et ne demande rien tant que la fiche du territoire n’a pas donné ses millésimes', () => {
        const { container } = render(ocsgeElement({ land: BRETAGNE, charts: STOCK_CHARTS }));

        expect(container).toBeEmptyDOMElement();
        expect(mockDispatch).not.toHaveBeenCalled();

        describeLand(BRETAGNE, BRETAGNE_DETAIL);

        expect(shownCharts()).toEqual(STOCK);
        expect(subscribed()).toEqual(queriesOf({ land: BRETAGNE, charts: STOCK_CHARTS }));
    });

    it('affiche les graphiques de la nation pour la France entière, et le signale pour l’Hexagone', () => {
        describeLand(NATION, FRANCE_DETAIL);
        const { rerender } = render(ocsgeElement({ land: NATION, charts: FLUX_CHARTS }, { surfaceHa: 63_764_822, hasMissing: false }));

        expect(shownCharts()).toEqual(['artif_net_flux_national_map NATION/NATION millésimes 1 et 2', 'artif_flux_by_couverture_national_map NATION/NATION millésimes 1 et 2']);
        expect(screen.queryByText(/Hexagone seul/)).not.toBeInTheDocument();

        rerender(ocsgeElement({ zone: ZONE_HEXAGONE, land: NATION, charts: FLUX_CHARTS }, { surfaceHa: 54_394_000, hasMissing: false }));

        expect(screen.getByText("Les graphiques de l'Hexagone seul ne sont pas disponibles : ceux de la France entière sont affichés.")).toBeInTheDocument();
        expect(narrowTexts('artif_net_flux_national_map')[1]).toBe(SERVER_SUBTITLE);
    });
});

describe('territoire que les graphiques de l’OCS GE décrivent', () => {
    const ILLE_ET_VILAINE = { land_type: 'DEPART', land_id: '35' };
    const subtitles = (): string[] => ['artif_net_flux_national_map', 'artif_flux_by_couverture_national_map'].map((id) => narrowTexts(id)[1]);

    beforeEach(() => describeLand(ILLE_ET_VILAINE, landDetail('Ille-et-Vilaine', 683_129, [2017, 2020])));

    it('ne le nomme pas quand les territoires affichés, tous avec des données, couvrent exactement la zone', () => {
        render(chartsElement({ land: ILLE_ET_VILAINE, charts: FLUX_CHARTS, ocsge: { surfaceHa: 683_129, hasMissing: false } }));

        expect(subtitles()).toEqual([SERVER_SUBTITLE, SERVER_SUBTITLE]);
    });

    it('le nomme dans le sous-titre de chaque graphique, après celui du serveur, quand des territoires affichés débordent de la zone', () => {
        // Les EPCI du département, dont deux à cheval sur un voisin : les chiffres clés les comptent en entier
        render(chartsElement({ land: ILLE_ET_VILAINE, charts: FLUX_CHARTS, ocsge: { surfaceHa: 749_863, hasMissing: false } }));

        expect(subtitles()).toEqual([`${SERVER_SUBTITLE}. Ille-et-Vilaine dans ses limites exactes.`, `${SERVER_SUBTITLE}. Ille-et-Vilaine dans ses limites exactes.`]);
    });

    it('dit que le graphique compte les territoires sans donnée de la carte', () => {
        describeLand(NATION, FRANCE_DETAIL);
        render(chartsElement({ land: NATION, charts: STOCK_CHARTS, ocsge: { surfaceHa: 63_764_822, hasMissing: true } }));

        expect(narrowTexts('artif_synthese_national_map')[1]).toBe(`${SERVER_SUBTITLE}. France, territoires hachurés compris.`);
    });

    it('met le sous-titre à jour quand la maille change, sans remonter le graphique ni le redemander', () => {
        answer({ land: ILLE_ET_VILAINE, charts: FLUX_CHARTS });
        const { rerender } = render(chartsElement({ land: ILLE_ET_VILAINE, charts: FLUX_CHARTS, ocsge: { surfaceHa: 749_863, hasMissing: false } }));
        rerender(chartsElement({ land: ILLE_ET_VILAINE, charts: FLUX_CHARTS, ocsge: { surfaceHa: 683_129, hasMissing: false } }));

        expect(subtitles()).toEqual([SERVER_SUBTITLE, SERVER_SUBTITLE]);
        expect(busySlots()).toEqual([false, false]);
        expect(mockCharts.mounts).toEqual({ artif_net_flux_national_map: 1, artif_flux_by_couverture_national_map: 1 });
    });

    it('ne rend pas les graphiques de nouveau quand la page est rendue de nouveau', () => {
        answer({ land: ILLE_ET_VILAINE, charts: FLUX_CHARTS });
        const view = { land: ILLE_ET_VILAINE, charts: FLUX_CHARTS, ocsge: { surfaceHa: 749_863, hasMissing: false } };
        const { rerender } = render(chartsElement(view));
        rerender(chartsElement(view));

        expect(mockCharts.renders).toHaveLength(2);
    });
});

describe('territoire sans graphique de l’OCS GE', () => {
    const UNCOVERED = "Les graphiques de cette carte ne sont pas disponibles pour ce territoire : l'OCS GE ne le couvre pas entièrement.";
    const GUYANE_SHOWN: ShownOcsge = { surfaceHa: 8_320_076, hasMissing: true };

    it('n’affiche ni ne demande aucun graphique pour un territoire que l’OCS GE ne couvre pas entièrement, et le dit à leur place', () => {
        // La Guyane a deux millésimes, sur une partie de son territoire
        describeLand(GUYANE, { ...landDetail('Guyane', 8_320_076, [2018, 2022]), has_ocsge: false });
        render(chartsElement({ land: GUYANE, charts: STOCK_CHARTS, ocsge: GUYANE_SHOWN }));
        renderHook(() => usePrefetchConsoCharts('REGION_03', 2011, 2024, STOCK_CHARTS));

        expect(shownCharts()).toEqual([]);
        expect(mockDispatch).not.toHaveBeenCalled();
        expect(screen.getByRole('heading', { name: 'Graphiques complémentaires' })).toBeInTheDocument();
        expect(screen.getByText(UNCOVERED)).toBeInTheDocument();
    });

    it('le dit aussi pour un territoire sans aucun millésime', () => {
        describeLand(GUYANE, landDetail('Guyane', 8_320_076, []));
        render(chartsElement({ land: GUYANE, charts: FLUX_CHARTS, ocsge: GUYANE_SHOWN }));

        expect(shownCharts()).toEqual([]);
        expect(screen.getByText(UNCOVERED)).toBeInTheDocument();
    });

    it('ne dit rien de tel pour un territoire couvert', () => {
        describeLand(BRETAGNE, BRETAGNE_DETAIL);
        render(chartsElement({ land: BRETAGNE, charts: STOCK_CHARTS, ocsge: BRETAGNE_SHOWN }));

        expect(screen.queryByText(UNCOVERED)).not.toBeInTheDocument();
    });

    it('n’affiche pas les graphiques qui comparent deux millésimes pour un territoire qui n’en a qu’un, et le dit', () => {
        describeLand(BRETAGNE, landDetail('Bretagne', 2_744_642, [2021]));
        const { rerender } = render(chartsElement({ land: BRETAGNE, charts: FLUX_CHARTS, ocsge: BRETAGNE_SHOWN }));

        expect(shownCharts()).toEqual([]);
        expect(mockDispatch).not.toHaveBeenCalled();
        expect(screen.getByText("Les graphiques qui comparent deux millésimes de l'OCS GE ne sont pas disponibles : ce territoire n'en a qu'un.")).toBeInTheDocument();

        rerender(chartsElement({ land: BRETAGNE, charts: STOCK_CHARTS, ocsge: BRETAGNE_SHOWN }));

        expect(shownCharts()).toEqual(['artif_synthese_national_map REGION/53 sans période', 'pie_artif_by_couverture_national_map REGION/53 millésime 1']);
        expect(screen.queryByText(/deux millésimes/)).not.toBeInTheDocument();
    });

    it('dit que les graphiques n’ont pas pu être chargés quand la fiche du territoire ne répond pas', () => {
        describeLand(BRETAGNE, 'error');
        render(chartsElement({ land: BRETAGNE, charts: STOCK_CHARTS, ocsge: BRETAGNE_SHOWN }));

        expect(shownCharts()).toEqual([]);
        expect(mockDispatch).not.toHaveBeenCalled();
        expect(screen.getByText("Les graphiques de cette carte n'ont pas pu être chargés.")).toBeInTheDocument();
    });

    it('retrouve les graphiques dès que la carte montre un territoire couvert, sans garder la note', () => {
        describeLand(GUYANE, { ...landDetail('Guyane', 8_320_076), has_ocsge: false });
        describeLand(BRETAGNE, BRETAGNE_DETAIL);
        const { rerender } = render(chartsElement({ land: GUYANE, charts: STOCK_CHARTS, ocsge: GUYANE_SHOWN }));
        rerender(chartsElement({ land: BRETAGNE, charts: STOCK_CHARTS, ocsge: BRETAGNE_SHOWN }));

        expect(shownCharts()).toEqual(['artif_synthese_national_map REGION/53 sans période', 'pie_artif_by_couverture_national_map REGION/53 millésime 2']);
        expect(screen.queryByText(UNCOVERED)).not.toBeInTheDocument();
    });
});

// La colonne passe d'un bloc des graphiques d'une carte à ceux de la suivante : ni chargeur, ni
// emplacement vide entre les deux
describe('passage d’une carte de consommation à une carte de l’OCS GE, et retour', () => {
    const CONSO = ['chart_determinant_national_map REGION/53 2011-2024', 'pie_determinant_national_map REGION/53 2011-2024'];
    const STOCK = ['artif_synthese_national_map REGION/53 sans période', 'pie_artif_by_couverture_national_map REGION/53 millésime 2'];
    const consoView: View = { land: BRETAGNE };
    const stockView: View = { land: BRETAGNE, charts: STOCK_CHARTS, ocsge: BRETAGNE_SHOWN };

    it('garde les graphiques de la consommation, atténués, tant que la fiche du territoire n’a pas répondu', () => {
        answer(consoView);
        const { rerender } = render(chartsElement(consoView));
        rerender(chartsElement(stockView));

        expect(shownCharts()).toEqual(CONSO);
        expect(busySlots()).toEqual([true, true]);
        expect(screen.getByRole('heading', { name: 'Graphiques complémentaires (2)' })).toBeInTheDocument();
    });

    it('les garde encore tant que le serveur n’a pas répondu pour tous les graphiques de l’OCS GE', () => {
        answer(consoView);
        const { rerender } = render(chartsElement(consoView));
        rerender(chartsElement(stockView));
        describeLand(BRETAGNE, BRETAGNE_DETAIL);

        expect(subscribed().slice(2)).toEqual(queriesOf(stockView));
        expect(shownCharts()).toEqual(CONSO);
        expect(busySlots()).toEqual([true, true]);

        answer({ ...stockView, charts: ['artif_share_by_millesime'] });

        expect(shownCharts()).toEqual(CONSO);
    });

    it('affiche d’un bloc les graphiques de l’OCS GE dès la dernière réponse', () => {
        answer(consoView);
        const { rerender } = render(chartsElement(consoView));
        rerender(chartsElement(stockView));
        describeLand(BRETAGNE, BRETAGNE_DETAIL);
        answer(stockView);

        expect(shownCharts()).toEqual(STOCK);
        expect(busySlots()).toEqual([false, false]);
    });

    it('les affiche aussitôt quand la fiche et les réponses sont déjà en cache, préchargées avec la carte', () => {
        answer(consoView);
        answer(stockView);
        describeLand(BRETAGNE, BRETAGNE_DETAIL);
        const { rerender } = render(chartsElement(consoView));
        rerender(chartsElement(stockView));

        expect(shownCharts()).toEqual(STOCK);
        expect(busySlots()).toEqual([false, false]);
    });

    it('revient aux graphiques de la consommation de la même façon', () => {
        describeLand(BRETAGNE, BRETAGNE_DETAIL);
        answer(stockView);
        const { rerender } = render(chartsElement(stockView));
        rerender(chartsElement(consoView));

        expect(shownCharts()).toEqual(STOCK);
        expect(busySlots()).toEqual([true, true]);

        answer(consoView);

        expect(shownCharts()).toEqual(CONSO);
        expect(busySlots()).toEqual([false, false]);
    });

    it('affiche un graphique en échec plutôt que de garder ceux de la carte précédente', () => {
        answer(consoView);
        describeLand(BRETAGNE, BRETAGNE_DETAIL);
        const { rerender } = render(chartsElement(consoView));
        rerender(chartsElement(stockView));
        answer({ ...stockView, charts: ['artif_share_by_millesime'] }, 'error');
        answer({ ...stockView, charts: ['artif_by_cover'] });

        expect(shownCharts()).toEqual(STOCK);
        expect(busySlots()).toEqual([false, false]);
    });

    it('se désabonne des requêtes de la vue quittée', () => {
        answer(consoView);
        describeLand(BRETAGNE, BRETAGNE_DETAIL);
        const { rerender } = render(chartsElement(consoView));
        rerender(chartsElement(stockView));

        expect(mockServer.unsubscribed).toEqual(queriesOf(consoView));
    });
});

describe('préchargement des graphiques d’une carte de l’OCS GE', () => {
    it('attend les millésimes du territoire, puis demande les graphiques avec les arguments mêmes que la colonne lira', () => {
        renderHook(() => usePrefetchConsoCharts('REGION_53', 2011, 2024, FLUX_CHARTS));

        expect(mockServer.landsQueried).toContain('REGION/53');
        expect(prefetched()).toEqual([]);

        describeLand(BRETAGNE, BRETAGNE_DETAIL);
        render(chartsElement({ land: BRETAGNE, charts: FLUX_CHARTS, ocsge: BRETAGNE_SHOWN }));

        expect(prefetched()).toEqual(queriesOf({ land: BRETAGNE, charts: FLUX_CHARTS }));
        expect(subscribed()).toEqual(prefetched());
    });

    it.each([ZONE_FRANCE, ZONE_HEXAGONE])('lit les millésimes de la nation pour la zone %s', (zone) => {
        describeLand(NATION, FRANCE_DETAIL);
        renderHook(() => usePrefetchConsoCharts(zone, 2011, 2024, STOCK_CHARTS));

        expect(prefetched()).toEqual(queriesOf({ land: NATION, charts: STOCK_CHARTS }));
    });
});

// Le nuage de points d'une carte bivariée est dessiné par la page à partir de la carte affichée :
// il ne dépend d'aucune requête
describe('nuage de points des cartes bivariées', () => {
    const DEPARTMENTS = scatterOf('Un point par département');
    const TOO_FEW: CrossedScatter = { kind: 'none', reason: "Le nuage de points n'est pas dessiné pour moins de dix territoires." };
    const HOUSEHOLDS = 'dc_menages_evolution_national_map REGION/53 2011-2024';
    const SOME_NOT_NATIONWIDE = "Certains graphiques de cette carte ne sont pas disponibles à l'échelle nationale : choisissez une région, un département ou un EPCI.";
    const NONE_NATIONWIDE = "Les graphiques de cette carte ne sont pas disponibles à l'échelle nationale : choisissez une région, un département ou un EPCI.";
    const households = (view: Partial<View> = {}): View => ({ land: BRETAGNE, charts: HABITAT_MENAGES, scatter: DEPARTMENTS, ...view });

    it('est le premier graphique de la colonne, compté avec ceux du serveur', () => {
        answer(households());
        render(chartsElement(households()));

        expect(screen.getByRole('heading', { name: 'Graphiques complémentaires (2)' })).toBeInTheDocument();
        expect(shownScatter()).toBe('Un point par département');
        expect(screen.getByTestId('scatter-chart').compareDocumentPosition(screen.getByTestId('generic-chart'))).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        expect(shownCharts()).toEqual([HOUSEHOLDS]);
    });

    it('ne demande rien au serveur', () => {
        render(chartsElement(households({ charts: [CROSSED_RATES_SCATTER] })));
        renderHook(() => usePrefetchConsoCharts('REGION_53', 2011, 2024, [CROSSED_RATES_SCATTER]));

        expect(shownScatter()).toBe('Un point par département');
        expect(screen.getByRole('heading', { name: 'Graphiques complémentaires' })).toBeInTheDocument();
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('n’est pas affiché quand il est décoché', () => {
        answer(households());
        render(chartsElement(households({ charts: ['conso_and_households_by_year'] })));

        expect(shownScatter()).toBeNull();
        expect(screen.getByRole('heading', { name: 'Graphiques complémentaires' })).toBeInTheDocument();
    });

    it('n’est pas affiché pour une carte qui n’en a pas, même si son identifiant est coché', () => {
        answer(households());
        render(chartsElement(households({ scatter: null })));

        expect(shownScatter()).toBeNull();
        expect(shownCharts()).toEqual([HOUSEHOLDS]);
    });

    it('dit à sa place ce qui empêche de le dessiner, sans le compter', () => {
        answer(households());
        render(chartsElement(households({ scatter: TOO_FEW })));

        expect(shownScatter()).toBeNull();
        expect(screen.getByText("Le nuage de points n'est pas dessiné pour moins de dix territoires.")).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Graphiques complémentaires' })).toBeInTheDocument();
    });

    it('ne dit rien de tel quand il est décoché', () => {
        answer(households());
        render(chartsElement(households({ scatter: TOO_FEW, charts: ['conso_and_households_by_year'] })));

        expect(screen.queryByText(/nuage de points/)).not.toBeInTheDocument();
    });

    it('est affiché à l’échelle de la nation, où la note ne parle plus que d’une partie des graphiques', () => {
        render(chartsElement(households({ land: NATION })));

        expect(shownScatter()).toBe('Un point par département');
        expect(shownCharts()).toEqual([]);
        expect(screen.getByText(SOME_NOT_NATIONWIDE)).toBeInTheDocument();
        expect(screen.queryByText(NONE_NATIONWIDE)).not.toBeInTheDocument();
    });

    it('laisse la note parler de tous les graphiques quand lui non plus n’est pas dessiné', () => {
        render(chartsElement(households({ land: NATION, scatter: TOO_FEW })));

        expect(screen.getByText(NONE_NATIONWIDE)).toBeInTheDocument();
    });

    it('reçoit le canal par lequel la carte et lui se désignent le territoire survolé', () => {
        render(chartsElement(households({ charts: [CROSSED_RATES_SCATTER] })));

        expect(mockScatter.highlights).toEqual([HIGHLIGHT]);
    });

    it('suit la carte affichée sans attendre les graphiques du serveur, qui restent ceux de la vue précédente, atténués', () => {
        answer(households());
        const { rerender } = render(chartsElement(households()));
        rerender(chartsElement(households({ startYear: 2015, scatter: scatterOf('Un point par département, de 2015 à 2024') })));

        expect(shownScatter()).toBe('Un point par département, de 2015 à 2024');
        expect(scatterIsBusy()).toBe(false);
        expect(shownCharts()).toEqual([HOUSEHOLDS]);
        expect(busySlots()).toEqual([true]);
    });

    it('reste en place, atténué, quand la carte suivante n’en a pas et que ses graphiques chargent', () => {
        answer(households());
        const { rerender } = render(chartsElement(households()));
        rerender(chartsElement({ land: BRETAGNE }));

        expect(shownScatter()).toBe('Un point par département');
        expect(scatterIsBusy()).toBe(true);

        answer({ land: BRETAGNE });

        expect(shownScatter()).toBeNull();
        expect(shownCharts()).toEqual(['chart_determinant_national_map REGION/53 2011-2024', 'pie_determinant_national_map REGION/53 2011-2024']);
    });

    it('apparaît avec les graphiques de sa carte, pas avant, en venant d’une carte sans nuage', () => {
        answer({ land: BRETAGNE });
        const { rerender } = render(chartsElement({ land: BRETAGNE }));
        rerender(chartsElement(households()));

        expect(shownScatter()).toBeNull();
        expect(shownCharts()).toEqual(['chart_determinant_national_map REGION/53 2011-2024', 'pie_determinant_national_map REGION/53 2011-2024']);

        answer(households());

        expect(shownScatter()).toBe('Un point par département');
        expect(shownCharts()).toEqual([HOUSEHOLDS]);
    });

    it('remplace aussitôt la note d’une vue sans graphique', () => {
        const { rerender } = render(chartsElement(households({ land: NATION, charts: ['conso_and_households_by_year'], scatter: null })));

        expect(screen.getByText(NONE_NATIONWIDE)).toBeInTheDocument();

        rerender(chartsElement(households({ land: NATION })));

        expect(shownScatter()).toBe('Un point par département');
    });
});
