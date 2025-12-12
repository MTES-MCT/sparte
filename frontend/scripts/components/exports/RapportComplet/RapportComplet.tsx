import React from "react";
import { LandDetailResultType } from "@services/types/land";
import ExportLayout from "../ExportLayout";
import TerritoryInfoPage from "../TerritoryInfoPage";
import DefinitionSection from "../sections/DefinitionSection";
import TrajectoireSection from "../sections/TrajectoireSection";
import ConsoDetailSection from "../sections/ConsoDetailSection";
import ComparisonSection from "../sections/ComparisonSection";
import ArtifDefinitionSection from "../sections/ArtifDefinitionSection";
import ArtifDetailSection from "../sections/ArtifDetailSection";
import RepartitionSection from "../sections/RepartitionSection";

interface RapportCompletContentProps {
  landData: LandDetailResultType;
}

const RapportCompletContent: React.FC<RapportCompletContentProps> = ({ landData }) => {
  // Configuration centralisée des années de consommation
  const consoStartYear = 2011;
  const consoEndYear = 2023;

  return (
    <>
      <TerritoryInfoPage landData={landData} consoStartYear={consoStartYear} consoEndYear={consoEndYear} />
      <DefinitionSection />
      <TrajectoireSection landData={landData} />
      <ConsoDetailSection landData={landData} startYear={consoStartYear} endYear={consoEndYear} />
      <ComparisonSection landData={landData} startYear={consoStartYear} endYear={consoEndYear} />
      <ArtifDefinitionSection />
      <ArtifDetailSection landData={landData} />
      <RepartitionSection landData={landData} />
    </>
  );
};

interface RapportCompletProps {
  landType: string;
  landId: string;
}

const RapportComplet: React.FC<RapportCompletProps> = ({ landType, landId }) => {
  return (
    <ExportLayout
      landType={landType}
      landId={landId}
      reportTitle="Rapport Complet"
      reportSubtitle="Diagnostic territorial de sobriété foncière"
    >
      {(landData) => <RapportCompletContent landData={landData} />}
    </ExportLayout>
  );
};

export default RapportComplet;
