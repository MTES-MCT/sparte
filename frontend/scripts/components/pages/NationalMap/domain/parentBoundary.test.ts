import { PARENT_BOUNDARY_STYLE, parentBoundaryFeature, parentBoundaryKey, parentBoundaryOf } from './parentBoundary';

const LINES: [number, number][][] = [
    [
        [0, 0],
        [111_319.49, 0],
        [111_319.49, 111_325.14],
        [0, 0],
    ],
];

describe('parentBoundaryOf', () => {
    it('rend les lignes du fond', () => {
        expect(parentBoundaryOf({ parent_boundary: LINES })).toBe(LINES);
    });

    it("rend le même tableau vide pour tous les fonds sans limite : rien n'est redessiné de l'un à l'autre", () => {
        const none = parentBoundaryOf({ parent_boundary: null });
        expect(none).toEqual([]);
        expect(parentBoundaryOf({ parent_boundary: [] })).toBe(none);
        // Réponse d'avant le calcul de la limite, encore en cache
        expect(parentBoundaryOf({} as { parent_boundary: null })).toBe(none);
    });
});

describe('parentBoundaryKey', () => {
    it('nomme le trait dans la légende, d’après le type du territoire affiché', () => {
        expect(parentBoundaryKey(LINES, 'DEPART')).toBe('Limite du département');
        expect(parentBoundaryKey(LINES, 'REGION')).toBe('Limite de la région');
        expect(parentBoundaryKey(LINES, undefined)).toBe('Limite du territoire');
    });

    it('ne dit rien quand le fond ne porte pas de limite', () => {
        expect(parentBoundaryKey(parentBoundaryOf({ parent_boundary: null }), 'DEPART')).toBeNull();
    });
});

describe('parentBoundaryFeature', () => {
    it('convertit chaque ligne en longitude et latitude', () => {
        const { geometry } = parentBoundaryFeature(LINES);
        expect(geometry.type).toBe('MultiLineString');
        expect(geometry.coordinates).toHaveLength(1);
        expect(geometry.coordinates[0]).toHaveLength(4);
        expect(geometry.coordinates[0][1][0]).toBeCloseTo(1, 4);
        expect(geometry.coordinates[0][2][1]).toBeCloseTo(1, 4);
    });

    it('sans ligne, ne dessine rien', () => {
        expect(parentBoundaryFeature([]).geometry.coordinates).toEqual([]);
    });
});

describe('PARENT_BOUNDARY_STYLE', () => {
    it('garde un liseré plus large que le trait, qui couvre les limites longées', () => {
        expect(PARENT_BOUNDARY_STYLE.casingWidthPx).toBeGreaterThan(PARENT_BOUNDARY_STYLE.widthPx);
    });

    it('nomme pour Highcharts le tireté décrit en épaisseurs de trait', () => {
        // Highcharts : « Dash » vaut un tiret de 4 épaisseurs et un intervalle de 3
        expect([PARENT_BOUNDARY_STYLE.highchartsDash, ...PARENT_BOUNDARY_STYLE.dash]).toEqual(['Dash', 4, 3]);
    });
});
