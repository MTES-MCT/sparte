import React, { useRef } from 'react';

import HighchartsReact from 'highcharts-react-official';
import * as Highcharts from 'highcharts';
import styled from 'styled-components';

import HighchartsHeatmap from 'highcharts/modules/heatmap';
import HighchartsTilemap from 'highcharts/modules/tilemap';
import Exporting from 'highcharts/modules/exporting';
import Fullscreen from 'highcharts/modules/full-screen';

import Loader from '@components/ui/Loader';
import ChartSource from '@components/charts/ChartSource';

// Initialize the modules
HighchartsHeatmap(Highcharts);
HighchartsTilemap(Highcharts);
Exporting(Highcharts);
Fullscreen(Highcharts);

type GenericChartProps = {
    chartOptions: Highcharts.Options;
    containerProps?: React.HTMLAttributes<HTMLDivElement>;
    isMap?: boolean; // optional. When true, the chart is displayed in a map
    isLoading?: boolean;
    error?: any;
    showToolbar?: boolean;
    sources?: string[]; // ['insee', 'majic', 'gpu', 'lovac', 'ocsge', 'rpls', 'sitadel']
}

const GenericChart = ({ 
    chartOptions, 
    containerProps, 
    isMap = false,
    isLoading = false,
    error = null,
    showToolbar = true,
    sources = []
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
        return <div style={{ height: "400px", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Loader />
        </div>
    }

    if (error || !chartOptions) {
        return <div>Erreur lors du chargement des données</div>
    }

    const mutableChartOptions = JSON.parse(JSON.stringify(chartOptions || {}))
    
    // Génère un ID unique basé sur le titre du graphique
    const chartId = `chart-${String(mutableChartOptions.title.text)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')}`

    const shouldRedraw = true
    const oneToOne = true
    const animation = !isMap

    const defaultContainerProps = {
        style: { height: "400px", width: "100%", marginBottom: "2rem" }
    };

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
            {sources.length > 0 && <ChartSource sources={sources} chartId={chartId} />}
        </div>
    )
}

export default React.memo(GenericChart);