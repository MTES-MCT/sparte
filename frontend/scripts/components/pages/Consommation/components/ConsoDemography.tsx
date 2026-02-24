import React from "react";
import GenericChart from "@components/charts/GenericChart";
import Kpi from "@components/ui/Kpi";
import Loader from "@components/ui/Loader";
import { formatNumber } from "@utils/formatUtils";
import { BivariateMapSection } from "./BivariateMapSection";

interface ConsoDemographyProps {
  landId: string;
  landType: string;
  landName?: string;
  startYear: number;
  endYear: number;
  populationEvolution: number | null;
  populationEvolutionPercent: number | null;
  populationDensity: number | null;
  populationStock: number | null;
  isLoadingPop: boolean;
  populationCardRef?: React.RefObject<HTMLDivElement>;
  childLandTypes?: string[];
  childType?: string;
  onChildLandTypeChange?: (type: string) => void;
}

export const ConsoDemography: React.FC<ConsoDemographyProps> = ({
  landId,
  landType,
  landName,
  startYear,
  endYear,
  populationEvolution,
  populationEvolutionPercent,
  populationDensity,
  populationStock,
  isLoadingPop,
  populationCardRef,
  childLandTypes,
  childType,
  onChildLandTypeChange,
}) => {
  const hasChildren = childLandTypes && childLandTypes.length > 0;
  const mapChildType = childType || (childLandTypes && childLandTypes[0]);

  const formatPopulationValue = () => {
    if (isLoadingPop || populationEvolution === null) {
      return <Loader size={32} />;
    }
    const sign = populationEvolution > 0 ? "+" : "";
    return <>{sign}{formatNumber({ number: populationEvolution })} <span>hab</span></>;
  };

  const formatDensityValue = () => {
    if (isLoadingPop || populationDensity === null) {
      return <Loader size={32} />;
    }
    return <>{formatNumber({ number: populationDensity, decimals: 1 })} <span>hab/ha</span></>;
  };

  const formatPopulationStockValue = () => {
    if (isLoadingPop || populationStock === null) {
      return <Loader size={32} />;
    }
    return <>{formatNumber({ number: populationStock })} <span>hab</span></>;
  };

  const formatPopulationDescription = () => {
    if (isLoadingPop || populationEvolutionPercent === null) {
      return undefined;
    }
    const percentSign = populationEvolutionPercent > 0 ? "+" : "";
    return `${percentSign}${formatNumber({ number: populationEvolutionPercent, decimals: 1 })}%`;
  };

  return (
    <div className="fr-mt-7w">
      <h3 id="conso-demographie">Consommation d'espaces NAF et démographie</h3>

      <div className="fr-grid-row fr-grid-row--gutters fr-mb-5w">
        <div className="fr-col-12 fr-col-xl-4 fr-grid-row" ref={populationCardRef}>
          <Kpi
            icon="bi bi-people"
            label="Évolution de la population"
            value={formatPopulationValue()}
            description={formatPopulationDescription()}
            variant="success"
            badge="Donnée clé"
            footer={{
              type: "period",
              periods: [
                { label: String(startYear), active: true },
                { label: String(endYear) },
              ],
            }}
          />
        </div>
        <div className="fr-col-12 fr-col-xl-4 fr-grid-row">
          <Kpi
            icon="bi bi-people-fill"
            label="Population"
            value={formatPopulationStockValue()}
            variant="default"
            footer={{
              type: "period",
              periods: [{ label: String(endYear) }],
            }}
          />
        </div>
        <div className="fr-col-12 fr-col-xl-4 fr-grid-row">
          <Kpi
            icon="bi bi-bar-chart"
            label="Densité de population"
            value={formatDensityValue()}
            variant="default"
            footer={{
              type: "period",
              periods: [{ label: String(endYear) }],
            }}
          />
        </div>
      </div>

      <div className="fr-mt-5w">
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
            <p className="fr-text--xs fr-mb-0">Données brutes, sans calcul</p>
            <p className="fr-text--xs fr-mb-0">
              Évolution estimée = (somme des évolutions annuelles de la population) / (nombre d'années)
            </p>
          </div>
        </GenericChart>
      </div>

      <div className="fr-mt-5w" />

      {hasChildren && mapChildType && (
        <BivariateMapSection
          chartId="dc_population_conso_map"
          landId={landId}
          landType={landType}
          landName={landName}
          childLandType={mapChildType}
          childLandTypes={childLandTypes}
          onChildLandTypeChange={onChildLandTypeChange}
        />
      )}

      {hasChildren && mapChildType && (
        <BivariateMapSection
          chartId="dc_menages_conso_map"
          landId={landId}
          landType={landType}
          landName={landName}
          childLandType={mapChildType}
          childLandTypes={childLandTypes}
          onChildLandTypeChange={onChildLandTypeChange}
        />
      )}
    </div>
  );
};
