import React from "react";
import Guide from "@components/ui/Guide";
import { ConsoGraph } from "@components/charts/conso/ConsoGraph";
import { ConsoStats } from "./ConsoStats";

interface ConsoDemographyProps {
  landId: string;
  landType: string;
  startYear: number;
  endYear: number;
  totalConsoHa: number | null;
  populationEvolution: number | null;
  populationEvolutionPercent: number | null;
  populationDensity: number | null;
  isLoadingConso: boolean;
  isLoadingPop: boolean;
  defaultStartYear: number;
  defaultEndYear: number;
  surface: number;
  perHabitantCardRef?: React.RefObject<HTMLDivElement>;
}

/**
 * Demography section with population and consumption statistics
 */
export const ConsoDemography: React.FC<ConsoDemographyProps> = ({
  landId,
  landType,
  startYear,
  endYear,
  totalConsoHa,
  populationEvolution,
  populationEvolutionPercent,
  populationDensity,
  isLoadingConso,
  isLoadingPop,
  defaultStartYear,
  defaultEndYear,
  surface,
  perHabitantCardRef,
}) => {
  return (
    <div className="fr-mt-7w">
      <h3 id="conso-demographie">Consommation d'espaces NAF et démographie</h3>

      {/* Stats cards */}
      <ConsoStats
        totalConsoHa={totalConsoHa}
        populationEvolution={populationEvolution}
        populationEvolutionPercent={populationEvolutionPercent}
        populationDensity={populationDensity}
        isLoadingConso={isLoadingConso}
        isLoadingPop={isLoadingPop}
        startYear={startYear}
        endYear={endYear}
        surface={surface}
        perHabitantCardRef={perHabitantCardRef}
      />

      {/* Population density chart */}
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-lg-8">
          <div className="bg-white fr-p-2w rounded">
            <ConsoGraph
              id="population_density_chart"
              land_id={landId}
              land_type={landType}
              params={{
                start_date: String(defaultStartYear),
                end_date: String(defaultEndYear),
              }}
              sources={["majic", "insee"]}
              showDataTable={true}
            >
              <div>
                <h6 className="fr-mb-0">Calcul</h6>
                <p className="fr-text--sm fr-mb-0">
                  La densité de population est le rapport entre l'effectif de population du territoire et sa
                  superficie.
                </p>
              </div>
            </ConsoGraph>
          </div>
        </div>

        <div className="fr-col-12 fr-col-lg-4">
          <Guide title="Comprendre les données" column>
            <p>
              La densité de population est le rapport entre l'effectif de population du territoire et sa
              superficie. Par souci de cohérence avec le reste des indicateurs, nous avons choisi de
              l'exprimer en habitants par hectare.
            </p>
          </Guide>
        </div>
      </div>

      {/* Population and consumption progression chart */}
      <div className="fr-mt-5w">
        <div className="bg-white fr-p-2w rounded">
          <ConsoGraph
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
          </ConsoGraph>
        </div>
      </div>
    </div>
  );
};
