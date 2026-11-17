import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsAccessibility from 'highcharts/modules/accessibility';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsOfflineExporting from 'highcharts/modules/offline-exporting';
import HighchartsFullscreen from 'highcharts/modules/full-screen';
import { theme } from '@theme';
import BaseCard from '@components/ui/BaseCard';
import Button from '@components/ui/Button';
import ChartDataSource from '@components/charts/ChartDataSource';
import ChartExplorer from '@components/charts/ChartExplorer';
import type { DataSource } from '@components/charts/GenericChart';
import { downloadChartPng } from '@components/charts/downloadChartPng';
import type { ScatterModel } from '../domain/frame/types';
import type { LandHighlight } from '../domain/landHighlight';
import { SCATTER_HEIGHT, registerTickHelper, scatterOptions, scatterTable } from './scatterOptions';

HighchartsAccessibility(Highcharts);
HighchartsExporting(Highcharts);
HighchartsOfflineExporting(Highcharts);
HighchartsFullscreen(Highcharts);
registerTickHelper(Highcharts);

// Carte du graphique, à l'image de celle des graphiques du serveur qui l'entourent dans la
// colonne : boutons, tracé, puis sources et fenêtre de détails

const Body = styled.div`
    padding: ${theme.spacing.lg};
`;

const Toolbar = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: ${theme.spacing.sm};
    margin-bottom: ${theme.spacing.md};
`;

const Footer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing.sm};
    border-top: 1px solid ${theme.colors.border};
`;

const Method = styled.p`
    margin: 0;
    font-size: ${theme.fontSize.sm};
`;

// Les deux taux viennent des fichiers fonciers (consommation) et des recensements de l'Insee
const SOURCES: DataSource[] = ['majic', 'insee'];

// Props du conteneur du graphique, de même identité à chaque rendu : en changer le recréerait
const CONTAINER_PROPS = { style: { height: `${SCATTER_HEIGHT}px`, width: '100%' } };

// Point du nuage qui porte l'identifiant d'un territoire, s'il y en a un
const pointOf = (chart: Highcharts.Chart | undefined, landId: string | null): Highcharts.Point | null => {
    const found = landId === null ? undefined : chart?.get(landId);
    return found instanceof Highcharts.Point ? found : null;
};

interface ScatterChartProps {
    // Nuage de la carte affichée
    model: ScatterModel;
    // Canal par lequel le nuage et la carte se désignent le territoire survolé
    highlight: LandHighlight;
}

// Nuage de points des territoires affichés par une carte bivariée. Le graphique est recréé à
// chaque vue, comme la carte : une mise à jour en place, où Highcharts retrouve chaque point par
// son identifiant, coûte plus cher dès quelques centaines de points (mesuré).
const ScatterChart: React.FC<ScatterChartProps> = ({ model: shownModel, highlight }) => {
    const chartRef = useRef<HighchartsReact.RefObject>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    // Le nuage suit la carte d'un rendu : elle est peinte d'abord, sans attendre qu'il soit dessiné
    const model = useDeferredValue(shownModel);

    const options = useMemo(
        () =>
            scatterOptions(model, {
                pointEvents: {
                    // Highcharts passe le point survolé en cible de l'événement
                    mouseOver: (event: Event) => highlight.publish('scatter', (event.target as unknown as Highcharts.Point).options.id ?? null),
                    mouseOut: () => highlight.publish('scatter', null),
                },
            }),
        [model, highlight],
    );

    // Territoire survolé sur la carte : son point est dessiné par-dessus les autres, agrandi et cerclé
    useEffect(() => {
        let shown: string | null = null;
        return highlight.subscribe('scatter', (landId) => {
            const chart = chartRef.current?.chart;
            pointOf(chart, shown)?.setState('');
            shown = landId;
            pointOf(chart, landId)?.setState('hover');
        });
    }, [highlight]);

    return (
        <BaseCard>
            <Body>
                <Toolbar>
                    <Button variant="secondary" size="sm" icon="bi bi-download" onClick={() => downloadChartPng(chartRef.current?.chart)} title="Télécharger en PNG">
                        PNG
                    </Button>
                    <Button variant="secondary" size="sm" icon="bi bi-fullscreen" onClick={() => chartRef.current?.chart?.fullscreen.toggle()} title="Plein écran">
                        Plein écran
                    </Button>
                </Toolbar>
                <HighchartsReact ref={chartRef} highcharts={Highcharts} options={options} immutable containerProps={CONTAINER_PROPS} />
            </Body>
            <Footer>
                <ChartDataSource sources={SOURCES} displayMode="tag" />
                <Button variant="tertiary" size="sm" icon="bi bi-chevron-right" iconPosition="right" onClick={() => setDetailsOpen(true)} type="button">
                    Détails données et calculs
                </Button>
            </Footer>
            {/* Montée à l'ouverture seulement : elle dessine un second nuage et un tableau d'une ligne par territoire */}
            {detailsOpen && (
                <ChartExplorer isOpen onClose={() => setDetailsOpen(false)} chartTitle={model.title} chartOptions={scatterOptions(model)} sources={SOURCES} dataTable={scatterTable(model)}>
                    <Method>{model.method}</Method>
                </ChartExplorer>
            )}
        </BaseCard>
    );
};

export default React.memo(ScatterChart);
