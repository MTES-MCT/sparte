import React from "react";
import { LogementVacantProgressionProps } from "../types";
import { ConsoGraph } from "@components/charts/conso/ConsoGraph";

export const LogementVacantConso: React.FC<LogementVacantProgressionProps> = ({
  landId,
  landType,
  startYear,
  endYear,
}) => {
  return (
    <div className="bg-white fr-p-2w rounded">
      <ConsoGraph
        id="logement_vacant_conso_progression_chart"
        land_id={landId}
        land_type={landType}
        params={{
          start_date: String(startYear),
          end_date: String(endYear),
        }}
        sources={["fichiers_fonciers", "lovac", "rpls"]}
        showDataTable={true}
      />
    </div>
  );
};
