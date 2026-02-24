import React from "react";
import { LandDetailResultType } from "@services/types/land";
import {
  LogementVacantProvider,
  useLogementVacantContext,
} from "./context/LogementVacantContext";
import {
  LogementVacantKpiCards,
  LogementVacantTaux,
  LogementVacantConso,
  LogementVacantAutorisation,
  LogementVacantMaps,
  LogementVacantExternalServices,
} from "./components";

interface LogementVacantProps {
  landData: LandDetailResultType;
}

const LogementVacantContent: React.FC = () => {
  const { childLandTypes } = useLogementVacantContext();

  return (
    <div className="fr-container--fluid fr-p-3w">
      <div className="fr-grid-row">
        <div className="fr-col-12">
          <LogementVacantKpiCards />
        </div>

        <div className="fr-col-12 fr-mb-7w">
          <h2 className="fr-h4 fr-mb-3w">
            Évolution du taux de vacance des logements sur le territoire
          </h2>
          <LogementVacantTaux />
        </div>

        <div className="fr-col-12 fr-mb-7w">
          <h2 className="fr-h4 fr-mb-3w">
            Logements vacants et consommation d'espaces NAF
          </h2>
          <LogementVacantConso />
        </div>

        <div className="fr-col-12 fr-mb-7w">
          <h2 className="fr-h4 fr-mb-3w">
            Logements vacants et autorisations d'urbanisme
          </h2>
          <LogementVacantAutorisation />
        </div>

        {childLandTypes.length > 0 && (
          <div className="fr-col-12">
            <LogementVacantMaps />
          </div>
        )}

        <div className="fr-col-12">
          <LogementVacantExternalServices />
        </div>
      </div>
    </div>
  );
};

export const LogementVacant: React.FC<LogementVacantProps> = ({ landData }) => {
  if (!landData) {
    return (
      <div role="status" aria-live="polite">
        Données non disponibles
      </div>
    );
  }

  return (
    <LogementVacantProvider landData={landData}>
      <LogementVacantContent />
    </LogementVacantProvider>
  );
};

export default LogementVacant;
