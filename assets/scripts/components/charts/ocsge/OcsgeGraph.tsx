import React from 'react';

import { useGetChartConfigQuery } from '@services/api';
import GenericChart from '../GenericChart';

type OcsgeGraphProps = {
    id: string;
    land_id: string;
    land_type: string;
    departement?: string; // optional departement code. When undefined, all departements are used
    index?: number; // optional millesime index. When undefined, the last millesime is used
};

export const OcsgeGraph = ({
    id,
    index,
    land_id,
    land_type,
    departement,
} : OcsgeGraphProps) => {

    let params = { id, land_id, land_type } as any

    if (index) {
        params = { ...params, index }
    }

    if (departement) {
        params = { departement, ...params}
    }

    const { data } = useGetChartConfigQuery(params)

    return <GenericChart chartOptions={data} />
}