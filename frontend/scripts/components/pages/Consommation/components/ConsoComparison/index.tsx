import React from "react";
import { ConsoGraph } from "@components/charts/conso/ConsoGraph";
import { Territory } from "@components/ui/SearchBar";
import { TerritorySelector } from "./TerritorySelector";
import { SuggestedTerritories } from "./SuggestedTerritories";
import { SelectedTerritories } from "./SelectedTerritories";

interface ConsoComparisonProps {
  landId: string;
  landType: string;
  landName: string;
  startYear: number;
  endYear: number;
  suggestedTerritories: Territory[];
  additionalTerritories: Territory[];
  comparisonLandIds: string | null;
  isDefaultSelection: boolean;
  onTerritoryAdd: (territory: Territory) => void;
  onTerritoryRemove: (territory: Territory) => void;
  onReset: () => void;
}

/**
 * Comparison section with similar territories
 * Allows users to compare consumption with other territories
 */
export const ConsoComparison: React.FC<ConsoComparisonProps> = ({
  landId,
  landType,
  landName,
  startYear,
  endYear,
  suggestedTerritories,
  additionalTerritories,
  comparisonLandIds,
  isDefaultSelection,
  onTerritoryAdd,
  onTerritoryRemove,
  onReset,
}) => {
  return (
    <div className="fr-mt-7w">
      <h3 id="conso-comparaison">Comparaison avec les territoires similaires</h3>

      <div className="fr-notice fr-notice--info fr-mb-3w">
        <div className="fr-container">
          <div className="fr-notice__body">
            <p className="fr-notice__title">À propos des territoires similaires</p>
            <p className="fr-text--sm fr-mb-0">
              Les territoires présentés ci-dessous ont été automatiquement sélectionnés en fonction de leur
              similarité avec {landName}. La sélection se base sur deux critères principaux : la population
              (critère prioritaire) et la proximité géographique. Pour les communes de moins de 100 000
              habitants, seuls les territoires du même département sont comparés.
            </p>
          </div>
        </div>
      </div>

      {/* Territory selector */}
      <div className="bg-white fr-p-3w rounded fr-mb-3w">
        <TerritorySelector
          landId={landId}
          landType={landType}
          additionalTerritories={additionalTerritories}
          onTerritorySelect={onTerritoryAdd}
        />

        {/* Suggested territories */}
        <SuggestedTerritories
          territories={suggestedTerritories}
          additionalTerritories={additionalTerritories}
          onTerritoryAdd={onTerritoryAdd}
          onReset={onReset}
          showResetButton={!isDefaultSelection}
        />

        {/* Selected territories */}
        <SelectedTerritories territories={additionalTerritories} onRemove={onTerritoryRemove} />
      </div>

      {/* Comparison charts */}
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-lg-6">
          <div className="bg-white fr-p-2w rounded h-100">
            <ConsoGraph
              id="comparison_chart"
              land_id={landId}
              land_type={landType}
              params={{
                start_date: String(startYear),
                end_date: String(endYear),
                ...(comparisonLandIds && { comparison_lands: comparisonLandIds }),
              }}
              sources={["majic"]}
              showDataTable={true}
            >
              <div>
                <h6 className="fr-mb-0">À propos</h6>
                <p className="fr-text--sm fr-mb-0">
                  Ce graphique compare la consommation d'espaces NAF de votre territoire avec celle de
                  territoires similaires, sélectionnés en fonction de leur population et de leur proximité
                  géographique.
                </p>
                <p className="fr-text--sm fr-mb-0">
                  Cliquez sur un territoire pour voir le détail année par année de sa consommation.
                </p>
              </div>
            </ConsoGraph>
          </div>
        </div>
        <div className="fr-col-12 fr-col-lg-6">
          <div className="bg-white fr-p-2w rounded h-100">
            <ConsoGraph
              id="surface_proportional_chart"
              land_id={landId}
              land_type={landType}
              params={{
                start_date: String(startYear),
                end_date: String(endYear),
                ...(comparisonLandIds && { comparison_lands: comparisonLandIds }),
              }}
              sources={["majic"]}
              showDataTable={true}
            >
              <div>
                <h6 className="fr-mb-0">À propos</h6>
                <p className="fr-text--sm fr-mb-0">
                  Ce graphique compare la consommation d'espaces NAF proportionnelle à la surface totale du
                  territoire. Les territoires sont représentés sous forme de treemap où la taille reflète la
                  surface du territoire.
                </p>
              </div>
            </ConsoGraph>
          </div>
        </div>
      </div>

      <div className="fr-mt-5w">
        <div className="bg-white fr-p-2w rounded">
          <ConsoGraph
            id="population_conso_comparison_chart"
            land_id={landId}
            land_type={landType}
            params={{
              start_date: String(startYear),
              end_date: String(endYear),
              ...(comparisonLandIds && { comparison_lands: comparisonLandIds }),
            }}
            sources={["majic", "insee"]}
            showDataTable={true}
          >
            <div>
              <h6 className="fr-mb-0">À propos</h6>
              <p className="fr-text--sm fr-mb-0">
                Ce graphique compare la consommation d'espaces NAF au regard de l'évolution démographique. La
                taille des bulles représente la population totale de chaque territoire. La ligne médiane
                indique le ratio médian entre évolution démographique et consommation d'espaces.
              </p>
            </div>
          </ConsoGraph>
        </div>
      </div>
    </div>
  );
};
