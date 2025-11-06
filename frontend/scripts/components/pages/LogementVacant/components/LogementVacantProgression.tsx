import React from "react";
import { LogementVacantProgressionProps } from "../types";
import GenericChart from "@components/charts/GenericChart";

export const LogementVacantProgression: React.FC<LogementVacantProgressionProps> = ({
  landId,
  landType,
  startYear,
  endYear,
}) => {
  return (
    <div className="bg-white fr-p-2w rounded fr-mb-3w">
      <GenericChart
        id="logement_vacant_progression_chart"
        land_id={landId}
        land_type={landType}
        params={{
          start_date: String(startYear),
          end_date: String(endYear),
        }}
        sources={["lovac", "rpls"]}
        showDataTable={true}
      />
    </div>
  );
};
