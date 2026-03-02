import React from "react";
import { LandDetailResultType } from "@services/types/land";
import Triptych from "@components/ui/Triptych";
import { OcsgeDrawerProvider, useOcsgeDrawer } from "@components/features/ocsge/OcsgeDrawerContext";
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

const ImpermeabilisationPageContent: React.FC = () => {
  const { childLandTypes } = useImpermeabilisationContext();
  const ocsgeDrawer = useOcsgeDrawer();

  return (
    <div className="fr-container--fluid fr-p-3w">
      <Triptych
        className="fr-mb-5w"
        definition={{
          preview: "L'imperméabilisation des sols est définie comme : 1° Surfaces dont les sols sont imperméabilisés en raison du bâti (constructions, aménagements, ouvrages ou installations). 2° Surfaces dont les sols sont imperméabilisés en raison d'un revêtement (artificiel, asphalté, bétonné, couvert de pavés ou de dalles).",
          content: (
            <>
              <p>L'imperméabilisation des sols est définie comme :</p>
              <ul>
                <li>
                  1° Surfaces dont les sols sont imperméabilisés en{" "}
                  <strong>raison du bâti</strong> (constructions, aménagements,
                  ouvrages ou installations).
                </li>
                <li>
                  2° Surfaces dont les sols sont imperméabilisés en{" "}
                  <strong>raison d'un revêtement</strong> (artificiel, asphalté,
                  bétonné, couvert de pavés ou de dalles).
                </li>
              </ul>
            </>
          ),
        }}
        donnees={{
          preview: "La mesure de l'imperméabilisation d'un territoire repose sur la donnée OCS GE (Occupation du Sol à Grande Échelle), base de données de référence pour la description de l'occupation du sol.",
          content: null,
        }}
        onDonneesClick={ocsgeDrawer?.openDrawer}
      />
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

const ImpermeabilisationContent: React.FC = () => {
  const { name, millesimes, isInterdepartemental } = useImpermeabilisationContext();

  return (
    <OcsgeDrawerProvider millesimes={millesimes} territoryName={name} isInterdepartemental={isInterdepartemental}>
      <ImpermeabilisationPageContent />
    </OcsgeDrawerProvider>
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
