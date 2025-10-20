import React from "react";
import Card from "@components/ui/Card";
import { ConsoGraph } from "@components/charts/conso/ConsoGraph";
import { LandDetailResultType } from "@services/types/land";
import { formatNumber } from "@utils/formatUtils";
import { PeriodSelector } from "./components/PeriodSelector";
import { ConsoDemography } from "./components/ConsoDemography";
import { ConsoComparison } from "./components/ConsoComparison";
import { useConsoData, useSimilarTerritories, useComparisonTerritories } from "./hooks";

interface ConsommationProps {
  landData: LandDetailResultType;
}

const DetailsCalculationFichiersFonciers: React.FC = () => (
  <div>
    <h6 className="fr-mb-0">Calcul</h6>
    <p className="fr-text--sm fr-mb-0">Données brutes, sans calcul</p>
  </div>
);

// Default dates for analysis
const DEFAULT_START_YEAR = 2011;
const DEFAULT_END_YEAR = 2023;

/**
 * Main Consommation page component
 * Displays consumption statistics, demographic data, and territory comparisons
 */
export const Consommation: React.FC<ConsommationProps> = ({ landData }) => {
  const { land_id, land_type, name, surface } = landData || {};

  // State for selected years
  const [startYear, setStartYear] = React.useState(DEFAULT_START_YEAR);
  const [endYear, setEndYear] = React.useState(DEFAULT_END_YEAR);

  // Fetch consumption and population data
  const { totalConsoHa, populationEvolution, populationEvolutionPercent, isLoadingConso, isLoadingPop } =
    useConsoData(land_id, land_type, startYear, endYear);

  // Fetch similar territories
  const { territories: suggestedTerritories } = useSimilarTerritories(land_id, land_type);

  // Manage comparison territories
  const {
    additionalTerritories,
    comparisonLandIds,
    isDefaultSelection,
    handleAddTerritory,
    handleRemoveTerritory,
    handleResetTerritories,
  } = useComparisonTerritories(land_id, land_type);

  if (!landData) {
    return (
      <div role="status" aria-live="polite">
        Données non disponibles
      </div>
    );
  }

  return (
    <>
      {/* Period selector (sticky) */}
      <PeriodSelector
        startYear={startYear}
        endYear={endYear}
        onStartYearChange={setStartYear}
        onEndYearChange={setEndYear}
        defaultStartYear={DEFAULT_START_YEAR}
        defaultEndYear={DEFAULT_END_YEAR}
      />

      <div className="fr-container--fluid fr-p-3w">
        {/* Main statistics cards */}
      <div className="fr-grid-row fr-grid-row--gutters fr-mb-5w">
        <div className="fr-col-12 fr-col-md-6">
          <Card
            icon="bi-geo-alt"
            badgeClass="fr-badge--info"
            badgeLabel="Surface du territoire"
            value={`${formatNumber({ number: surface })} ha`}
            label={name}
          />
        </div>
        <div className="fr-col-12 fr-col-md-6">
          <Card
            icon="bi-graph-up"
            badgeClass="fr-badge--warning"
            badgeLabel="Consommation d'espaces NAF"
            value={
              isLoadingConso || totalConsoHa === null ? "..." : `${formatNumber({ number: totalConsoHa })} ha`
            }
            label={`Période d'analyse ${startYear} - ${endYear}`}
          />
        </div>
      </div>

      {/* Annual consumption section */}
      <div>
        <h3 id="conso-annuelle">Consommation annuelle d'espaces NAF</h3>

        <div className="fr-mb-5w">
          <div className="bg-white fr-p-2w rounded">
            <ConsoGraph
              id="annual_total_conso_chart"
              land_id={land_id}
              land_type={land_type}
              params={{
                start_date: String(startYear),
                end_date: String(endYear),
              }}
              sources={["majic"]}
              showDataTable={true}
            >
              <DetailsCalculationFichiersFonciers />
            </ConsoGraph>
          </div>
        </div>

        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-lg-4">
            <div className="bg-white fr-p-2w rounded h-100">
              <ConsoGraph
                id="pie_determinant"
                land_id={land_id}
                land_type={land_type}
                params={{
                  start_date: String(startYear),
                  end_date: String(endYear),
                }}
                sources={["majic"]}
                showDataTable={true}
              >
                <div>
                  <h6 className="fr-mb-0">Source</h6>
                  <p className="fr-text--sm fr-mb-0">
                    Les données proviennent des <strong>fichiers fonciers</strong> (Cerema, d'après DGFiP).
                  </p>
                  <p className="fr-text--sm fr-mb-0">
                    La ligne "inconnu" comprend les éléments dont la destination n'est pas définie dans les
                    fichiers fonciers.
                  </p>
                  <h6 className="fr-mb-2w fr-mt-2w">Calcul</h6>
                  <p className="fr-text--sm fr-mb-0">Données brutes, sans calcul</p>
                </div>
              </ConsoGraph>
            </div>
          </div>
          <div className="fr-col-12 fr-col-lg-8">
            <div className="bg-white fr-p-2w rounded h-100">
              <ConsoGraph
                id="chart_determinant"
                land_id={land_id}
                land_type={land_type}
                params={{
                  start_date: String(startYear),
                  end_date: String(endYear),
                }}
                sources={["majic"]}
                showDataTable={true}
              >
                <div>
                  <h6 className="fr-mb-0">Source</h6>
                  <p className="fr-text--sm fr-mb-0">
                    Les données proviennent des <strong>fichiers fonciers</strong> (Cerema, d'après DGFiP).
                  </p>
                  <p className="fr-text--sm fr-mb-0">
                    La ligne "inconnu" comprend les éléments dont la destination n'est pas définie dans les
                    fichiers fonciers.
                  </p>
                  <h6 className="fr-mb-2w fr-mt-2w">Calcul</h6>
                  <p className="fr-text--sm fr-mb-0">Données brutes, sans calcul</p>
                </div>
              </ConsoGraph>
            </div>
          </div>
        </div>
      </div>

      {/* Demography section */}
      <ConsoDemography
        landId={land_id}
        landType={land_type}
        startYear={startYear}
        endYear={endYear}
        totalConsoHa={totalConsoHa}
        populationEvolution={populationEvolution}
        populationEvolutionPercent={populationEvolutionPercent}
        isLoadingConso={isLoadingConso}
        isLoadingPop={isLoadingPop}
        defaultStartYear={DEFAULT_START_YEAR}
        defaultEndYear={DEFAULT_END_YEAR}
      />

        {/* Comparison section */}
        <ConsoComparison
          landId={land_id}
          landType={land_type}
          landName={name}
          startYear={startYear}
          endYear={endYear}
          suggestedTerritories={suggestedTerritories}
          additionalTerritories={additionalTerritories}
          comparisonLandIds={comparisonLandIds}
          isDefaultSelection={isDefaultSelection}
          onTerritoryAdd={handleAddTerritory}
          onTerritoryRemove={handleRemoveTerritory}
          onReset={handleResetTerritories}
        />
      </div>
    </>
  );
};
