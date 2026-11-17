import type * as Highcharts from 'highcharts';
import type { RingPoint, RingsRender } from '../../domain/frame/types';
import { ringArcPath } from '../../domain/rings';
import { symbolRadius } from '../../values';
import { renderRings, resizeRings } from './ringsLayer';

// Élément SVG tel que le calque le crée par le moteur de rendu de Highcharts : son genre, ce qu'il
// a reçu et le groupe où il a été ajouté
type Drawn = {
    kind: 'g' | 'circle' | 'path' | 'text';
    name?: string;
    args: unknown[];
    attributes: Record<string, unknown>;
    styles: Record<string, unknown>;
    parent: Drawn | null;
    added: boolean;
    destroyed: boolean;
    attr: (attributes: Record<string, unknown>) => Drawn;
    css: (styles: Record<string, unknown>) => Drawn;
    add: (parent?: Drawn) => Drawn;
    destroy: () => void;
};

type Land = { land_id: string; plotX?: number; plotY?: number };

// Graphique réduit à ce que le calque lit : la place de la zone de tracé, le centre de chaque
// territoire de la première série, et un moteur de rendu qui consigne ce qu'il dessine
const fakeChart = (lands: Land[], plot = { plotLeft: 8, plotTop: 8 }) => {
    const drawn: Drawn[] = [];
    const element = (kind: Drawn['kind'], args: unknown[], name?: string): Drawn => {
        const created: Drawn = {
            kind,
            name,
            args,
            attributes: {},
            styles: {},
            parent: null,
            added: false,
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
                created.added = true;
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
        ...plot,
        series: [{ points: lands.map(({ land_id, plotX, plotY }) => ({ options: { land_id }, plotX, plotY })) }],
        renderer: {
            g: (name: string) => element('g', [], name),
            circle: (...args: number[]) => element('circle', args),
            path: () => element('path', []),
            text: (...args: unknown[]) => element('text', args),
        },
    };
    const shown = (): Drawn[] => drawn.filter((item) => item.added && !item.destroyed);
    return {
        chart: chart as unknown as Highcharts.Chart,
        // Déplace un territoire, comme un redimensionnement du graphique
        moveLand: (landId: string, plotX: number, plotY: number): void => {
            Object.assign(chart.series[0].points.find((point) => point.options.land_id === landId), { plotX, plotY });
        },
        groups: (): Drawn[] => shown().filter((item) => item.kind === 'g'),
        marks: (): Drawn[] => shown().filter((item) => item.kind !== 'g'),
    };
};

const ring = (landId: string, gross: number, decreaseShare = 0.25, netLabel = '+1'): RingPoint => ({ land_id: landId, gross, decreaseShare, netLabel });

const renderOf = (rings: RingPoint[]): RingsRender => ({ renderer: 'territory', mode: 'rings', points: [], rings, maxValue: Math.max(...rings.map(({ gross }) => gross)) });

const RED = '#b2182b';
const BLUE = '#2166ac';

// Trois territoires : un grand anneau, un anneau moyen et un symbole trop petit pour être partagé
const LANDS: Land[] = [
    { land_id: 'A', plotX: 100, plotY: 200 },
    { land_id: 'B', plotX: 300, plotY: 120 },
    { land_id: 'C', plotX: 40, plotY: 60 },
];
const RINGS = renderOf([ring('A', 1000, 0.25, '+500'), ring('B', 200, 0.6), ring('C', 4, 0.9)]);
const MAX_SIZE = 64;

describe('calque des anneaux', () => {
    it('dessine un seul groupe, au-dessus des territoires, qui ne reçoit pas le pointeur', () => {
        const { chart, groups, marks } = fakeChart(LANDS);
        renderRings(chart, RINGS, MAX_SIZE);

        expect(groups()).toHaveLength(1);
        expect(groups()[0]).toMatchObject({ name: 'national-map-rings', attributes: { zIndex: 5 }, styles: { pointerEvents: 'none' } });
        marks().forEach((mark) => expect(mark.parent).toBe(groups()[0]));
    });

    it('pose chaque symbole au centre de son territoire, dans le repère du graphique', () => {
        const { chart, marks } = fakeChart(LANDS);
        renderRings(chart, RINGS, MAX_SIZE);
        const disc = marks().find((mark) => mark.kind === 'circle' && mark.attributes.fill === BLUE);

        // Centre du territoire C, décalé de l'origine de la zone de tracé
        expect(disc.args.slice(0, 2)).toEqual([48, 68]);
        expect(marks().find((mark) => mark.kind === 'text').args).toEqual(['+500', 108, 211.5]);
    });

    it('donne à chaque symbole le rayon du cercle proportionnel de son flux brut', () => {
        const { chart, marks } = fakeChart(LANDS);
        renderRings(chart, RINGS, MAX_SIZE);
        const radiusOf = (gross: number): number => symbolRadius(gross, 1000, MAX_SIZE);
        const paths = marks().filter((mark) => mark.kind === 'path');

        expect(radiusOf(1000)).toBe(32);
        expect(paths[0].attributes.d).toBe(ringArcPath(108, 208, 32, { from: 0, to: 0.75 }));
        expect(paths[2].attributes.d).toBe(ringArcPath(308, 128, radiusOf(200), { from: 0, to: 0.4 }));
        expect(marks().find((mark) => mark.attributes.fill === BLUE && mark.kind === 'circle').args[2]).toBe(radiusOf(4));
    });

    it('dessine du plus grand au plus petit, dans l’ordre du rendu : les petits restent visibles', () => {
        const { chart, marks } = fakeChart(LANDS);
        renderRings(chart, RINGS, MAX_SIZE);

        expect(marks().map(({ kind, attributes }) => [kind, attributes.fill ?? null])).toEqual([
            // Grand anneau : fond blanc du centre, deux arcs, valeur nette
            ['circle', '#ffffff'],
            ['path', RED],
            ['path', BLUE],
            ['text', null],
            // Anneau moyen : deux arcs, le centre laisse voir le territoire
            ['path', RED],
            ['path', BLUE],
            // Petit symbole : disque de la couleur du flux le plus fort
            ['circle', BLUE],
        ]);
    });

    it('n’écrit la valeur nette, sur un fond blanc, qu’au centre des anneaux d’au moins 40 px', () => {
        const { chart, marks } = fakeChart(LANDS);
        // Diamètres : 40 px pour le plus grand, moins pour les autres
        renderRings(chart, RINGS, 40);

        expect(marks().filter((mark) => mark.kind === 'text').map((mark) => mark.args[0])).toEqual(['+500']);
        expect(marks().filter((mark) => mark.attributes.fill === '#ffffff')).toHaveLength(1);

        const smaller = fakeChart(LANDS);
        renderRings(smaller.chart, RINGS, 38);

        expect(smaller.marks().filter((mark) => mark.kind === 'text')).toEqual([]);
        expect(smaller.marks().filter((mark) => mark.attributes.fill === '#ffffff')).toEqual([]);
    });

    it('remplace l’anneau par un disque plein, de même diamètre, sous 12 px', () => {
        const { chart, marks } = fakeChart(LANDS);
        // Sur une petite carte, l'anneau moyen passe sous 12 px
        renderRings(chart, RINGS, 20);
        const discs = marks().filter((mark) => mark.kind === 'circle');

        expect(discs.map((disc) => [disc.attributes.fill, disc.args[2]])).toEqual([
            [BLUE, symbolRadius(200, 1000, 20)],
            [BLUE, symbolRadius(4, 1000, 20)],
        ]);
        expect(symbolRadius(200, 1000, 20) * 2).toBeLessThan(12);
        expect(marks().filter((mark) => mark.kind === 'path')).toHaveLength(2);
    });

    it('ne trace qu’un arc pour un territoire dont un seul flux n’est pas nul', () => {
        const { chart, marks } = fakeChart(LANDS);
        renderRings(chart, renderOf([ring('A', 1000, 0), ring('B', 900, 1)]), 30);

        expect(marks().map(({ kind, attributes }) => [kind, attributes.fill])).toEqual([
            ['path', RED],
            ['path', BLUE],
        ]);
    });

    it('ignore l’anneau d’un territoire que le graphique n’a pas placé', () => {
        const { chart, marks } = fakeChart([{ land_id: 'A' }, LANDS[1]]);
        renderRings(chart, renderOf([ring('A', 1000), ring('B', 1000), ring('Z', 1000)]), 30);

        expect(marks().filter((mark) => mark.kind === 'path')).toHaveLength(2);
    });

    it('n’a ni fond ni texte pour un rendu sans anneau', () => {
        const { chart, groups, marks } = fakeChart(LANDS);
        renderRings(chart, { renderer: 'territory', mode: 'rings', points: [], rings: [], maxValue: 0 }, MAX_SIZE);

        expect(groups()).toHaveLength(1);
        expect(marks()).toEqual([]);
    });
});

describe('anneaux d’un graphique redessiné', () => {
    it('ne laisse rien du dessin précédent, et suit les territoires à leur nouvelle place', () => {
        const { chart, moveLand, groups, marks } = fakeChart(LANDS);
        renderRings(chart, RINGS, MAX_SIZE);
        const first = marks().length;
        moveLand('C', 20, 30);
        renderRings(chart, RINGS, MAX_SIZE);

        expect(groups()).toHaveLength(1);
        expect(marks()).toHaveLength(first);
        expect(marks().find((mark) => mark.kind === 'circle' && mark.attributes.fill === BLUE).args.slice(0, 2)).toEqual([28, 38]);
    });

    it('donne aux anneaux le diamètre que demande la scène, sans attendre un rendu du graphique', () => {
        const { chart, groups, marks } = fakeChart(LANDS);
        renderRings(chart, RINGS, MAX_SIZE);
        resizeRings(chart, 40);

        expect(groups()).toHaveLength(1);
        expect(marks().find((mark) => mark.kind === 'path').attributes.d).toBe(ringArcPath(108, 208, 20, { from: 0, to: 0.75 }));
    });

    it('garde, aux rendus suivants, le dernier diamètre demandé par la scène plutôt que celui de la création', () => {
        const { chart, marks } = fakeChart(LANDS);
        renderRings(chart, RINGS, MAX_SIZE);
        resizeRings(chart, 40);
        renderRings(chart, RINGS, MAX_SIZE);

        expect(marks().find((mark) => mark.kind === 'path').attributes.d).toBe(ringArcPath(108, 208, 20, { from: 0, to: 0.75 }));
    });

    it('ne redessine rien quand le diamètre demandé est déjà le sien', () => {
        const { chart, groups } = fakeChart(LANDS);
        renderRings(chart, RINGS, MAX_SIZE);
        const [group] = groups();
        resizeRings(chart, MAX_SIZE);

        expect(groups()).toEqual([group]);
    });

    it('ne dessine rien sur un graphique sans anneaux, dont les cercles sont retaillés ailleurs', () => {
        const { chart, groups } = fakeChart(LANDS);
        resizeRings(chart, 40);

        expect(groups()).toEqual([]);
    });

    it('tient les anneaux de chaque graphique à part : la copie d’un export ne retaille pas la carte affichée', () => {
        const shown = fakeChart(LANDS);
        const exported = fakeChart(LANDS);
        renderRings(shown.chart, RINGS, 40);
        renderRings(exported.chart, RINGS, MAX_SIZE);

        expect(shown.marks().find((mark) => mark.kind === 'path').attributes.d).toBe(ringArcPath(108, 208, 20, { from: 0, to: 0.75 }));
        expect(exported.marks().find((mark) => mark.kind === 'path').attributes.d).toBe(ringArcPath(108, 208, 32, { from: 0, to: 0.75 }));
    });
});
