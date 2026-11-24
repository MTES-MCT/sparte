// Limite de la zone sur la carte par territoire (département à la maille EPCI). À part des autres
// tests des options : seule cette vue porte ces séries.
import { consoFrame } from '../../__fixtures__/frames';
import { BRETAGNE_BY_DEPARTEMENT, CONSO_BRETAGNE_BY_DEPARTEMENT } from '../../__fixtures__/nationalMapFixtures';
import type { MapFrame } from '../../domain/frame/types';
import { BoundaryLines, PARENT_BOUNDARY_STYLE } from '../../domain/parentBoundary';
import { HOVERED_POINT_STYLE, PARENT_BOUNDARY_CLASS, PointHandlers, buildChartOptions } from './territoryOptions';

jest.mock('./ringsLayer', () => ({ renderRings: jest.fn(), resizeRings: jest.fn() }));

const LINES: BoundaryLines = [
    [
        [0, 0],
        [250_000, 0],
        [250_000, 100_000],
        [0, 0],
    ],
];

const handlers = (): PointHandlers => ({ onLandClick: jest.fn(), onLandHover: jest.fn(), touching: () => false, onLandRead: jest.fn() });
// Un fond réel avec ou sans limite : les options ne lisent d'elle que ses lignes
const frameOf = (indicatorId: string, parentBoundary: BoundaryLines): MapFrame => {
    const frame = consoFrame('REGION_53', BRETAGNE_BY_DEPARTEMENT, indicatorId, CONSO_BRETAGNE_BY_DEPARTEMENT);
    return { ...frame, base: { ...frame.base, parentBoundary } };
};

type LineSeries = {
    type: string;
    name: string;
    className?: string;
    color?: string;
    nullColor?: string;
    lineWidth?: number;
    dashStyle?: string;
    affectsMapView?: boolean;
    enableMouseTracking?: boolean;
    showInLegend?: boolean;
    data: { geometry?: { type: string; coordinates: unknown } }[];
};
const seriesOf = (frame: MapFrame): LineSeries[] =>
    buildChartOptions(frame, { numberedInsets: false, symbolMaxSize: 40 }, handlers()).series as unknown as LineSeries[];
const boundaryOf = (frame: MapFrame): LineSeries[] => seriesOf(frame).filter((series) => series.className === PARENT_BOUNDARY_CLASS);

describe('limite de la zone', () => {
    it('ne change aucune série des fonds sans limite', () => {
        expect(seriesOf(frameOf('conso_pct_surface', [])).map((series) => series.type)).toEqual(['map', 'mapline', 'mappoint']);
        expect(boundaryOf(frameOf('conso_ha', []))).toEqual([]);
    });

    it('trace un liseré puis un tireté, au-dessus des territoires et sous les noms', () => {
        const series = seriesOf(frameOf('conso_pct_surface', LINES));
        const [casing, line] = boundaryOf(frameOf('conso_pct_surface', LINES));

        expect(series.map((each) => each.type)).toEqual(['map', 'mapline', 'mapline', 'mapline', 'mappoint']);
        expect(series.slice(2, 4)).toEqual([casing, line]);
        expect(casing).toMatchObject({ color: PARENT_BOUNDARY_STYLE.casingColor, nullColor: PARENT_BOUNDARY_STYLE.casingColor, lineWidth: PARENT_BOUNDARY_STYLE.casingWidthPx });
        expect(casing.dashStyle).toBeUndefined();
        expect(line).toMatchObject({
            color: PARENT_BOUNDARY_STYLE.color,
            nullColor: PARENT_BOUNDARY_STYLE.color,
            lineWidth: PARENT_BOUNDARY_STYLE.widthPx,
            dashStyle: PARENT_BOUNDARY_STYLE.highchartsDash,
        });
        expect(line.data).toEqual([{ geometry: { type: 'MultiLineString', coordinates: LINES } }]);
        expect(line.name).toBe('Limite : Bretagne');
    });

    it('reste sous les cercles proportionnels', () => {
        expect(seriesOf(frameOf('conso_ha', LINES)).map((series) => series.type)).toEqual(['map', 'mapline', 'mapline', 'mapline', 'mapbubble', 'mappoint']);
    });

    it('ne capte ni survol ni clic, ne recadre pas la carte et reste hors de la légende exportée', () => {
        boundaryOf(frameOf('conso_pct_surface', LINES)).forEach((series) => {
            expect(series).toMatchObject({ enableMouseTracking: false, affectsMapView: false, showInLegend: false });
        });
        // Le tracé lui-même laisse passer le pointeur vers le territoire dessous
        expect(HOVERED_POINT_STYLE).toMatch(new RegExp(`\\.${PARENT_BOUNDARY_CLASS} \\{\\s*pointer-events: none;`));
    });

    it('donne les mêmes lignes d’une carte à l’autre : seul le fond les change', () => {
        const [, first] = boundaryOf(frameOf('conso_pct_surface', LINES));
        const [, second] = boundaryOf(frameOf('conso_ha', LINES));
        expect(first.data[0].geometry.coordinates).toBe(second.data[0].geometry.coordinates);
    });
});
