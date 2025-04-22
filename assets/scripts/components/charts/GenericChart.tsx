import React from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';


type GenericChartProps = {
    chartOptions: Highcharts.Options;
    ref?: React.RefObject<HighchartsReact.RefObject>;
}


const GenericChart = ({ chartOptions } : GenericChartProps) => {
    Highcharts.setOptions({
        plotOptions: {
            series: {
                animation: false
            }
        }
    });

    return (
        <HighchartsReact
            highcharts={Highcharts}
            options={chartOptions}
            immutable
            updateArgs={[true, true, false]}
            containerProps={{ style: { height: "400px", width: "100%" } }}
        />
    )
}

export default React.memo(GenericChart);