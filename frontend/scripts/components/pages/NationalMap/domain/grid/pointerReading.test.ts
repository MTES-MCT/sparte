import type { GridCells, GridDetail } from './cells';
import { PointerContext, PointerTarget, pointerReading } from './pointerReading';

// La carte ne connaît ni ses mailles ni ses objets : ils se lisent eux-mêmes. Ceux d'essai rendent
// ce que leurs attributs portent.
const CELLS = {
    classes: [
        { color: '#aaaaaa', name: 'faible' },
        { color: '#bbbbbb', name: 'forte' },
    ],
    read: ({ part }: Record<string, unknown>) => ({ name: 'Maille de 1 km × 1 km', valueText: `${part} % de sols artificialisés`, classIndex: 1 }),
    texts: { empty: 'Aucune maille ici' },
} as unknown as GridCells;

const DETAIL = {
    classes: [{ color: '#111111', name: 'zones bâties' }],
    read: ({ couverture }: Record<string, unknown>) => ({ name: 'Objet OCS GE', valueText: `Couverture : ${couverture}`, classIndex: 0 }),
} as unknown as GridDetail;

const CELL = { part: 23 };
const OBJECT = { couverture: 'zones bâties' };

const context = (changes: Partial<PointerContext> = {}): PointerContext => ({ cells: CELLS, detail: DETAIL, objectsShown: false, cellsMissing: false, pictured: false, ...changes });

describe('lecture sous le pointeur', () => {
    it('lit la maille sous le nom du territoire qu’un clic ouvrirait, avec la pastille de sa classe', () => {
        expect(pointerReading({ landName: 'Ille-et-Vilaine', cell: CELL, object: null }, context())).toEqual({
            name: 'Ille-et-Vilaine',
            valueText: '23 % de sols artificialisés',
            classIndex: 1,
            swatch: '#bbbbbb',
        });
    });

    it('nomme la maille elle-même là où elle dépasse des territoires dessinés', () => {
        expect(pointerReading({ landName: undefined, cell: CELL, object: null }, context()).name).toBe('Maille de 1 km × 1 km');
    });

    it('dit ce que signifie un territoire sans maille, sans classe ni pastille', () => {
        expect(pointerReading({ landName: 'Ille-et-Vilaine', cell: null, object: null }, context())).toEqual({
            name: 'Ille-et-Vilaine',
            valueText: 'Aucune maille ici',
            classIndex: null,
            swatch: null,
        });
    });

    it('ne dit rien d’un endroit sans maille quand leur fichier manque, ni sous l’image', () => {
        const land: PointerTarget = { landName: 'Ille-et-Vilaine', cell: null, object: null };

        expect(pointerReading(land, context({ cellsMissing: true })).valueText).toBe('');
        expect(pointerReading(land, context({ pictured: true })).valueText).toBe('');
    });

    it('lit l’objet à la place de la maille qu’il recouvre : son nom, sa classe et sa pastille dans la légende des objets', () => {
        expect(pointerReading({ landName: 'Ille-et-Vilaine', cell: CELL, object: OBJECT }, context({ objectsShown: true }))).toEqual({
            name: 'Objet OCS GE',
            valueText: 'Couverture : zones bâties',
            classIndex: 0,
            swatch: '#111111',
        });
    });

    it('lit encore la maille là où l’objet n’est pas chargé, sans classe : la légende affichée est celle des objets', () => {
        expect(pointerReading({ landName: 'Ille-et-Vilaine', cell: CELL, object: null }, context({ objectsShown: true }))).toEqual({
            name: 'Ille-et-Vilaine',
            valueText: '23 % de sols artificialisés',
            classIndex: null,
            swatch: null,
        });
    });
});
