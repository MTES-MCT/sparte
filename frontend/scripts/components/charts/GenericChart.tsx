import React, { useRef } from 'react';
import styled from 'styled-components';

import HighchartsReact from 'highcharts-react-official';
import * as Highcharts from 'highcharts';

import HighchartsMore from 'highcharts/highcharts-more';
import HCSoldGauge from 'highcharts/modules/solid-gauge';

import HighchartsHeatmap from 'highcharts/modules/heatmap';
import HighchartsTilemap from 'highcharts/modules/tilemap';
import HighchartsTreemap from 'highcharts/modules/treemap';
import Exporting from 'highcharts/modules/exporting';
import Fullscreen from 'highcharts/modules/full-screen';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';

import Loader from '@components/ui/Loader';
import ChartDetails from './ChartDetails';
import '../../highcharts/lineargauge.js';

// Initialize the modules
HighchartsMore(Highcharts); // Required for gauge charts
HighchartsHeatmap(Highcharts);
HighchartsTilemap(Highcharts);
HighchartsTreemap(Highcharts);
Exporting(Highcharts);
Fullscreen(Highcharts);
NoDataToDisplay(Highcharts);
HCSoldGauge(Highcharts); // Required for solid gauge charts

type GenericChartProps = {
    chartOptions: {
        highcharts_options: Highcharts.Options;
        data_table?: any;
    };
    containerProps?: React.HTMLAttributes<HTMLDivElement>;
    isMap?: boolean; // optional. When true, the chart is displayed in a map
    isLoading?: boolean;
    error?: any;
    showToolbar?: boolean;
    sources?: string[]; // ['insee', 'majic', 'gpu', 'lovac', 'ocsge', 'rpls', 'sitadel', 'cartofriches']
    children?: React.ReactNode;
    showDataTable?: boolean;
}

const LoaderContainer = styled.div`
    height: 400px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const GenericChart = ({ 
    chartOptions, 
    containerProps, 
    isMap = false,
    isLoading = false,
    error = null,
    showToolbar = true,
    sources = [],
    children,
    showDataTable = false
} : GenericChartProps) => {
    const chartRef = useRef<any>(null);

    const handleDownloadPNG = () => {
        if (chartRef.current?.chart) {
            chartRef.current.chart.exportChart({
                type: 'image/png',
            });
        }
    };

    const handleFullscreen = () => {
        if (chartRef.current?.chart) {
            chartRef.current.chart.fullscreen.toggle();
        }
    };

    if (isLoading) {
        return <LoaderContainer>
            <Loader />
        </LoaderContainer>
    }

    if (error || !chartOptions?.highcharts_options) {
        return <div>Erreur lors du chargement des données</div>
    }

    /*
    Highcharts fait parfois des mutations sur les options du graphique, ce qui peut causer des problèmes
    avec l'environnement qui ne supporte pas les mutations. Pour éviter cela, on clone les options du graphique
    avant de les passer à HighchartsReact.
    */
    const mutableChartOptions = JSON.parse(JSON.stringify(chartOptions.highcharts_options || {}))
    
    // Génère un ID basé sur le titre du graphique (utilisé pour l'accessibilité des dataTable)
    const chartId = `chart-${String(mutableChartOptions.title?.text || '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-+)|(-+$)/g, '')}`

    const shouldRedraw = true
    const oneToOne = true
    const animation = !isMap

    // Si le chart a un height défini (y compris null), on l'utilise
    // Sinon on applique le height par défaut de 400px
    const chartHeight = mutableChartOptions.chart?.height;
    const shouldUseDefaultHeight = chartHeight === undefined;

    const defaultContainerProps = {
        style: {
            height: shouldUseDefaultHeight ? "400px" : (chartHeight === null ? "auto" : `${chartHeight}px`),
            width: "100%",
            marginBottom: "2rem"
        }
    };

    const dataTable = showDataTable ? {
        headers: chartOptions.data_table?.headers,
        rows: chartOptions.data_table?.rows,
        boldFirstColumn: chartOptions.data_table?.boldFirstColumn,
        boldLastColumn: chartOptions.data_table?.boldLastColumn,
        boldLastRow: chartOptions.data_table?.boldLastRow
    } : undefined;

    return (
        <div>
            {showToolbar && (
                <div className="d-flex justify-content-end align-items-center fr-mb-2w">
                    <button
                        className="fr-btn fr-icon-download-line fr-btn--tertiary fr-btn--sm fr-mr-2w"
                        onClick={handleDownloadPNG}
                        title="Télécharger en PNG"
                    />
                    <button
                        className="fr-btn fr-icon-drag-move-2-line fr-btn--tertiary fr-btn--sm"
                        onClick={handleFullscreen}
                        title="Plein écran"
                    />
                </div>
            )}
            <HighchartsReact
                ref={chartRef}
                highcharts={Highcharts}
                options={mutableChartOptions}
                updateArgs={[shouldRedraw, oneToOne, animation]}
                containerProps={{ ...defaultContainerProps, ...containerProps }}
                constructorType={isMap ? 'mapChart' : 'chart'}
            />
            <ChartDetails
                sources={sources}
                showDataTable={showDataTable}
                chartId={chartId}
                dataTable={dataTable}
                chartTitle={mutableChartOptions.title?.text}
            >
                {children}
            </ChartDetails>
        </div>
    )
}

export default React.memo(GenericChart);