import type { ExpressionSpecification } from 'maplibre-gl';
import { cellClassIndex, cellColorExpression, cellOpacityExpression, hasCode } from './cells';

const VALUE: ExpressionSpecification = ['get', 'part'];
const CLASSIFIED = {
    value: VALUE,
    bounds: [10, 50],
    classes: [
        { color: '#aaaaaa', name: 'faible' },
        { color: '#bbbbbb', name: 'moyenne' },
        { color: '#cccccc', name: 'forte' },
    ],
};

describe('classes d’une maille', () => {
    it('range une valeur égale à une borne dans la classe supérieure, comme l’expression step de MapLibre', () => {
        expect([0, 9.99, 10, 49, 50, 100].map((value) => cellClassIndex(CLASSIFIED.bounds, value))).toEqual([0, 0, 1, 1, 2, 2]);
    });

    it('colore par paliers : une couleur par classe, de part et d’autre de chaque borne', () => {
        expect(cellColorExpression(CLASSIFIED)).toEqual(['step', VALUE, '#aaaaaa', 10, '#bbbbbb', 50, '#cccccc']);
    });

    it('laisse toutes les mailles pleines sans classe mise en avant', () => {
        expect(cellOpacityExpression(CLASSIFIED, null, 0.2)).toBe(1);
    });

    it('estompe les mailles des autres classes, avec la même règle de borne que les couleurs', () => {
        expect(cellOpacityExpression(CLASSIFIED, 0, 0.2)).toEqual(['case', ['all', ['<', VALUE, 10]], 1, 0.2]);
        expect(cellOpacityExpression(CLASSIFIED, 1, 0.2)).toEqual(['case', ['all', ['>=', VALUE, 10], ['<', VALUE, 50]], 1, 0.2]);
        expect(cellOpacityExpression(CLASSIFIED, 2, 0.2)).toEqual(['case', ['all', ['>=', VALUE, 50]], 1, 0.2]);
    });
});

describe('territoires d’une maille', () => {
    it('cherche un code avec ses guillemets dans la liste sérialisée, absente ou non', () => {
        expect(hasCode('DEPART', '35')).toEqual(['in', '"35"', ['coalesce', ['get', 'DEPART'], '']]);
    });
});
