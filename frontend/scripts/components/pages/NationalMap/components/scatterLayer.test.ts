import Highcharts from 'highcharts';
import { SCATTER_PALETTE, scatterModel, scatterPoints } from '../__fixtures__/scatterFixtures';
import { discPathsByColor, renderScatterPoints } from './scatterLayer';
import { scatterOptions } from './scatterOptions';

// Points du nuage, dessinés en un tracé par couleur dans le SVG du graphique

describe('discPathsByColor', () => {
    const POINTS = scatterPoints(12);
    // Place d'un point : ses taux, à une échelle qui les rend lisibles
    const placeOf = ({ x, y }: { x: number; y: number }) => ({ x: 100 * x, y: 1000 * y });

    it('réunit les points d’une même couleur dans un seul tracé', () => {
        const paths = discPathsByColor(POINTS, placeOf, 3);

        expect([...paths.keys()]).toEqual(SCATTER_PALETTE);
        // Douze points de neuf couleurs : les trois premières en ont deux
        expect([...paths.values()].map((path) => path.split('M').length - 1)).toEqual([2, 2, 2, 1, 1, 1, 1, 1, 1]);
    });

    it('trace chaque point en un disque du rayon demandé, centré à sa place', () => {
        const paths = discPathsByColor([POINTS[4]], placeOf, 3);

        // Le territoire 4 est en (40, 40) : le tracé part de son bord gauche et fait le tour en deux demi-cercles
        expect(paths.get(SCATTER_PALETTE[4])).toBe('M37 40a3 3 0 1 0 6 0a3 3 0 1 0 -6 0z');
    });

    it('arrondit les places au dixième de pixel', () => {
        const paths = discPathsByColor([POINTS[1]], () => ({ x: 12.3456, y: 7.891 }), 2);

        expect(paths.get(SCATTER_PALETTE[1])).toBe('M10.3 7.9a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z');
    });

    it('ne trace rien sans point', () => {
        expect(discPathsByColor([], placeOf, 3).size).toBe(0);
    });
});

// Élément SVG tel que le calque le crée par le moteur de rendu de Highcharts
type Drawn = {
    kind: 'g' | 'path';
    name?: string;
    attributes: Record<string, unknown>;
    styles: Record<string, unknown>;
    parent: Drawn | null;
    destroyed: boolean;
    attr: (attributes: Record<string, unknown>) => Drawn;
    css: (styles: Record<string, unknown>) => Drawn;
    add: (parent?: Drawn) => Drawn;
    destroy: () => void;
};

// Graphique réduit à ce que le calque lit : deux axes qui placent les taux à l'échelle donnée, et
// un moteur de rendu qui consigne ce qu'il dessine
const fakeChart = (scale = 100) => {
    const drawn: Drawn[] = [];
    const element = (kind: Drawn['kind'], name?: string): Drawn => {
        const created: Drawn = {
            kind,
            name,
            attributes: {},
            styles: {},
            parent: null,
            destroyed: false,
            attr: (attributes) => {
                Object.assign(created.attributes, attributes);
                return created;
            },
            css: (styles) => {
                Object.assign(created.styles, styles);
                return created;
            },
            add: (parent) => {
                created.parent = parent ?? null;
                return created;
            },
            // Détruire un groupe détruit ce qu'il porte
            destroy: () => {
                created.destroyed = true;
                drawn.filter((child) => child.parent === created).forEach((child) => child.destroy());
            },
        };
        drawn.push(created);
        return created;
    };
    const chart = {
        xAxis: [{ toPixels: (value: number) => 10 + value * scale }],
        yAxis: [{ toPixels: (value: number) => 300 - value * scale * 10 }],
        renderer: { g: (name: string) => element('g', name), path: () => element('path') },
    };
    const alive = (kind: Drawn['kind']): Drawn[] => drawn.filter((item) => item.kind === kind && !item.destroyed);
    return { chart: chart as unknown as Highcharts.Chart, groups: () => alive('g'), paths: () => alive('path') };
};

describe('renderScatterPoints', () => {
    it('dessine un tracé par couleur dans un seul groupe, au-dessus des seuils', () => {
        const { chart, groups, paths } = fakeChart();
        renderScatterPoints(chart, scatterPoints(12), 3);

        expect(groups()).toHaveLength(1);
        expect(groups()[0]).toMatchObject({ name: 'national-map-scatter-points', attributes: { zIndex: 2 } });
        expect(paths().map((path) => path.attributes.fill)).toEqual(SCATTER_PALETTE);
        expect(paths().every((path) => path.parent === groups()[0])).toBe(true);
    });

    it('cerne chaque point d’un liseré blanc, plus fin pour les petits points', () => {
        const large = fakeChart();
        const small = fakeChart();
        renderScatterPoints(large.chart, scatterPoints(3), 3.5);
        renderScatterPoints(small.chart, scatterPoints(3), 2);

        expect(large.paths().map((path) => [path.attributes.stroke, path.attributes['stroke-width']])).toEqual(Array(3).fill(['#ffffff', 0.5]));
        expect(small.paths().map((path) => path.attributes['stroke-width'])).toEqual(Array(3).fill(0.29));
    });

    it('place chaque point d’après les axes du graphique', () => {
        const { chart, paths } = fakeChart();
        // Le territoire 5 a pour taux 0,5 et 0,05 : en (60, 250) à cette échelle
        renderScatterPoints(chart, [scatterPoints(6)[5]], 2);

        expect(paths()[0].attributes.d).toBe('M58 250a2 2 0 1 0 4 0a2 2 0 1 0 -4 0z');
    });

    it('ne reçoit pas le pointeur : Highcharts cherche lui-même le point le plus proche', () => {
        const { chart, groups } = fakeChart();
        renderScatterPoints(chart, scatterPoints(3), 3);

        expect(groups()[0].styles).toEqual({ pointerEvents: 'none' });
    });

    it('ne garde rien du dessin précédent quand le graphique est rendu de nouveau', () => {
        const { chart, groups, paths } = fakeChart();
        renderScatterPoints(chart, scatterPoints(12), 3);
        renderScatterPoints(chart, scatterPoints(4), 3);

        expect(groups()).toHaveLength(1);
        expect(paths()).toHaveLength(4);
    });

    it('dessine les points d’un graphique sans effacer ceux d’un autre', () => {
        const first = fakeChart();
        const second = fakeChart();
        renderScatterPoints(first.chart, scatterPoints(12), 3);
        renderScatterPoints(second.chart, scatterPoints(3), 3);

        expect(first.paths()).toHaveLength(9);
        expect(second.paths()).toHaveLength(3);
    });
});

// Le calque branché sur le vrai Highcharts par les options du graphique de la colonne. jsdom ne
// calcule pas de mise en page : la place des points n'y est pas vérifiable.
describe('calque du graphique de la colonne', () => {
    let container: HTMLDivElement;
    let chart: Highcharts.Chart;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        const options = scatterOptions(scatterModel(scatterPoints(12)), { pointEvents: {} });
        chart = Highcharts.chart(container, { ...options, chart: { ...options.chart, width: 272, height: 360 }, accessibility: { enabled: false } });
    });

    afterEach(() => {
        chart.destroy();
        container.remove();
    });

    const paths = (): Element[] => [...container.querySelectorAll('.highcharts-national-map-scatter-points path')];

    it('est dessiné à la création du graphique : un tracé par couleur', () => {
        expect(paths().map((path) => path.getAttribute('fill'))).toEqual(SCATTER_PALETTE);
    });

    it('ne laisse à Highcharts aucun élément par point, hors de son module d’accessibilité', () => {
        expect(chart.series[0].points).toHaveLength(12);
        expect(chart.series[0].points.filter((point) => point.graphic)).toEqual([]);
    });

    it('est redessiné, sans doublon, quand le graphique change de taille', () => {
        chart.setSize(900, 500, false);

        expect(container.querySelectorAll('.highcharts-national-map-scatter-points')).toHaveLength(1);
        expect(paths()).toHaveLength(9);
    });
});
