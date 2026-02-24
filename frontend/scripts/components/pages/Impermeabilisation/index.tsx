import React from "react";
import { LandDetailResultType } from "@services/types/land";
import { ImpermeabilisationProvider, useImpermeabilisationContext } from "./context/ImpermeabilisationContext";
import {
  ImperKpiCards,
  ImperNetFlux,
  ImperZonage,
  ImperRepartition,
  ImperFluxDetail,
  ImperChildLands,
  ImperExplorer,
} from "./components";

interface ImpermeabilisationProps {
  landData: LandDetailResultType;
}

const ImpermeabilisationContent: React.FC = () => {
  const { childLandTypes } = useImpermeabilisationContext();

  return (
    <div className="fr-container--fluid fr-p-3w">
      <ImperKpiCards />
      <ImperNetFlux />
      <ImperZonage />
      <ImperRepartition />
      <ImperFluxDetail />
      {childLandTypes.length > 0 && <ImperChildLands />}
      <ImperExplorer />
    </div>
  );
};

export const Impermeabilisation: React.FC<ImpermeabilisationProps> = ({
  landData,
}) => {
  if (!landData) {
    return <div role="status" aria-live="polite">Données non disponibles</div>;
  }

  return (
    <ImpermeabilisationProvider landData={landData}>
      <ImpermeabilisationContent />
    </ImpermeabilisationProvider>
  );
};
