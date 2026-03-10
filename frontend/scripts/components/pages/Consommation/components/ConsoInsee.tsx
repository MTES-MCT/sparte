import React from "react";
import GenericChart from "@components/charts/GenericChart";

interface ConsoInseeProps {
  landId: string;
  landType: string;
  startYear: number;
  endYear: number;
}

export const ConsoInsee: React.FC<ConsoInseeProps> = ({
  landId,
  landType,
  startYear,
  endYear,
}) => {
  return (
    <div className="fr-mt-7w">
      <div className="fr-mb-3w">
        <GenericChart
          id="dc_emploi_vs_conso"
          land_id={landId}
          land_type={landType}
          params={{
            start_date: String(startYear),
            end_date: String(endYear),
          }}
          sources={["insee", "majic"]}
          showDataTable={true}
        />
      </div>
    </div>
  );
};
