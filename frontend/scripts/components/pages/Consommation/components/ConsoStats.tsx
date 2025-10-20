import React from "react";
import Card from "@components/ui/Card";
import { formatNumber } from "@utils/formatUtils";

interface ConsoStatsProps {
  totalConsoHa: number | null;
  populationEvolution: number | null;
  populationEvolutionPercent: number | null;
  populationDensity: number | null;
  isLoadingConso: boolean;
  isLoadingPop: boolean;
  startYear: number;
  endYear: number;
  surface: number;
}

/**
 * Displays consumption and demographic statistics cards
 */
export const ConsoStats: React.FC<ConsoStatsProps> = ({
  totalConsoHa,
  populationEvolution,
  populationEvolutionPercent,
  populationDensity,
  isLoadingConso,
  isLoadingPop,
  startYear,
  endYear,
  surface,
}) => {
  const formatPopulationValue = () => {
    if (isLoadingPop || populationEvolution === null) {
      return "...";
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

  const calculateConsoPerNewHabitant = () => {
    if (isLoadingConso || isLoadingPop || totalConsoHa === null || populationEvolution === null || populationEvolution <= 0) {
      return "...";
    }

    // Convert ha to m² (1 ha = 10,000 m²)
    const consoPerHabitantM2 = (totalConsoHa * 10000) / populationEvolution;
    return `${formatNumber({ number: consoPerHabitantM2, decimals: 0 })} m²`;
  };

  return (
    <div className="fr-grid-row fr-grid-row--gutters fr-mb-5w">
      <div className="fr-col-12 fr-col-md-4">
        <Card
          icon="bi-house"
          badgeClass="fr-badge--info"
          badgeLabel="Consommation par nouvel habitant"
          value={calculateConsoPerNewHabitant()}
          label={`Entre ${startYear} et ${endYear}`}
          isHighlighted={true}
          highlightBadge="Donnée clé"
        />
      </div>
      <div className="fr-col-12 fr-col-md-4">
        <Card
          icon="bi-people"
          badgeClass="fr-badge--success"
          badgeLabel="Évolution de la population"
          value={formatPopulationValue()}
          label={formatPopulationLabel()}
          isHighlighted={false}
        />
      </div>
    </div>
  );
};
