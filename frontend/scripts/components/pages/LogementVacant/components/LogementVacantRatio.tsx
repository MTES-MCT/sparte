import React from "react";
import { LogementVacantProgressionProps } from "../types";
import { ConsoGraph } from "@components/charts/conso/ConsoGraph";

export const LogementVacantRatio: React.FC<LogementVacantProgressionProps> = ({
  landId,
  landType,
  startYear,
  endYear,
}) => {
  return (
    <div className="bg-white fr-p-2w rounded">
      <ConsoGraph
        id="logement_vacant_ratio_progression_chart"
        land_id={landId}
        land_type={landType}
        params={{
          start_date: String(startYear),
          end_date: String(endYear),
        }}
        sources={["lovac", "rpls"]}
        showDataTable={true}
      >
        <div className="fr-mt-3w">
          <p className="fr-text--sm fr-mb-0">
            <strong>Détails du calcul :</strong> Taux de vacance &gt; 2 ans (parc privé) et &gt; 3 mois (bailleurs sociaux)
          </p>
        </div>
      </ConsoGraph>
    </div>
  );
};
