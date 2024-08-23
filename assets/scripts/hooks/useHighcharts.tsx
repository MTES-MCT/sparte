import { useEffect } from 'react';
import Highcharts from 'highcharts';
import highchartsExporting from 'highcharts/modules/exporting';
import exportDataModule from 'highcharts/modules/export-data';
import highchartsAccessibility from 'highcharts/modules/accessibility';
import DependencyWheel from 'highcharts/modules/dependency-wheel';
import Sankey from 'highcharts/modules/sankey';

highchartsExporting(Highcharts);
exportDataModule(Highcharts);
highchartsAccessibility(Highcharts);
Sankey(Highcharts);
DependencyWheel(Highcharts);

const useHighcharts = (chartIds: string[], loading: boolean) => {
    useEffect(() => {
        if (!loading) {
            chartIds.forEach((chartId) => {
                const chartDataElement = document.getElementById(`${chartId}_data`);   
                if (chartDataElement) {
                    const chartOptions = JSON.parse(chartDataElement.textContent || '{}');
                    const chart = Highcharts.chart(chartId, chartOptions);

                    const fullscreenButton = document.querySelector(`[data-chart-fullscreen="${chartId}"]`) as HTMLButtonElement;
                    const exportPngButton = document.querySelector(`[data-chart-exportpng="${chartId}"]`) as HTMLButtonElement;
                    const exportCsvButton = document.querySelector(`[data-chart-exportcsv="${chartId}"]`) as HTMLButtonElement;

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