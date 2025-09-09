import React from 'react';

import { useGetChartConfigQuery } from '@services/api';
import GenericChart from '../GenericChart';

type ArtifSyntheseChartProps = {
    land_id: string;
    land_type: string;
};

export const ArtifSyntheseChart = ({
    land_id,
    land_type,
} : ArtifSyntheseChartProps) => {
    const id = 'artif_synthese';
    const { data, isLoading, error } = useGetChartConfigQuery({ id, land_id, land_type })

    return (
        <GenericChart 
            isMap={false} 
            chartOptions={data}
            isLoading={isLoading}
            error={error}
            sources={["ocsge"]}
            showDataTable={false}
            showToolbar={false}
         />
    )
}
