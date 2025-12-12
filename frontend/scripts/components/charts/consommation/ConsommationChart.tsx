import React from 'react';

import GenericChart from '../GenericChart';

type ConsommationChartProps = {
    id: string;
    land_id: string;
    land_type: string;
    isMap?: boolean;
    params?: object;
    containerProps?: object;
    sources?: string[];
    children?: React.ReactNode;
    showDataTable?: boolean;
    showToolbar?: boolean;
};

export const ConsommationChart = ({
    id,
    land_id,
    land_type,
    isMap = false,
    params,
    containerProps,
    sources = [],
    children,
    showDataTable = false,
    showToolbar = true,
} : ConsommationChartProps) => {
    return (
        <GenericChart
            id={id}
            land_id={land_id}
            land_type={land_type}
            params={params}
            isMap={isMap}
            containerProps={containerProps}
            sources={["majic"]}
            showDataTable={showDataTable}
            showToolbar={showToolbar}
        >
            {children}
        </GenericChart>
    )
}
