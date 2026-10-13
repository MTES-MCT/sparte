import React from "react";
import { LandDetailResultType } from "@services/types/land";
import { ComparisonLand, UserLandPreferenceResultType } from "@services/types/project";
import { useNearestTerritories, useComparisonTerritories } from "./hooks";
import { ConsommationControlsProvider, useConsommationControls } from "./context/ConsommationControlsContext";
import { TopBarContent } from "@components/layout/TopBarContent";
import Triptych from "@components/ui/Triptych";
import {
  ConsommationControls,
  ConsoAnnuelle,
  ConsoCarroyage,
  ConsoDemography,
  ConsoComparison,
} from "./components";

interface ConsommationProps {
  landData: LandDetailResultType;
  preference?: UserLandPreferenceResultType;
}

const ConsommationContent: React.FC<ConsommationProps> = ({ landData, preference }) => {
  const { land_id, land_type, name, child_land_types, departements } = landData || {};

  // Le carroyage n'est disponible que pour la France hexagonale
  const isDromCom = departements?.length > 0 && departements.some((dep) => dep.startsWith("97"));

  const {
    startYear,
    endYear,
    childType,
  } = useConsommationControls();

  const { territories: nearestTerritories } = useNearestTerritories(land_id, land_type);

  const defaultTerritories: ComparisonLand[] = React.useMemo(
    () => nearestTerritories.map((t) => ({
      land_type: t.land_type,
      land_id: t.land_id,
      name: t.name,
    })),
    [nearestTerritories]
  );

  const {
    territories,
    comparisonLandIds,
    isDefaultSelection,
    excludedTerritories,
    handleAddTerritory,
    handleRemoveTerritory,
    handleResetTerritories,
  } = useComparisonTerritories(land_id, land_type, name, {
    landId: land_id,
    landType: land_type,
    comparisonLands: preference?.comparison_lands ?? [],
    defaultTerritories,
  });

  if (!landData) {
    return (
      <div role="status" aria-live="polite">
        Données non disponibles
      </div>
    );
  }

  return (
    <>
      <TopBarContent>
        <ConsommationControls />
      </TopBarContent>

      <div className="fr-container--fluid fr-p-3w">
        <Triptych
          className="fr-mb-5w"
          definition={{
            preview: "La consommation d'ENAF est entendue comme « la création ou l'extension effective d'espaces urbanisés sur le territoire concerné » (article 194 de la loi Climat et résilience).",
            content: (
              <>
                <p>La consommation d'espaces naturels, agricoles et forestiers (ENAF) est entendue comme <strong>« la création ou l'extension effective d'espaces urbanisés sur le territoire concerné »</strong> (article 194 de la loi Climat et résilience).</p>
                <p>Cet article exprime le fait que le caractère urbanisé d'un espace est la traduction de l'usage qui en est fait.</p>
                <p>Si l'artificialisation des sols traduit globalement un changement de couverture physique, la consommation traduit un changement d'usage. À titre d'exemple, un bâtiment agricole artificialise mais ne consomme pas.</p>
              </>
            ),
          }}
          donnees={{
            preview: "Les données de consommation d'ENAF publiées sur Mon Diag Artif sont produites par le Cerema à partir des Fichiers Fonciers.",
            content: (
              <>
                <p>Les données de consommation d'ENAF publiées sur Mon Diag Artif sont produites par le <strong>Cerema</strong> à partir des <strong>Fichiers Fonciers</strong>.</p>
                <p>Ces données sont disponibles à l'échelle de la commune.</p>
                <p>Depuis 2026 les données sont également proposées à l’échelle infra-communale pour les ayants droit (structures publiques et prestataires assurant des missions pour elles), via le site <a href="https://datafoncier.cerema.fr/" target="_blank" rel="noopener noreferrer">Datafoncier</a> ou sur <a href="https://urbansimul.cerema.fr/" target="_blank" rel="noopener noreferrer">UrbanSimul</a>.</p>
                <p>Le dernier millésime (2024) correspond à la photographie du territoire au 1er janvier 2025, et intègre les évolutions réalisées au cours de l'année 2024.</p>
              </>
            ),
          }}
          cadreReglementaire={{
            preview: "La loi Climat et Résilience, adoptée en 2021, engage la France à limiter la consommation d'ENAF, entendue comme leur transformation en espaces urbanisés.",
            content: (
              <>
                <p>La loi Climat et Résilience, adoptée en 2021, engage la France à <strong>limiter la consommation d'espaces naturels, agricoles et forestiers</strong> (ENAF), entendue comme leur transformation en espaces urbanisés.</p>
                <p>Plus précisément, elle fixe à l'échelle nationale l'objectif de <strong>réduire de moitié cette consommation sur la période allant du 1<sup>er</sup> janvier 2021 au 1<sup>er</sup> janvier 2031</strong>, par rapport à la décennie précédente (1<sup>er</sup> janvier 2011 au 1<sup>er</sup> janvier 2021).</p>
              </>
            ),
          }}
        />

        <ConsoAnnuelle landId={land_id} landType={land_type} landName={name} childLandTypes={child_land_types || []} />

        {!isDromCom && <ConsoCarroyage landData={landData} />}

        <ConsoDemography
          landId={land_id}
          landType={land_type}
          landName={name}
          startYear={startYear}
          endYear={endYear}
          childLandTypes={child_land_types}
          childType={childType}
        />
        <ConsoComparison
          landId={land_id}
          landType={land_type}
          landName={name}
          startYear={startYear}
          endYear={endYear}
          territories={territories}
          excludedTerritories={excludedTerritories}
          comparisonLandIds={comparisonLandIds}
          isDefaultSelection={isDefaultSelection}
          onAddTerritory={handleAddTerritory}
          onRemoveTerritory={handleRemoveTerritory}
          onReset={handleResetTerritories}
        />
      </div>
    </>
  );
};

export const Consommation: React.FC<ConsommationProps> = ({ landData, preference }) => {
  const { land_id, land_type, child_land_types } = landData || {};

  return (
    <ConsommationControlsProvider
      land_id={land_id}
      land_type={land_type}
      childLandTypes={child_land_types}
    >
      <ConsommationContent landData={landData} preference={preference} />
    </ConsommationControlsProvider>
  );
};
