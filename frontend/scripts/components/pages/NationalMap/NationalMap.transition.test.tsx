import React, { useRef, useSyncExternalStore } from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import type { NationalMapArtifIndicators, NationalMapBaseMap, NationalMapIndicators, NationalMapValues } from '@services/api';
import NationalMap from './index';
import { COMMUNES_CONSO_HA, COMMUNES_CONSO_SHARE } from './__fixtures__/communesFixtures';
import { chartStub, communesStub, gridStub } from './__fixtures__/engineStubs';
import {
    ARTIF_FRANCE_BY_REGION,
    BRETAGNE_BY_DEPARTEMENT,
    CONSO_BRETAGNE_BY_DEPARTEMENT,
    CONSO_FRANCE_BY_DEPARTEMENT,
    CONSO_FRANCE_BY_EPCI,
    CONSO_FRANCE_BY_REGION,
    CONSO_MAYOTTE_BY_EPCI,
    FRANCE_BY_DEPARTEMENT,
    FRANCE_BY_EPCI,
    FRANCE_BY_REGION,
    MAYOTTE_BY_EPCI,
} from './__fixtures__/nationalMapFixtures';
import { CONSO_FRANCE_BY_TWELVE_REGIONS, FRANCE_BY_TWELVE_REGIONS } from './__fixtures__/scatterFixtures';
import type { ScatterModel } from './domain/frame/types';
import type { LandHighlight } from './domain/landHighlight';

// La page entière, avec sept bouchons : les trois moteurs de rendu, l'API, le magasin Redux, les
// graphiques complémentaires du serveur et le nuage de points. Les réponses de l'API arrivent
// quand le test les remet, dans l'ordre qu'il choisit : c'est ce qui permet d'observer la page
// entre deux réponses.

jest.mock('highcharts-react-official', () => jest.requireActual('./__fixtures__/engineStubs').highchartsReactModule);
jest.mock('./GriddedMap', () => jest.requireActual('./__fixtures__/engineStubs').griddedMapModule);
jest.mock('./components/stage/CommunesCanvas', () => jest.requireActual('./__fixtures__/engineStubs').communesCanvasModule);
jest.mock('./components/stage/mapLibre', () => jest.requireActual('./__fixtures__/mapLibreStub').mapLibreModule);
jest.mock('@components/charts/GenericChart', () => ({ __esModule: true, default: MockGenericChart }));
jest.mock('./components/ScatterChart', () => ({ __esModule: true, default: MockScatterChart }));
// Le magasin ne reçoit de la page que les requêtes des graphiques complémentaires : celles de la
// carte demandée, préchargées, puis celles de la carte affichée, auxquelles la colonne s'abonne.
// Le serveur leur répond aussitôt : les graphiques suivent la carte affichée.
jest.mock('react-redux', () => ({
    __esModule: true,
    useDispatch: () => mockPrefetchChart,
    useSelector: (selector: (state: undefined) => unknown) => selector(undefined),
}));
jest.mock('@services/api', () => ({
    __esModule: true,
    useGetNationalMapBaseMapQuery: (query: Query) => mockUseQuery('base-map', query),
    useGetNationalMapIndicatorsQuery: (query: Query) => mockUseQuery('indicators', query),
    useGetNationalMapArtifIndicatorsQuery: (query: Query, options?: { skip?: boolean }) => mockUseQuery('artif-indicators', query, options),
    useGetNationalMapValuesQuery: (query: Query, options?: { skip?: boolean }) => mockUseQuery('values', query, options),
    // Adresse des fichiers de tuiles : la page la demande dès son ouverture
    useGetEnvironmentQuery: () => ({ data: { vector_tiles_location: 'https://tuiles.test/vector_tiles' } }),
    // Fiche du territoire des graphiques d'une carte de l'OCS GE, donnée aussitôt elle aussi
    useGetLandQuery: (_land: Query, options: { skip: boolean }) => ({ currentData: options.skip ? undefined : mockLandDetail, isError: false }),
    djangoApi: {
        endpoints: {
            getChartConfig: {
                // La requête d'un graphique, réduite à ses arguments
                initiate: (query: Query) => query,
                select: () => () => ({ isSuccess: true, isError: false }),
            },
        },
    },
}));

// Requêtes des graphiques complémentaires remises au magasin
const mockPrefetchChart = jest.fn((_query: Query) => ({ unsubscribe: (): void => undefined }));

// Un territoire que l'OCS GE couvre entièrement, à deux millésimes
const mockLandDetail = {
    name: 'France',
    surface: 63_764_822,
    has_ocsge: true,
    millesimes: [
        { index: 2, year: 2021, departement: '35' },
        { index: 1, year: 2018, departement: '35' },
    ],
};

type ChartParams = { start_date?: string; end_date?: string; index?: number; millesime_new_index?: number; millesime_old_index?: number };

// Ce que les paramètres d'un graphique désignent : une période, un millésime, deux millésimes, ou rien
const paramsText = ({ start_date, end_date, index, millesime_new_index, millesime_old_index }: ChartParams): string => {
    if (start_date) return ` ${start_date}-${end_date}`;
    if (index !== undefined) return ` millésime ${index}`;
    return millesime_new_index === undefined ? '' : ` millésimes ${millesime_old_index} et ${millesime_new_index}`;
};

// Un graphique complémentaire, réduit à ce que la page lui demande
function MockGenericChart({ id, land_type, land_id, params }: { id: string; land_type: string; land_id: string; params: ChartParams }) {
    return <div data-testid="generic-chart">{`${id} ${land_type}/${land_id}${paramsText(params)}`}</div>;
}

// Le nuage de points d'une carte bivariée, réduit à son titre et au nombre de ses points ; il
// garde le canal par lequel la carte et lui se désignent le territoire survolé
const mockScatter = { highlight: null as LandHighlight | null };

function MockScatterChart({ model, highlight }: { model: ScatterModel; highlight: LandHighlight }) {
    mockScatter.highlight = highlight;
    return <div data-testid="scatter-chart">{`${model.title}, ${model.points.length} points`}</div>;
}

// --- API d'essai -------------------------------------------------------------------------

type Endpoint = 'base-map' | 'indicators' | 'artif-indicators' | 'values';
type Query = Record<string, string | number>;
type Outcome = { data: unknown } | { error: true };

// `requested` : toutes les requêtes que la page a faites, réponses arrivées ou non
const mockServer = { outcomes: new Map<string, Outcome>(), listeners: new Set<() => void>(), version: 0, requested: new Set<string>() };

const requestKey = (endpoint: Endpoint, query: Query): string =>
    `${endpoint}?${Object.keys(query)
        .sort((a, b) => a.localeCompare(b))
        .map((key) => `${key}=${query[key]}`)
        .join('&')}`;

const mockSubscribe = (listener: () => void) => {
    mockServer.listeners.add(listener);
    return () => {
        mockServer.listeners.delete(listener);
    };
};

// Ce que rend un hook de requête de RTK Query : `data` garde la dernière réponse reçue par ce
// hook pendant que la suivante charge, `currentData` n'est que la réponse de la requête en cours
function mockUseQuery(endpoint: Endpoint, query: Query, options?: { skip?: boolean }) {
    useSyncExternalStore(mockSubscribe, () => mockServer.version);
    const lastData = useRef<unknown>(undefined);
    if (!options?.skip) mockServer.requested.add(requestKey(endpoint, query));
    const outcome = options?.skip ? undefined : mockServer.outcomes.get(requestKey(endpoint, query));
    const currentData = outcome && 'data' in outcome ? outcome.data : undefined;
    if (currentData !== undefined) lastData.current = currentData;
    return {
        data: lastData.current,
        currentData,
        isFetching: !options?.skip && outcome === undefined,
        isError: Boolean(outcome && 'error' in outcome),
    };
}

// La réponse d'une requête arrive : les hooks qui l'attendent rendent de nouveau
const settle = (endpoint: Endpoint, query: Query, outcome: Outcome): void =>
    act(() => {
        mockServer.outcomes.set(requestKey(endpoint, query), outcome);
        mockServer.version += 1;
        mockServer.listeners.forEach((listener) => listener());
    });

// Requête des territoires d'un fond de carte : sa maille et, hors France entière, son parent
const queryOf = ({ scale, parent }: NationalMapBaseMap): Query => (parent ? { scale, parent_type: parent.land_type, parent_id: parent.land_id } : { scale });

const deliverBaseMap = (baseMap: NationalMapBaseMap): void => settle('base-map', queryOf(baseMap), { data: baseMap });
const deliverConso = (baseMap: NationalMapBaseMap, conso: NationalMapIndicators): void =>
    settle('indicators', { ...queryOf(baseMap), start_year: conso.start_year, end_year: conso.end_year }, { data: conso });
const deliverArtif = (baseMap: NationalMapBaseMap, artif: NationalMapArtifIndicators): void => settle('artif-indicators', queryOf(baseMap), { data: artif });
// Colonne de valeurs par commune : sa requête rappelle la maille, les clés et la période servies
const deliverValues = (values: NationalMapValues): void => {
    const { scale, key, amount, start_year, end_year } = values;
    settle('values', { scale, key, ...(amount ? { amount } : {}), ...(start_year === null ? {} : { start_year, end_year }) }, { data: values });
};

// --- Lecture de la page ------------------------------------------------------------------

const openPage = (search = ''): void => {
    window.history.replaceState(null, '', `/carte${search}`);
    render(<NationalMap />);
};

// Adresse de la France entière par région, carte en hectares : la plupart des tests partent de
// cette vue, que l'adresse nue n'ouvre pas. Elle est complète, dans l'ordre où la page écrit ses
// paramètres, pour que les adresses attendues se lisent telles quelles.
const BY_REGION_IN_HECTARES = '?zone=FRANCE&scale=REGION&start=2011&end=2024&indicator=conso_ha';

// Ouvre la page sur la France entière par région, carte en hectares, fond et consommation déjà en cache
const openFranceByRegion = (): void => {
    deliverBaseMap(FRANCE_BY_REGION);
    deliverConso(FRANCE_BY_REGION, CONSO_FRANCE_BY_REGION);
    openPage(BY_REGION_IN_HECTARES);
};

// Joue un test dans une fenêtre de la largeur donnée
const atWidth = (width: number, run: () => void): void => {
    const initialWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width });
    try {
        run();
    } finally {
        Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: initialWidth });
    }
};

const title = (): HTMLElement => screen.getByRole('heading', { level: 1 });
const breadcrumbNav = (): HTMLElement | null => screen.queryByRole('navigation', { name: "Fil d'Ariane de la carte" });
// Étapes du fil d'Ariane ; aucune quand sa ligne est vide
const breadcrumb = (): string[] => Array.from(breadcrumbNav()?.querySelectorAll('button, [aria-current="page"]') ?? []).map((step) => step.textContent);
// Barre de titre : le premier bloc du contenu principal
const titleBar = (): Element => screen.getByRole('main').firstElementChild;
const mapLegend = (): HTMLElement | null => screen.queryByRole('region', { name: 'Légende de la carte' });
const keyFigures = (): HTMLElement => screen.getByLabelText('Chiffres clés');
const drawnLands = (): string[] => (chartStub.options().series[0] as unknown as { data: { name: string }[] }).data.map((land) => land.name);
const charts = (): string[] => screen.queryAllByTestId('generic-chart').map((chart) => chart.textContent);
const scaleButton = (label: string): HTMLElement => within(screen.getByRole('group', { name: 'Maille affichée' })).getByRole('button', { name: label });
const mapChoices = (): string[] => (screen.getAllByRole('radio') as HTMLInputElement[]).map((radio) => radio.value);
const selectedMap = (): string => (screen.getAllByRole('radio') as HTMLInputElement[]).find((radio) => radio.checked).value;

beforeEach(() => {
    mockServer.outcomes.clear();
    mockServer.requested.clear();
    mockPrefetchChart.mockClear();
    chartStub.reset();
    gridStub.reset();
    communesStub.reset();
});

describe('nuage de points des cartes bivariées', () => {
    const BY_REGION_HOUSEHOLDS = '?zone=FRANCE&scale=REGION&start=2011&end=2024&indicator=bivariate_habitat_menages';
    const scatter = (): string | null => screen.queryByTestId('scatter-chart')?.textContent ?? null;
    const openTwelveRegions = (): void => {
        deliverBaseMap(FRANCE_BY_TWELVE_REGIONS);
        deliverConso(FRANCE_BY_TWELVE_REGIONS, CONSO_FRANCE_BY_TWELVE_REGIONS);
        openPage(BY_REGION_HOUSEHOLDS);
    };

    it('est proposé en premier parmi les graphiques d’une carte bivariée, coché à l’ouverture', () => {
        openFranceByRegion();
        fireEvent.click(screen.getByRole('radio', { name: /évolution des ménages/ }));

        expect((screen.getAllByRole('checkbox') as HTMLInputElement[]).map((box) => [box.value, box.checked])).toEqual([
            ['crossed_rates_scatter', true],
            ['conso_and_households_by_year', true],
        ]);
    });

    it('n’est pas proposé pour une autre carte', () => {
        openFranceByRegion();

        expect((screen.getAllByRole('checkbox') as HTMLInputElement[]).map((box) => box.value)).not.toContain('crossed_rates_scatter');
        expect(scatter()).toBeNull();
    });

    it('place les territoires de la carte affichée, sans rien demander au serveur', () => {
        openTwelveRegions();

        expect(scatter()).toBe('Un point par région, 12 points');
        expect(mockPrefetchChart).not.toHaveBeenCalled();
    });

    it('dit à sa place pourquoi il n’est pas dessiné quand la carte montre moins de dix territoires', () => {
        openFranceByRegion();
        fireEvent.click(screen.getByRole('radio', { name: /évolution des ménages/ }));

        expect(scatter()).toBeNull();
        expect(screen.getByText("Le nuage de points n'est pas dessiné pour moins de dix territoires.")).toBeInTheDocument();
    });

    it('disparaît quand il est décoché, et revient quand il est coché de nouveau', () => {
        openTwelveRegions();
        fireEvent.click(screen.getByRole('checkbox', { name: /nuage de points/ }));

        expect(scatter()).toBeNull();

        fireEvent.click(screen.getByRole('checkbox', { name: /nuage de points/ }));

        expect(scatter()).toBe('Un point par région, 12 points');
    });

    it('apprend de la carte le territoire survolé, et lui désigne le sien', () => {
        openTwelveRegions();
        const onScatter = jest.fn();
        mockScatter.highlight.subscribe('scatter', onScatter);
        act(() => chartStub.hoverLand('R3'));
        act(() => chartStub.hoverLand(null));

        expect(onScatter.mock.calls).toEqual([['R3'], [null]]);

        act(() => mockScatter.highlight.publish('scatter', 'R7'));

        expect(chartStub.outlinedLands()).toEqual(['R7']);
    });

    it('ne recrée pas la carte quand un territoire est survolé dans le nuage', () => {
        openTwelveRegions();
        act(() => mockScatter.highlight.publish('scatter', 'R7'));

        expect(chartStub.creations.length).toBe(1);
    });
});

describe('marque du site', () => {
    it('remplace l’en-tête des autres pages par les logos en haut du menu, celui du site menant à l’accueil', () => {
        openFranceByRegion();

        expect(screen.queryByRole('banner')).not.toBeInTheDocument();
        const menu = screen.getByRole('complementary', { name: 'Menu de la carte nationale' });
        expect(within(menu).getByRole('img', { name: 'Logo République Française' })).toBeInTheDocument();
        expect(within(menu).getByRole('link', { name: 'Logo Mon Diagnostic Artificialisation' })).toHaveAttribute('href', '/');
        expect(screen.queryByPlaceholderText(/Rechercher un territoire/)).not.toBeInTheDocument();
    });

    it('se réduit, sous les onglets mobiles, au logo du site en tête de leur barre, toujours sans en-tête', () => {
        atWidth(390, () => {
            openFranceByRegion();
            const tabsBar = screen.getByRole('navigation', { name: 'Affichage' }).parentElement;
            const homeLinks = screen.getAllByRole('link', { name: 'Logo Mon Diagnostic Artificialisation' });

            expect(screen.queryByRole('banner')).not.toBeInTheDocument();
            // Un seul logo, dans la barre des onglets : le menu ne répète pas la marque
            expect(homeLinks).toHaveLength(1);
            expect(tabsBar).toContainElement(homeLinks[0]);
            expect(homeLinks[0]).toHaveAttribute('href', '/');
            // Premier élément de la page atteint au clavier
            expect(document.body.querySelector('a[href], button, select, input')).toBe(homeLinks[0]);
            expect(screen.queryByRole('img', { name: 'Logo République Française' })).not.toBeInTheDocument();
            expect(screen.queryByPlaceholderText(/Rechercher un territoire/)).not.toBeInTheDocument();
        });
    });
});

describe('titre de la page', () => {
    it('porte le nom entier du territoire en infobulle, pour le lire au survol quand la barre le coupe', () => {
        deliverBaseMap(BRETAGNE_BY_DEPARTEMENT);
        deliverConso(BRETAGNE_BY_DEPARTEMENT, CONSO_BRETAGNE_BY_DEPARTEMENT);
        openPage('?zone=REGION_53&scale=DEPART');

        expect(title()).toHaveTextContent('Bretagne');
        expect(title()).toHaveAttribute('title', 'Bretagne');
    });
});

describe('fil d’Ariane', () => {
    const openBretagne = (): void => {
        deliverBaseMap(BRETAGNE_BY_DEPARTEMENT);
        deliverConso(BRETAGNE_BY_DEPARTEMENT, CONSO_BRETAGNE_BY_DEPARTEMENT);
        openPage('?zone=REGION_53&scale=DEPART');
    };

    it('tient dans la barre de titre, au-dessus du titre', () => {
        openBretagne();

        expect(titleBar()).toContainElement(breadcrumbNav());
        expect(titleBar()).toContainElement(title());
        expect(breadcrumbNav().compareDocumentPosition(title()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('laisse sa ligne vide, et muette, sur la France entière, dont il ne ferait que répéter le titre', () => {
        openFranceByRegion();
        const line = titleBar().firstElementChild;

        expect(breadcrumbNav()).toBeNull();
        expect(line).toBeEmptyDOMElement();
        expect(line).toHaveAttribute('aria-hidden', 'true');
    });

    it('garde sa ligne dans la barre d’une zone à l’autre, pour que le titre et la carte ne bougent pas', () => {
        openFranceByRegion();
        const emptyLine = titleBar().firstElementChild;
        act(() => chartStub.clickLand('53'));
        deliverBaseMap(BRETAGNE_BY_DEPARTEMENT);
        deliverConso(BRETAGNE_BY_DEPARTEMENT, CONSO_BRETAGNE_BY_DEPARTEMENT);

        expect(breadcrumb()).toEqual(['France entière', 'Hexagone', 'Bretagne']);
        expect(titleBar().firstElementChild).toBe(breadcrumbNav());
        expect(titleBar().children).toHaveLength(2);
        expect(emptyLine).not.toBeInTheDocument();
    });

    it('reste au-dessus de la carte sous les onglets mobiles, France entière comprise', () => {
        atWidth(390, () => {
            openFranceByRegion();

            expect(breadcrumb()).toEqual(['France entière']);
            expect(titleBar()).not.toContainElement(breadcrumbNav());
            expect(title().compareDocumentPosition(breadcrumbNav()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        });
    });

    it('suit les onglets mobiles jusqu’à 980 px de fenêtre compris, comme les règles CSS de la page', () => {
        atWidth(980, () => {
            openFranceByRegion();

            expect(screen.getByRole('navigation', { name: 'Affichage' })).toBeInTheDocument();
            expect(breadcrumb()).toEqual(['France entière']);
        });
    });

    it('rejoint la barre de titre dès 981 px de fenêtre, où les onglets disparaissent', () => {
        atWidth(981, () => {
            openBretagne();

            expect(screen.queryByRole('navigation', { name: 'Affichage' })).not.toBeInTheDocument();
            expect(titleBar()).toContainElement(breadcrumbNav());
        });
    });
});

describe('vue chargée', () => {
    it('affiche par défaut la France entière par EPCI, en pourcentage de la surface consommée de 2011 à 2024', () => {
        deliverBaseMap(FRANCE_BY_EPCI);
        deliverConso(FRANCE_BY_EPCI, CONSO_FRANCE_BY_EPCI);
        openPage();

        expect(title()).toHaveTextContent('France entière');
        expect(breadcrumb()).toEqual([]);
        expect(window.location.search).toBe('?zone=FRANCE&scale=EPCI&start=2011&end=2024&indicator=conso_pct_surface');
        expect(scaleButton('EPCI')).toHaveAttribute('aria-pressed', 'true');
        expect(selectedMap()).toBe('conso_pct_surface');
        expect(mapChoices()[0]).toBe('conso_pct_surface');
        expect(drawnLands()).toEqual(['Métropole de Lyon', 'Rennes Métropole']);
        expect(mapLegend()).toHaveTextContent("Consommation d'ENAF (en pourcentage de la surface communale)");
        expect(chartStub.creations.length).toBe(1);
    });

    it('rouvre depuis son adresse la France entière par région, en hectares consommés', () => {
        openFranceByRegion();

        expect(title()).toHaveTextContent('France entière');
        expect(breadcrumb()).toEqual([]);
        expect(window.location.search).toBe('?zone=FRANCE&scale=REGION&start=2011&end=2024&indicator=conso_ha');
        expect(scaleButton('Région')).toHaveAttribute('aria-pressed', 'true');
        expect(selectedMap()).toBe('conso_ha');
        expect(drawnLands()).toEqual(['Guyane', 'Mayotte', 'Île-de-France', 'Bretagne', 'Nouvelle-Aquitaine', 'Auvergne-Rhône-Alpes', 'Corse']);
        expect(mapLegend()).toHaveTextContent("Consommation d'ENAF (en hectares)");
    });

    it('somme la consommation des territoires affichés et en donne le rythme annuel', () => {
        openFranceByRegion();

        expect(keyFigures()).toHaveTextContent("123 748 haConsommation d'espaces");
        expect(keyFigures()).toHaveTextContent('8 839 ha/anRythme annuel moyen');
    });

    it('accompagne la carte des graphiques de la France entière, sur la période affichée', () => {
        openFranceByRegion();

        expect(screen.getByRole('heading', { name: 'Graphiques complémentaires (2)' })).toBeInTheDocument();
        expect(charts()).toEqual(['chart_determinant_national_map NATION/NATION 2011-2024', 'pie_determinant_national_map NATION/NATION 2011-2024']);
    });

    it('rouvre une région depuis son adresse, avec le chemin qui y mène et ses graphiques', () => {
        deliverBaseMap(BRETAGNE_BY_DEPARTEMENT);
        deliverConso(BRETAGNE_BY_DEPARTEMENT, CONSO_BRETAGNE_BY_DEPARTEMENT);
        openPage('?zone=REGION_53&scale=DEPART&start=2011&end=2024&indicator=conso_pct_surface');

        expect(title()).toHaveTextContent('Bretagne');
        expect(screen.getByText('Région')).toBeInTheDocument();
        expect(breadcrumb()).toEqual(['France entière', 'Hexagone', 'Bretagne']);
        expect(scaleButton('Département')).toHaveAttribute('aria-pressed', 'true');
        expect(selectedMap()).toBe('conso_pct_surface');
        expect(drawnLands()).toEqual(["Côtes-d'Armor", 'Finistère', 'Ille-et-Vilaine', 'Morbihan']);
        expect(keyFigures()).toHaveTextContent("22 824 haConsommation d'espaces");
        expect(charts()).toEqual(['chart_determinant_national_map REGION/53 2011-2024', 'pie_determinant_national_map REGION/53 2011-2024']);
    });

    it('ne fait pas passer par l’Hexagone le chemin d’une région d’outre-mer, et nomme ses territoires sans donnée', () => {
        deliverBaseMap(MAYOTTE_BY_EPCI);
        deliverConso(MAYOTTE_BY_EPCI, CONSO_MAYOTTE_BY_EPCI);
        openPage('?zone=REGION_06&scale=EPCI');

        expect(breadcrumb()).toEqual(['France entière', 'Mayotte']);
        expect(screen.getByText(/^Les données de consommation/)).toHaveTextContent(
            "Les données de consommation d'espaces ne sont pas disponibles pour CA de Dembeni / Mamoudzou, CC de Petite-Terre (en gris sur la carte).",
        );
    });

    it('annonce l’échec du chargement du fond et garde l’identifiant de la zone pour titre', () => {
        settle('base-map', { scale: 'COMM', parent_type: 'EPCI', parent_id: '999' }, { error: true });
        openPage('?zone=EPCI_999');

        expect(screen.getByText("Le fond de carte n'a pas pu être chargé.")).toBeInTheDocument();
        expect(title()).toHaveTextContent('999');
        expect(screen.getByRole('button', { name: /Exporter la carte/ })).toBeDisabled();
    });
});

describe('rubriques du menu', () => {
    it('liste les cartes de la consommation en neuf lignes, dont une seule pour les données carroyées, les relatives avant les hectares, avec l’année qui suit le dernier millésime dans leurs libellés', () => {
        openFranceByRegion();

        expect(mapChoices()).toEqual([
            'conso_pct_surface',
            'conso_ha_gridded',
            'conso_evolution_between_periods',
            'bivariate_activite_emplois',
            'bivariate_habitat_menages',
            'bivariate_habitat_population',
            'conso_ha',
            'conso_habitat_ha',
            'conso_activite_ha',
        ]);
        expect(screen.getByRole('radio', { name: "Évolution de la consommation d'ENAF (en pourcentage) entre 2011-2021 et 2021-2025" })).toBeInTheDocument();
        expect((screen.getAllByRole('checkbox') as HTMLInputElement[]).map((box) => [box.value, box.checked])).toEqual([
            ['conso_by_year_and_destination', true],
            ['destination_share', true],
        ]);
    });

    it('ouvre la rubrique des espaces artificialisés sur sa première carte', () => {
        openFranceByRegion();
        fireEvent.click(screen.getByRole('button', { name: 'Visualiser les espaces artificialisés' }));

        expect(mapChoices()).toEqual(['artif_pct_gridded', 'artif_pct', 'artif_ha']);
        expect(selectedMap()).toBe('artif_pct_gridded');
        expect(window.location.search).toBe('?zone=FRANCE&scale=REGION&start=2011&end=2024&indicator=artif_pct_gridded');
    });

    it('affiche, pour l’artificialisation, ses chiffres clés, sa note et ses graphiques, sans période à choisir', () => {
        openFranceByRegion();
        fireEvent.click(screen.getByRole('button', { name: "Visualiser l'artificialisation" }));
        deliverArtif(FRANCE_BY_REGION, ARTIF_FRANCE_BY_REGION);

        expect(mapChoices()).toEqual(['artif_net_pct_surface', 'artif_net_annual_pct_surface', 'artif_desartif_ha', 'artif_net_ha', 'artif_net_annual_ha']);
        expect(selectedMap()).toBe('artif_net_pct_surface');
        expect(mapLegend()).toHaveTextContent('Artificialisation nette entre les deux derniers millésimes (en pourcentage de la surface du territoire)');
        expect(keyFigures()).toHaveTextContent('+22 429 haArtificialisation nette');
        expect(keyFigures()).toHaveTextContent('+7 132 ha/anRythme annuel moyen');
        expect(keyFigures()).toHaveTextContent('Millésimes n°1 et n°2');
        expect(screen.getByText(/^Source : OCS GE/)).toHaveTextContent(
            'Source : OCS GE (IGN). Évolution mesurée entre le millésime n°1 (2017 à 2020) et le millésime n°2 (2020 à 2023). ' +
                'Les années diffèrent selon les départements : les valeurs ne sont pas strictement comparables d’un territoire à l’autre. ' +
                'Donnée non disponible pour Guyane (en gris) : la couverture OCS GE y est incomplète.',
        );
        // À la place du sélecteur de période : les millésimes représentés, qui ouvrent leur explication
        const badge = screen.getByRole('button', { name: 'Millésimes n°1 (2017 à 2020) et n°2 (2020 à 2023). Qu’est-ce qu’un millésime ?' });
        expect(badge).toHaveTextContent('Millésimes n°1 et n°22017 à 2020 puis 2020 à 2023');
        expect(screen.getByRole('group', { name: 'Zone, maille et millésimes' })).toContainElement(badge);
        expect(charts()).toEqual(['artif_net_flux_national_map NATION/NATION millésimes 1 et 2', 'artif_flux_by_couverture_national_map NATION/NATION millésimes 1 et 2']);
    });

    it('retrouve la dernière carte d’une rubrique quand on la rouvre, et laisse la carte quand on la referme', () => {
        openFranceByRegion();
        fireEvent.click(screen.getByRole('radio', { name: /à destination de l'habitat \(en hectares\)/ }));
        fireEvent.click(screen.getByRole('button', { name: 'Visualiser les espaces artificialisés' }));
        fireEvent.click(screen.getByRole('button', { name: "Visualiser la consommation d'ENAF" }));

        expect(selectedMap()).toBe('conso_habitat_ha');

        fireEvent.click(screen.getByRole('button', { name: "Visualiser la consommation d'ENAF" }));

        expect(screen.queryAllByRole('radio')).toEqual([]);
        expect(window.location.search).toContain('indicator=conso_habitat_ha');
        expect(mapLegend()).toHaveTextContent("Consommation d'ENAF à destination de l'habitat (en hectares)");
    });
});

describe('clic sur un territoire', () => {
    it('en fait la zone affichée, à la maille juste en dessous', () => {
        openFranceByRegion();
        act(() => chartStub.clickLand('53'));
        deliverBaseMap(BRETAGNE_BY_DEPARTEMENT);
        deliverConso(BRETAGNE_BY_DEPARTEMENT, CONSO_BRETAGNE_BY_DEPARTEMENT);

        expect(window.location.search).toBe('?zone=REGION_53&scale=DEPART&start=2011&end=2024&indicator=conso_ha');
        expect(title()).toHaveTextContent('Bretagne');
        expect(breadcrumb()).toEqual(['France entière', 'Hexagone', 'Bretagne']);
        expect(scaleButton('Département')).toHaveAttribute('aria-pressed', 'true');
        expect(drawnLands()).toEqual(["Côtes-d'Armor", 'Finistère', 'Ille-et-Vilaine', 'Morbihan']);
        expect(charts()).toEqual(['chart_determinant_national_map REGION/53 2011-2024', 'pie_determinant_national_map REGION/53 2011-2024']);
    });

    it('est ignoré pendant un chargement : la carte montre encore la vue précédente', () => {
        openFranceByRegion();
        act(() => chartStub.clickLand('53'));
        act(() => chartStub.clickLand('75'));

        expect(window.location.search).toContain('zone=REGION_53');
    });
});

describe('changement de maille', () => {
    it('suit le clic tout de suite dans les commandes et dans l’adresse', () => {
        openFranceByRegion();
        fireEvent.click(scaleButton('Département'));

        expect(scaleButton('Département')).toHaveAttribute('aria-pressed', 'true');
        expect(window.location.search).toBe('?zone=FRANCE&scale=DEPART&start=2011&end=2024&indicator=conso_ha');
        expect(screen.getByRole('status')).toHaveTextContent('Chargement de la carte : France entière…');
    });

    it('affiche les départements et leurs chiffres clés une fois le fond et les données arrivés', () => {
        openFranceByRegion();
        fireEvent.click(scaleButton('Département'));
        deliverBaseMap(FRANCE_BY_DEPARTEMENT);
        deliverConso(FRANCE_BY_DEPARTEMENT, CONSO_FRANCE_BY_DEPARTEMENT);

        expect(drawnLands()).toEqual(["Côtes-d'Armor", 'Ille-et-Vilaine', 'Paris', 'Vaucluse']);
        expect(keyFigures()).toHaveTextContent("14 941 haConsommation d'espaces");
        expect(mapLegend()).toHaveTextContent("Consommation d'ENAF (en hectares)");
        expect(screen.queryByRole('status')).toBeNull();
    });

    describe('quand le fond arrive avant les données', () => {
        it('garde la légende montée', () => {
            openFranceByRegion();
            fireEvent.click(scaleButton('Département'));
            deliverBaseMap(FRANCE_BY_DEPARTEMENT);

            expect(mapLegend()).not.toBeNull();
        });

        it('ne change pas le texte des chiffres clés', () => {
            openFranceByRegion();
            const before = keyFigures().textContent;
            fireEvent.click(scaleButton('Département'));
            deliverBaseMap(FRANCE_BY_DEPARTEMENT);

            expect(keyFigures().textContent).toBe(before);
        });

        it('garde les régions dessinées, et signale les chiffres clés comme en cours de mise à jour', () => {
            openFranceByRegion();
            const regions = drawnLands();
            fireEvent.click(scaleButton('Département'));
            deliverBaseMap(FRANCE_BY_DEPARTEMENT);

            expect(drawnLands()).toEqual(regions);
            expect(keyFigures().parentElement).toHaveAttribute('aria-busy', 'true');
        });
    });

    describe('quand les données arrivent avant le fond', () => {
        it('garde la légende, les chiffres clés et les régions dessinées', () => {
            openFranceByRegion();
            const before = { keyFigures: keyFigures().textContent, lands: drawnLands() };
            fireEvent.click(scaleButton('Département'));
            deliverConso(FRANCE_BY_DEPARTEMENT, CONSO_FRANCE_BY_DEPARTEMENT);

            expect(mapLegend()).not.toBeNull();
            expect(keyFigures().textContent).toBe(before.keyFigures);
            expect(drawnLands()).toEqual(before.lands);
        });

        it('affiche les départements une fois le fond arrivé', () => {
            openFranceByRegion();
            fireEvent.click(scaleButton('Département'));
            deliverConso(FRANCE_BY_DEPARTEMENT, CONSO_FRANCE_BY_DEPARTEMENT);
            deliverBaseMap(FRANCE_BY_DEPARTEMENT);

            expect(drawnLands()).toEqual(["Côtes-d'Armor", 'Ille-et-Vilaine', 'Paris', 'Vaucluse']);
            expect(keyFigures()).toHaveTextContent("14 941 haConsommation d'espaces");
            expect(keyFigures().parentElement).toHaveAttribute('aria-busy', 'false');
        });
    });
});

describe('changement de zone', () => {
    it('nomme tout de suite la zone demandée dans le sélecteur et l’annonce de chargement, pas dans le titre', () => {
        openFranceByRegion();
        act(() => chartStub.clickLand('53'));

        expect(screen.getByRole('status')).toHaveTextContent('Chargement de la carte : Bretagne…');
        expect(screen.getByRole('combobox', { name: 'Zone affichée' })).toHaveValue('REGION_53');
        expect(title()).toHaveTextContent('France entière');
        expect(breadcrumb()).toEqual([]);
    });

    it('change le titre, le fil d’Ariane, la carte, les chiffres clés et les graphiques dans le même rendu', () => {
        openFranceByRegion();
        const france = { keyFigures: keyFigures().textContent, lands: drawnLands(), charts: charts() };
        act(() => chartStub.clickLand('53'));
        deliverBaseMap(BRETAGNE_BY_DEPARTEMENT);

        expect(title()).toHaveTextContent('France entière');
        expect(breadcrumb()).toEqual([]);
        expect(drawnLands()).toEqual(france.lands);
        expect(keyFigures().textContent).toBe(france.keyFigures);
        expect(charts()).toEqual(france.charts);

        deliverConso(BRETAGNE_BY_DEPARTEMENT, CONSO_BRETAGNE_BY_DEPARTEMENT);

        expect(title()).toHaveTextContent('Bretagne');
        expect(breadcrumb()).toEqual(['France entière', 'Hexagone', 'Bretagne']);
        expect(drawnLands()).toEqual(["Côtes-d'Armor", 'Finistère', 'Ille-et-Vilaine', 'Morbihan']);
        expect(keyFigures()).toHaveTextContent("22 824 haConsommation d'espaces");
        expect(charts()).toEqual(['chart_determinant_national_map REGION/53 2011-2024', 'pie_determinant_national_map REGION/53 2011-2024']);
    });

    it('demande les graphiques de la zone cliquée dès le clic, pendant que ceux de la carte affichée restent', () => {
        openFranceByRegion();
        mockPrefetchChart.mockClear();
        act(() => chartStub.clickLand('53'));

        expect(mockPrefetchChart.mock.calls.map(([query]) => query)).toEqual([
            { id: 'chart_determinant_national_map', land_type: 'REGION', land_id: '53', start_date: '2011', end_date: '2024' },
            { id: 'pie_determinant_national_map', land_type: 'REGION', land_id: '53', start_date: '2011', end_date: '2024' },
        ]);
        expect(charts()).toEqual(['chart_determinant_national_map NATION/NATION 2011-2024', 'pie_determinant_national_map NATION/NATION 2011-2024']);
    });

    it('garde le chemin complet quand on remonte par le fil d’Ariane, jusqu’à l’arrivée de la carte demandée', () => {
        deliverBaseMap(BRETAGNE_BY_DEPARTEMENT);
        deliverConso(BRETAGNE_BY_DEPARTEMENT, CONSO_BRETAGNE_BY_DEPARTEMENT);
        openPage('?zone=REGION_53&scale=DEPART');
        fireEvent.click(screen.getByRole('button', { name: 'France entière' }));

        expect(breadcrumb()).toEqual(['France entière', 'Hexagone', 'Bretagne']);

        deliverBaseMap(FRANCE_BY_DEPARTEMENT);
        deliverConso(FRANCE_BY_DEPARTEMENT, CONSO_FRANCE_BY_DEPARTEMENT);

        expect(breadcrumb()).toEqual([]);
    });
});

describe('changement de période', () => {
    // Même consommation, pour une période qui commence un an plus tard
    const from2012: NationalMapIndicators = { ...CONSO_FRANCE_BY_REGION, start_year: 2012 };

    const chooseStartYear = (year: number): void => {
        fireEvent.click(screen.getByRole('button', { name: 'Année de début' }));
        fireEvent.click(screen.getByRole('button', { name: String(year) }));
    };

    it('garde l’ancien total et les anciennes années jusqu’à l’arrivée des données', () => {
        openFranceByRegion();
        const before = keyFigures().textContent;
        chooseStartYear(2012);

        expect(window.location.search).toContain('start=2012');
        expect(before).toContain('2011');
        expect(keyFigures().textContent).toBe(before);
        expect(charts()).toEqual(['chart_determinant_national_map NATION/NATION 2011-2024', 'pie_determinant_national_map NATION/NATION 2011-2024']);
    });

    it('affiche le total, le rythme annuel et les graphiques de la nouvelle période à l’arrivée des données', () => {
        openFranceByRegion();
        chooseStartYear(2012);
        deliverConso(FRANCE_BY_REGION, from2012);

        expect(keyFigures()).toHaveTextContent("123 748 haConsommation d'espaces");
        expect(keyFigures()).toHaveTextContent('9 519 ha/anRythme annuel moyen');
        expect(keyFigures().textContent).toContain('2012');
        expect(charts()).toEqual(['chart_determinant_national_map NATION/NATION 2012-2024', 'pie_determinant_national_map NATION/NATION 2012-2024']);
    });

    it('atténue l’ancienne carte sans la recréer, puis crée la nouvelle une seule fois', () => {
        openFranceByRegion();
        chooseStartYear(2012);

        expect(chartStub.creations.length).toBe(1);

        deliverConso(FRANCE_BY_REGION, from2012);

        expect(chartStub.creations.length).toBe(2);
    });
});

describe('périodes prédéfinies du sélecteur de période', () => {
    // Même consommation, sur la décennie de référence
    const overDecade: NationalMapIndicators = { ...CONSO_FRANCE_BY_REGION, end_year: 2020 };

    const openYears = (bound: 'début' | 'fin'): void => {
        fireEvent.click(screen.getByRole('button', { name: `Année de ${bound}` }));
    };
    const presetsGroup = (): HTMLElement | null => screen.queryByRole('group', { name: 'Périodes prédéfinies' });
    const presets = (): [string, string, string][] =>
        within(presetsGroup())
            .getAllByRole('button')
            .map((button) => [button.textContent, button.getAttribute('aria-pressed'), button.title]);
    const choosePreset = (label: RegExp): void => {
        fireEvent.click(within(presetsGroup()).getByRole('button', { name: label }));
    };
    const consoRequests = (): string[] => [...mockServer.requested].filter((request) => request.startsWith('indicators?'));

    it('propose les périodes de référence de la réponse en tête des deux listes d’années, et marque celle de la période en cours', () => {
        openFranceByRegion();
        openYears('début');

        expect(presets()).toEqual([
            ['Décennie de référence2011 – 2020', 'false', 'du 1er janvier 2011 au 1er janvier 2021'],
            ['Depuis 20212021 – 2024', 'false', 'du 1er janvier 2021 au 1er janvier 2025'],
            ['Toute la période2011 – 2024', 'true', 'du 1er janvier 2011 au 1er janvier 2025'],
        ]);
        // Au-dessus des années : le groupe précède la première année de la liste
        const firstYear = screen.getByRole('button', { name: '2011' });
        expect(presetsGroup().compareDocumentPosition(firstYear) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

        openYears('fin');

        expect(presets().map(([text]) => text)).toEqual(['Décennie de référence2011 – 2020', 'Depuis 20212021 – 2024', 'Toute la période2011 – 2024']);
    });

    it('règle les deux années d’un coup : une seule vue demandée à l’API, et la liste se referme', () => {
        openFranceByRegion();
        const before = consoRequests();
        openYears('début');
        choosePreset(/^Décennie de référence/);

        expect(window.location.search).toBe('?zone=FRANCE&scale=REGION&start=2011&end=2020&indicator=conso_ha');
        expect(consoRequests().filter((request) => !before.includes(request))).toEqual(['indicators?end_year=2020&scale=REGION&start_year=2011']);
        expect(presetsGroup()).toBeNull();
    });

    it('fait suivre la période choisie par les chiffres clés et les graphiques, et la marque à la réouverture de la liste', () => {
        openFranceByRegion();
        openYears('fin');
        choosePreset(/^Décennie de référence/);
        deliverConso(FRANCE_BY_REGION, overDecade);

        expect(keyFigures().textContent).toContain('2020');
        expect(keyFigures().textContent).not.toContain('2024');
        expect(charts()).toEqual(['chart_determinant_national_map NATION/NATION 2011-2020', 'pie_determinant_national_map NATION/NATION 2011-2020']);

        openYears('début');

        expect(presets().map(([, pressed]) => pressed)).toEqual(['true', 'false', 'false']);
    });

    it('ne marque aucune période quand celle en cours n’est pas une période de référence', () => {
        deliverBaseMap(FRANCE_BY_REGION);
        deliverConso(FRANCE_BY_REGION, { ...CONSO_FRANCE_BY_REGION, start_year: 2012 });
        openPage('?zone=FRANCE&scale=REGION&start=2012&end=2024&indicator=conso_ha');
        openYears('début');

        expect(presets().map(([, pressed]) => pressed)).toEqual(['false', 'false', 'false']);
    });

    it('n’en propose aucune tant qu’aucune réponse ne donne les périodes de référence', () => {
        deliverBaseMap(FRANCE_BY_REGION);
        openPage(BY_REGION_IN_HECTARES);
        openYears('début');

        expect(screen.getByRole('button', { name: '2012' })).toBeInTheDocument();
        expect(presetsGroup()).toBeNull();
    });
});

describe('première carte d’une rubrique d’artificialisation', () => {
    it('laisse la carte de consommation, sa légende, ses chiffres clés et ses graphiques jusqu’à l’arrivée des données OCS GE', () => {
        openFranceByRegion();
        const before = { keyFigures: keyFigures().textContent, charts: charts() };
        // La rubrique dont la première carte est par territoire : celle des espaces artificialisés
        // s'ouvre sur l'image des sols, qui se prépare sous la carte affichée (voir plus bas)
        fireEvent.click(screen.getByRole('button', { name: "Visualiser l'artificialisation" }));

        expect(selectedMap()).toBe('artif_net_pct_surface');
        expect(mapLegend()).toHaveTextContent("Consommation d'ENAF (en hectares)");
        expect(keyFigures().textContent).toBe(before.keyFigures);
        expect(charts()).toEqual(before.charts);

        deliverArtif(FRANCE_BY_REGION, ARTIF_FRANCE_BY_REGION);

        expect(mapLegend()).toHaveTextContent('Artificialisation nette entre les deux derniers millésimes (en pourcentage de la surface du territoire)');
        expect(keyFigures()).toHaveTextContent('Artificialisation nette');
        expect(charts()).toEqual(['artif_net_flux_national_map NATION/NATION millésimes 1 et 2', 'artif_flux_by_couverture_national_map NATION/NATION millésimes 1 et 2']);
    });
});

describe('carte des sols artificialisés par maille', () => {
    // Le libellé de la ligne sélectionnée est suivi de sa description : la carte se cherche par son début
    const SOILS_LABEL = /^Sols artificialisés/;
    // La rubrique s'ouvre sur la carte des sols, la première de son menu
    const openSoils = (): void => {
        openFranceByRegion();
        fireEvent.click(screen.getByRole('button', { name: 'Visualiser les espaces artificialisés' }));
        deliverArtif(FRANCE_BY_REGION, ARTIF_FRANCE_BY_REGION);
    };
    const soilsMap = (): HTMLElement | null => screen.queryByRole('img', { name: /Sols artificialisés/, hidden: true });

    it('se prépare sous la carte par territoire, puis la remplace avec sa légende, les chiffres clés du stock et ses deux graphiques', () => {
        openSoils();

        expect(window.location.search).toBe('?zone=FRANCE&scale=REGION&start=2011&end=2024&indicator=artif_pct_gridded');
        expect(soilsMap()).not.toBeNull();
        expect(mapLegend()).toHaveTextContent("Consommation d'ENAF (en hectares)");

        act(() => gridStub.reportStatus({ ready: true }));

        expect(screen.queryByTestId('highcharts-map')).toBeNull();
        expect(mapLegend()).toHaveTextContent('Nature des sols');
        expect(gridStub.props.render.cells.file).toBe('sols_artificialises_national.pmtiles');
        expect(keyFigures()).toHaveTextContent('Part du territoire artificialisée');
        expect(charts()).toEqual(['artif_synthese_national_map NATION/NATION', 'pie_artif_by_couverture_national_map NATION/NATION millésime 2']);
    });

    it('ne redemande rien au serveur en venant d’une autre carte de la rubrique : même réponse, même maille', () => {
        openFranceByRegion();
        fireEvent.click(screen.getByRole('button', { name: 'Visualiser les espaces artificialisés' }));
        fireEvent.click(screen.getByRole('radio', { name: 'Part du territoire artificialisée (en pourcentage)' }));
        deliverArtif(FRANCE_BY_REGION, ARTIF_FRANCE_BY_REGION);
        const before = keyFigures().textContent;
        fireEvent.click(screen.getByRole('radio', { name: SOILS_LABEL }));
        act(() => gridStub.reportStatus({ ready: true }));

        expect(keyFigures().textContent).toBe(before);
    });

    it('garde la même carte MapLibre en revenant aux carreaux de la consommation, dont elle reçoit les carreaux', () => {
        openFranceByRegion();
        fireEvent.click(screen.getByRole('radio', { name: /données carroyées/ }));
        act(() => gridStub.reportStatus({ ready: true }));
        fireEvent.click(screen.getByRole('button', { name: 'Visualiser les espaces artificialisés' }));
        deliverArtif(FRANCE_BY_REGION, ARTIF_FRANCE_BY_REGION);
        act(() => gridStub.reportStatus({ ready: true }));
        const created = gridStub.creations;
        // La rubrique de la consommation se rouvre sur sa dernière carte : les carreaux
        fireEvent.click(screen.getByRole('button', { name: "Visualiser la consommation d'ENAF" }));

        expect(selectedMap()).toBe('conso_ha_gridded');
        expect(gridStub.creations).toBe(created);
        expect(gridStub.props.render.cells.file).toBe('carroyage_national.pmtiles');
        expect(mapLegend()).toHaveTextContent("Consommation d'ENAF (en hectares), données carroyées");
        expect(screen.queryByText(/^Chargement de la carte/)).toBeNull();
    });

    it('rouvre la carte de l’adresse', () => {
        deliverBaseMap(FRANCE_BY_REGION);
        deliverArtif(FRANCE_BY_REGION, ARTIF_FRANCE_BY_REGION);
        openPage('?zone=FRANCE&scale=REGION&indicator=artif_pct_gridded');
        act(() => gridStub.reportStatus({ ready: true }));

        expect(selectedMap()).toBe('artif_pct_gridded');
        expect(gridStub.props.render.cells.file).toBe('sols_artificialises_national.pmtiles');
        expect(mapLegend()).toHaveTextContent('Nature des sols');
    });
});

describe('vers les données carroyées et retour', () => {
    const chooseGrid = (): void => {
        fireEvent.click(screen.getByRole('radio', { name: /données carroyées/ }));
    };
    // Carte MapLibre, qu'elle soit affichée ou en préparation sous la carte affichée
    const gridMap = (): HTMLElement | null => screen.queryByRole('img', { name: /données carroyées/, hidden: true });
    const territoryMap = (): HTMLElement | null => screen.queryByTestId('highcharts-map');
    // MapLibre a dessiné le fond des territoires ; les carreaux chargent encore
    const paintGridLands = (): void => act(() => gridStub.reportStatus({ ready: true, loading: true }));

    it('garde la carte, son titre, sa légende et ses chiffres clés tant que la carte carroyée n’a pas dessiné son fond', () => {
        openFranceByRegion();
        const before = keyFigures().textContent;
        chooseGrid();

        expect(selectedMap()).toBe('conso_ha_gridded');
        expect(territoryMap()).not.toBeNull();
        expect(chartStub.creations.length).toBe(1);
        expect(mapLegend()).toHaveTextContent("Consommation d'ENAF (en hectares)");
        expect(keyFigures().textContent).toBe(before);
        expect(screen.getByRole('status')).toHaveTextContent('Chargement de la carte : France entière…');
        expect(gridMap()).not.toBeNull();
        expect(screen.queryByText(/^Carroyage de 1 km/)).toBeNull();
    });

    it('remplace la carte, sa légende et sa note dans le même rendu, quand le fond de la carte carroyée est dessiné', () => {
        openFranceByRegion();
        chooseGrid();
        paintGridLands();

        expect(territoryMap()).toBeNull();
        expect(mapLegend()).toHaveTextContent("Consommation d'ENAF (en hectares), données carroyées");
        expect(screen.getByText(/^Carroyage de 1 km/)).toBeInTheDocument();
        expect(screen.getByRole('status')).toHaveTextContent('Chargement des carreaux…');
    });

    it('affiche la carte carroyée au bout de trois secondes si son fond tarde à être dessiné', () => {
        // L'horloge de mesure reste la vraie : la carte y pose le repère de ses créations
        jest.useFakeTimers({ doNotFake: ['performance'] });
        openFranceByRegion();
        chooseGrid();
        act(() => jest.advanceTimersByTime(3000));
        jest.useRealTimers();

        expect(territoryMap()).toBeNull();
        expect(screen.getByText(/^Carroyage de 1 km/)).toBeInTheDocument();
    });

    it('revient tout de suite à la carte par territoire, et démonte la carte carroyée', () => {
        openFranceByRegion();
        chooseGrid();
        paintGridLands();
        fireEvent.click(screen.getByRole('radio', { name: "Consommation d'ENAF (en hectares)" }));

        expect(territoryMap()).not.toBeNull();
        expect(chartStub.creations.length).toBe(2);
        expect(gridMap()).toBeNull();
        expect(mapLegend()).toHaveTextContent("Consommation d'ENAF (en hectares)");
    });

    it('prépare de nouveau la carte carroyée sous la carte affichée à la seconde entrée', () => {
        openFranceByRegion();
        chooseGrid();
        paintGridLands();
        fireEvent.click(screen.getByRole('radio', { name: "Consommation d'ENAF (en hectares)" }));
        chooseGrid();

        expect(territoryMap()).not.toBeNull();
        expect(gridMap()).not.toBeNull();

        paintGridLands();

        expect(territoryMap()).toBeNull();
    });

    it('annonce le chargement de la carte ouverte par son adresse, puis l’affiche une fois son fond dessiné', () => {
        deliverBaseMap(BRETAGNE_BY_DEPARTEMENT);
        deliverConso(BRETAGNE_BY_DEPARTEMENT, CONSO_BRETAGNE_BY_DEPARTEMENT);
        openPage('?zone=REGION_53&scale=DEPART&indicator=conso_ha_gridded');

        expect(screen.getByRole('status')).toHaveTextContent('Chargement de la carte…');
        expect(screen.getByRole('button', { name: /Exporter la carte/ })).toBeDisabled();

        paintGridLands();

        expect(title()).toHaveTextContent('Bretagne');
        expect(screen.getByText(/^Carroyage de 1 km/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Exporter la carte/ })).toBeEnabled();
    });
});

describe('destinations des données carroyées', () => {
    const gridLine = (): HTMLElement => screen.getByRole('radio', { name: /données carroyées/ });
    const destinations = (): HTMLElement | null => screen.queryByRole('group', { name: 'Destination' });
    const destinationButton = (label: string): HTMLElement => within(destinations()).getByRole('button', { name: label });
    const pressedDestinations = (): string[] =>
        within(destinations())
            .getAllByRole('button')
            .filter((button) => button.getAttribute('aria-pressed') === 'true')
            .map((button) => button.textContent);
    const territoryMap = (): HTMLElement | null => screen.queryByTestId('highcharts-map');
    // La carte carroyée de toutes les destinations, affichée : son fond est dessiné, ses carreaux aussi
    const openGrid = (): void => {
        openFranceByRegion();
        fireEvent.click(gridLine());
        act(() => gridStub.reportStatus({ ready: true }));
    };

    it('ne propose le choix de la destination que sous la ligne du carroyage sélectionnée', () => {
        openFranceByRegion();

        expect(destinations()).toBeNull();

        fireEvent.click(gridLine());

        expect(within(destinations()).getAllByRole('button').map((button) => button.textContent)).toEqual([
            'Toutes',
            'Habitat',
            'Activité',
            'Mixte',
            'Routes',
            'Voies ferrées',
            'Inconnue',
        ]);
        expect(pressedDestinations()).toEqual(['Toutes']);
        // Toujours une seule ligne pour le carroyage dans la liste des cartes
        expect(mapChoices()).toHaveLength(9);

        fireEvent.click(screen.getByRole('radio', { name: "Consommation d'ENAF (en hectares)" }));

        expect(destinations()).toBeNull();
    });

    it('passe d’une destination à l’autre sans recréer la carte ni retirer la légende, ses carreaux suivant la destination', () => {
        openGrid();
        const legend = mapLegend();

        fireEvent.click(destinationButton('Habitat'));

        expect(window.location.search).toBe('?zone=FRANCE&scale=REGION&start=2011&end=2024&indicator=conso_habitat_ha_gridded');
        expect(pressedDestinations()).toEqual(['Habitat']);
        expect(selectedMap()).toBe('conso_habitat_ha_gridded');
        expect(gridStub.props.render.cells.file).toBe('carroyage_national_habitat.pmtiles');
        expect(gridStub.creations).toBe(1);
        expect(territoryMap()).toBeNull();
        expect(chartStub.creations.length).toBe(1);
        // La même légende, à son emplacement, sous le titre de la destination
        expect(mapLegend()).toBe(legend);
        expect(mapLegend()).toHaveTextContent("Consommation d'ENAF à destination de l'habitat (en hectares), données carroyées");
        expect(screen.queryByText(/^Chargement de la carte/)).toBeNull();

        fireEvent.click(destinationButton('Voies ferrées'));

        expect(gridStub.props.render.cells.file).toBe('carroyage_national_ferroviaire.pmtiles');
        expect(gridStub.creations).toBe(1);
        expect(mapLegend()).toBe(legend);

        fireEvent.click(destinationButton('Toutes'));

        expect(gridStub.props.render.cells.file).toBe('carroyage_national.pmtiles');
        expect(window.location.search).toBe('?zone=FRANCE&scale=REGION&start=2011&end=2024&indicator=conso_ha_gridded');
    });

    it('garde, sur la ligne, le libellé du carroyage et décrit la destination affichée', () => {
        openGrid();
        fireEvent.click(destinationButton('Routes'));

        expect(gridLine()).toBeChecked();
        expect(gridLine().closest('label')).toHaveTextContent(/^Consommation d'ENAF \(en hectares\), données carroyées/);
        expect(gridLine().closest('label')).toHaveTextContent('Nouvelles surfaces urbanisées à destination des routes');
    });

    it('retrouve la dernière destination choisie en revenant sur la ligne du carroyage', () => {
        openGrid();
        fireEvent.click(destinationButton('Activité'));
        fireEvent.click(screen.getByRole('radio', { name: "Consommation d'ENAF (en hectares)" }));

        expect(selectedMap()).toBe('conso_ha');

        fireEvent.click(gridLine());

        expect(selectedMap()).toBe('conso_activite_ha_gridded');
        expect(pressedDestinations()).toEqual(['Activité']);
    });

    it('rouvre la destination de l’adresse, son bouton enfoncé', () => {
        deliverBaseMap(BRETAGNE_BY_DEPARTEMENT);
        deliverConso(BRETAGNE_BY_DEPARTEMENT, CONSO_BRETAGNE_BY_DEPARTEMENT);
        openPage('?zone=REGION_53&scale=DEPART&start=2011&end=2024&indicator=conso_mixte_ha_gridded');
        act(() => gridStub.reportStatus({ ready: true }));

        expect(window.location.search).toBe('?zone=REGION_53&scale=DEPART&start=2011&end=2024&indicator=conso_mixte_ha_gridded');
        expect(gridLine()).toBeChecked();
        expect(pressedDestinations()).toEqual(['Mixte']);
        expect(gridStub.props.render.cells.key).toBe('carroyage_lea.pmtiles|REGION_53|mixte');
        expect(mapLegend()).toHaveTextContent("Consommation d'ENAF à destination mixte (en hectares), données carroyées");
    });

    it('garde la destination quand la zone change', () => {
        openGrid();
        fireEvent.click(destinationButton('Habitat'));
        deliverBaseMap(BRETAGNE_BY_DEPARTEMENT);
        deliverConso(BRETAGNE_BY_DEPARTEMENT, CONSO_BRETAGNE_BY_DEPARTEMENT);
        fireEvent.change(screen.getByRole('combobox', { name: 'Zone affichée' }), { target: { value: 'REGION_53' } });
        fireEvent.click(scaleButton('Département'));

        expect(gridStub.props.render.cells.key).toBe('carroyage_lea.pmtiles|REGION_53|habitat');
        expect(gridStub.creations).toBe(1);
        expect(pressedDestinations()).toEqual(['Habitat']);
    });

    it('rend le choix atteignable au clavier : des boutons, dans un groupe nommé', () => {
        openGrid();
        const buttons = within(destinations()).getAllByRole('button') as HTMLButtonElement[];

        buttons.forEach((button) => {
            button.focus();
            expect(button).toHaveFocus();
            expect(button.type).toBe('button');
            expect(button.tabIndex).toBe(0);
        });
    });
});

describe('toutes les communes d’une zone nationale', () => {
    const BY_COMMUNE = '?zone=FRANCE&scale=COMM&start=2011&end=2024&indicator=conso_pct_surface';
    // Carte MapLibre des communes, qu'elle soit affichée ou en préparation sous la carte affichée
    const communesMap = (): HTMLElement | null => screen.queryByRole('img', { name: /par commune/, hidden: true });
    const territoryMap = (): HTMLElement | null => screen.queryByTestId('highcharts-map');
    const exportButton = (): HTMLElement => screen.getByRole('button', { name: /Exporter la carte/ });
    // MapLibre a chargé ses tuiles et dessiné les communes
    const paintCommunes = (): void => act(() => communesStub.reportStatus({ ready: true }));
    // Le fond et la consommation par département, dont la vue emprunte le cadre
    const deliverDepartements = (): void => {
        deliverBaseMap(FRANCE_BY_DEPARTEMENT);
        deliverConso(FRANCE_BY_DEPARTEMENT, CONSO_FRANCE_BY_DEPARTEMENT);
    };
    const openFranceByEpci = (): void => {
        deliverBaseMap(FRANCE_BY_EPCI);
        deliverConso(FRANCE_BY_EPCI, CONSO_FRANCE_BY_EPCI);
        openPage();
    };

    it.each(['FRANCE', 'HEXAGONE'])('propose la maille Commune pour la zone %s', (zone) => {
        deliverBaseMap(FRANCE_BY_EPCI);
        deliverConso(FRANCE_BY_EPCI, CONSO_FRANCE_BY_EPCI);
        openPage(`?zone=${zone}&scale=EPCI&start=2011&end=2024&indicator=conso_pct_surface`);

        expect(scaleButton('Commune')).toHaveAttribute('aria-pressed', 'false');
    });

    it('rouvre la vue depuis son adresse, à l’identique', () => {
        deliverDepartements();
        deliverValues(COMMUNES_CONSO_SHARE);
        openPage(BY_COMMUNE);
        paintCommunes();

        expect(window.location.search).toBe(BY_COMMUNE);
        expect(title()).toHaveTextContent('France entière');
        expect(scaleButton('Commune')).toHaveAttribute('aria-pressed', 'true');
        expect(selectedMap()).toBe('conso_pct_surface');
        expect(communesMap()).not.toBeNull();
        expect(territoryMap()).toBeNull();
        expect(mapLegend()).toHaveTextContent('Classes par quantiles');
        expect(keyFigures()).toHaveTextContent("Consommation d'espaces");
    });

    it('demande le fond et les chiffres clés des départements et la colonne des communes, jamais le fond des communes', () => {
        openPage(BY_COMMUNE);

        expect([...mockServer.requested].sort((a, b) => a.localeCompare(b))).toEqual([
            'base-map?scale=DEPART',
            'indicators?end_year=2024&scale=DEPART&start_year=2011',
            'values?end_year=2024&key=conso_pct_surface&scale=COMM&start_year=2011',
        ]);
    });

    it('demande, pour une carte en hectares, sa version relative accompagnée des hectares', () => {
        deliverDepartements();
        deliverValues(COMMUNES_CONSO_HA);
        openPage('?zone=FRANCE&scale=COMM&start=2011&end=2024&indicator=conso_ha');
        paintCommunes();

        expect(mockServer.requested).toContain('values?amount=conso_ha&end_year=2024&key=conso_pct_surface&scale=COMM&start_year=2011');
        expect(mapLegend()).toHaveTextContent("Consommation d'ENAF (en pourcentage de la surface communale)");
    });

    describe('depuis la carte par EPCI', () => {
        it('garde la carte, sa légende et ses chiffres clés pendant le chargement, puis pendant le dessin des communes', () => {
            openFranceByEpci();
            const legendNode = mapLegend();
            const before = keyFigures().textContent;
            fireEvent.click(scaleButton('Commune'));

            expect(window.location.search).toBe(BY_COMMUNE);
            expect(screen.getByRole('status')).toHaveTextContent('Chargement de la carte : France entière…');
            expect(communesMap()).toBeNull();

            deliverDepartements();
            deliverValues(COMMUNES_CONSO_SHARE);

            // Les réponses sont là, les tuiles chargent : la carte par EPCI et sa légende restent
            expect(territoryMap()).not.toBeNull();
            expect(drawnLands()).toEqual(['Métropole de Lyon', 'Rennes Métropole']);
            expect(mapLegend()).toBe(legendNode);
            expect(mapLegend()).toHaveTextContent('méthode de Jenks');
            expect(keyFigures().textContent).toBe(before);
            expect(screen.getByRole('status')).toHaveTextContent('Chargement des communes…');
            expect(communesMap()).not.toBeNull();
        });

        it('remplace la carte et sa légende dans le même rendu quand les communes sont dessinées, sans démonter la légende', () => {
            openFranceByEpci();
            const legendNode = mapLegend();
            fireEvent.click(scaleButton('Commune'));
            deliverDepartements();
            deliverValues(COMMUNES_CONSO_SHARE);
            paintCommunes();

            expect(territoryMap()).toBeNull();
            expect(communesStub.creations).toBe(1);
            expect(mapLegend()).toBe(legendNode);
            expect(mapLegend()).toHaveTextContent('Classes par quantiles');
            expect(screen.queryByRole('status')).toBeNull();
            expect(chartStub.creations.length).toBe(1);
        });

        it('affiche la vue au bout de trois secondes si les tuiles tardent, sous l’annonce de leur chargement', () => {
            jest.useFakeTimers({ doNotFake: ['performance'] });
            openFranceByEpci();
            fireEvent.click(scaleButton('Commune'));
            deliverDepartements();
            deliverValues(COMMUNES_CONSO_SHARE);
            act(() => communesStub.reportStatus({ loading: true }));
            act(() => jest.advanceTimersByTime(3000));
            jest.useRealTimers();

            expect(territoryMap()).toBeNull();
            expect(mapLegend()).toHaveTextContent('Classes par quantiles');
            expect(screen.getByRole('status')).toHaveTextContent('Chargement des communes…');
        });

        it('revient tout de suite à la carte par EPCI, avec sa légende, et détruit la carte des communes', () => {
            openFranceByEpci();
            const legendNode = mapLegend();
            fireEvent.click(scaleButton('Commune'));
            deliverDepartements();
            deliverValues(COMMUNES_CONSO_SHARE);
            paintCommunes();
            fireEvent.click(scaleButton('EPCI'));

            expect(territoryMap()).not.toBeNull();
            expect(drawnLands()).toEqual(['Métropole de Lyon', 'Rennes Métropole']);
            expect(communesMap()).toBeNull();
            expect(mapLegend()).toBe(legendNode);
            expect(mapLegend()).toHaveTextContent('méthode de Jenks');
            expect(chartStub.creations.length).toBe(2);
        });
    });

    it('garde la même carte MapLibre d’une carte à l’autre, la légende suivant la carte affichée', () => {
        deliverDepartements();
        deliverValues(COMMUNES_CONSO_SHARE);
        openPage(BY_COMMUNE);
        paintCommunes();
        fireEvent.click(screen.getByRole('radio', { name: "Consommation d'ENAF (en hectares)" }));

        // La colonne de la carte en hectares charge : la carte et la légende affichées restent
        expect(communesStub.props.busy).toBe(true);
        expect(mapLegend()).toHaveTextContent('Classes par quantiles');

        deliverValues(COMMUNES_CONSO_HA);

        expect(communesStub.creations).toBe(1);
        expect(communesStub.props.busy).toBe(false);
        expect(communesStub.props.render.describe('35238').valueText).toMatch(/soit 123/);
        expect(chartStub.creations.length).toBe(0);
    });

    it('ouvre par commune le département désigné dans la fiche de sélection', () => {
        deliverDepartements();
        deliverValues(COMMUNES_CONSO_SHARE);
        openPage(BY_COMMUNE);
        paintCommunes();

        act(() => communesStub.props.onZoneChange('DEPART_35', 'Ille-et-Vilaine'));

        expect(window.location.search).toBe('?zone=DEPART_35&scale=COMM&start=2011&end=2024&indicator=conso_pct_surface');
        expect(screen.getByRole('status')).toHaveTextContent('Chargement de la carte : Ille-et-Vilaine…');
    });

    it('exporte l’image de cette vue comme celle des autres : la carte des communes compose la sienne', () => {
        deliverDepartements();
        deliverValues(COMMUNES_CONSO_SHARE);
        openPage(BY_COMMUNE);
        paintCommunes();

        expect(exportButton()).toBeEnabled();
        fireEvent.click(exportButton());
        expect(communesStub.exports).toBe(1);
        expect(communesStub.props.exportInfo).toMatchObject({ title: "Consommation d'ENAF (en pourcentage de la surface communale)", filename: 'carte-france-comm-conso_pct_surface' });
        expect(communesStub.props.exportLegend.kind).toBe('rows');

        fireEvent.click(scaleButton('Département'));

        expect(exportButton()).toBeEnabled();
        expect(exportButton()).toHaveAttribute('title', 'Télécharger la carte affichée en PNG');
    });

    it('revient à la France entière par commune depuis un département affiché par commune', () => {
        deliverDepartements();
        deliverValues(COMMUNES_CONSO_SHARE);
        openPage('?zone=DEPART_35&scale=COMM&start=2011&end=2024&indicator=conso_pct_surface');

        fireEvent.change(screen.getByRole('combobox', { name: 'Zone affichée' }), { target: { value: 'FRANCE' } });

        expect(window.location.search).toBe(BY_COMMUNE);
    });
});

describe('créations du graphique', () => {
    it('crée la carte une seule fois au premier affichage, quand le fond arrive avant les données', () => {
        openPage(BY_REGION_IN_HECTARES);
        deliverBaseMap(FRANCE_BY_REGION);

        expect(chartStub.creations.length).toBe(0);

        deliverConso(FRANCE_BY_REGION, CONSO_FRANCE_BY_REGION);

        expect(chartStub.creations.length).toBe(1);
    });

    it('crée la carte une seule fois au premier affichage, quand les données arrivent avant le fond', () => {
        openPage(BY_REGION_IN_HECTARES);
        deliverConso(FRANCE_BY_REGION, CONSO_FRANCE_BY_REGION);
        deliverBaseMap(FRANCE_BY_REGION);

        expect(chartStub.creations.length).toBe(1);
    });

    it('ne crée rien pendant le chargement d’une autre maille, puis crée sa carte une seule fois', () => {
        openFranceByRegion();
        fireEvent.click(scaleButton('Département'));
        deliverBaseMap(FRANCE_BY_DEPARTEMENT);

        expect(chartStub.creations.length).toBe(1);

        deliverConso(FRANCE_BY_DEPARTEMENT, CONSO_FRANCE_BY_DEPARTEMENT);

        expect(chartStub.creations.length).toBe(2);
    });

    it('ne crée rien pendant le chargement du territoire cliqué, puis crée sa carte une seule fois', () => {
        openFranceByRegion();
        act(() => chartStub.clickLand('53'));
        deliverConso(BRETAGNE_BY_DEPARTEMENT, CONSO_BRETAGNE_BY_DEPARTEMENT);

        expect(chartStub.creations.length).toBe(1);

        deliverBaseMap(BRETAGNE_BY_DEPARTEMENT);

        expect(chartStub.creations.length).toBe(2);
    });

    it('crée une carte par changement d’indicateur sur des données déjà chargées', () => {
        openFranceByRegion();
        fireEvent.click(screen.getByRole('radio', { name: /en pourcentage de la surface communale/ }));

        expect(chartStub.creations.length).toBe(2);
    });

    it('ne crée rien à l’ouverture d’une rubrique d’artificialisation, puis crée sa carte à l’arrivée des données OCS GE', () => {
        openFranceByRegion();
        // Rubrique dont la première carte est par territoire, dessinée par Highcharts
        fireEvent.click(screen.getByRole('button', { name: "Visualiser l'artificialisation" }));

        expect(chartStub.creations.length).toBe(1);

        deliverArtif(FRANCE_BY_REGION, ARTIF_FRANCE_BY_REGION);

        expect(chartStub.creations.length).toBe(2);
    });

    it('ne recrée pas une carte OCS GE à l’arrivée de la réponse de consommation, qu’elle ne lit pas', () => {
        deliverBaseMap(FRANCE_BY_REGION);
        deliverArtif(FRANCE_BY_REGION, ARTIF_FRANCE_BY_REGION);
        openPage('?zone=FRANCE&scale=REGION&indicator=artif_pct');

        expect(chartStub.creations.length).toBe(1);

        deliverConso(FRANCE_BY_REGION, CONSO_FRANCE_BY_REGION);

        expect(chartStub.creations.length).toBe(1);
        expect(screen.getByRole('button', { name: /Exporter la carte/ })).toBeEnabled();
    });

    it('ne recrée rien quand on referme puis rouvre la rubrique de la carte affichée, ni quand on décoche un graphique', () => {
        openFranceByRegion();
        fireEvent.click(screen.getByRole('button', { name: "Visualiser la consommation d'ENAF" }));
        fireEvent.click(screen.getByRole('button', { name: "Visualiser la consommation d'ENAF" }));
        fireEvent.click(screen.getAllByRole('checkbox')[0]);

        expect(charts()).toHaveLength(1);
        expect(chartStub.creations.length).toBe(1);
    });
});

describe('échec du chargement des données', () => {
    it('l’annonce et garde la carte précédente, sa légende et ses chiffres clés', () => {
        openFranceByRegion();
        const before = { keyFigures: keyFigures().textContent, lands: drawnLands() };
        fireEvent.click(scaleButton('Département'));
        deliverBaseMap(FRANCE_BY_DEPARTEMENT);
        settle('indicators', { scale: 'DEPART', start_year: 2011, end_year: 2024 }, { error: true });

        expect(screen.getByRole('status')).toHaveTextContent("Les données de la carte n'ont pas pu être chargées.");
        expect(drawnLands()).toEqual(before.lands);
        expect(mapLegend()).not.toBeNull();
        expect(keyFigures().textContent).toBe(before.keyFigures);
    });

    it('l’annonce seule quand aucune carte n’a encore été affichée', () => {
        deliverBaseMap(FRANCE_BY_REGION);
        settle('indicators', { scale: 'REGION', start_year: 1950, end_year: 2024 }, { error: true });
        openPage('?zone=FRANCE&scale=REGION&start=1950');

        expect(screen.getByText("Les données de la carte n'ont pas pu être chargées.")).toBeInTheDocument();
        expect(chartStub.creations.length).toBe(0);
        expect(screen.getByRole('button', { name: /Exporter la carte/ })).toBeDisabled();
    });
});
