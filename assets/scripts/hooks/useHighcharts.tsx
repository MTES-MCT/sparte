import { useEffect } from 'react';
import Highcharts from 'highcharts';
import DependencyWheel from 'highcharts/modules/dependency-wheel';
import Sankey from 'highcharts/modules/sankey';

Sankey(Highcharts);
DependencyWheel(Highcharts);

const useHighcharts = (chartIds: string[], loading: boolean) => {
    useEffect(() => {
        if (!loading) {
            chartIds.forEach((chartId) => {
                const chartDataElement = document.getElementById(`${chartId}_data`);   
                if (chartDataElement) {
                    const chartOptions = JSON.parse(chartDataElement.textContent || '{}');
                Highcharts.chart(chartId, chartOptions);
                }
            });
        }
    }, [chartIds, loading]);
};

export default useHighcharts;