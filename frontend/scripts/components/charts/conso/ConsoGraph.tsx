import React from 'react';

import { useGetChartConfigQuery } from '@services/api';
import GenericChart from '../GenericChart';

type ConsoGraphProps = {
    id: string;
    land_id: string;
    land_type: string;
    params?: object;
    containerProps?: object;
    sources?: string[];
    children?: React.ReactNode;
    showDataTable?: boolean;
};

export const ConsoGraph = ({
    id,
    land_id,
    land_type,
    params,
    containerProps,
    sources = [],
    children,
    showDataTable = false
} : ConsoGraphProps) => {
    const { data, isLoading, isFetching, error } = useGetChartConfigQuery({ id, land_id, land_type, ...params })

    // Afficher le loader pendant le chargement initial ou le refetch
    const isLoadingOrFetching = isLoading || isFetching;

    return (
        <GenericChart
            chartOptions={data}
            containerProps={containerProps}
            isLoading={isLoadingOrFetching}
            error={error}
            sources={sources}
            showDataTable={showDataTable}
        >
            {children}
        </GenericChart>
    )
}
