import React from "react";
import styled from "styled-components";
import { Territory } from "@components/ui/SearchBar";
import SearchBar from "@components/ui/SearchBar";
import Guide from "@components/ui/Guide";
import { TerritoryBadge } from "./TerritoryBadge";
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
  comparisonLandIds: string | null;
  isDefaultSelection: boolean;
  onAddTerritory: (territory: Territory) => void;
  onRemoveTerritory: (territory: Territory) => void;
  onReset: () => void;
}

const InfoBody = styled.div`
  text-align: left;
`;

const TerritoryList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const EmptyText = styled.p`
  color: #666;
`;

export const ConsoComparison: React.FC<ConsoComparisonProps> = ({
  landId,
  landType,
  landName,
  startYear,
  endYear,
  territories,
  comparisonLandIds,
  isDefaultSelection,
  onAddTerritory,
  onRemoveTerritory,
  onReset,
}) => {
  const mainTerritory: Territory = {
    id: 0,
    name: landName,
    source_id: landId,
    land_type: landType,
    land_type_label: '',
    area: 0,
    public_key: '',
  };

  const excludedTerritories = [mainTerritory, ...territories];

  return (
    <div className="fr-mt-7w">
      <h3 id="conso-comparaison">Comparaison avec les territoires voisins</h3>

      <div className="fr-notice fr-notice--info fr-mb-3w">
        <div className="fr-container">
          <InfoBody className="fr-notice__body">
            <p className="fr-notice__title">À propos des territoires voisins</p>
            <p className="fr-text--sm fr-mb-0">
              Les territoires voisins ont été automatiquement sélectionnés en fonction de leur
              proximité avec {landName}. La sélection se base sur la distance géographique entre les
              centroïdes des territoires.
            </p>
          </InfoBody>
        </div>
      </div>

      <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
        <div className="fr-col-12 fr-col-lg-6">
          <div className="bg-white fr-p-3w rounded h-100">
            <h5 className="fr-mb-3w">Territoires voisins ({territories.length})</h5>

            {!isDefaultSelection && (
              <button
                onClick={onReset}
                className="fr-btn fr-btn--sm fr-btn--secondary fr-mb-3w"
              >
                Remettre la sélection par défaut
              </button>
            )}

            <TerritoryList>
              {territories.length === 0 ? (
                <EmptyText className="fr-text--sm">
                  Aucun territoire sélectionné
                </EmptyText>
              ) : (
                territories.map((territory) => (
                  <TerritoryBadge
                    key={`${territory.land_type}_${territory.source_id}`}
                    territory={territory}
                    onRemove={onRemoveTerritory}
                  />
                ))
              )}
            </TerritoryList>

            <div>
              <hr className="fr-my-3w" />
              <h6 className="fr-mb-2w">Ajouter d'autres territoires</h6>
              <SearchBar
                onTerritorySelect={onAddTerritory}
                excludeTerritories={excludedTerritories}
                disableOverlay={true}
              />
            </div>
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
              <p className="fr-text--sm fr-mb-0">
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
              <p className="fr-text--sm fr-mb-0">
                {CHART_DESCRIPTIONS.surfaceProportional.content}
              </p>
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
                <p className="fr-text--sm fr-mb-0">
                  {CHART_DESCRIPTIONS.populationConso.content}
                </p>
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
