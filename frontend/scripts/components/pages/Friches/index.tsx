import React from "react";
import { LandDetailResultType } from "@services/types/land";
import { FrichesProvider } from "./context/FrichesContext";
import {
  FrichesKpiCards,
  FrichesCharts,
  FrichesDataTable,
  FrichesMaps,
  FrichesExternalServices,
} from "./components";

interface FrichesProps {
  landData: LandDetailResultType;
}

const FrichesContent: React.FC = () => {
  return (
    <div className="fr-p-3w">
      <FrichesKpiCards />
      <FrichesCharts />
      <FrichesDataTable />
      <FrichesMaps />
      <FrichesExternalServices />
    </div>
  );
};

export const Friches: React.FC<FrichesProps> = ({ landData }) => {
  if (!landData) {
    return (
      <div role="status" aria-live="polite">
        Données non disponibles
      </div>
    );
  }

  return (
    <FrichesProvider landData={landData}>
      <FrichesContent />
    </FrichesProvider>
  );
};
