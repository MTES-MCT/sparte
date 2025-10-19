import React from "react";
import Card from "@components/ui/Card";
import { formatNumber } from "@utils/formatUtils";

interface ConsoStatsProps {
  totalConsoHa: number | null;
  populationEvolution: number | null;
  populationEvolutionPercent: number | null;
  isLoadingConso: boolean;
  isLoadingPop: boolean;
  startYear: number;
  endYear: number;
}

/**
 * Displays consumption and demographic statistics cards
 */
export const ConsoStats: React.FC<ConsoStatsProps> = ({
  totalConsoHa,
  populationEvolution,
  populationEvolutionPercent,
  isLoadingConso,
  isLoadingPop,
  startYear,
  endYear,
}) => {
  const formatPopulationValue = () => {
    if (isLoadingPop || populationEvolution === null) {
      return "...";
    }

    const sign = populationEvolution > 0 ? "+" : "";
    const evolutionText = `${sign}${formatNumber({ number: populationEvolution })} hab`;

    if (populationEvolutionPercent !== null) {
      const percentSign = populationEvolutionPercent > 0 ? "+" : "";
      return `${evolutionText} (${percentSign}${formatNumber({ number: populationEvolutionPercent, decimals: 1 })}%)`;
    }

    return evolutionText;
  };

  return (
    <div className="fr-grid-row fr-grid-row--gutters fr-mb-5w">
      <div className="fr-col-12 fr-col-md-6">
        <Card
          icon="bi-people"
          badgeClass="fr-badge--success"
          badgeLabel="Évolution de la population"
          value={formatPopulationValue()}
          label={`Période d'analyse ${startYear} - ${endYear}`}
        />
      </div>
      <div className="fr-col-12 fr-col-md-6">
        <Card
          icon="bi-graph-up"
          badgeClass="fr-badge--warning"
          badgeLabel="Consommation totale"
          value={
            isLoadingConso || totalConsoHa === null ? "..." : `${formatNumber({ number: totalConsoHa })} ha`
          }
          label={`Période d'analyse ${startYear} - ${endYear}`}
        />
      </div>
    </div>
  );
};
