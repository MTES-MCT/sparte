import { useEffect } from 'react';
import Highcharts from 'highcharts';
import highchartsExporting from 'highcharts/modules/exporting';
import exportDataModule from 'highcharts/modules/export-data';
import highchartsAccessibility from 'highcharts/modules/accessibility';
import DependencyWheel from 'highcharts/modules/dependency-wheel';
import Sankey from 'highcharts/modules/sankey';
import Treemap from 'highcharts/modules/treemap'

// Importation du type personnalisé lineargauge
import '../highcharts/lineargauge.js';

highchartsExporting(Highcharts);
exportDataModule(Highcharts);
highchartsAccessibility(Highcharts);
Sankey(Highcharts);
DependencyWheel(Highcharts);
Treemap(Highcharts);

const useHighcharts = (chartIds: string[], loading: boolean) => {
    useEffect(() => {
        if (!loading) {
            chartIds.forEach((chartId) => {
                const chartDataElement = document.getElementById(`${chartId}_data`);   
                if (chartDataElement) {
                    const chartOptions = JSON.parse(chartDataElement.textContent || '{}');
                    const chart = Highcharts.chart(chartId, chartOptions);

                    const fullscreenButton = document.querySelector<HTMLButtonElement>(
                        `[data-chart-fullscreen="${chartId}"]`
                    );
                    
                    const exportPngButton = document.querySelector<HTMLButtonElement>(
                        `[data-chart-exportpng="${chartId}"]`
                    );
                    
                    const exportCsvButton = document.querySelector<HTMLButtonElement>(
                        `[data-chart-exportcsv="${chartId}"]`
                    );

                    if (fullscreenButton) {
                        fullscreenButton.onclick = (e) => {
                            e.preventDefault();
                            chart.fullscreen.toggle();
                        };
                    }

                    if (exportPngButton) {
                        exportPngButton.onclick = (e) => {
                            e.preventDefault();
                            chart.exportChart({
                                type: 'image/png',
                                scale: 3,
                            }, {});
                        };
                    }

                    if (exportCsvButton) {
                        exportCsvButton.onclick = (e) => {
                            e.preventDefault();
                            chart.downloadCSV() 
                        };
                    }

                }
            });
        }
    }, [chartIds, loading]);
};

export default useHighcharts;
