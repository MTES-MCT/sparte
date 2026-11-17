import type * as Highcharts from 'highcharts';
import { DECREASE_PALETTE, INCREASE_PALETTE } from '../values';
import { asRankedShares, flowsAsBars, flowsByCover, focusedOn, inTwoPanels, shareByMillesime, surfaceChangeOf, withPeriodMeans } from './chartCompositions';

// Ce que les graphiques complémentaires dessinent des options du serveur. Les options d'essai
// reprennent la forme des réponses du serveur, réduites à ce que les compositions lisent.

// Gris des grandeurs qui ne sont pas une destination de la consommation
const NEUTRAL_COLOR = '#3a3a3a';

const years = (from: number, to: number): string[] => Array.from({ length: to - from + 1 }, (_, index) => String(from + index));

type Serie = { name: string; type?: string; color?: string; yAxis?: number; linkedTo?: string; marker?: object; data?: unknown[] };

const seriesOf = (options: Highcharts.Options): Serie[] => options.series as Serie[];
const axesOf = (options: Highcharts.Options): Highcharts.YAxisOptions[] => options.yAxis as Highcharts.YAxisOptions[];

describe('consommation et grandeur de l’Insee en deux panneaux', () => {
    // Recensements de 2011, 2016 et 2022 sur une période de 2011 à 2024
    const CENSUSES = [996439, null, null, null, null, 1051779, null, null, null, null, null, 1109850, null, null];

    // Graphique des ménages tel que le serveur le rend : la grandeur de l'Insee sur le premier axe,
    // la consommation sur le second, à droite, et la consommation pour l'habitat rattachée au total
    const serverChart = (insee: (number | null)[] = CENSUSES): Highcharts.Options =>
        ({
            title: { text: "Ménages et consommation d'espaces - Ille-et-Vilaine (2011 - 2024)" },
            xAxis: [{ categories: years(2011, 2024) }],
            yAxis: [
                { title: { text: 'Nombre de ménages', style: { color: '#6A6AF4' } }, labels: { style: { color: '#6A6AF4' } } },
                { title: { text: "Consommation d'espaces (ha)", style: { color: '#6A6AF4' } }, labels: { style: { color: '#6A6AF4' } }, opposite: true },
            ],
            series: [
                { name: 'Consommation totale', type: 'column', yAxis: 1, data: insee.map(() => 400), color: '#CFD1E5', id: 'main' },
                { name: 'Consommation habitat', type: 'column', yAxis: 1, data: insee.map(() => 300), color: '#6A6AF4', linkedTo: 'main' },
                { name: 'Ménages', type: 'spline', data: insee, color: '#6A6AF4', connectNulls: true },
            ],
        }) as Highcharts.Options;

    const percent = (value: unknown): number => Number(String(value).replace('%', ''));

    it('pose les deux axes à gauche, la consommation en haut et la grandeur de l’Insee en bas, sans qu’ils se recouvrent', () => {
        const [insee, conso] = axesOf(inTwoPanels(serverChart()));

        expect([insee.opposite, conso.opposite]).toEqual([false, false]);
        expect([insee.offset, conso.offset]).toEqual([0, 0]);
        expect(percent(conso.top)).toBe(0);
        expect(percent(conso.top) + percent(conso.height)).toBeLessThan(percent(insee.top));
        expect(percent(insee.top) + percent(insee.height)).toBe(100);
    });

    it('garde les titres d’axe du serveur, pour le graphique agrandi', () => {
        const [insee, conso] = axesOf(inTwoPanels(serverChart()));

        expect([insee.title.text, conso.title.text]).toEqual(['Nombre de ménages', "Consommation d'espaces (ha)"]);
    });

    it('passe la grandeur de l’Insee et son axe au gris neutre, et garde aux séries de la consommation leurs couleurs', () => {
        const options = inTwoPanels(serverChart());
        const [insee, conso] = axesOf(options);

        expect(seriesOf(options).map((serie) => [serie.name, serie.color])).toEqual([
            ['Consommation totale', '#CFD1E5'],
            ['Consommation habitat', '#6A6AF4'],
            ['Ménages', NEUTRAL_COLOR],
        ]);
        expect([insee.title.style.color, insee.labels.style.color]).toEqual([NEUTRAL_COLOR, NEUTRAL_COLOR]);
        expect(conso.labels.style.color).toBe('#6A6AF4');
    });

    it('donne sa ligne de légende à la série que le serveur rattache à une autre', () => {
        expect(seriesOf(inTwoPanels(serverChart())).map((serie) => serie.linkedTo)).toEqual([undefined, undefined, undefined]);
    });

    it.each([
        ['aucun recensement dans la période', [null, null, null, null, null]],
        ['un seul recensement dans la période', [null, 1051779, null, null, null]],
        ['aucune valeur rendue', []],
    ])('ne garde que la consommation, sur un seul axe à gauche, quand la grandeur de l’Insee n’a pas d’évolution à montrer : %s', (_case, insee) => {
        const options = inTwoPanels(serverChart(insee));

        // Toute la zone de tracé, dite en toutes lettres : l'axe d'un graphique mis à jour en place garderait sinon la place d'un panneau
        expect(axesOf(options).map((axis) => [axis.title.text, axis.opposite, axis.top, axis.height])).toEqual([["Consommation d'espaces (ha)", false, '0%', '100%']]);
        expect(seriesOf(options).map((serie) => [serie.name, serie.yAxis])).toEqual([
            ['Consommation totale', 0],
            ['Consommation habitat', 0],
        ]);
    });

    it('garde les deux panneaux dès que la période compte deux recensements, reliés par des repères ronds', () => {
        const options = inTwoPanels(serverChart([null, 1051779, null, null, null, null, null, 1109850]));

        expect(axesOf(options)).toHaveLength(2);
        expect(seriesOf(options)[2]).toMatchObject({ name: 'Ménages', marker: { symbol: 'circle' } });
    });

    it('rend telles quelles des options qui n’ont pas deux axes, et ne modifie jamais celles qu’elle reçoit', () => {
        const empty: Highcharts.Options = { series: [] };
        const server = serverChart();
        const before = JSON.stringify(server);
        inTwoPanels(server);

        expect(inTwoPanels(empty)).toBe(empty);
        expect(JSON.stringify(server)).toBe(before);
    });
});

describe('consommation par année d’une destination, devant le total', () => {
    const DESTINATIONS = ['Habitat', 'Activité', 'Mixte', 'Route', 'Ferré', 'Inconnu'];

    // Graphique par destination tel que le serveur le rend : les destinations prennent leur couleur
    // dans la palette, selon leur place ; seul le total a la sienne
    const serverChart = (): Highcharts.Options =>
        ({
            colors: ['#6a6af4', '#8ecac7', '#eeb088', '#cab8ee', '#6b8abc', '#86cdf2'],
            series: [
                ...DESTINATIONS.map((name) => ({ name, type: 'column', stacking: 'normal', data: [{ name: 2011, y: 1 }] })),
                { name: 'Total', id: 'main', type: 'column', color: '#CFD1E5', data: [{ name: 2011, y: 6 }] },
            ],
        }) as Highcharts.Options;

    it.each([
        ['Habitat', '#6a6af4'],
        ['Activité', '#8ecac7'],
        ['Inconnu', '#86cdf2'],
    ])('ne garde que la série « %s », de la couleur que la palette lui donne parmi toutes les destinations, puis le total', (name, color) => {
        expect(seriesOf(focusedOn(name)(serverChart())).map((serie) => [serie.name, serie.color])).toEqual([
            [name, color],
            ['Total', '#CFD1E5'],
        ]);
    });

    it('garde les autres options de la série : son type, son empilement, ses valeurs', () => {
        const server = serverChart();

        expect(seriesOf(focusedOn('Activité')(server))[0]).toEqual({ ...server.series[1], color: '#8ecac7' });
    });

    it('rend le graphique de toutes les destinations quand le serveur ne rend pas la série attendue', () => {
        const server = serverChart();

        expect(focusedOn('Commerce')(server)).toBe(server);
    });
});

describe('consommation par an et rythme moyen de deux périodes', () => {
    // Graphique de la consommation par an tel que le serveur le rend : une seule série, sans
    // légende, et une bande de fond libellée sur la décennie de référence
    const serverChart = (values: number[], firstYear = 2011): Highcharts.Options =>
        ({
            legend: { enabled: false },
            xAxis: {
                type: 'category',
                plotBands: [{ color: '#f5f5f5', from: -0.5, to: 9.5, label: { text: 'Période de référence de la loi Climat & Résilience' }, className: 'plotband_blue' }],
            },
            series: [{ name: 'Consommation totale', data: values.map((y, index) => ({ name: String(firstYear + index), y })) }],
        }) as Highcharts.Options;

    // Dix années à 500 ha, puis quatre à `after` ha
    const twoPeriods = (after: number): Highcharts.Options => serverChart([...Array(10).fill(500), ...Array(4).fill(after)]);
    const composed = (server: Highcharts.Options): Highcharts.Options => withPeriodMeans(2021)(server);
    const segments = (options: Highcharts.Options): Serie[] => seriesOf(options).slice(1);

    it('trace la moyenne de chaque période, de sa première à sa dernière barre, et la dit dans la légende', () => {
        const options = composed(twoPeriods(320));

        expect(segments(options).map((serie) => [serie.type, serie.name, serie.data])).toEqual([
            ['line', 'Moyenne de 2011 à 2020 : 500 ha', [[-0.45, 500], [9.45, 500]]],
            ['line', 'Moyenne de 2021 à 2024 : 320 ha', [[9.55, 320], [13.45, 320]]],
        ]);
        expect(options.legend.enabled).toBe(true);
    });

    it('calcule chaque moyenne sur les années de sa période', () => {
        const options = composed(serverChart([100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 10, 20, 30, 40]));

        expect(segments(options).map((serie) => serie.name)).toEqual(['Moyenne de 2011 à 2020 : 550 ha', 'Moyenne de 2021 à 2024 : 25 ha']);
    });

    it('écrit une décimale sous dix hectares par an', () => {
        expect(segments(composed(twoPeriods(4.26)))[1].name).toBe('Moyenne de 2021 à 2024 : 4,3 ha');
    });

    it.each([
        ['augmenté : la teinte des hausses de la carte', 620, INCREASE_PALETTE[2]],
        ['baissé : la teinte des baisses de la carte', 320, DECREASE_PALETTE[0]],
        ['pas changé : le gris neutre', 500, NEUTRAL_COLOR],
    ])('colore la moyenne de la seconde période selon que le rythme a %s, et la première en gris neutre', (_case, after, color) => {
        expect(segments(composed(twoPeriods(after))).map((serie) => serie.color)).toEqual([NEUTRAL_COLOR, color]);
    });

    it('donne aux barres la couleur du total, et garde la bande de fond sans son libellé', () => {
        const options = composed(twoPeriods(320));

        expect(seriesOf(options)[0]).toMatchObject({ name: 'Consommation totale', color: '#CFD1E5' });
        expect((options.xAxis as Highcharts.XAxisOptions).plotBands).toEqual([{ color: '#f5f5f5', from: -0.5, to: 9.5, className: 'plotband_blue' }]);
        expect((options.xAxis as Highcharts.XAxisOptions).type).toBe('category');
    });

    it.each([
        ['aucune année depuis 2021', serverChart(Array(10).fill(500)), ['Moyenne de 2011 à 2020 : 500 ha']],
        ['aucune année avant 2021', serverChart([300, 340], 2021), ['Moyenne de 2021 à 2022 : 320 ha']],
        ['aucune valeur', serverChart([]), []],
    ])('ne trace pas la moyenne d’une période sans année connue : %s', (_case, server, expected) => {
        expect(segments(composed(server)).map((serie) => serie.name)).toEqual(expected);
    });

    it('ignore une année sans valeur', () => {
        const server = serverChart([500, 500]);
        (server.series[0] as Serie).data.push({ name: '2013', y: null });

        expect(segments(composed(server))[0]).toMatchObject({ name: 'Moyenne de 2011 à 2012 : 500 ha', data: [[-0.45, 500], [1.45, 500]] });
    });

    it('rend telles quelles des options sans série, et ne modifie jamais celles qu’elle reçoit', () => {
        const empty: Highcharts.Options = { series: [] };
        const server = twoPeriods(320);
        const before = JSON.stringify(server);
        composed(server);

        expect(composed(empty)).toBe(empty);
        expect(JSON.stringify(server)).toBe(before);
    });
});

// --- Artificialisation (OCS GE) -----------------------------------------------------------

// Couleurs des cartes d'artificialisation : rouge pour ce qui s'artificialise, bleu pour la désartificialisation
const ARTIF_RED = '#b2182b';
const DESARTIF_BLUE = '#2166ac';

const xAxisOf = (options: Highcharts.Options): Highcharts.XAxisOptions => options.xAxis as Highcharts.XAxisOptions;
const yAxisOf = (options: Highcharts.Options): Highcharts.YAxisOptions => options.yAxis as Highcharts.YAxisOptions;
// Texte dont les espaces des nombres (insécables, fines) sont ramenées à l'espace ordinaire
const plain = (text: string): string => text.replace(/[\u00a0\u202f]/g, ' ');
// Ligne d'infobulle d'un point, telle que le graphique l'écrit
const tooltipOf = (options: Highcharts.Options, point: object): string => plain(options.tooltip.pointFormatter.call(point as Highcharts.Point));

describe('part artificialisée aux millésimes du territoire', () => {
    // Graphique du serveur pour l'Ille-et-Vilaine : les barres, le trait du flux entre elles et son étiquette
    const serverChart = (categories = ['2017', '2020']): Highcharts.Options =>
        ({
            chart: { type: 'column' },
            title: { text: 'Evolution du stock de surfaces artificialisées de Ille-et-Vilaine entre 2017 et 2020' },
            xAxis: { categories, lineColor: '#E5E7EB' },
            yAxis: { title: { text: 'Part artificialisée (%)' }, labels: { format: '{value}%' } },
            tooltip: { useHTML: true, pointFormat: '<b>{point.y:.2f}%</b>' },
            plotOptions: { column: { borderRadius: 3, dataLabels: { enabled: true, format: '{point.y:.2f}%<br/>({point.surface:,.0f} ha)', style: { fontSize: '10px' } } } },
            series: [
                { name: 'Part artificialisée', type: 'column', color: '#818CF8', data: [{ y: 12.484, surface: 85282.18 }, { y: 12.698, surface: 86746.95 }] },
                { name: 'Flux', type: 'line', color: '#F97316', data: [{ x: 0, y: 12.484 }, { x: 1, y: 12.698 }] },
                { name: 'Flux label 1', type: 'scatter', data: [{ x: 0.5, y: 12.59, name: '+1,464.8 ha' }] },
            ],
        }) as Highcharts.Options;

    const dataLabels = (options: Highcharts.Options): Highcharts.DataLabelsOptions => options.plotOptions.column.dataLabels as Highcharts.DataLabelsOptions;
    const labelOf = (options: Highcharts.Options, point: object): string =>
        plain(String(dataLabels(options).formatter.call({ point: { options: point } } as Highcharts.PointLabelObject, dataLabels(options))));

    it('ne garde que les barres, au rouge de la carte : le trait et l’étiquette du flux sont retirés', () => {
        const series = seriesOf(shareByMillesime(serverChart()));

        expect(series.map(({ name, type, color }) => [name, type, color])).toEqual([['Part artificialisée', 'column', ARTIF_RED]]);
        expect(series[0].data).toEqual([{ y: 12.484, surface: 85282.18 }, { y: 12.698, surface: 86746.95 }]);
    });

    it('écrit sur chaque barre sa part et sa surface, comme les autres nombres de la page, à la place du format du serveur', () => {
        const options = shareByMillesime(serverChart());

        expect(dataLabels(options).format).toBeUndefined();
        expect(dataLabels(options)).toMatchObject({ enabled: true, style: { fontSize: '10px' } });
        expect(labelOf(options, { y: 12.484, surface: 85282.18 })).toBe('12,48 %<br/>85 282 ha');
        expect(labelOf(options, { y: 7.94 })).toBe('7,94 %');
    });

    it('laisse au-dessus des barres la place de leur étiquette', () => {
        expect(yAxisOf(shareByMillesime(serverChart())).maxPadding).toBeGreaterThanOrEqual(0.25);
        expect(yAxisOf(shareByMillesime(serverChart())).title.text).toBe('Part artificialisée (%)');
    });

    it('garde sous chaque barre l’étiquette que le serveur donne à son millésime : son index, puis ses années', () => {
        const server = serverChart(['Millésime n°1<br/>(2017 à 2020)', 'Millésime n°2<br/>(2020 à 2023)']);

        expect(shareByMillesime(server).xAxis).toBe(server.xAxis);
    });

    it('dit dans l’infobulle la part et la surface', () => {
        const options = shareByMillesime(serverChart());

        expect(tooltipOf(options, { options: { y: 12.698, surface: 86746.95 } })).toBe('Part du territoire : <b>12,70 %</b><br/>Surface : <b>86 747 ha</b>');
    });

    // Barres réduites à leurs points
    const barsOf = (...data: object[]): Highcharts.Options => ({ series: [{ type: 'column', data }] }) as Highcharts.Options;

    it('mesure la surface gagnée du premier au dernier millésime, ou rendue', () => {
        expect(surfaceChangeOf(shareByMillesime(serverChart()))).toBeCloseTo(1464.77, 2);
        expect(surfaceChangeOf(barsOf({ y: 2, surface: 500 }, { y: 1.9, surface: 480 }))).toBe(-20);
    });

    it('ne mesure rien avec un seul millésime, ni sans surface', () => {
        expect(surfaceChangeOf(barsOf({ y: 2, surface: 500 }))).toBeNull();
        expect(surfaceChangeOf(barsOf({ y: 2 }, { y: 3 }))).toBeNull();
        expect(surfaceChangeOf({})).toBeNull();
    });

    it('rend le graphique tel quel sans série, sans modifier les options reçues', () => {
        const empty: Highcharts.Options = { series: [] };
        const server = serverChart();
        const before = JSON.stringify(server);
        shareByMillesime(server);

        expect(shareByMillesime(empty)).toBe(empty);
        expect(JSON.stringify(server)).toBe(before);
    });
});

describe('artificialisation, désartificialisation et leur différence', () => {
    // Graphique du serveur pour l'Ille-et-Vilaine : trois colonnes en rouge, vert et indigo
    const FLOWS = [
        { name: 'Artificialisation', y: 1620.13, color: '#FA4B42' },
        { name: 'Désartificialisation', y: -151.94, color: '#00E272' },
        { name: 'Artificialisation nette', y: 1468.19, color: '#6A6AF4' },
    ];
    const serverChart = (data: object[] = FLOWS): Highcharts.Options =>
        ({
            chart: { type: 'column' },
            title: { text: 'Artificialisation nette entre 2017 et 2020' },
            legend: { enabled: false },
            xAxis: { type: 'category' },
            yAxis: { title: { text: 'Surface (en ha)' } },
            tooltip: { pointFormat: '{point.y}', valueSuffix: ' Ha', headerFormat: '<b>{point.key}</b><br/>' },
            plotOptions: { column: { dataLabels: { enabled: true, format: '{point.y:,.1f}' } } },
            series: [{ data }],
            lang: { noData: "Aucun changement du sol n'est à l'origine d'artificialisation sur cette période." },
        }) as Highcharts.Options;

    type FlowPoint = { name: string; y: number; color: string };
    const pointsOf = (options: Highcharts.Options): FlowPoint[] => seriesOf(options)[0].data as FlowPoint[];
    const axisLabel = (options: Highcharts.Options, pos: number, value = ''): string =>
        plain(String(xAxisOf(options).labels.formatter.call({ pos, value } as Highcharts.AxisLabelsFormatterContextObject, undefined)));

    it('couche les barres, pour que le nom de chaque flux tienne à leur gauche', () => {
        const options = flowsAsBars(serverChart());

        expect(options.chart.type).toBe('bar');
        expect(seriesOf(options).map(({ type }) => type)).toEqual(['bar']);
    });

    it('donne aux trois flux les couleurs de la carte : rouge, bleu, et gris neutre pour leur différence', () => {
        expect(pointsOf(flowsAsBars(serverChart())).map(({ name, y, color }) => [name, y, color])).toEqual([
            ['Artificialisation', 1620.13, ARTIF_RED],
            ['Désartificialisation', -151.94, DESARTIF_BLUE],
            ['Artificialisation nette', 1468.19, NEUTRAL_COLOR],
        ]);
    });

    it('garde sa couleur à un flux que la carte ne connaît pas', () => {
        const other = { name: 'Renaturation', y: 3, color: '#123456' };

        expect(pointsOf(flowsAsBars(serverChart([...FLOWS, other])))[3]).toEqual(other);
    });

    it('écrit la valeur de chaque flux sous son nom, avec son signe, sans décimale à partir de 10 ha', () => {
        const options = flowsAsBars(serverChart());

        expect([0, 1, 2].map((pos) => axisLabel(options, pos))).toEqual([
            'Artificialisation<br/><b>+1 620 ha</b>',
            'Désartificialisation<br/><b>−152 ha</b>',
            'Artificialisation nette<br/><b>+1 468 ha</b>',
        ]);
        expect(axisLabel(flowsAsBars(serverChart([{ name: 'Artificialisation', y: 3.71 }, { name: 'Désartificialisation', y: -2.27 }])), 1)).toBe('Désartificialisation<br/><b>−2,3 ha</b>');
        expect(axisLabel(options, 7, 'hors des flux')).toBe('hors des flux');
    });

    it('réduit l’axe des valeurs au trait du zéro, et retire les étiquettes au bout des barres', () => {
        const options = flowsAsBars(serverChart());

        expect(yAxisOf(options)).toMatchObject({ labels: { enabled: false }, gridLineWidth: 0, plotLines: [{ value: 0, width: 1 }] });
        expect(yAxisOf(options).title.text).toBeUndefined();
        expect(options.plotOptions.bar.dataLabels).toEqual({ enabled: false });
    });

    it('écrit le flux de l’infobulle comme les autres nombres de la page', () => {
        const options = flowsAsBars(serverChart());

        expect(tooltipOf(options, { color: DESARTIF_BLUE, y: -151.94, series: { name: '' } })).toBe(`<span style="color:${DESARTIF_BLUE}">●</span> <b>−152 ha</b><br/>`);
        expect(options.tooltip.headerFormat).toBe('<b>{point.key}</b><br/>');
    });

    it('laisse au serveur le graphique sans flux, qui le dit', () => {
        const empty = serverChart([]);

        expect(flowsAsBars(empty)).toBe(empty);
    });
});

describe('surfaces artificialisées par type de couverture', () => {
    const cover = (name: string, y: number, color: string, long_name = name) => ({ name, y, color, code: 'CS', long_name, surface: y });
    // Répartition du serveur pour l'Ille-et-Vilaine, dans l'ordre de la nomenclature
    const COVERS = [
        cover('Zones bâties', 17608.19, '#ff377a'),
        cover('Zones non bâties', 24916.84, '#ff9191', 'Zones non bâties (Routes; places; parking…)'),
        cover('Zones à matériaux minéraux', 4301.36, '#ff9'),
        cover('Zones à autres matériaux compo...', 5.98, '#a64d00', 'Zones à autres matériaux composites'),
        cover("Surfaces d'eau", 37.67, '#00ccf2', "Surfaces d'eau (Eau continentale et maritime)"),
        cover('Peuplement de feuillus', 905.92, '#80ff00'),
        cover('Peuplement de conifères', 7.06, '#00a600'),
        cover('Formations herbacées', 38960.15, '#ccf24d', 'Formations herbacées (Pelouses et prairies; terres arables; roselières; …)'),
        cover('Sols nus', 0, '#ccc'),
    ];
    const serverChart = (data: object[] = COVERS): Highcharts.Options =>
        ({
            chart: { type: 'pie' },
            title: { text: 'Surfaces artificialisées par couverture  en 2020' },
            legend: { layout: 'vertical', align: 'right', itemWidth: 200 },
            tooltip: { valueSuffix: ' Ha', pointFormat: '{point.code} - {point.long_name} - {point.percentage:.1f}% ({point.surface:,.1f} ha)', headerFormat: '<b>{point.key}</b><br/>' },
            plotOptions: { pie: { innerSize: '60%' } },
            series: [{ name: 'Surface artificielle', data }],
        }) as Highcharts.Options;

    type Bar = { name: string; y: number; surface: number; color: string };
    const barsOf = (options: Highcharts.Options): Bar[] => seriesOf(options)[0].data as Bar[];
    const TOTAL = COVERS.reduce((sum, { y }) => sum + y, 0);

    it('range les couvertures de la plus étendue à la moins étendue, en barres horizontales', () => {
        const options = asRankedShares(5)(serverChart());

        expect(options.chart.type).toBe('bar');
        expect(seriesOf(options)).toHaveLength(1);
        expect(seriesOf(options)[0]).toMatchObject({ type: 'bar', name: 'Surface artificielle' });
        expect(barsOf(options).map(({ name }) => name)).toEqual(['Formations herbacées', 'Zones non bâties', 'Zones bâties', 'Zones à matériaux minéraux', 'Peuplement de feuillus', 'Autres couvertures']);
    });

    it('donne à chaque barre sa part des surfaces, sa surface et sa couleur dans la nomenclature de l’OCS GE', () => {
        const [first] = barsOf(asRankedShares(5)(serverChart()));

        expect(first.y).toBeCloseTo((38960.15 / TOTAL) * 100, 6);
        expect(first).toMatchObject({ surface: 38960.15, color: '#ccf24d' });
    });

    it('réunit les couvertures suivantes en une barre grise, sans en perdre : les parts font cent', () => {
        const bars = barsOf(asRankedShares(5)(serverChart()));
        const others = bars[bars.length - 1];

        expect(others).toMatchObject({ name: 'Autres couvertures', color: '#bdbdbd' });
        expect(others.surface).toBeCloseTo(5.98 + 37.67 + 7.06, 6);
        expect(bars.reduce((sum, bar) => sum + bar.y, 0)).toBeCloseTo(100, 6);
    });

    it('n’ajoute pas la barre des autres quand toutes les couvertures tiennent, et ne montre pas une couverture sans surface', () => {
        expect(barsOf(asRankedShares(8)(serverChart())).map(({ name }) => name)).toEqual([
            'Formations herbacées',
            'Zones non bâties',
            'Zones bâties',
            'Zones à matériaux minéraux',
            'Peuplement de feuillus',
            "Surfaces d'eau",
            'Peuplement de conifères',
            'Zones à autres matériaux composites',
        ]);
    });

    it('nomme une couverture par son nom complet, sans les exemples entre parenthèses, plutôt que par son nom abrégé', () => {
        const names = barsOf(asRankedShares(8)(serverChart())).map(({ name }) => name);

        expect(names).toContain('Zones à autres matériaux composites');
        expect(names).toContain("Surfaces d'eau");
        expect(barsOf(asRankedShares(1)(serverChart([{ name: 'Sans nom complet', y: 1 }])))[0].name).toBe('Sans nom complet');
    });

    it('écrit la part au bout de chaque barre, avec une décimale sous 10 %, et lui laisse de la place', () => {
        const options = asRankedShares(5)(serverChart());
        const { dataLabels } = options.plotOptions.bar as { dataLabels: Highcharts.DataLabelsOptions };
        const label = (y: number) => dataLabels.formatter.call({ y } as Highcharts.PointLabelObject, dataLabels);

        expect(dataLabels.enabled).toBe(true);
        expect([44.91, 4.96, 0.06].map(label)).toEqual(['45 %', '5,0 %', '0,1 %']);
        expect(yAxisOf(options)).toMatchObject({ min: 0, endOnTick: false, labels: { enabled: false }, gridLineWidth: 0 });
        expect(yAxisOf(options).maxPadding).toBeGreaterThanOrEqual(0.25);
    });

    it('masque la légende, que les libellés des barres remplacent, et dit dans l’infobulle la part et la surface', () => {
        const options = asRankedShares(5)(serverChart());

        expect(options.legend).toMatchObject({ enabled: false });
        expect(options.tooltip.pointFormat).toBeUndefined();
        expect(options.tooltip.headerFormat).toBe('<b>{point.key}</b><br/>');
        expect(tooltipOf(options, { options: { y: 44.91, surface: 38960.15 } })).toBe('45 % des surfaces artificialisées, soit 38 960 ha');
    });

    it('laisse au serveur le graphique sans surface, sans modifier les options reçues', () => {
        const empty = serverChart([]);
        const server = serverChart();
        const before = JSON.stringify(server);
        asRankedShares(5)(server);

        expect(asRankedShares(5)(empty)).toBe(empty);
        expect(asRankedShares(5)({})).toEqual({});
        expect(JSON.stringify(server)).toBe(before);
    });
});

describe('artificialisation et désartificialisation par type de couverture', () => {
    const category = (name: string, code: string, color: string): string => `${name} (${code}) <span style='color:${color}'></span>`;
    // Flux du serveur pour l'Ille-et-Vilaine, dans l'ordre de la nomenclature
    const CATEGORIES = [
        category('Zones bâties', 'CS1.1.1.1', '#ff377a'),
        category('Zones non bâties', 'CS1.1.1.2', '#ff9191'),
        category('Zones à matériaux minéraux', 'CS1.1.2.1', '#ff9'),
        category("Surfaces d'eau", 'CS1.2.2', '#00ccf2'),
        category('Peuplement de feuillus', 'CS2.1.1.1', '#80ff00'),
        category('Peuplement mixte', 'CS2.1.1.3', '#80be00'),
        category('Formations arbustives et sous-...', 'CS2.1.2', '#a6ff80'),
        category('Formations herbacées', 'CS2.2.1', '#ccf24d'),
    ];
    const INCREASES = [254.3, 244.07, 656.82, 0.64, 15.75, 0, 0.22, 448.14];
    const DECREASES = [-18.99, -3.39, -100.48, -0.13, -1.22, -0, -0, -27.61];
    const serverChart = (increases = INCREASES, decreases = DECREASES): Highcharts.Options =>
        ({
            chart: { type: 'column' },
            title: { text: 'Artificialisation par couverture entre 2017 et 2020' },
            legend: { align: 'center', verticalAlign: 'top' },
            xAxis: { minPadding: 0.2, maxPadding: 0.2, categories: CATEGORIES },
            yAxis: { title: { text: 'Surface (en ha)' }, plotLines: [{ value: 0, color: 'black', width: 2 }] },
            tooltip: { pointFormat: '{point.y}', valueSuffix: ' Ha' },
            plotOptions: { column: { dataLabels: { enabled: true, format: '{point.y:,.2f}', allowOverlap: true } } },
            series: [
                { name: 'Artificialisation', data: increases, color: '#FA4B42' },
                { name: 'Désartificialisation', data: decreases, color: '#00E272' },
                { name: 'Artificialisation nette', data: increases.map((value, index) => value + decreases[index]), color: '#6A6AF4' },
            ],
        }) as Highcharts.Options;

    it('range les couvertures de celle dont le sol a le plus changé à celle dont il a le moins changé, sans leur code ni balise', () => {
        const options = flowsByCover(6)(serverChart());

        expect(options.chart.type).toBe('bar');
        expect(xAxisOf(options)).toEqual({ categories: ['Zones à matériaux minéraux', 'Formations herbacées', 'Zones bâties', 'Zones non bâties', 'Peuplement de feuillus'] });
    });

    it('ne garde que les deux flux, aux couleurs de la carte, de part et d’autre du zéro', () => {
        const options = flowsByCover(6)(serverChart());

        expect(seriesOf(options).map(({ name, type, color, data }) => [name, type, color, data])).toEqual([
            ['Artificialisation', 'bar', ARTIF_RED, [656.82, 448.14, 254.3, 244.07, 15.75]],
            ['Désartificialisation', 'bar', DESARTIF_BLUE, [-100.48, -27.61, -18.99, -3.39, -1.22]],
        ]);
        expect(options.plotOptions.bar).toEqual({ stacking: 'normal', borderWidth: 0, dataLabels: { enabled: false } });
        expect(yAxisOf(options).plotLines).toMatchObject([{ value: 0, width: 1 }]);
        expect(yAxisOf(options).title.text).toBe('Surface (en ha)');
    });

    it('s’arrête au nombre de couvertures demandé', () => {
        expect(xAxisOf(flowsByCover(3)(serverChart())).categories).toEqual(['Zones à matériaux minéraux', 'Formations herbacées', 'Zones bâties']);
    });

    it('écarte les couvertures dont la barre ne se verrait pas : moins d’un centième du plus grand flux', () => {
        // Surfaces d'eau (0,77 ha) et formations arbustives (0,22 ha), devant 757 ha de matériaux minéraux
        const shown = xAxisOf(flowsByCover(8)(serverChart())).categories;

        expect(shown).toHaveLength(5);
        expect(shown).not.toContain("Surfaces d'eau");
        expect(shown).not.toContain('Formations arbustives et sous-...');
    });

    it('classe une couverture d’après ses deux flux, même si elle se désartificialise surtout', () => {
        const increases = INCREASES.map((value, index) => (index === 4 ? 5 : value));
        const decreases = DECREASES.map((value, index) => (index === 4 ? -900 : value));

        expect(xAxisOf(flowsByCover(6)(serverChart(increases, decreases))).categories[0]).toBe('Peuplement de feuillus');
    });

    it('écrit le flux de l’infobulle avec le nom de sa série', () => {
        const options = flowsByCover(6)(serverChart());

        expect(tooltipOf(options, { color: ARTIF_RED, y: 254.3, series: { name: 'Artificialisation' } })).toBe(`<span style="color:${ARTIF_RED}">●</span> Artificialisation : <b>+254 ha</b><br/>`);
    });

    it('laisse au serveur le graphique sans flux, ou sans les deux séries attendues', () => {
        const flat = serverChart(INCREASES.map(() => 0), DECREASES.map(() => -0));
        const renamed = { ...serverChart(), series: [{ type: 'column', name: 'Autre', data: [1] }] } as Highcharts.Options;

        expect(flowsByCover(6)(flat)).toBe(flat);
        expect(flowsByCover(6)(renamed)).toBe(renamed);
    });

    it('ne modifie pas les options reçues', () => {
        const server = serverChart();
        const before = JSON.stringify(server);
        flowsByCover(6)(server);

        expect(JSON.stringify(server)).toBe(before);
    });
});
