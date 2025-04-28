import React from 'react';

import HighchartsReact from 'highcharts-react-official';
import * as Highcharts from 'highcharts';
import * as Highmaps from 'highcharts/highmaps';
import HighchartsMore from 'highcharts/highcharts-more'

import HighchartsHeatmap from 'highcharts/modules/heatmap';
import HighchartsTilemap from 'highcharts/modules/tilemap';
import data from 'highcharts/modules/data';

// Initialize the module
HighchartsHeatmap(Highcharts);
HighchartsTilemap(Highcharts);

type GenericChartProps = {
    chartOptions: Highcharts.Options;
    containerProps?: React.HTMLAttributes<HTMLDivElement>;
    isMap?: boolean; // optional. When true, the chart is displayed in a map
}

Highcharts.setOptions({
    plotOptions: {
        series: {
            animation: false
        }
    }
});
data(Highmaps);


const GenericChart = ({ chartOptions,containerProps, isMap = false } : GenericChartProps) => {
    /*
        Highcharts fait parfois des mutations sur les options du graphique, ce qui peut causer des problèmes
        avec l'environnement qui ne supporte pas les mutations. Pour éviter cela, on clone les options du graphique
        avant de les passer à HighchartsReact.
    */
    const mutableChartOptions = JSON.parse(JSON.stringify(chartOptions || {}))

    const shouldRedraw = true
    const oneToOne = true
    const animation = false

    const defaultContainerProps = {
        style: { height: "400px", width: "100%" }
    };

    return (
        <HighchartsReact
            highcharts={isMap ? Highmaps : Highcharts}
            options={mutableChartOptions}
            immutable
            updateArgs={[shouldRedraw, oneToOne, animation]}
            containerProps={{ ...defaultContainerProps, ...containerProps }}
            constructorType={isMap ? 'mapChart' : 'chart'}
        />
    )
}

export default React.memo(GenericChart);