import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type * as Highcharts from 'highcharts';
import { scatterModel, scatterPoints } from '../__fixtures__/scatterFixtures';
import { createLandHighlight } from '../domain/landHighlight';
import ScatterChart from './ScatterChart';

// Le nuage de points d'une carte bivariée, dessiné par le vrai Highcharts. Deux bouchons : la
// fenêtre de détails des diagnostics, qui consigne ce qu'on lui remet, et le téléchargement en image.

jest.mock('@components/charts/ChartExplorer', () => ({ __esModule: true, default: MockChartExplorer }));
jest.mock('@components/charts/downloadChartPng', () => ({ __esModule: true, downloadChartPng: (chart: Highcharts.Chart) => mockDownloads.push(chart) }));

type ExplorerProps = {
    isOpen: boolean;
    onClose: () => void;
    chartTitle: string;
    chartOptions: Highcharts.Options;
    sources: string[];
    dataTable: { headers: string[]; rows: { name: string; data: string[] }[] };
    children: React.ReactNode;
};

const mockExplorer = { props: null as ExplorerProps | null };
const mockDownloads: Highcharts.Chart[] = [];

function MockChartExplorer(props: ExplorerProps) {
    mockExplorer.props = props;
    return (
        <div role="dialog" aria-label={props.chartTitle}>
            {props.children}
            <button type="button" onClick={props.onClose}>
                Fermer
            </button>
        </div>
    );
}

const MODEL = scatterModel(scatterPoints(12));

// Graphique Highcharts du nuage affiché : le seul de la page d'essai
const chartOf = (container: HTMLElement): Highcharts.Chart => {
    const index = Number(container.querySelector('[data-highcharts-chart]').getAttribute('data-highcharts-chart'));
    return (jest.requireActual('highcharts') as typeof Highcharts).charts[index];
};
// Ce que les tests lisent et déclenchent sur un point, hors des types publics de Highcharts
type LivePoint = Highcharts.Point & { state?: string; firePointEvent: (event: string) => void };
const pointsOf = (chart: Highcharts.Chart): LivePoint[] => chart.series[0].points as LivePoint[];
const hoveredPoints = (chart: Highcharts.Chart): string[] =>
    pointsOf(chart)
        .filter((point) => point.state === 'hover')
        .map((point) => point.options.id);

beforeEach(() => {
    mockExplorer.props = null;
    mockDownloads.length = 0;
});

describe('carte du graphique', () => {
    it('dessine le nuage du modèle, avec son titre', () => {
        const { container } = render(<ScatterChart model={MODEL} highlight={createLandHighlight()} />);

        expect(container.querySelector('.highcharts-title').textContent).toBe('Un point par département');
        expect(chartOf(container).series[0].points).toHaveLength(12);
        expect(container.querySelectorAll('.highcharts-national-map-scatter-points path')).toHaveLength(9);
    });

    it('réserve au graphique la hauteur de son emplacement', () => {
        const { container } = render(<ScatterChart model={MODEL} highlight={createLandHighlight()} />);

        expect((container.querySelector('[data-highcharts-chart]') as HTMLElement).style.height).toBe('360px');
    });

    it('cite ses sources : les fichiers fonciers et l’Insee', () => {
        render(<ScatterChart model={MODEL} highlight={createLandHighlight()} />);

        expect(screen.getByText('Cerema')).toBeInTheDocument();
        expect(screen.getByText('INSEE')).toBeInTheDocument();
    });

    it('télécharge l’image du graphique affiché', () => {
        const { container } = render(<ScatterChart model={MODEL} highlight={createLandHighlight()} />);
        fireEvent.click(screen.getByRole('button', { name: 'PNG' }));

        expect(mockDownloads).toEqual([chartOf(container)]);
    });

    it('propose le plein écran, comme les graphiques voisins', () => {
        render(<ScatterChart model={MODEL} highlight={createLandHighlight()} />);

        expect(screen.getByRole('button', { name: 'Plein écran' })).toBeInTheDocument();
    });

    it('recrée le graphique quand la carte affichée change', () => {
        const highlight = createLandHighlight();
        const { container, rerender } = render(<ScatterChart model={MODEL} highlight={highlight} />);
        const first = chartOf(container);
        rerender(<ScatterChart model={scatterModel(scatterPoints(20), { title: 'Un point par EPCI' })} highlight={highlight} />);

        expect(chartOf(container)).not.toBe(first);
        expect(container.querySelector('.highcharts-title').textContent).toBe('Un point par EPCI');
        expect(chartOf(container).series[0].points).toHaveLength(20);
    });

    it('garde son graphique quand la page est rendue de nouveau sans que la carte change', () => {
        const highlight = createLandHighlight();
        const { container, rerender } = render(<ScatterChart model={MODEL} highlight={highlight} />);
        const first = chartOf(container);
        rerender(<ScatterChart model={MODEL} highlight={highlight} />);

        expect(chartOf(container)).toBe(first);
    });
});

describe('fenêtre de détails', () => {
    it('n’est pas montée tant qu’elle n’est pas ouverte', () => {
        render(<ScatterChart model={MODEL} highlight={createLandHighlight()} />);

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('s’ouvre sur le nuage, son tableau de données, ses sources et sa méthode', () => {
        render(<ScatterChart model={MODEL} highlight={createLandHighlight()} />);
        fireEvent.click(screen.getByRole('button', { name: 'Détails données et calculs' }));

        expect(screen.getByRole('dialog', { name: 'Un point par département' })).toBeInTheDocument();
        expect(screen.getByText('Un point par département affiché.')).toBeInTheDocument();
        expect(mockExplorer.props.sources).toEqual(['majic', 'insee']);
        expect(mockExplorer.props.dataTable.headers).toHaveLength(3);
        expect(mockExplorer.props.dataTable.rows).toHaveLength(12);
    });

    it('reçoit des options sans fonction, où Highcharts dessine lui-même les points', () => {
        render(<ScatterChart model={MODEL} highlight={createLandHighlight()} />);
        fireEvent.click(screen.getByRole('button', { name: 'Détails données et calculs' }));
        const { chartOptions } = mockExplorer.props;

        expect(JSON.parse(JSON.stringify(chartOptions))).toEqual(chartOptions);
        expect(chartOptions.plotOptions.scatter.marker.enabled).toBe(true);
    });

    it('se referme', () => {
        render(<ScatterChart model={MODEL} highlight={createLandHighlight()} />);
        fireEvent.click(screen.getByRole('button', { name: 'Détails données et calculs' }));
        fireEvent.click(screen.getByRole('button', { name: 'Fermer' }));

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});

describe('territoire survolé', () => {
    it('met en avant le point du territoire que la carte désigne, puis plus aucun', () => {
        const highlight = createLandHighlight();
        const { container } = render(<ScatterChart model={MODEL} highlight={highlight} />);
        act(() => highlight.publish('map', 'T4'));

        expect(hoveredPoints(chartOf(container))).toEqual(['T4']);

        act(() => highlight.publish('map', null));

        expect(hoveredPoints(chartOf(container))).toEqual([]);
    });

    it('passe d’un territoire à l’autre sans laisser le premier en avant', () => {
        const highlight = createLandHighlight();
        const { container } = render(<ScatterChart model={MODEL} highlight={highlight} />);
        act(() => highlight.publish('map', 'T4'));
        act(() => highlight.publish('map', 'T9'));

        expect(hoveredPoints(chartOf(container))).toEqual(['T9']);
    });

    it('ignore un territoire que le nuage ne place pas', () => {
        const highlight = createLandHighlight();
        const { container } = render(<ScatterChart model={MODEL} highlight={highlight} />);

        expect(() => act(() => highlight.publish('map', 'inconnu'))).not.toThrow();
        expect(hoveredPoints(chartOf(container))).toEqual([]);
    });

    it('retrouve le territoire dans le graphique recréé pour une autre vue', () => {
        const highlight = createLandHighlight();
        const { container, rerender } = render(<ScatterChart model={MODEL} highlight={highlight} />);
        act(() => highlight.publish('map', 'T4'));
        rerender(<ScatterChart model={scatterModel(scatterPoints(20))} highlight={highlight} />);
        act(() => highlight.publish('map', 'T15'));

        expect(hoveredPoints(chartOf(container))).toEqual(['T15']);
    });

    it('désigne à la carte le point survolé dans le nuage, puis plus aucun', () => {
        const highlight = createLandHighlight();
        const onMap = jest.fn();
        highlight.subscribe('map', onMap);
        const { container } = render(<ScatterChart model={MODEL} highlight={highlight} />);
        const point = pointsOf(chartOf(container))[6];
        act(() => point.firePointEvent('mouseOver'));
        act(() => point.firePointEvent('mouseOut'));

        expect(onMap.mock.calls).toEqual([['T6'], [null]]);
    });

    it('cesse d’écouter la carte quand il est retiré de la page', () => {
        const highlight = createLandHighlight();
        const { unmount } = render(<ScatterChart model={MODEL} highlight={highlight} />);
        unmount();

        expect(() => highlight.publish('map', 'T4')).not.toThrow();
    });
});
