import React from "react";
import GenericChart from "@components/charts/GenericChart";

interface RSEvolutionProps {
  landId: string;
  landType: string;
}

export const RSEvolution: React.FC<RSEvolutionProps> = ({ landId, landType }) => {
  return (
    <div className="fr-mb-5w">
      <h3>Évolution des résidences secondaires</h3>
      <div className="bg-white fr-p-2w rounded">
        <GenericChart
          id="dc_residences_secondaires"
          land_id={landId}
          land_type={landType}
          sources={["insee"]}
          showDataTable={true}
        />
      </div>
    </div>
  );
};
