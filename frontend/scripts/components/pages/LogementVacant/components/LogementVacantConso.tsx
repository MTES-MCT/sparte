import React from "react";
import GenericChart from "@components/charts/GenericChart";
import BaseCard from "@components/ui/BaseCard";
import { useLogementVacantContext } from "../context/LogementVacantContext";

export const LogementVacantConso: React.FC = () => {
  const { landId, landType, startYear, endYear } = useLogementVacantContext();

  return (
    <BaseCard>
      <GenericChart
        id="logement_vacant_conso_progression_chart"
        land_id={landId}
        land_type={landType}
        params={{
          start_date: String(startYear),
          end_date: String(endYear),
        }}
        sources={["majic", "lovac", "rpls"]}
        showDataTable={true}
      />
    </BaseCard>
  );
};
