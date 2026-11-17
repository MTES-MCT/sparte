import { RING_MIN_DIAMETER, ringArcPath, ringArcs, ringInnerRadius, ringMarkOf } from './rings';

// Ce que dit le tracé d'un arc : son départ sur le bord du trou, son parcours du bord extérieur,
// puis son retour par le bord du trou
const ARC_PATH = /^M (\S+) (\S+) L (\S+) (\S+) A (\S+) \S+ 0 ([01]) 1 (\S+) (\S+) L (\S+) (\S+) A (\S+) \S+ 0 ([01]) 0 (\S+) (\S+) Z$/;

const parse = (path: string) => {
    const [innerStartX, innerStartY, outerStartX, outerStartY, outerRadius, largeArc, outerEndX, outerEndY, , , innerRadius, innerLargeArc, backX, backY] = ARC_PATH.exec(path)
        .slice(1)
        .map(Number);
    return {
        innerStart: [innerStartX, innerStartY],
        outerStart: [outerStartX, outerStartY],
        outerEnd: [outerEndX, outerEndY],
        back: [backX, backY],
        outerRadius,
        innerRadius,
        largeArc,
        innerLargeArc,
    };
};

describe('forme du symbole selon son diamètre', () => {
    it('dessine un disque plein sous 12 px, un anneau à partir de 12 px', () => {
        expect(RING_MIN_DIAMETER).toBe(12);
        expect(ringMarkOf(11.9, 0.2).shape).toBe('disc');
        expect(ringMarkOf(3, 0.2).shape).toBe('disc');
        expect(ringMarkOf(12, 0.2).shape).toBe('ring');
        expect(ringMarkOf(64, 0.2).shape).toBe('ring');
    });

    it('écrit la valeur nette au centre à partir de 40 px, pas en dessous', () => {
        expect(ringMarkOf(39.9, 0.2)).toMatchObject({ shape: 'ring', labelled: false });
        expect(ringMarkOf(12, 0.2)).toMatchObject({ shape: 'ring', labelled: false });
        expect(ringMarkOf(40, 0.2)).toMatchObject({ shape: 'ring', labelled: true });
        expect(ringMarkOf(64, 0.2)).toMatchObject({ shape: 'ring', labelled: true });
    });

    it('donne au disque la couleur du flux le plus fort, celle du flux à la hausse à égalité', () => {
        expect(ringMarkOf(8, 0)).toEqual({ shape: 'disc', flow: 'increase' });
        expect(ringMarkOf(8, 0.49)).toEqual({ shape: 'disc', flow: 'increase' });
        expect(ringMarkOf(8, 0.5)).toEqual({ shape: 'disc', flow: 'increase' });
        expect(ringMarkOf(8, 0.51)).toEqual({ shape: 'disc', flow: 'decrease' });
        expect(ringMarkOf(8, 1)).toEqual({ shape: 'disc', flow: 'decrease' });
    });

    it('partage l’anneau comme ses arcs', () => {
        expect(ringMarkOf(20, 0.25)).toEqual({ shape: 'ring', arcs: ringArcs(0.25), labelled: false });
    });

    it('donne à l’anneau une épaisseur d’un quart de son diamètre', () => {
        const radius = 20;

        expect(radius - ringInnerRadius(radius)).toBe((2 * radius) / 4);
    });
});

describe('partage des arcs', () => {
    it('fait partir le flux à la hausse de midi, et le flux à la baisse à sa suite, jusqu’au tour complet', () => {
        expect(ringArcs(0.25)).toEqual([
            { flow: 'increase', from: 0, to: 0.75 },
            { flow: 'decrease', from: 0.75, to: 1 },
        ]);
    });

    it('donne tout l’anneau au flux à la hausse quand le flux à la baisse est nul', () => {
        expect(ringArcs(0)).toEqual([{ flow: 'increase', from: 0, to: 1 }]);
    });

    it('partage l’anneau en deux moitiés quand les flux sont égaux', () => {
        expect(ringArcs(0.5)).toEqual([
            { flow: 'increase', from: 0, to: 0.5 },
            { flow: 'decrease', from: 0.5, to: 1 },
        ]);
    });

    it('donne le plus grand arc au flux à la baisse quand il est majoritaire, et tout l’anneau quand il est seul', () => {
        const [increase, decrease] = ringArcs(0.9);

        expect(increase.to - increase.from).toBeCloseTo(0.1);
        expect(decrease.to - decrease.from).toBeCloseTo(0.9);
        expect(ringArcs(1)).toEqual([{ flow: 'decrease', from: 0, to: 1 }]);
    });

    it('couvre toujours le tour entier, sans arc vide', () => {
        [0, 0.001, 0.15, 0.5, 0.912, 0.999, 1].forEach((share) => {
            const arcs = ringArcs(share);

            expect(arcs.reduce((total, { from, to }) => total + (to - from), 0)).toBeCloseTo(1);
            arcs.forEach(({ from, to }) => expect(to).toBeGreaterThan(from));
        });
    });

    it('ramène une part hors bornes à un anneau d’un seul flux', () => {
        expect(ringArcs(-0.2)).toEqual(ringArcs(0));
        expect(ringArcs(1.2)).toEqual(ringArcs(1));
    });
});

describe('tracé d’un arc', () => {
    it('part de midi sur le bord du trou, suit le bord extérieur dans le sens horaire et revient par le trou', () => {
        // Quart de tour d'un anneau de rayon 20 centré en (100, 100) : de midi à trois heures
        expect(ringArcPath(100, 100, 20, { from: 0, to: 0.25 })).toBe(
            'M 100.00 90.00 L 100.00 80.00 A 20 20 0 0 1 120.00 100.00 L 110.00 100.00 A 10 10 0 0 0 100.00 90.00 Z',
        );
    });

    it('trace le bord extérieur au rayon de l’anneau, le bord du trou à la moitié, et se referme sur son départ', () => {
        const arc = parse(ringArcPath(50, 60, 16, { from: 0.3, to: 0.9 }));

        expect(arc).toMatchObject({ outerRadius: 16, innerRadius: 8 });
        expect(arc.back).toEqual(arc.innerStart);
    });

    it('marque comme un grand arc celui qui dépasse le demi-tour, sur ses deux bords', () => {
        expect(parse(ringArcPath(0, 0, 20, { from: 0, to: 0.75 }))).toMatchObject({ largeArc: 1, innerLargeArc: 1 });
        expect(parse(ringArcPath(0, 0, 20, { from: 0, to: 0.5 }))).toMatchObject({ largeArc: 0, innerLargeArc: 0 });
        expect(parse(ringArcPath(0, 0, 20, { from: 0.75, to: 1 }))).toMatchObject({ largeArc: 0, innerLargeArc: 0 });
    });

    it.each([
        ['le plus petit anneau', RING_MIN_DIAMETER / 2],
        ['un grand anneau', 32],
    ])('arrête un tour complet juste avant son point de départ, sans quoi il ne serait pas tracé (%s)', (_size, radius) => {
        const { innerStart, outerStart, outerEnd, back, largeArc } = parse(ringArcPath(50, 50, radius, { from: 0, to: 1 }));

        expect(largeArc).toBe(1);
        expect(outerEnd).not.toEqual(outerStart);
        expect(back).toEqual(innerStart);
        // L'écart reste invisible : moins d'un quart de pixel
        expect(Math.hypot(outerEnd[0] - outerStart[0], outerEnd[1] - outerStart[1])).toBeLessThan(0.25);
    });
});
