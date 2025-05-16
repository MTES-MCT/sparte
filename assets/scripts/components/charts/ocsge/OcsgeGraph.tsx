import React from 'react';

import { useGetChartConfigQuery } from '@services/api';
import GenericChart from '../GenericChart';

type OcsgeGraphProps = {
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

export const OcsgeGraph = ({
    id,
    land_id,
    land_type,
    isMap = false,
    params,
    containerProps,
    sources = [],
    children,
    showDataTable = false
} : OcsgeGraphProps) => {
    const { data, isLoading, error } = useGetChartConfigQuery({ id, land_id, land_type, ...params })

    return (
        <GenericChart 
            isMap={isMap} 
            chartOptions={data}
            containerProps={containerProps}
            isLoading={isLoading}
            error={error}
            sources={sources}
            showDataTable={showDataTable}
        >
            {children}
        </GenericChart>
    )
}
