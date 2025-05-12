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
};

export const OcsgeGraph = ({
    id,
    land_id,
    land_type,
    isMap = false,
    params,
    containerProps,
    sources = []
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
        />
    )
}