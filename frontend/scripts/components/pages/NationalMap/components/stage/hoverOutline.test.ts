import { StubMap } from '../../__fixtures__/mapLibreStub';
import { HOVER_HALO, HOVER_LAYERS, HOVER_LINE, HOVER_SOURCE, createHoverOutline, piecesAround, sameFeatureFilter } from './hoverOutline';

type Position = [number, number];
const TRIANGLE: Position[] = [
    [0, 0],
    [2, 1],
    [1, 3],
    [0, 0],
];
const polygon = { type: 'Polygon', coordinates: [TRIANGLE] };
const outlineOn = (map: StubMap) => createHoverOutline(map as unknown as Parameters<typeof createHoverOutline>[0]);
const dataOf = (map: StubMap) => map.sources.get(HOVER_SOURCE)?.data as { geometry?: { coordinates: Position[][] }; features?: unknown[] } | undefined;

describe('contour de l’élément survolé', () => {
    it('ne pose rien sur une carte que personne ne survole', () => {
        const map = new StubMap();
        const outline = outlineOn(map);
        outline.hide();

        expect(map.calls).toEqual([]);
    });

    it('pose sa source et ses deux couches au premier contour, le trait sombre sur son liseré clair, au-dessus de tout', () => {
        const map = new StubMap();
        outlineOn(map).show('35238', () => [polygon]);

        expect(dataOf(map).geometry.coordinates).toEqual([TRIANGLE]);
        expect(map.callsOf('addLayer').map(([layer, beforeId]) => [(layer as { id: string }).id, beforeId])).toEqual([
            [HOVER_HALO, undefined],
            [HOVER_LINE, undefined],
        ]);
        const [halo, line] = HOVER_LAYERS.map((layer) => layer.paint as { 'line-color': string; 'line-width': number });
        expect([halo['line-color'], line['line-color']]).toEqual(['#ffffff', '#1a1a1a']);
        expect(halo['line-width']).toBeGreaterThan(line['line-width']);
    });

    it('ne relit ni ne redessine rien tant que le pointeur parcourt le même élément', () => {
        const map = new StubMap();
        const outline = outlineOn(map);
        const pieces = jest.fn(() => [polygon]);
        outline.show('35238', pieces);
        const mark = map.mark();
        outline.show('35238', pieces);
        outline.show('35238', pieces);

        expect(pieces).toHaveBeenCalledTimes(1);
        expect(map.calls.slice(mark)).toEqual([]);
    });

    it('remplace le contour par celui de l’élément suivant, sans rien poser de plus', () => {
        const map = new StubMap();
        const outline = outlineOn(map);
        outline.show('35238', () => [polygon]);
        const mark = map.mark();
        outline.show('35001', () => [{ type: 'Polygon', coordinates: [TRIANGLE.map(([x, y]) => [x + 5, y])] }]);

        expect(map.callsOf('setData', mark)).toHaveLength(1);
        expect(map.callsOf('addLayer', mark)).toEqual([]);
        expect(dataOf(map).geometry.coordinates[0][0]).toEqual([5, 0]);
    });

    it('s’efface quand le pointeur quitte l’élément, et revient s’il y retourne', () => {
        const map = new StubMap();
        const outline = outlineOn(map);
        outline.show('35238', () => [polygon]);
        outline.hide();

        expect(dataOf(map).features).toEqual([]);
        // Effacé dès l'image suivante, sans attendre que la source ait relu ses données
        expect(map.callsOf('setPaintProperty')).toEqual([
            [HOVER_HALO, 'line-opacity', 0],
            [HOVER_LINE, 'line-opacity', 0],
        ]);

        outline.show('35238', () => [polygon]);
        expect(dataOf(map).geometry.coordinates).toEqual([TRIANGLE]);
        expect(map.callsOf('setPaintProperty').slice(2)).toEqual([
            [HOVER_HALO, 'line-opacity', 1],
            [HOVER_LINE, 'line-opacity', 1],
        ]);
    });

    it('efface le contour précédent pour un élément dont les tuiles ne donnent pas la forme', () => {
        const map = new StubMap();
        const outline = outlineOn(map);
        outline.show('35238', () => [polygon]);
        outline.show('sans-forme', () => [undefined]);

        expect(dataOf(map).features).toEqual([]);
    });
});

describe('morceaux d’une entité', () => {
    it('se reconnaissent à leurs attributs, tous égaux', () => {
        expect(sameFeatureFilter({ code_cs: 'CS1.1.1.1', surface: 1240.5, is_artificial: true })).toEqual([
            'all',
            ['==', ['get', 'code_cs'], 'CS1.1.1.1'],
            ['==', ['get', 'surface'], 1240.5],
            ['==', ['get', 'is_artificial'], true],
        ]);
    });

    // Fausse carte : un degré vaut dix pixels, et la recherche rend ce qu'on lui a préparé
    const mapWith = (underPoint: unknown[], inFrame: unknown[]) => {
        const queries: unknown[][] = [];
        return {
            queries,
            project: ([x, y]: Position) => ({ x: x * 10, y: y * 10 }),
            queryRenderedFeatures: (where: unknown, options: unknown) => {
                queries.push([where, options]);
                return (queries.length === 1 ? underPoint : inFrame).map((geometry) => ({ geometry }));
            },
        } as unknown as Parameters<typeof piecesAround>[0] & { queries: unknown[][] };
    };
    const FILTER = sameFeatureFilter({ land_id: '35238' });

    it('sont cherchés sous le point, puis dans le seul cadre de ceux qui s’y trouvent', () => {
        const neighbour = { type: 'Polygon', coordinates: [TRIANGLE.map(([x, y]) => [x + 2, y])] };
        const map = mapWith([polygon], [polygon, neighbour]);

        expect(piecesAround(map, { x: 12, y: 8 }, ['communes'], FILTER)).toEqual([polygon, neighbour]);
        expect(map.queries).toEqual([
            [[12, 8], { layers: ['communes'], filter: FILTER }],
            [
                [
                    [-2, -2],
                    [22, 32],
                ],
                { layers: ['communes'], filter: FILTER },
            ],
        ]);
    });

    it('ne cherchent pas plus loin quand les tuiles ne donnent pas de forme sous le point', () => {
        const map = mapWith([undefined], []);

        expect(piecesAround(map, { x: 0, y: 0 }, ['communes'], FILTER)).toEqual([undefined]);
        expect(map.queries).toHaveLength(1);
    });
});
