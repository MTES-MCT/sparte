import Highcharts from 'highcharts';
import { coverFlowsChart, coversChart, flowsChart, shareChart } from '../__fixtures__/ocsgeChartFixtures';
import { ChartContext, ComplementaryChart, chartHeight, heightKeepingPlot, withChartLayout } from './narrowChartLayouts';

// Présentation des graphiques complémentaires : ce que chacun dessine des options du serveur, et
// la règle que Highcharts applique à un graphique étroit, lue telle qu'elle leur est ajoutée.

// Vue d'une carte de la consommation : la période est dans le titre que donne le serveur
const PERIOD: ChartContext = { scope: null };

// Vue d'une carte de l'OCS GE : le territoire que ses graphiques décrivent quand ce n'est pas
// l'ensemble des territoires affichés
const ocsgeView = (scope: string | null = null): ChartContext => ({ scope });

const OCSGE = ocsgeView();

// Graphiques des cartes de la consommation, puis de l'OCS GE
const CHARTS: ComplementaryChart[] = [
    'conso_by_year_and_destination',
    'conso_habitat_by_year',
    'conso_activite_by_year',
    'conso_by_year',
    'destination_share',
    'conso_and_population_by_year',
    'conso_and_households_by_year',
    'employment_by_census',
];
const OCSGE_CHARTS: ComplementaryChart[] = ['artif_share_by_millesime', 'artif_by_cover', 'artif_and_desartif', 'artif_flux_by_cover'];
const ALL_CHARTS = [...CHARTS, ...OCSGE_CHARTS];

// Vue d'essai d'un graphique
const viewOf = (chart: ComplementaryChart): ChartContext => (OCSGE_CHARTS.includes(chart) ? OCSGE : PERIOD);

// Titre et sous-titre que le serveur donne à un graphique, dans sa variante « carte nationale »
const SERVER_TITLE = 'Titre du serveur';
const SERVER_SUBTITLE = 'Sous-titre du serveur';
const SERVER_TEXTS: Highcharts.Options = { title: { text: SERVER_TITLE }, subtitle: { text: SERVER_SUBTITLE } };

const years = (from: number, to: number): string[] => Array.from({ length: to - from + 1 }, (_, index) => String(from + index));

// Recensements de 2011, 2016 et 2022 : une valeur aux années recensées, null aux autres
const censuses = (categories: string[]): (number | null)[] => categories.map((year) => (['2011', '2016', '2022'].includes(year) ? 400000 + Number(year) : null));

// Graphique des ménages tel que le serveur le décrit, réduit à ce que sa présentation lit et
// change : la grandeur de l'Insee sur le premier axe, la consommation sur le second
const householdsChart = (categories: string[] = years(2011, 2024), insee: (number | null)[] = censuses(categories)): Highcharts.Options => ({
    chart: { animation: false },
    accessibility: { enabled: false },
    title: { text: "Consommation d'ENAF et nombre de ménages, par année" },
    subtitle: { text: 'En hectares par année et en nombre de ménages aux recensements, de 2011 à 2024' },
    legend: { layout: 'vertical', align: 'right', verticalAlign: 'middle', itemWidth: 200 },
    xAxis: [{ categories }],
    yAxis: [{ title: { text: 'Nombre de ménages' } }, { title: { text: "Consommation d'espaces (ha)" }, opposite: true }],
    plotOptions: { series: { animation: false } },
    series: [
        { type: 'column', name: 'Consommation totale', id: 'main', yAxis: 1, data: categories.map((_, index) => index + 2) },
        { type: 'column', name: 'Consommation habitat', linkedTo: 'main', yAxis: 1, data: categories.map((_, index) => index + 1) },
        { type: 'spline', name: 'Ménages', data: insee, connectNulls: true },
    ],
    responsive: { rules: [{ condition: { maxWidth: 600 }, chartOptions: { legend: { align: 'center', verticalAlign: 'bottom', layout: 'horizontal' } } }] },
});

// Graphique par destination tel que le serveur le décrit : six destinations empilées, puis le total
const destinationsChart = (): Highcharts.Options => ({
    title: { text: "Consommation d'ENAF par année et par destination" },
    subtitle: { text: 'En hectares, de 2011 à 2024' },
    colors: ['#6a6af4', '#8ecac7', '#eeb088', '#cab8ee', '#6b8abc', '#86cdf2'],
    xAxis: { type: 'category' },
    series: [
        ...['Habitat', 'Activité', 'Mixte', 'Route', 'Ferré', 'Inconnu'].map((name): Highcharts.SeriesColumnOptions => ({ type: 'column', name, stacking: 'normal', data: [1, 2] })),
        { type: 'column', name: 'Total', id: 'main', color: '#CFD1E5', data: [6, 12] },
    ],
});

// Graphique de la consommation par an tel que le serveur le décrit : une série, sans légende, de
// hauteur fixe, avec une bande de fond sur la décennie de référence
const annualChart = (): Highcharts.Options => ({
    chart: { type: 'column', height: 280, animation: false },
    accessibility: { enabled: false },
    title: { text: "Consommation d'ENAF par année" },
    subtitle: { text: 'En hectares, de 2011 à 2024' },
    legend: { enabled: false },
    xAxis: { type: 'category', plotBands: [{ color: '#f5f5f5', from: -0.5, to: 9.5, label: { text: 'Période de référence de la loi Climat & Résilience' } }] },
    plotOptions: { series: { animation: false } },
    series: [{ type: 'column', name: 'Consommation totale', data: years(2011, 2024).map((name, index) => ({ name, y: index < 10 ? 500 : 320 })) }],
});

const narrowRule = (chart: ComplementaryChart, server: Highcharts.Options = {}, context = viewOf(chart)): Highcharts.Options =>
    withChartLayout(chart, context)(server).responsive.rules.at(-1).chartOptions;

// Titre et sous-titre qu'un graphique étroit affiche d'une réponse du serveur : les siens, que le
// graphique ou sa présentation compacte ne complètent ou ne remplacent que là où la colonne ne
// montre pas la même chose
const narrowTexts = (chart: ComplementaryChart, server: Highcharts.Options = {}, context = viewOf(chart)): string[] => {
    const options = withChartLayout(chart, context)({ ...server, ...SERVER_TEXTS });
    const { title, subtitle } = options.responsive.rules.at(-1).chartOptions;
    return [title.text ?? options.title.text, subtitle.text ?? options.subtitle.text];
};

const firstXAxis = (options: Highcharts.Options): Highcharts.XAxisOptions => (Array.isArray(options.xAxis) ? options.xAxis[0] : options.xAxis);

describe('règle des graphiques étroits', () => {
    it('s’ajoute après les règles du serveur, pour un graphique de 520 px au plus, sans toucher aux autres options', () => {
        const serverRule = { condition: { maxWidth: 600 }, chartOptions: { legend: { align: 'center' as const } } };
        const server: Highcharts.Options = { title: { text: 'Titre du serveur' }, responsive: { rules: [serverRule] } };
        const options = withChartLayout('conso_by_year_and_destination', PERIOD)(server);

        expect(options.title).toBe(server.title);
        expect(options.responsive.rules).toHaveLength(2);
        expect(options.responsive.rules[0]).toBe(serverRule);
        expect(options.responsive.rules[1].condition).toEqual({ maxWidth: 520 });
    });

    it.each(ALL_CHARTS)('range la légende de %s sous le graphique, sur des lignes horizontales', (chart) => {
        expect(narrowRule(chart).legend).toMatchObject({ layout: 'horizontal', verticalAlign: 'bottom', itemWidth: 0 });
    });

    it.each(ALL_CHARTS)('range à gauche le titre et le sous-titre de %s, sans en retirer le texte', (chart) => {
        const { title, subtitle } = narrowRule(chart, SERVER_TEXTS);

        expect(title).toMatchObject({ align: 'left' });
        expect(subtitle).toMatchObject({ align: 'left' });
        expect('text' in title).toBe(false);
        narrowTexts(chart).forEach((text) => expect(text.length).toBeGreaterThan(0));
    });

    it.each<ComplementaryChart>(['conso_by_year_and_destination', 'conso_by_year', 'employment_by_census'])('garde le titre et le sous-titre que le serveur donne à %s', (chart) => {
        expect(narrowTexts(chart)).toEqual([SERVER_TITLE, SERVER_SUBTITLE]);
    });

    it('ne liste aucune série, que Highcharts retirerait ou créerait pour s’y conformer', () => {
        ALL_CHARTS.forEach((chart) => expect(narrowRule(chart, householdsChart()).series).toBeUndefined());
    });
});

describe('graduations des axes de valeurs', () => {
    // Axes des valeurs que la règle décrit pour un graphique : un seul, ou un par grandeur
    const axesOf = (chart: ComplementaryChart): Highcharts.YAxisOptions[] => [narrowRule(chart, householdsChart()).yAxis].flat() as Highcharts.YAxisOptions[];
    // Graduations et libellés que l'axe donne à Highcharts, une fois ses extrêmes connus
    const ticksOf = (axis: Highcharts.YAxisOptions, min: number, max: number): number[] => axis.tickPositioner.call({ min, max } as Highcharts.Axis);
    const labelsOf = (axis: Highcharts.YAxisOptions, tickPositions: number[]): string[] =>
        tickPositions.map((value) => axis.labels.formatter.call({ value, axis: { tickPositions } } as Highcharts.AxisLabelsFormatterContextObject));

    it.each(CHARTS.filter((chart) => chart !== 'destination_share'))('donne à chaque axe des valeurs de %s quatre graduations et leurs libellés', (chart) => {
        const axes = axesOf(chart);

        expect(axes.length).toBeGreaterThan(0);
        axes.forEach((axis) => {
            expect(ticksOf(axis, 0, 30943)).toEqual([0, 12000, 24000, 36000]);
            expect(labelsOf(axis, [0, 12000, 24000, 36000])).toEqual(['0', '12k', '24k', '36k']);
        });
    });

    it('laisse le calcul à Highcharts tant que l’axe n’a pas de valeurs, et le libellé tant qu’il n’a pas deux graduations', () => {
        const [axis] = axesOf('conso_by_year_and_destination');
        const drawn = { tickPositions: [5], defaultLabelFormatter: () => 'libellé de Highcharts' };

        expect(ticksOf(axis, undefined, undefined)).toBeUndefined();
        expect(axis.labels.formatter.call({ value: 5, axis: drawn } as unknown as Highcharts.AxisLabelsFormatterContextObject)).toBe('libellé de Highcharts');
    });
});

describe('hauteur des graphiques', () => {
    it('donne à chaque graphique de l’OCS GE la hauteur de ses barres, et aux autres la même', () => {
        expect(ALL_CHARTS.map((chart) => [chart, chartHeight(chart)])).toEqual([
            ['conso_by_year_and_destination', 300],
            ['conso_habitat_by_year', 300],
            ['conso_activite_by_year', 300],
            ['conso_by_year', 300],
            ['destination_share', 300],
            ['conso_and_population_by_year', 300],
            ['conso_and_households_by_year', 300],
            ['employment_by_census', 300],
            ['artif_share_by_millesime', 260],
            ['artif_by_cover', 300],
            ['artif_and_desartif', 300],
            ['artif_flux_by_cover', 400],
        ]);
    });

    it('retire la hauteur que le serveur fixe pour un diagnostic : celle de l’emplacement s’applique', () => {
        const options = withChartLayout('conso_by_year', PERIOD)(annualChart());

        expect(options.chart).toEqual({ type: 'column', animation: false, events: { render: expect.any(Function) } });
    });
});

describe('consommation par année et par destination', () => {
    it('garde toutes les séries du serveur', () => {
        const server = destinationsChart();

        expect(withChartLayout('conso_by_year_and_destination', PERIOD)(server).series).toBe(server.series);
    });
});

describe('consommation par année d’une destination', () => {
    it.each<[ComplementaryChart, string, string, string]>([
        ['conso_habitat_by_year', "Consommation d'ENAF à destination de l'habitat, par année", 'Habitat', '#6a6af4'],
        ['conso_activite_by_year', "Consommation d'ENAF à destination de l'activité, par année", 'Activité', '#8ecac7'],
    ])('réduit %s à la destination, de sa couleur parmi toutes, devant le total, et le dit à toute largeur', (chart, title, serie, color) => {
        const options = withChartLayout(chart, PERIOD)({ ...destinationsChart(), ...SERVER_TEXTS });

        expect(options.series.map((drawn) => [drawn.name, (drawn as Highcharts.SeriesColumnOptions).color])).toEqual([
            [serie, color],
            ['Total', '#CFD1E5'],
        ]);
        // Le titre du serveur est celui de toutes les destinations : il est remplacé hors de la règle des graphiques étroits
        expect([options.title.text, options.subtitle.text]).toEqual([title, `${SERVER_SUBTITLE}, devant le total`]);
        expect(narrowTexts(chart, destinationsChart())).toEqual([title, `${SERVER_SUBTITLE}, devant le total`]);
    });

    it('garde le territoire et la période du titre du serveur, au format du diagnostic', () => {
        const server = { ...destinationsChart(), title: { text: "Consommation d'ENAF par année et par destination - Bretagne (2011 - 2024)" } };

        expect(withChartLayout('conso_habitat_by_year', PERIOD)(server).title.text).toBe("Consommation d'ENAF à destination de l'habitat, par année - Bretagne (2011 - 2024)");
    });

    it('garde le titre du serveur quand il ne rend pas la série de la destination', () => {
        expect(narrowTexts('conso_habitat_by_year', { series: [{ type: 'column', name: 'Total' }] })).toEqual([SERVER_TITLE, SERVER_SUBTITLE]);
    });

    it('retire les totaux écrits au-dessus des barres et le titre de l’axe', () => {
        expect(narrowRule('conso_habitat_by_year', destinationsChart()).yAxis).toMatchObject({ title: { text: undefined }, stackLabels: { enabled: false } });
    });
});

describe('consommation par an et rythme moyen des deux périodes de référence', () => {
    it('sépare les périodes en 2021 et affiche la légende des moyennes', () => {
        const options = withChartLayout('conso_by_year', PERIOD)(annualChart());

        expect(options.series.map((serie) => serie.name)).toEqual(['Consommation totale', 'Moyenne de 2011 à 2020 : 500 ha', 'Moyenne de 2021 à 2024 : 320 ha']);
        expect(options.legend.enabled).toBe(true);
    });

});

describe('consommation et grandeur de l’Insee sur le même tracé', () => {
    const rule = (categories: string[], insee?: (number | null)[]) => narrowRule('conso_and_households_by_year', householdsChart(categories, insee));

    it('retire le titre de chaque axe et dit en sous-titre l’unité, le dessin et l’axe de chaque grandeur', () => {
        const axes = rule(years(2011, 2024)).yAxis as Highcharts.YAxisOptions[];

        expect(axes.map((axis) => axis.title.text)).toEqual([undefined, undefined]);
        expect(narrowTexts('conso_and_households_by_year', householdsChart())).toEqual([
            SERVER_TITLE,
            'En hectares par année (barres, axe de gauche) et en nombre de ménages aux recensements (courbe, axe de droite)',
        ]);
        expect(narrowTexts('conso_and_population_by_year', householdsChart())).toEqual([
            SERVER_TITLE,
            "En hectares par année (barres, axe de gauche) et en nombre d'habitants aux recensements (courbe, axe de droite)",
        ]);
    });

    it('ne décrit qu’un axe et dit pourquoi quand la période n’a pas deux recensements', () => {
        const server = householdsChart(years(2017, 2021));

        expect(narrowRule('conso_and_households_by_year', server).yAxis).toHaveLength(1);
        expect(narrowTexts('conso_and_households_by_year', server)[1]).toBe('En hectares par année\u00a0; moins de deux recensements sur cette période');
        expect(narrowTexts('conso_and_population_by_year', server)[1]).toBe('En hectares par année\u00a0; moins de deux recensements sur cette période');
    });

    it('décrit toujours un axe au moins, même sans réponse exploitable du serveur', () => {
        expect(narrowRule('conso_and_households_by_year').yAxis).toHaveLength(1);
    });

    it.each([
        ['quatorze', years(2011, 2024), [0, 2, 4, 6, 8, 10, 12]],
        ['treize', years(2012, 2024), [0, 2, 4, 6, 8, 10, 12]],
        ['dix', years(2015, 2024), [0, 2, 4, 6, 8]],
        ['sept', years(2014, 2020), [0, 1, 2, 3, 4, 5, 6]],
        ['une', years(2024, 2024), [0]],
    ])('donne à Highcharts sept années au plus à écrire, régulièrement espacées, quand le serveur en rend %s', (_count, categories, expected) => {
        expect(firstXAxis(rule(categories)).tickPositions).toEqual(expected);
    });

    it('laisse le calcul des graduations à Highcharts quand le serveur ne rend aucune année', () => {
        expect(firstXAxis(rule([])).tickPositions).toBeUndefined();
        expect(firstXAxis(narrowRule('conso_and_population_by_year')).tickPositions).toBeUndefined();
    });
});

describe('emploi et chômage aux recensements', () => {
    const server = { xAxis: { categories: ['2011', '2016', '2022'] } } as Highcharts.Options;

    it('écrit les trois recensements, à l’horizontale', () => {
        const axis = firstXAxis(narrowRule('employment_by_census', server));

        expect(axis.tickPositions).toEqual([0, 1, 2]);
        expect(axis.labels.rotation).toBe(0);
    });

});

describe('graphiques des cartes de l’OCS GE', () => {
    const subtitleOf = (chart: ComplementaryChart, server: Highcharts.Options = {}, context = OCSGE): string => narrowTexts(chart, server, context)[1];

    it('garde le titre et le sous-titre du serveur, qui lit l’unité et les millésimes dans ses données, et les complète de ce que la colonne ajoute', () => {
        expect(narrowTexts('artif_share_by_millesime', shareChart())).toEqual([SERVER_TITLE, `${SERVER_SUBTITLE}\u00a0; +1\u202f465\u00a0ha`]);
        expect(narrowTexts('artif_by_cover', coversChart())).toEqual([SERVER_TITLE, SERVER_SUBTITLE]);
        expect(narrowTexts('artif_and_desartif', flowsChart())).toEqual([SERVER_TITLE, SERVER_SUBTITLE]);
        expect(narrowTexts('artif_flux_by_cover', coverFlowsChart())).toEqual([SERVER_TITLE, `${SERVER_SUBTITLE}, pour les six couvertures les plus concernées`]);
    });

    it('ne dit pas de surface gagnée pour un territoire qui n’a qu’un millésime', () => {
        expect(subtitleOf('artif_share_by_millesime', shareChart(['2021']))).toBe(SERVER_SUBTITLE);
    });

    it.each(OCSGE_CHARTS)('dit dans le sous-titre de %s le territoire décrit, quand ce n’est pas l’ensemble des territoires affichés', (chart) => {
        const scoped = ocsgeView('Ille-et-Vilaine dans ses limites exactes');

        expect(subtitleOf(chart, {}, scoped)).toBe(`${subtitleOf(chart)}. Ille-et-Vilaine dans ses limites exactes.`);
    });

    it('n’annonce six couvertures que si le graphique en montre six', () => {
        expect(subtitleOf('artif_flux_by_cover', coverFlowsChart(4))).toBe(SERVER_SUBTITLE);
        expect(subtitleOf('artif_flux_by_cover', coverFlowsChart(6))).toBe(`${SERVER_SUBTITLE}, pour les six couvertures les plus concernées`);
    });

    const valueAxisOf = (chart: ComplementaryChart): Highcharts.YAxisOptions => narrowRule(chart).yAxis as Highcharts.YAxisOptions;
    const ticksOf = (chart: ComplementaryChart, min: number, max: number): number[] => valueAxisOf(chart).tickPositioner.call({ min, max } as Highcharts.Axis);

    it('gradue l’axe des parts en quatre, et laisse sans graduation les barres dont la valeur est écrite', () => {
        expect(ticksOf('artif_share_by_millesime', 0, 15.9)).toEqual([0, 6, 12, 18]);
        expect(narrowRule('artif_and_desartif').yAxis).toBeUndefined();
        expect(narrowRule('artif_by_cover').yAxis).toBeUndefined();
    });

    it('arrête l’axe des flux par couverture aux valeurs extrêmes, et n’y garde que les graduations rondes qui y tombent', () => {
        expect(valueAxisOf('artif_flux_by_cover')).toMatchObject({ startOnTick: false, endOnTick: false });
        // Ille-et-Vilaine, Normandie et France entière
        expect(ticksOf('artif_flux_by_cover', -100.48, 656.82)).toEqual([0, 250, 500]);
        expect(ticksOf('artif_flux_by_cover', -815, 4124)).toEqual([0, 1500, 3000]);
        expect(ticksOf('artif_flux_by_cover', -7427, 30821)).toEqual([0, 12000, 24000]);
        // Une couverture qui se désartificialise autant qu'elle s'artificialise
        expect(ticksOf('artif_flux_by_cover', -600, 600)).toEqual([-600, -300, 0, 300, 600]);
        expect(ticksOf('artif_flux_by_cover', undefined, undefined)).toBeUndefined();
    });

    it('garde à l’horizontale les libellés de cet axe, et leur laisse de la place à droite du graphique', () => {
        const [, right] = narrowRule('artif_flux_by_cover').chart.spacing;

        expect(valueAxisOf('artif_flux_by_cover').labels.rotation).toBe(0);
        expect(right).toBeGreaterThanOrEqual(16);
    });

    it('écrit les libellés des couvertures dans une marge de largeur fixe, où ils passent à la ligne', () => {
        const labels = (chart: ComplementaryChart) => (narrowRule(chart).xAxis as Highcharts.XAxisOptions).labels;

        expect(labels('artif_by_cover').style.width).toBe(112);
        expect(labels('artif_flux_by_cover').style.width).toBe(112);
    });
});

// Les graphiques dessinés par le vrai Highcharts, comme le fait la colonne : créés à sa largeur,
// agrandis (plein écran) puis rétrécis, et mis à jour d'une période à l'autre sans être recréés.
describe('présentation appliquée par Highcharts', () => {
    let container: HTMLDivElement;
    let chart: Highcharts.Chart;

    const drawAt = (width: number, options: Highcharts.Options, height = 300): void => {
        container = document.createElement('div');
        document.body.appendChild(container);
        chart = Highcharts.chart(container, { ...options, chart: { ...options.chart, width, height } });
    };

    // Ce que la présentation change, lu sur le graphique dessiné
    const drawn = () => ({
        title: chart.options.title.text,
        legend: chart.legend.allItems.map((item) => item.name),
        series: chart.series.map((serie) => serie.name),
        // Côté et titre de chaque axe des ordonnées, dans l'ordre du serveur
        sides: chart.yAxis.map((axis) => (axis.options.opposite ? 'droite' : 'gauche')),
        axisTitles: chart.yAxis.map((axis) => axis.options.title.text),
    });

    const writtenYears = (): string[] => chart.xAxis[0].tickPositions.map((position) => chart.xAxis[0].categories[position]);

    afterEach(() => {
        chart.destroy();
        container.remove();
    });

    describe('consommation et ménages', () => {
        const households = (categories?: string[]) => withChartLayout('conso_and_households_by_year', PERIOD)(householdsChart(categories));
        const SERIES = ['Consommation totale', 'Consommation habitat', 'Ménages'];
        const NARROW = { title: "Consommation d'ENAF et nombre de ménages, par année", legend: SERIES, series: SERIES, sides: ['droite', 'gauche'], axisTitles: [undefined, undefined] as string[] };

        // Place de chaque axe dans la zone de tracé, dans l'ordre du serveur : les ménages puis la
        // consommation, superposés. jsdom ne calcule aucune géométrie : seules les options sont lues.
        const panels = () => chart.yAxis.map(({ options }) => [(options as Highcharts.YAxisOptions).top, (options as Highcharts.YAxisOptions).height]);
        const TWO_PANELS = [
            ['0%', '100%'],
            ['0%', '100%'],
        ];

        it('donne au graphique de la colonne son titre court, ses trois lignes de légende, ses axes sans titre et sept années', () => {
            drawAt(272, households(), 340);

            expect(drawn()).toEqual(NARROW);
            expect(panels()).toEqual(TWO_PANELS);
            expect(writtenYears()).toEqual(['2011', '2013', '2015', '2017', '2019', '2021', '2023']);
        });

        it('rend au graphique agrandi les titres du serveur, toujours sur deux axes, puis reprend sa présentation étroite', () => {
            drawAt(272, households(), 340);
            chart.setSize(900, 500, false);

            expect(drawn()).toEqual({ ...NARROW, axisTitles: ['Nombre de ménages', "Consommation d'espaces (ha)"] });
            expect(chart.xAxis[0].options.tickPositions).toBeUndefined();
            expect(panels()).toEqual(TWO_PANELS);

            chart.setSize(272, 340, false);

            expect(drawn()).toEqual(NARROW);
        });

        it('passe à un seul axe pour une période sans recensement, puis revient aux deux axes, sans recréer le graphique', () => {
            drawAt(272, households(), 340);
            // Mise à jour telle que la fait le composant React de Highcharts : une entrée par série et par axe
            chart.update(households(years(2017, 2021)), true, true, false);

            expect(drawn()).toMatchObject({ series: ['Consommation totale', 'Consommation habitat'], sides: ['gauche'], axisTitles: [undefined] });
            expect(panels()).toEqual([['0%', '100%']]);
            expect(chart.series.map((serie) => chart.yAxis.indexOf(serie.yAxis))).toEqual([0, 0]);

            chart.update(households(), true, true, false);

            expect(drawn()).toEqual(NARROW);
            expect(panels()).toEqual(TWO_PANELS);
        });
    });

    describe('artificialisation (OCS GE)', () => {
        const RED = '#b2182b';
        const BLUE = '#2166ac';
        const NEUTRAL = '#3a3a3a';
        const layout = (id: ComplementaryChart, server: Highcharts.Options) => withChartLayout(id, OCSGE)({ ...server, ...SERVER_TEXTS });
        // Points de la première série : leur nom, leur valeur et leur couleur
        const points = () => chart.series[0].points.map((point) => [point.name, Math.round(point.y), point.color]);

        it('dessine la part artificialisée en deux barres rouges, sous un titre court, sans le trait du flux', () => {
            drawAt(272, layout('artif_share_by_millesime', shareChart()), 260);

            expect(drawn()).toMatchObject({ title: SERVER_TITLE, legend: [], series: ['Part artificialisée'], axisTitles: [undefined] });
            expect(chart.series[0].color).toBe(RED);
            expect(chart.inverted).toBeFalsy();
            expect(chart.xAxis[0].categories).toEqual(['2017', '2020']);
        });

        it('couche les trois flux en barres aux couleurs de la carte, sans légende ni graduation', () => {
            drawAt(272, layout('artif_and_desartif', flowsChart()), 300);

            expect(drawn()).toMatchObject({ title: SERVER_TITLE, legend: [], axisTitles: [undefined] });
            expect(chart.inverted).toBe(true);
            expect(points()).toEqual([
                ['Artificialisation', 1620, RED],
                ['Désartificialisation', -152, BLUE],
                ['Artificialisation nette', 1468, NEUTRAL],
            ]);
            expect(chart.yAxis[0].options.labels.enabled).toBe(false);
        });

        it('remplace le disque des couvertures par des barres triées, les cinq premières puis les autres, sans légende', () => {
            drawAt(272, layout('artif_by_cover', coversChart()));

            expect(drawn()).toMatchObject({ title: SERVER_TITLE, legend: [] });
            expect(chart.inverted).toBe(true);
            expect(chart.series).toHaveLength(1);
            expect(chart.series[0].type).toBe('bar');
            expect(points()).toEqual([
                ['Formations herbacées', 45, '#ccf24d'],
                ['Zones non bâties', 29, '#ff9191'],
                ['Zones bâties', 20, '#ff377a'],
                ['Zones à matériaux minéraux', 5, '#ff9'],
                ['Peuplement de feuillus', 1, '#80ff00'],
                ['Autres couvertures', 0, '#bdbdbd'],
            ]);
        });

        it('dessine les flux par couverture en deux séries empilées de part et d’autre du zéro, avec leur légende', () => {
            drawAt(272, layout('artif_flux_by_cover', coverFlowsChart()), 400);

            const FLOWS = ['Artificialisation', 'Désartificialisation'];
            expect(drawn()).toMatchObject({ title: SERVER_TITLE, legend: FLOWS, series: FLOWS, axisTitles: [undefined] });
            expect(chart.inverted).toBe(true);
            expect(chart.series.map((serie) => [serie.color, (serie.options as Highcharts.SeriesBarOptions).stacking])).toEqual([
                [RED, 'normal'],
                [BLUE, 'normal'],
            ]);
            expect(chart.xAxis[0].categories).toEqual(['Zones à matériaux minéraux', 'Formations herbacées', 'Zones bâties', 'Zones non bâties', "Surfaces d'eau", 'Peuplement mixte']);
        });

        it('rend au graphique agrandi le titre du serveur, toujours en barres aux couleurs de la carte, puis reprend sa présentation étroite', () => {
            drawAt(272, layout('artif_and_desartif', flowsChart()), 300);
            chart.setSize(900, 500, false);

            expect(drawn().title).toBe(SERVER_TITLE);
            expect(chart.inverted).toBe(true);
            expect(points().map(([, , color]) => color)).toEqual([RED, BLUE, NEUTRAL]);

            chart.setSize(272, 300, false);

            expect(drawn().title).toBe(SERVER_TITLE);
        });

        it('passe d’un territoire à l’autre sans recréer le graphique : moins de couvertures, puis de nouveau six', () => {
            drawAt(272, layout('artif_flux_by_cover', coverFlowsChart()), 400);
            // Mise à jour telle que la fait le composant React de Highcharts : une entrée par série et par axe
            chart.update(layout('artif_flux_by_cover', coverFlowsChart(3)), true, true, false);

            expect(chart.xAxis[0].categories).toEqual(['Zones à matériaux minéraux', 'Zones bâties', 'Zones non bâties']);
            expect(chart.series.map((serie) => serie.points.length)).toEqual([3, 3]);

            chart.update(layout('artif_flux_by_cover', coverFlowsChart()), true, true, false);

            expect(chart.series.map((serie) => [serie.name, serie.points.length])).toEqual([
                ['Artificialisation', 6],
                ['Désartificialisation', 6],
            ]);
        });
    });

    describe('consommation par an', () => {
        const annual = () => withChartLayout('conso_by_year', PERIOD)(annualChart());
        const LEGEND = ['Consommation totale', 'Moyenne de 2011 à 2020 : 500 ha', 'Moyenne de 2021 à 2024 : 320 ha'];

        it('affiche la légende des deux moyennes sous un titre court, à la hauteur de son emplacement', () => {
            drawAt(272, annual());

            expect(drawn()).toMatchObject({ title: "Consommation d'ENAF par année", legend: LEGEND, series: LEGEND });
            expect(chart.chartHeight).toBe(300);
        });

        it('garde les moyennes et leur légende quand le graphique est agrandi, sous le titre du serveur', () => {
            drawAt(272, annual());
            chart.setSize(900, 500, false);

            expect(drawn()).toMatchObject({ title: "Consommation d'ENAF par année", legend: LEGEND });
        });
    });
});

describe('hauteur d’un graphique étroit', () => {
    // Faux graphique Highcharts : ce que lit la règle, et la hauteur qu'elle demande
    const drawn = (chartWidth: number, chartHeightNow: number, plotHeight: number) => {
        const setSize = jest.fn();
        const { render } = withChartLayout('conso_and_population_by_year', PERIOD)({}).chart.events;
        render.call({ chartWidth, chartHeight: chartHeightNow, plotHeight, setSize } as unknown as Highcharts.Chart, undefined);
        return setSize;
    };

    it('grandit de ce que son titre prend au tracé, et pas plus', () => {
        // Emplacement de 300 px : un tracé de 170 px est prévu ; il n'en reste que 78 sous un titre de quatre lignes
        expect(heightKeepingPlot(300, 300, 78)).toBe(392);
        expect(drawn(284, 300, 78)).toHaveBeenCalledWith(undefined, 392, false);
        // Une fois agrandi, le tracé a sa hauteur : rien n'est redemandé
        expect(drawn(284, 392, 170)).not.toHaveBeenCalled();
    });

    it('revient à la hauteur de son emplacement quand le titre raccourcit, jamais en dessous', () => {
        expect(drawn(284, 392, 220)).toHaveBeenCalledWith(undefined, 342, false);
        expect(heightKeepingPlot(300, 392, 400)).toBe(300);
        expect(drawn(284, 300, 240)).not.toHaveBeenCalled();
    });

    it('laisse sa hauteur à un graphique large : image exportée, plein écran', () => {
        expect(drawn(1136, 400, 100)).not.toHaveBeenCalled();
    });
});
