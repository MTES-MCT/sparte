import React from "react";
import Card from "@components/ui/Card";
import { formatNumber } from "@utils/formatUtils";

interface RSKpisProps {
  residencesSecondaires: number | null;
  evolutionPercent: number | null;
  evolutionAbsolute: number | null;
  densite: number | null;
}

export const RSKpis: React.FC<RSKpisProps> = ({
  residencesSecondaires,
  evolutionPercent,
  evolutionAbsolute,
  densite,
}) => {
  return (
    <div className="fr-grid-row fr-grid-row--gutters fr-mb-5w">
      <div className="fr-col-12 fr-col-lg-4">
        <Card
          icon="bi-graph-up-arrow"
          badgeClass="fr-badge--info"
          badgeLabel="Évolution des résidences secondaires"
          value={evolutionAbsolute != null
            ? `${evolutionAbsolute > 0 ? "+" : ""}${formatNumber({ number: evolutionAbsolute })}`
            : "n.d."}
          label={evolutionPercent != null
            ? `Entre 2011 et 2022 (${evolutionPercent > 0 ? "+" : ""}${evolutionPercent} %)`
            : "Entre 2011 et 2022"}
          isHighlighted={true}
          highlightBadge="Donnée clé"
        />
      </div>
      <div className="fr-col-12 fr-col-lg-4">
        <Card
          icon="bi-house"
          badgeClass="fr-badge--info"
          badgeLabel="Nombre de résidences secondaires"
          value={residencesSecondaires != null ? formatNumber({ number: residencesSecondaires }) : "n.d."}
          label="En 2022"
        />
      </div>
      <div className="fr-col-12 fr-col-lg-4">
        <Card
          icon="bi-grid-3x3-gap"
          badgeClass="fr-badge--info"
          badgeLabel="Densité de résidences secondaires"
          value={densite != null ? `${formatNumber({ number: densite })} / ha` : "n.d."}
          label="En 2022"
        />
      </div>
    </div>
  );
};
