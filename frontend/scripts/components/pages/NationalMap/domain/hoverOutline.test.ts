import { outlineOf } from './hoverOutline';

type Position = [number, number];
const square = (x: number, y: number, side = 1): Position[] => [
    [x, y],
    [x + side, y + 0.25],
    [x + side + 0.25, y + side],
    [x, y + side + 0.25],
    [x, y],
];
// Les côtés du carré d'essai sont tous obliques, sauf sa fermeture, qui suit un méridien

describe('outlineOf', () => {
    it('trace tous les anneaux d’une entité entière, sans rien en retirer', () => {
        const hole: Position[] = [
            [0.2, 0.2],
            [0.4, 0.2],
            [0.4, 0.4],
            [0.2, 0.2],
        ];

        expect(outlineOf([{ type: 'Polygon', coordinates: [square(0, 0), hole] }])).toEqual({ type: 'MultiLineString', coordinates: [square(0, 0), hole] });
    });

    it('trace chaque polygone d’une entité en plusieurs parties', () => {
        const outline = outlineOf([{ type: 'MultiPolygon', coordinates: [[square(0, 0)], [square(5, 5)]] }]);

        expect(outline.coordinates).toEqual([square(0, 0), square(5, 5)]);
    });

    it('retire les coutures d’une entité découpée par les tuiles : ce qui suit un méridien ou un parallèle', () => {
        // Deux morceaux d'un même losange, fermés chacun le long du méridien 1
        const west: Position[] = [
            [0, 1],
            [1, 0],
            [1, 2],
            [0, 1],
        ];
        const east: Position[] = [
            [1, 0],
            [2, 1],
            [1, 2],
            [1, 0],
        ];
        const outline = outlineOf([
            { type: 'Polygon', coordinates: [west] },
            { type: 'Polygon', coordinates: [east] },
        ]);

        expect(outline.coordinates).toEqual([
            [
                [0, 1],
                [1, 0],
            ],
            [
                [1, 2],
                [0, 1],
            ],
            [
                [1, 0],
                [2, 1],
                [1, 2],
            ],
        ]);
    });

    it('ignore ce qui n’est pas un polygone, et ne trace rien sans polygone', () => {
        expect(outlineOf([undefined, null, { type: 'Point', coordinates: [0, 0] }])).toBeNull();
        expect(outlineOf([])).toBeNull();
        expect(outlineOf([undefined, { type: 'Polygon', coordinates: [square(0, 0)] }]).coordinates).toEqual([square(0, 0)]);
    });
});
