import { PARENT_BOUNDARY_STYLE } from '../../domain/parentBoundary';
import { PARENT_BOUNDARY_CASING, PARENT_BOUNDARY_LAYERS, PARENT_BOUNDARY_LINE, PARENT_BOUNDARY_SOURCE, drawParentBoundary } from './parentBoundaryLayer';

const LINES: [number, number][][] = [
    [
        [0, 0],
        [100_000, 0],
        [100_000, 100_000],
        [0, 0],
    ],
];

type Boundary = GeoJSON.Feature<GeoJSON.MultiLineString>;
type FakeSource = { data: Boundary; setData: jest.Mock<void, [Boundary]> };

// Carte réduite à ce que la limite lui demande
const fakeMap = () => {
    const sources = new Map<string, FakeSource>();
    const layers: string[] = [];
    const map = {
        getSource: (id: string) => sources.get(id),
        addSource: (id: string, { data }: { data: Boundary }) => {
            const source: FakeSource = {
                data,
                setData: jest.fn((next: Boundary) => {
                    source.data = next;
                }),
            };
            sources.set(id, source);
        },
        addLayer: ({ id }: { id: string }) => {
            layers.push(id);
        },
    };
    return { sources, layers, map: map as unknown as Parameters<typeof drawParentBoundary>[0] };
};

describe('drawParentBoundary', () => {
    it('pose la source et ses deux couches, le liseré sous le tireté', () => {
        const map = fakeMap();
        drawParentBoundary(map.map, LINES);

        expect(map.layers).toEqual([PARENT_BOUNDARY_CASING, PARENT_BOUNDARY_LINE]);
        expect(map.sources.get(PARENT_BOUNDARY_SOURCE).data.geometry.coordinates[0]).toHaveLength(4);
    });

    it('pose ses couches même sans limite : leur rang ne dépend pas de la première zone affichée', () => {
        const map = fakeMap();
        drawParentBoundary(map.map, []);

        expect(map.layers).toHaveLength(2);
        expect(map.sources.get(PARENT_BOUNDARY_SOURCE).data.geometry.coordinates).toEqual([]);
    });

    it('ne remplace ensuite que les données : ni source ni couche de plus', () => {
        const map = fakeMap();
        drawParentBoundary(map.map, []);
        drawParentBoundary(map.map, LINES);
        drawParentBoundary(map.map, []);

        expect(map.layers).toHaveLength(2);
        expect(map.sources.size).toBe(1);
        const source = map.sources.get(PARENT_BOUNDARY_SOURCE);
        expect(source.setData).toHaveBeenCalledTimes(2);
        expect(source.data.geometry.coordinates).toEqual([]);
    });
});

describe('PARENT_BOUNDARY_LAYERS', () => {
    it("dessine le trait décrit pour les deux moteurs : couleurs, épaisseurs et tireté", () => {
        const [casing, line] = PARENT_BOUNDARY_LAYERS as { paint: Record<string, unknown> }[];
        expect(casing.paint).toEqual({ 'line-color': PARENT_BOUNDARY_STYLE.casingColor, 'line-width': PARENT_BOUNDARY_STYLE.casingWidthPx });
        expect(line.paint).toEqual({ 'line-color': PARENT_BOUNDARY_STYLE.color, 'line-width': PARENT_BOUNDARY_STYLE.widthPx, 'line-dasharray': [...PARENT_BOUNDARY_STYLE.dash] });
    });
});
