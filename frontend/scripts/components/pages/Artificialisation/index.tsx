import React from "react";
import { LandDetailResultType } from "@services/types/land";
import { ArtificialisationProvider, useArtificialisationContext } from "./context/ArtificialisationContext";
import {
  ArtifKpiCards,
  ArtifNetFlux,
  ArtifZonage,
  ArtifRepartition,
  ArtifFluxDetail,
  ArtifChildLands,
  ArtifExplorer,
  ArtifCalculation,
} from "./components";

interface ArtificialisationProps {
  landData: LandDetailResultType;
}

const ArtificialisationContent: React.FC = () => {
  const { isLoading, error } = useArtificialisationContext();

  if (isLoading) {
    return <div role="status" aria-live="polite">Chargement...</div>;
  }

  if (error) {
    return <div role="alert" aria-live="assertive">Erreur : {String(error)}</div>;
  }

  return (
    <div className="fr-container--fluid fr-p-3w">
      <ArtifKpiCards />
      <ArtifNetFlux />
      <ArtifZonage />
      <ArtifRepartition />
      <ArtifFluxDetail />
      <ArtifChildLands />
      <ArtifExplorer />
      <ArtifCalculation />
    </div>
  );
};

export const Artificialisation: React.FC<ArtificialisationProps> = ({ landData }) => {
  if (!landData) {
    return <div role="status" aria-live="polite">Données non disponibles</div>;
  }

  return (
    <ArtificialisationProvider landData={landData}>
      <ArtificialisationContent />
    </ArtificialisationProvider>
  );
};
