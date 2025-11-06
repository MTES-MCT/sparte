import React from "react";
import GenericChart from "@components/charts/GenericChart";
import { ConsoStats } from "./ConsoStats";

interface ConsoDemographyProps {
  landId: string;
  landType: string;
  startYear: number;
  endYear: number;
  populationEvolution: number | null;
  populationEvolutionPercent: number | null;
  populationDensity: number | null;
  populationStock: number | null;
  isLoadingPop: boolean;
  populationCardRef?: React.RefObject<HTMLDivElement>;
}

/**
 * Demography section with population and consumption statistics
 */
export const ConsoDemography: React.FC<ConsoDemographyProps> = ({
  landId,
  landType,
  startYear,
  endYear,
  populationEvolution,
  populationEvolutionPercent,
  populationDensity,
  populationStock,
  isLoadingPop,
  populationCardRef,
}) => {
  return (
    <div className="fr-mt-7w">
      <h3 id="conso-demographie">Consommation d'espaces NAF et démographie</h3>

      {/* Stats cards */}
      <ConsoStats
        populationEvolution={populationEvolution}
        populationEvolutionPercent={populationEvolutionPercent}
        populationDensity={populationDensity}
        populationStock={populationStock}
        isLoadingPop={isLoadingPop}
        startYear={startYear}
        endYear={endYear}
        populationCardRef={populationCardRef}
      />

      {/* Population and consumption progression chart */}
      <div className="fr-mt-5w">
        <div className="bg-white fr-p-2w rounded">
          <GenericChart
            id="population_conso_progression_chart"
            land_id={landId}
            land_type={landType}
            params={{
              start_date: String(startYear),
              end_date: String(endYear),
            }}
            sources={["majic", "insee"]}
            showDataTable={true}
          >
            <div>
              <h6 className="fr-mb-0">Calcul</h6>
              <p className="fr-text--sm fr-mb-0">Données brutes, sans calcul</p>
              <p className="fr-text--sm fr-mb-0">
                Évolution estimée = (somme des évolutions annuelles de la population) / (nombre d'années)
              </p>
            </div>
          </GenericChart>
        </div>
      </div>
    </div>
  );
};
