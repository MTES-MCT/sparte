import Highcharts from 'highcharts';
import { scatterModel, scatterPoints } from '../__fixtures__/scatterFixtures';
import { SCATTER_HEIGHT, registerTickHelper, scatterOptions, scatterTable } from './scatterOptions';

// Options Highcharts du nuage de points d'une carte bivariée

// Les nombres sont formatés avec des espaces insécables, étroites pour les milliers
const plain = (text: string): string => text.replace(/[  ]/g, ' ');

const MODEL = scatterModel(scatterPoints(12));
const LIVE = { pointEvents: { mouseOver: jest.fn(), mouseOut: jest.fn() } };

type Axis = Highcharts.XAxisOptions;
const xAxis = (options: Highcharts.Options): Axis => options.xAxis as Axis;
const yAxis = (options: Highcharts.Options): Axis => options.yAxis as Axis;
const marker = (options: Highcharts.Options): Highcharts.PointMarkerOptionsObject => options.plotOptions.scatter.marker;

describe('axes', () => {
    it('s’étendent un peu au-delà des points, pour qu’un point ramené au bord reste entier', () => {
        const options = scatterOptions(MODEL);

        expect([xAxis(options).min, xAxis(options).max]).toEqual([-0.1, 2.1]);
        expect(yAxis(options).min).toBeCloseTo(-0.01);
        expect(yAxis(options).max).toBeCloseTo(0.21);
        expect(xAxis(options)).toMatchObject({ startOnTick: false, endOnTick: false });
    });

    it('portent des graduations rondes, toutes dans leur étendue', () => {
        const options = scatterOptions(MODEL);

        expect(xAxis(options).tickPositions).toEqual([0, 0.6, 1.2, 1.8]);
        expect(yAxis(options).tickPositions).toEqual([0, 0.06, 0.12, 0.18]);
    });

    it('tracent les deux seuils de la carte en tirets fins', () => {
        const options = scatterOptions(MODEL);

        expect(xAxis(options).plotLines).toEqual([0.5, 1].map((value) => ({ value, color: '#6b6b6b', width: 1, dashStyle: 'ShortDash', zIndex: 1 })));
        expect(yAxis(options).plotLines.map((line) => line.value)).toEqual([0.02, 0.03]);
    });

    it('n’ont ni titre ni quadrillage : le sous-titre les nomme, les seuils sont les seuls repères', () => {
        const options = scatterOptions(MODEL);

        expect([xAxis(options), yAxis(options)].map((axis) => [axis.title.text, axis.gridLineWidth])).toEqual([
            [null, 0],
            [null, 0],
        ]);
    });

    it('gardent une étendue quand tous les points ont le même taux', () => {
        const model = scatterModel(scatterPoints(12), { x: { ...MODEL.x, min: 0.4, max: 0.4 }, y: { ...MODEL.y, min: 0, max: 0 } });
        const options = scatterOptions(model);

        expect(xAxis(options).min).toBeLessThan(0.4);
        expect(xAxis(options).max).toBeGreaterThan(0.4);
        expect(yAxis(options).min).toBeLessThan(0);
        expect(yAxis(options).max).toBeGreaterThan(0);
    });
});

describe('points', () => {
    it('donne à Highcharts un point par territoire, désigné par son identifiant, avec sa couleur et son texte de la carte', () => {
        const [series] = scatterOptions(MODEL).series as Highcharts.SeriesScatterOptions[];

        expect(series.data).toHaveLength(12);
        expect(series.data[3]).toEqual({
            id: 'T3',
            name: 'Territoire 3',
            x: 0.3,
            y: 0.03,
            color: '#be917e',
            valueText: 'taux du territoire 3',
            spokenText: 'taux du territoire 3',
        });
    });

    it('dit aux lecteurs d’écran les deux taux d’un point à la suite, sans le saut de ligne de l’infobulle', () => {
        const [point] = scatterPoints(1);
        const options = scatterOptions(scatterModel([{ ...point, valueText: 'Consommation : 0,032 % par an<br/>Évolution : 1,56 % par an' }]));
        const [series] = options.series as Highcharts.SeriesScatterOptions[];

        expect(series.data[0]).toMatchObject({ spokenText: 'Consommation : 0,032 % par an, Évolution : 1,56 % par an' });
        expect(options.accessibility.point.valueDescriptionFormat).toBe('{point.name} : {point.spokenText}');
    });

    it.each([
        [12, 3.5],
        [150, 3.5],
        [151, 2.75],
        [1500, 2.75],
        [1501, 2],
    ])('dessine %i points avec un rayon de %f px : il diminue quand leur nombre augmente', (count, radius) => {
        expect(marker(scatterOptions(scatterModel(scatterPoints(count)))).radius).toBe(radius);
    });

    it('cerne les points que Highcharts dessine du même liseré blanc que ceux du calque', () => {
        expect(marker(scatterOptions(MODEL))).toMatchObject({ lineColor: '#ffffff', lineWidth: 0.5 });
        expect(marker(scatterOptions(scatterModel(scatterPoints(1501)))).lineWidth).toBe(0.29);
    });

    it('n’anime rien : le nuage est remplacé d’un bloc', () => {
        const options = scatterOptions(MODEL, LIVE);

        expect(options.chart.animation).toBe(false);
        expect(options.plotOptions.scatter.animation).toBe(false);
    });

    it('accepte plus de mille points en objets', () => {
        expect(scatterOptions(MODEL).plotOptions.scatter.turboThreshold).toBe(0);
    });

    it('met en avant le point le plus proche du pointeur, cerclé de sombre', () => {
        const options = scatterOptions(MODEL, LIVE);

        expect(options.plotOptions.scatter.stickyTracking).toBe(true);
        expect(marker(options).states.hover).toEqual({ radiusPlus: 3, lineWidthPlus: 1.5, lineColor: '#161616' });
    });
});

describe('textes', () => {
    it('reprend le titre, le sous-titre et la description du modèle', () => {
        const options = scatterOptions(MODEL);

        expect(options.title.text).toBe('Un point par département');
        expect(options.title.align).toBe('left');
        expect(options.subtitle.text).toBe("↑ Consommation annuelle pour l'habitat<br/>→ Évolution du nombre de ménages");
        expect(options.accessibility.description).toBe('Nuage de points des départements.');
    });

    it('dit dans l’infobulle ce que la carte dit du territoire', () => {
        expect(scatterOptions(MODEL).tooltip).toMatchObject({ headerFormat: '', pointFormat: '<b>{point.name}</b><br/>{point.valueText}', outside: true });
    });

    it('n’a ni légende ni crédit : les couleurs sont celles de la carte, la source est sous le graphique', () => {
        const options = scatterOptions(MODEL);

        expect(options.legend.enabled).toBe(false);
        expect(options.credits.enabled).toBe(false);
    });

    it('nomme le fichier de l’image, exportée sans serveur à la taille d’un graphique de diagnostic, avec ses sources', () => {
        expect(scatterOptions(MODEL).exporting).toEqual({
            enabled: false,
            fallbackToExportServer: false,
            filename: 'nuage-france-depart-bivariate_habitat_menages',
            sourceWidth: 640,
            sourceHeight: 480,
            chartOptions: {
                chart: { spacingBottom: 28 },
                credits: { enabled: true, text: 'Mon Diagnostic Artificialisation · données Cerema (fichiers fonciers) et Insee (recensements)' },
            },
        });
    });

    it('réserve à l’emplacement de quoi lire le tracé sous le sous-titre', () => {
        expect(SCATTER_HEIGHT).toBe(360);
    });
});

describe('graphique de la colonne et fenêtre de détails', () => {
    it('ne contient aucune fonction pour la fenêtre de détails, qui recopie les options en JSON', () => {
        const options = scatterOptions(MODEL);

        expect(JSON.parse(JSON.stringify(options))).toEqual(options);
    });

    it('laisse Highcharts dessiner un élément par point dans la fenêtre de détails', () => {
        expect(marker(scatterOptions(MODEL)).enabled).toBe(true);
        expect(scatterOptions(MODEL).chart.events).toBeUndefined();
    });

    it('dessine lui-même les points du graphique de la colonne, à chaque rendu', () => {
        const options = scatterOptions(MODEL, LIVE);

        expect(marker(options).enabled).toBe(false);
        expect(typeof options.chart.events.render).toBe('function');
    });

    it('signale à la carte le point survolé dans le graphique de la colonne seulement', () => {
        expect(scatterOptions(MODEL, LIVE).plotOptions.scatter.point.events).toBe(LIVE.pointEvents);
        expect(scatterOptions(MODEL).plotOptions.scatter.point).toBeUndefined();
    });
});

describe('libellés des graduations', () => {
    it('inscrit une aide de gabarit qui écrit les nombres à la française, avec les décimales du pas', () => {
        const helpers: Record<string, (value: number, step: number) => string> = {};
        registerTickHelper({ Templating: { helpers } } as unknown as typeof Highcharts);

        expect(helpers.nationalMapTick(0.05, 0.025)).toBe('0,050');
        expect(helpers.nationalMapTick(1.5, 0.5)).toBe('1,5');
        expect(helpers.nationalMapTick(-1, 1)).toBe('-1');
        expect(helpers.nationalMapTick(0, 0.5)).toBe('0');
    });

    it('fait écrire ses graduations au vrai Highcharts, sans fonction dans les options', () => {
        registerTickHelper(Highcharts);
        const container = document.createElement('div');
        document.body.appendChild(container);
        const options = JSON.parse(JSON.stringify(scatterOptions(MODEL)));
        const chart = Highcharts.chart(container, { ...options, chart: { ...options.chart, width: 272, height: 360 }, accessibility: { enabled: false } });
        // Libellés des graduations d'un axe, dans l'ordre
        const labels = (axis: Highcharts.Axis): string[] =>
            axis.tickPositions.map((position) => (axis.ticks[position].label as unknown as { textStr: string }).textStr);

        expect(labels(chart.xAxis[0])).toEqual(['0', '0,6', '1,2', '1,8']);
        expect(labels(chart.yAxis[0])).toEqual(['0', '0,06', '0,12', '0,18']);
        // Aucun titre d'axe, pas même celui que Highcharts écrit par défaut
        expect(container.querySelectorAll('.highcharts-axis-title')).toHaveLength(0);

        chart.destroy();
        container.remove();
    });
});

describe('tableau de données', () => {
    const UNSORTED = scatterModel([
        { ...scatterPoints(1)[0], name: 'Vendée', consoRate: 0.03234, indicRate: 1.5582 },
        { ...scatterPoints(1)[0], name: 'Ain', consoRate: 0.0084, indicRate: -0.2887 },
        { ...scatterPoints(1)[0], name: 'Écrins', consoRate: 0, indicRate: 0.5 },
    ]);

    it('nomme ses colonnes comme les axes, unité comprise', () => {
        expect(scatterTable(UNSORTED).headers).toEqual(['Territoire', "Consommation annuelle pour l'habitat (% par an)", 'Évolution du nombre de ménages (% par an)']);
    });

    it('donne une ligne par territoire, par ordre alphabétique français', () => {
        expect(scatterTable(UNSORTED).rows.map((row) => row.name)).toEqual(['Ain', 'Écrins', 'Vendée']);
    });

    it('écrit les taux réels avec les décimales de l’infobulle, en texte que le tableau n’arrondit pas', () => {
        const rows = scatterTable(UNSORTED).rows.map((row) => row.data.map(plain));

        expect(rows).toEqual([
            ['Ain', '0,008', '-0,29'],
            ['Écrins', '0,000', '0,50'],
            ['Vendée', '0,032', '1,56'],
        ]);
    });

    it('ne modifie pas l’ordre des points du modèle', () => {
        scatterTable(UNSORTED);

        expect(UNSORTED.points.map((point) => point.name)).toEqual(['Vendée', 'Ain', 'Écrins']);
    });
});
