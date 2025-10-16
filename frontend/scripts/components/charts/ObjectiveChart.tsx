import React from 'react';

import { useGetChartConfigQuery } from '@services/api';
import GenericChart from './GenericChart';

type ObjectiveChartProps = {
    land_id: string;
    land_type: string;
    target2031?: number;
    containerProps?: object;
    sources?: string[];
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
    const { data, isLoading, isFetching, error } = useGetChartConfigQuery({
        id: 'objective_chart',
        land_id,
        land_type,
        target_2031: target2031.toString()
    })

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

export default ObjectiveChart;
