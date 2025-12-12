import React from 'react';

import GenericChart from '../GenericChart';

type ArtifSyntheseChartProps = {
    land_id: string;
    land_type: string;
};

export const ArtifSyntheseChart = ({
    land_id,
    land_type,
} : ArtifSyntheseChartProps) => {
    return (
        <GenericChart
            id="artif_synthese"
            land_id={land_id}
            land_type={land_type}
            isMap={false}
            sources={["ocsge"]}
            showDataTable={false}
            showToolbar={false}
         />
    )
}
