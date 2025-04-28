import React from 'react';
import { useGetChartConfigQuery } from '@services/api';
import GenericChart from '../GenericChart';

type ArtifPercentRateChartProps = {
    id: string;
    land_id: string;
    land_type: string;
    index: number;
};

export const ArtifPercentRateChart = ({
    id,
    index,
    land_id,
    land_type,
} : ArtifPercentRateChartProps) => {

    const { data } = useGetChartConfigQuery({ id, land_id, land_type, index })

    return (
        <GenericChart 
            chartOptions={data} 
            containerProps={{
                style: {
                    width: "100%",
                    maxHeight: "300px",
                }
            }}
        />
    )
}
