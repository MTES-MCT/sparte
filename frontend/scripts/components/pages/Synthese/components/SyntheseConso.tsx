import React from "react";
import { LandDetailResultType } from "@services/types/land";
import { ProjectUrls } from "@utils/projectUrls";
import { formatNumber } from "@utils/formatUtils";
import Kpi from "@components/ui/Kpi";
import GuideContent from "@components/ui/GuideContent";
import ConsoCorrectionStatus from "@components/features/status/ConsoCorrectionStatus";

interface SyntheseConsoProps {
  landData: LandDetailResultType;
  urls: ProjectUrls;
  phase: "reference" | "reduction";
}

const SyntheseConso: React.FC<SyntheseConsoProps> = ({
  landData,
  urls,
  phase,
}) => {
  const { has_conso, consommation_correction_status } = landData;

  if (!has_conso) {
    return <ConsoCorrectionStatus status={consommation_correction_status} />;
  }

  const { name, conso_details } = landData;
  const { conso_2011_2020, allowed_conso_2021_2030, conso_since_2021 } = conso_details;

  if (phase === "reference") {
    return (
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-xl-6 fr-grid-row">
          <Kpi
            icon="bi bi-archive"
            label="Consommation d'espaces NAF"
            description="Base de calcul pour définir l'objectif de réduction"
            value={<>{formatNumber({ number: conso_2011_2020 })} <span>ha</span></>}
            variant="default"
            footer={{
              type: "period",
              periods: [
                { label: "2011", active: true },
                { label: "2020" },
              ],
            }}
            action={{
              label: "Voir le diagnostic de consommation",
              to: urls.consommation,
            }}
          />
        </div>
        <div className="fr-col-12 fr-col-xl-6 fr-grid-row">
          <GuideContent title="Pourquoi cette période de référence ?">
            <p className="fr-text--sm">
              La consommation d'espaces NAF entre 2011 et 2021 constitue
              la base de calcul pour définir la trajectoire de réduction fixée
              par la <strong>loi Climat et Résilience</strong>.
            </p>
            <p className="fr-text--sm fr-mb-0">
              Sur le territoire de <strong>{name}</strong>,{" "}
              <strong>{formatNumber({ number: conso_2011_2020 })} ha</strong> ont été
              consommés sur cette période selon les données du Portail National de
              l'artificialisation.{" "}
              Cette valeur sert de point de départ pour apprécier les efforts
              de réduction à mettre en oeuvre sur ce territoire.
            </p>
          </GuideContent>
        </div>
      </div>
    );
  }

  return (
    <div className="fr-grid-row fr-grid-row--gutters">
      <div className="fr-col-12 fr-col-xl-4 fr-grid-row">
        <Kpi
          icon="bi bi-check"
          label="Consommation d'espaces NAF"
          description="Consommation réelle observée"
          value={<>{formatNumber({ number: conso_since_2021 })} <span>ha</span></>}
          variant="default"
          footer={{
            type: "period",
            periods: [
              { label: "2021", active: true },
              { label: "2023" },
            ],
          }}
          action={{
            label: "Voir le diagnostic de consommation",
            to: urls.consommation,
          }}
        />
      </div>
      <div className="fr-col-12 fr-col-xl-4 fr-grid-row">
        <Kpi
          icon="bi bi-arrow-right"
          label="Consommation d'espaces NAF"
          description="Consommation à ne pas dépasser"
          value={<>{formatNumber({ number: allowed_conso_2021_2030 })} <span>ha</span></>}
          variant="default"
          footer={{
            type: "period",
            periods: [
              { label: "2021", active: false },
              { label: "2031" },
            ],
          }}
          action={{
            label: "Simuler une trajectoire",
            to: urls.trajectoires,
          }}
        />
      </div>
      <div className="fr-col-12 fr-col-xl-4 fr-grid-row">
        <GuideContent title="Comprendre l'objectif de réduction">
          <p className="fr-text--sm">
            L'objectif national de réduction de 50% se traduit, pour le territoire de <strong>{name}</strong>,
            par une consommation maximale de <strong>{formatNumber({ number: allowed_conso_2021_2030 })} ha entre 2021 et 2031</strong>.
          </p>
          <p className="fr-text--sm fr-mb-0">
            D'après les données du Portail National de l'Artificialisation, <strong>{formatNumber({ number: conso_since_2021 })} ha</strong> ont déjà été consommés <strong>entre 2021 et 2023</strong>.
          </p>
        </GuideContent>
      </div>
    </div>
  );
};

export default SyntheseConso;
