import React from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Loader from "@components/ui/Loader";



const GenericChart = ({ chartOptions } : { chartOptions: Highcharts.Options}) => {
    Highcharts.setOptions({
        plotOptions: {
            series: {
                animation: false
            }
        }
    });
    if (!chartOptions) {
        return <div style={{ height: '400px', display: 'flex', alignItems: 'center'}}>
            <Loader />
        </div>
    }

    return (
        <HighchartsReact
            highcharts={Highcharts}
            options={chartOptions}
            immutable
            updateArgs={[true, true, false]}
        />
    )
}

export default React.memo(GenericChart);