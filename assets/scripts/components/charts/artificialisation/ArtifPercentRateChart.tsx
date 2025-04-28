import React from 'react';
import { useGetChartConfigQuery } from '@services/api';
import GenericChart from '../GenericChart';

type ArtifPercentRateChartProps = {
    id: string;
    land_id: string;
    land_type: string;
    index?: number; // optional millesime index. When undefined, the last millesime is used
};

export const ArtifPercentRateChart = ({
    id,
    index,
    land_id,
    land_type,
} : ArtifPercentRateChartProps) => {

    let params = { id, land_id, land_type } as any

    if (index) {
        params = { ...params, index }
    }

    const { data } = useGetChartConfigQuery(params)

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
