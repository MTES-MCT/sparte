import React from "react";
import { LogementVacantProgressionProps } from "../types";
import { ConsoGraph } from "@components/charts/conso/ConsoGraph";

export const LogementVacantProgression: React.FC<LogementVacantProgressionProps> = ({
  landId,
  landType,
  startYear,
  endYear,
}) => {
  return (
    <div className="fr-mb-5w">
      <h2 className="fr-h4 fr-mb-3w">Évolution de la vacance des logements</h2>
      <div className="bg-white fr-p-2w rounded">
        <ConsoGraph
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
    </div>
  );
};
