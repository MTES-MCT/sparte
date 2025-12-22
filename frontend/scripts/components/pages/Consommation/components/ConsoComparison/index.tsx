import React from "react";
import { Territory } from "@components/ui/SearchBar";
import TerritorySelector from "@components/features/TerritorySelector";
import { ChartSection } from "./ChartSection";
import { CHART_DESCRIPTIONS, GUIDE_TEXTS } from "./constants";
import GuideContent from "@components/ui/GuideContent";

interface ConsoComparisonProps {
  landId: string;
  landType: string;
  landName: string;
  startYear: number;
  endYear: number;
  territories: Territory[];
  excludedTerritories: Territory[];
  comparisonLandIds: string | null;
  isDefaultSelection: boolean;
  onAddTerritory: (territory: Territory) => void;
  onRemoveTerritory: (territory: Territory) => void;
  onReset: () => void;
}

export const ConsoComparison: React.FC<ConsoComparisonProps> = ({
  landId,
  landType,
  landName,
  startYear,
  endYear,
  territories,
  excludedTerritories,
  comparisonLandIds,
  isDefaultSelection,
  onAddTerritory,
  onRemoveTerritory,
  onReset,
}) => {
  return (
    <div className="fr-mt-7w">
      <h3 id="conso-comparaison">Comparaison avec d'autres territoires</h3>

      <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
        <div className="fr-col-12 fr-col-lg-6">
          <div className="bg-white fr-p-3w rounded h-100">
            <p className="fr-text--xs">
              <i className="bi bi-info-circle fr-mr-1w" /> Par défaut les <strong>territoires de comparaison</strong> ont été automatiquement sélectionnés en fonction de leur proximité géographique avec {landName}.
            </p>
            <TerritorySelector
              territories={territories}
              excludedTerritories={excludedTerritories}
              isDefaultSelection={isDefaultSelection}
              onAddTerritory={onAddTerritory}
              onRemoveTerritory={onRemoveTerritory}
              onReset={onReset}
              searchLabel="Ajouter un territoire de comparaison"
              showCount={true}
              compact={true}
            />
          </div>
        </div>

        <div className="fr-col-12 fr-col-lg-6">
          <ChartSection
            id="comparison_map"
            landId={landId}
            landType={landType}
            startYear={startYear}
            endYear={endYear}
            comparisonLandIds={comparisonLandIds}
            sources={["majic"]}
            isMap={true}
          >
            <div>
              <h6 className="fr-mb-0">{CHART_DESCRIPTIONS.comparisonMap.title}</h6>
              <p className="fr-text--xs fr-mb-0">
                {CHART_DESCRIPTIONS.comparisonMap.content}
              </p>
            </div>
          </ChartSection>
        </div>
      </div>

      <div className="fr-mb-3w">
        <ChartSection
          id="comparison_chart"
          landId={landId}
          landType={landType}
          startYear={startYear}
          endYear={endYear}
          comparisonLandIds={comparisonLandIds}
          sources={["majic"]}
        >
          <div>
            <h6 className="fr-mb-0">{CHART_DESCRIPTIONS.comparisonChart.title}</h6>
            {CHART_DESCRIPTIONS.comparisonChart.content}
          </div>
        </ChartSection>
      </div>

      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-lg-8">
          <ChartSection
            id="surface_proportional_chart"
            landId={landId}
            landType={landType}
            startYear={startYear}
            endYear={endYear}
            comparisonLandIds={comparisonLandIds}
            sources={["majic"]}
          >
            <div>
              <h6 className="fr-mb-0">{CHART_DESCRIPTIONS.surfaceProportional.title}</h6>
              {CHART_DESCRIPTIONS.surfaceProportional.content}
            </div>
          </ChartSection>
        </div>

        <div className="fr-col-12 fr-col-lg-4">
          <GuideContent title={GUIDE_TEXTS.treemap.title} column>
            {GUIDE_TEXTS.treemap.content}
          </GuideContent>
        </div>
      </div>

      <div className="fr-mt-5w">
        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-lg-8">
            <ChartSection
              id="population_conso_comparison_chart"
              landId={landId}
              landType={landType}
              startYear={startYear}
              endYear={endYear}
              comparisonLandIds={comparisonLandIds}
              sources={["majic", "insee"]}
            >
              <div>
                <h6 className="fr-mb-0">{CHART_DESCRIPTIONS.populationConso.title}</h6>
                {CHART_DESCRIPTIONS.populationConso.content}
              </div>
            </ChartSection>
          </div>

          <div className="fr-col-12 fr-col-lg-4">
            <GuideContent title={GUIDE_TEXTS.populationBubble.title} column>
              {GUIDE_TEXTS.populationBubble.content}
            </GuideContent>
          </div>
        </div>
      </div>
    </div>
  );
};
