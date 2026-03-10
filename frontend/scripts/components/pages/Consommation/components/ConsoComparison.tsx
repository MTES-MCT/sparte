import React, { useCallback, useState } from "react";
import { LandDetailResultType } from "@services/types/land";
import TerritorySelector from "@components/features/TerritorySelector";
import GenericChart from "@components/charts/GenericChart";
import GuideContent from "@components/ui/GuideContent";
import Button from "@components/ui/Button";
import { djangoApi } from "@services/api";
import { TreemapSVG } from "@components/charts/consommation/TreemapSVG";

const BUBBLE_CHARTS = [
  {
    chartId: "population_conso_comparison_chart",
    label: "Population",
    description: "Ce graphique compare la consommation d'espaces NAF au regard de l'évolution démographique.",
  },
  {
    chartId: "dc_logement_conso_comparison_chart",
    label: "Logements",
    description: "Ce graphique compare la consommation d'espaces NAF à destination de l'habitat au regard de l'évolution du parc de logements.",
  },
  {
    chartId: "dc_menages_conso_comparison_chart",
    label: "Ménages",
    description: "Ce graphique compare la consommation d'espaces NAF à destination de l'habitat au regard de l'évolution du nombre de ménages.",
  },
  {
    chartId: "dc_emploi_conso_comparison_chart",
    label: "Emploi",
    description: "Ce graphique compare la consommation d'espaces NAF à destination de l'activité au regard de l'évolution de l'emploi.",
  },
];

interface ConsoComparisonProps {
  landId: string;
  landType: string;
  landName: string;
  startYear: number;
  endYear: number;
  territories: LandDetailResultType[];
  excludedTerritories: LandDetailResultType[];
  comparisonLandIds: string | null;
  isDefaultSelection: boolean;
  onAddTerritory: (territory: LandDetailResultType) => void;
  onRemoveTerritory: (territory: LandDetailResultType) => void;
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
  const [selectedTerritory, setSelectedTerritory] = useState<{
    land_id: string;
    land_type: string;
    name: string;
  } | null>(null);

  const [activeBubbleChartId, setActiveBubbleChartId] = useState(BUBBLE_CHARTS[0].chartId);
  const activeBubbleChart = BUBBLE_CHARTS.find((c) => c.chartId === activeBubbleChartId) || BUBBLE_CHARTS[0];

  const prefetchChartConfig = djangoApi.usePrefetch("getChartConfig");

  const handlePointClick = useCallback(
    (point: { land_id: string; land_type: string; name: string }) => {
      setSelectedTerritory(point);
    },
    []
  );

  const chartParams = {
    start_date: String(startYear),
    end_date: String(endYear),
    ...(comparisonLandIds !== null && { comparison_lands: comparisonLandIds }),
  };

  const prefetchBubbleChart = useCallback((chartId: string) => {
    prefetchChartConfig({
      id: chartId,
      land_type: landType,
      land_id: landId,
      ...chartParams,
    });
  }, [prefetchChartConfig, landId, landType, startYear, endYear, comparisonLandIds]);

  return (
    <div className="fr-mt-7w">
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }} className="fr-mb-2w">
        <h3 id="conso-comparaison" className="fr-mb-0">Comparaison avec d'autres territoires</h3>
        <span className="fr-badge fr-badge--info fr-badge--no-icon">
          {territories.length} territoire{territories.length > 1 ? "s" : ""} sélectionné{territories.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="fr-notice fr-notice--info fr-mb-3w" style={{ padding: "0.75rem 1rem" }}>
        <div className="fr-notice__body" style={{ marginLeft: 0 }}>
          <p className="fr-notice__title fr-text--xs fr-mb-0" style={{ fontWeight: 400 }}>
            Par défaut, les territoires de comparaison ont été automatiquement sélectionnés en fonction de leur proximité géographique avec <strong>{landName}</strong>.
          </p>
        </div>
      </div>

      <div className="fr-mb-3w">
        <TerritorySelector
          territories={territories}
          excludedTerritories={excludedTerritories}
          isDefaultSelection={isDefaultSelection}
          onAddTerritory={onAddTerritory}
          onRemoveTerritory={onRemoveTerritory}
          onReset={onReset}
          searchLabel="Ajouter un territoire de comparaison"
          showCount={false}
          compact={true}
        />
      </div>

      <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
        <div className="fr-col-12 fr-col-xl-6 fr-grid-row">
          <GenericChart
            isMap={true}
            id="comparison_map"
            land_id={landId}
            land_type={landType}
            params={chartParams}
            sources={["majic"]}
            showDataTable={true}
          >
            <div>
              <h6 className="fr-mb-0">À propos</h6>
              <p className="fr-text--xs fr-mb-0">
                Cette carte affiche votre territoire (surligné en bleu) et les
                territoires de comparaison. La couleur indique la consommation
                d'espaces NAF relative à la surface du territoire, et la taille
                des bulles représente la consommation d'espaces NAF totale.
              </p>
            </div>
          </GenericChart>
        </div>

        <div className="fr-col-12 fr-col-xl-6 fr-grid-row">
          {selectedTerritory && (
            <nav className="fr-mb-1w" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }} aria-label="Fil d'ariane du graphique">
              <i className="bi bi-geo-alt" aria-hidden="true" style={{ opacity: 0.4, fontSize: "0.85rem" }} />
              <Button variant="tertiary" noBackground noPadding size="sm" onClick={() => setSelectedTerritory(null)}>
                Tous les territoires
              </Button>
              <span aria-hidden="true" style={{ opacity: 0.4 }}>/</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 500 }}>{selectedTerritory.name}</span>
            </nav>
          )}
          {selectedTerritory ? (
            <GenericChart
              key={`detail-${selectedTerritory.land_id}`}
              id="chart_determinant"
              land_id={selectedTerritory.land_id}
              land_type={selectedTerritory.land_type}
              params={{ start_date: String(startYear), end_date: String(endYear) }}
              sources={["majic"]}
              showDataTable={true}
            >
              <div>
                <h6 className="fr-mb-0">À propos</h6>
                <p className="fr-text--xs fr-mb-0">
                  Ce graphique détaille la consommation d'espaces NAF année par
                  année de {selectedTerritory.name}, ventilée par destination.
                </p>
              </div>
            </GenericChart>
          ) : (
            <GenericChart
              id="comparison_chart"
              land_id={landId}
              land_type={landType}
              params={chartParams}
              sources={["majic"]}
              showDataTable={true}
              onPointClick={handlePointClick}
            >
              <div>
                <h6 className="fr-mb-0">À propos</h6>
                <p className="fr-text--xs fr-mb-0">
                  Ce graphique compare la consommation d'espaces NAF de votre
                  territoire avec celle de d'autres territoires, sélectionnés en
                  fonction de leur proximité géographique.
                </p>
                <p className="fr-text--xs fr-mb-0">
                  Cliquez sur un territoire pour voir le détail année par année de
                  sa consommation d'espaces NAF.
                </p>
              </div>
            </GenericChart>
          )}
        </div>
      </div>

      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-xl-8 fr-grid-row">
          <GenericChart
            id="surface_proportional_chart"
            land_id={landId}
            land_type={landType}
            params={chartParams}
            sources={["majic"]}
            showDataTable={true}
          >
            <div>
              <h6 className="fr-mb-0">À propos</h6>
              <p className="fr-text--xs fr-mb-0">
                Ce graphique compare la consommation d'espaces NAF
                proportionnelle à la surface totale du territoire. Les
                territoires sont représentés sous forme de treemap où la taille
                reflète la surface du territoire.
              </p>
            </div>
          </GenericChart>
        </div>

        <div className="fr-col-12 fr-col-xl-4 fr-grid-row">
          <GuideContent title="Comprendre les données">
            <p className="fr-text--xs fr-mb-0">
              Ce graphique représente chaque territoire par un rectangle, dont
              la taille est proportionnelle à sa surface. Plus le rectangle est
              grand, plus le territoire est vaste. La couleur des rectangles
              reflète le rapport entre la surface d'espaces NAF consommée et la
              surface totale du territoire. Plus la couleur est foncée, plus la
              consommation d'espaces NAF est intense.
            </p>
            <p className="fr-text--xs fr-mb-0">
              Par exemple, un rectangle de petite taille et de couleur intense
              correspond à un territoire peu étendu ayant consommé une part
              significative de ses espaces NAF.
            </p>
          </GuideContent>
        </div>
      </div>

      <div className="fr-grid-row fr-grid-row--gutters fr-mt-3w">
        <div className="fr-col-12 fr-col-xl-8 fr-grid-row">
          <TreemapSVG
            chartId="surface_proportional_chart"
            landId={landId}
            landType={landType}
            startYear={startYear}
            endYear={endYear}
            comparisonLandIds={comparisonLandIds}
            sources={["majic"]}
          >
            <div>
              <h6 className="fr-mb-0">À propos</h6>
              <p className="fr-text--xs fr-mb-0">
                Ce graphique compare la consommation d'espaces NAF
                proportionnelle à la surface totale du territoire. Les
                territoires sont représentés sous forme de treemap où la taille
                reflète la surface du territoire.
              </p>
            </div>
          </TreemapSVG>
        </div>

        <div className="fr-col-12 fr-col-xl-4 fr-grid-row">
          <GuideContent title="Comprendre les données (SVG)">
            <p className="fr-text--xs fr-mb-0">
              Version SVG du treemap ci-dessus. Chaque territoire est
              représenté par un rectangle dont la taille est proportionnelle
              à sa surface. La couleur reflète la consommation d'espaces NAF
              relative à la surface du territoire.
            </p>
          </GuideContent>
        </div>
      </div>

      <div className="fr-mt-5w">
        <div className="fr-mb-2w d-flex gap-2" style={{ flexWrap: "wrap" }}>
          {BUBBLE_CHARTS.map((chart) => (
            <Button
              key={chart.chartId}
              variant={activeBubbleChartId === chart.chartId ? "primary" : "secondary"}
              size="sm"
              onClick={() => setActiveBubbleChartId(chart.chartId)}
              onMouseEnter={() => prefetchBubbleChart(chart.chartId)}
            >
              {chart.label}
            </Button>
          ))}
        </div>

        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-xl-8 fr-grid-row">
            <GenericChart
              key={activeBubbleChart.chartId}
              id={activeBubbleChart.chartId}
              land_id={landId}
              land_type={landType}
              params={chartParams}
              sources={["majic", "insee"]}
              showDataTable={true}
            >
              <div>
                <h6 className="fr-mb-0">À propos</h6>
                <p className="fr-text--xs fr-mb-0">
                  {activeBubbleChart.description} La taille des bulles représente la population totale de chaque territoire.
                </p>
              </div>
            </GenericChart>
          </div>

          <div className="fr-col-12 fr-col-xl-4 fr-grid-row">
            <GuideContent title="Comprendre les données">
              <p className="fr-text--xs fr-mb-0">
                Ce graphique représente chaque territoire par une bulle, dont
                la taille est proportionnelle à sa population. La position des
                bulles sur l'axe vertical indique la consommation d'espaces NAF
                relative à la surface du territoire et l'axe horizontal indique
                l'évolution de l'indicateur sélectionné.
              </p>
              <p className="fr-text--xs fr-mb-0">
                Par exemple, une petite bulle située en haut à gauche correspond
                à un territoire peu peuplé ayant consommé une part importante de
                sa surface malgré une faible croissance de l'indicateur.
              </p>
            </GuideContent>
          </div>
        </div>
      </div>
    </div>
  );
};
