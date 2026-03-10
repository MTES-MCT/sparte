import React from "react";
import Kpi from "@components/ui/Kpi";
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
  const evolutionValue = evolutionAbsolute != null
    ? `${evolutionAbsolute > 0 ? "+" : ""}${formatNumber({ number: evolutionAbsolute })}`
    : "n.d.";

  const evolutionVariant = evolutionAbsolute != null
    ? evolutionAbsolute > 0 ? "error" : evolutionAbsolute < 0 ? "success" : "default"
    : "default";

  return (
    <div className="fr-grid-row fr-grid-row--gutters fr-mb-5w">
      <div className="fr-col-12 fr-col-lg-4">
        <Kpi
          icon={evolutionAbsolute != null && evolutionAbsolute > 0 ? "bi bi-arrow-up" : evolutionAbsolute != null && evolutionAbsolute < 0 ? "bi bi-arrow-down" : "bi bi-dash"}
          label="Évolution des résidences secondaires"
          value={evolutionValue}
          description={evolutionPercent != null ? `${evolutionPercent > 0 ? "+" : ""}${evolutionPercent} %` : undefined}
          variant={evolutionVariant}
          badge="Donnée clé"
          footer={{
            type: "period",
            from: "2011",
            to: "2022",
          }}
        />
      </div>
      <div className="fr-col-12 fr-col-lg-4">
        <Kpi
          icon="bi bi-house"
          label="Résidences secondaires"
          value={residencesSecondaires != null ? formatNumber({ number: residencesSecondaires }) : "n.d."}
          variant="default"
          footer={{
            type: "period",
            from: "2022",
            to: "2022",
          }}
        />
      </div>
      <div className="fr-col-12 fr-col-lg-4">
        <Kpi
          icon="bi bi-grid-3x3-gap"
          label="Densité de résidences secondaires"
          value={<>{densite != null ? formatNumber({ number: densite }) : "n.d."} <span>/ ha</span></>}
          variant="default"
          footer={{
            type: "period",
            from: "2022",
            to: "2022",
          }}
        />
      </div>
    </div>
  );
};
