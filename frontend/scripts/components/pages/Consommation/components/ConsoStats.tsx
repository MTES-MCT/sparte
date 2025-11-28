import React from "react";
import Card from "@components/ui/Card";
import Loader from "@components/ui/Loader";
import { formatNumber } from "@utils/formatUtils";

interface ConsoStatsProps {
  populationEvolution: number | null;
  populationEvolutionPercent: number | null;
  populationDensity: number | null;
  populationStock: number | null;
  isLoadingPop: boolean;
  startYear: number;
  endYear: number;
  populationCardRef?: React.RefObject<HTMLDivElement>;
}

/**
 * Displays consumption and demographic statistics cards
 */
export const ConsoStats: React.FC<ConsoStatsProps> = ({
  populationEvolution,
  populationEvolutionPercent,
  populationDensity,
  populationStock,
  isLoadingPop,
  startYear,
  endYear,
  populationCardRef,
}) => {
  const formatPopulationValue = () => {
    if (isLoadingPop || populationEvolution === null) {
      return <Loader size={32} />;
    }

    const sign = populationEvolution > 0 ? "+" : "";
    return `${sign}${formatNumber({ number: populationEvolution })} hab`;
  };

  const formatPopulationLabel = () => {
    if (isLoadingPop || populationEvolutionPercent === null) {
      return `Entre ${startYear} et ${endYear}`;
    }

    const percentSign = populationEvolutionPercent > 0 ? "+" : "";
    return (
      <>
        Entre {startYear} et {endYear} ({percentSign}
        {formatNumber({ number: populationEvolutionPercent, decimals: 1 })}%)
      </>
    );
  };

  const formatDensityValue = () => {
    if (isLoadingPop || populationDensity === null) {
      return <Loader size={32} />;
    }

    return `${formatNumber({ number: populationDensity, decimals: 1 })} hab/ha`;
  };

  const formatPopulationStockValue = () => {
    if (isLoadingPop || populationStock === null) {
      return <Loader size={32} />;
    }

    return `${formatNumber({ number: populationStock })} hab`;
  };

  return (
    <div className="fr-grid-row fr-grid-row--gutters fr-mb-5w">
      <div className="fr-col-12 fr-col-lg-4" ref={populationCardRef}>
        <Card
          icon="bi-people"
          badgeClass="fr-badge--success"
          badgeLabel="Évolution de la population"
          value={formatPopulationValue()}
          label={formatPopulationLabel()}
          isHighlighted={true}
          highlightBadge="Donnée clé"
        />
      </div>
      <div className="fr-col-12 fr-col-lg-4">
        <Card
          icon="bi-people-fill"
          badgeClass="fr-badge--info"
          badgeLabel="Population"
          value={formatPopulationStockValue()}
          label={`En ${endYear}`}
          isHighlighted={false}
        />
      </div>
      <div className="fr-col-12 fr-col-lg-4">
        <Card
          icon="bi-bar-chart"
          badgeClass="fr-badge--info"
          badgeLabel="Densité de population"
          value={formatDensityValue()}
          label={`En ${endYear}`}
          isHighlighted={false}
        />
      </div>
    </div>
  );
};
