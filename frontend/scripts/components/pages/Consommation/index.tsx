import React from "react";
import { LandDetailResultType } from "@services/types/land";
import { ComparisonLand, UserLandPreferenceResultType } from "@services/types/project";
import { useConsoData, useNearestTerritories, useComparisonTerritories } from "./hooks";
import { ConsommationControlsProvider, useConsommationControls } from "./context/ConsommationControlsContext";
import { TopBarContent } from "@components/layout/TopBarContent";
import Triptych from "@components/ui/Triptych";
import Feedback from "@components/ui/Feedback";
import {
  ConsommationControls,
  ConsoAnnuelle,
  ConsoMaps,
  ConsoCarroyage,
  ConsoDemography,
  ConsoComparison,
} from "./components";

interface ConsommationProps {
  landData: LandDetailResultType;
  preference?: UserLandPreferenceResultType;
}

const ConsommationContent: React.FC<ConsommationProps> = ({ landData, preference }) => {
  const { land_id, land_type, name, child_land_types } = landData || {};

  const {
    startYear,
    endYear,
    populationEvolution,
    populationEvolutionPercent,
    isLoadingPop,
    populationCardRef,
  } = useConsommationControls();

  const { populationDensity, populationStock } = useConsoData(land_id, land_type, startYear, endYear);

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
            preview: "La consommation d'espaces NAF (Naturels, Agricoles et Forestiers) est entendue comme « la création ou l'extension effective d'espaces urbanisés sur le territoire concerné » (article 194 de la loi Climat et résilience).",
            content: (
              <>
                <p>La consommation d'espaces NAF (Naturels, Agricoles et Forestiers) est entendue comme <strong>« la création ou l'extension effective d'espaces urbanisés sur le territoire concerné »</strong> (article 194 de la loi Climat et résilience).</p>
                <p>Cet article exprime le fait que le caractère urbanisé d'un espace est la traduction de l'usage qui en est fait. Un espace urbanisé n'est plus un espace d'usage NAF (Naturel, Agricole et Forestier).</p>
                <p>Si l'artificialisation des sols traduit globalement un changement de couverture physique, la consommation traduit un changement d'usage. À titre d'exemple, un bâtiment agricole artificialise mais ne consomme pas.</p>
              </>
            ),
          }}
          donnees={{
            preview: "Les données de consommation d'espaces NAF publiées sur Mon Diagnostic Artificialisation sont produites par le CEREMA à partir des données d'évolution des fichiers fonciers.",
            content: (
              <>
                <p>Les données de consommation d'espaces NAF publiées sur Mon Diagnostic Artificialisation sont produites par le <strong>CEREMA</strong> à partir des données d'évolution des <strong>fichiers fonciers</strong>.</p>
                <p>Ces données sont disponibles à l'échelle de la commune.</p>
                <p>Le dernier millésime (2023) correspond à la photographie du territoire au 1er janvier 2024, et intègre les évolutions réalisées au cours de l'année 2023.</p>
              </>
            ),
          }}
          cadreReglementaire={{
            preview: "La loi Climat et Résilience, adoptée en 2021, engage la France à limiter la consommation d'espaces naturels, agricoles et forestiers (NAF), entendue comme leur transformation en espaces urbanisés.",
            content: (
              <>
                <p>La loi Climat et Résilience, adoptée en 2021, engage la France à <strong>limiter la consommation d'espaces naturels, agricoles et forestiers</strong> (NAF), entendue comme leur transformation en espaces urbanisés.</p>
                <p>Plus précisément, elle fixe à l'échelle nationale l'objectif de <strong>réduire de moitié cette consommation sur la période 2021-2031</strong>, par rapport à la décennie 2011-2021.</p>
              </>
            ),
          }}
        />

        <ConsoAnnuelle landId={land_id} landType={land_type} />

        <ConsoMaps
          landId={land_id}
          landType={land_type}
          childLandTypes={child_land_types || []}
        />

        <ConsoCarroyage landData={landData} />

        <ConsoDemography
          landId={land_id}
          landType={land_type}
          startYear={startYear}
          endYear={endYear}
          populationEvolution={populationEvolution}
          populationEvolutionPercent={populationEvolutionPercent}
          populationDensity={populationDensity}
          populationStock={populationStock}
          isLoadingPop={isLoadingPop}
          populationCardRef={populationCardRef}
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

        <div className="fr-mt-5w">
          <Feedback />
        </div>
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
