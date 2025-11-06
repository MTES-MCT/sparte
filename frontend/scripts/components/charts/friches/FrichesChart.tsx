import React from 'react';

import GenericChart from '../GenericChart';

type FrichesChartProps = {
    id: string;
    land_id: string;
    land_type: string;
    isMap?: boolean;
    params?: object;
    containerProps?: object;
    sources?: string[];
    children?: React.ReactNode;
    showDataTable?: boolean;
};

export const FrichesChart = ({
    id,
    land_id,
    land_type,
    isMap = false,
    params,
    containerProps,
    sources = [],
    children,
    showDataTable = false
} : FrichesChartProps) => {
    return (
        <GenericChart
            id={id}
            land_id={land_id}
            land_type={land_type}
            params={params}
            isMap={isMap}
            containerProps={containerProps}
            sources={sources}
            showDataTable={showDataTable}
        >
            {children}
        </GenericChart>
    )
}
