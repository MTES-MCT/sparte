import React from 'react';

import GenericChart, { DataSource } from './GenericChart';

type ObjectiveChartProps = {
    land_id: string;
    land_type: string;
    target2031?: number;
    containerProps?: object;
    sources?: DataSource[];
    children?: React.ReactNode;
    showDataTable?: boolean;
};

export const ObjectiveChart = ({
    land_id,
    land_type,
    target2031 = 50,
    containerProps,
    sources = [],
    children,
    showDataTable = false
} : ObjectiveChartProps) => {
    return (
        <GenericChart
            id="objective_chart"
            land_id={land_id}
            land_type={land_type}
            params={{ target_2031: target2031.toString() }}
            containerProps={containerProps}
            sources={sources}
            showDataTable={showDataTable}
        >
            {children}
        </GenericChart>
    )
}

export default ObjectiveChart;
