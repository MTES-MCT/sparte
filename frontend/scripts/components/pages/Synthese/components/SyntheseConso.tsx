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
}

const SyntheseConso: React.FC<SyntheseConsoProps> = ({
  landData,
  urls,
}) => {
  const { has_conso, consommation_correction_status } = landData;

  if (!has_conso) {
    return <ConsoCorrectionStatus status={consommation_correction_status} />;
  }

  const { name, conso_details } = landData;
  const { conso_2011_2020 } = conso_details;

  return (
    <div className="fr-grid-row fr-grid-row--gutters">
      <div className="fr-col-12 fr-col-xl-4 fr-grid-row">
        <Kpi
          icon="bi bi-check"
          label="Consommation d'espaces NAF"
          description="Période de référence"
          value={<>{formatNumber({ number: conso_2011_2020 })} <span>ha</span></>}
          variant="info"
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
      <div className="fr-col-12 fr-col-xl-4 fr-grid-row">
        <Kpi
          icon="bi bi-clock-history"
          label="Consommation d'espaces NAF"
          description="Période de réduction"
          value={<>12 <span>ha</span></>}
          variant="info"
          footer={{
            type: "period",
            periods: [
              { label: "2021", active: true },
              { label: "2023", active: false },
              { label: "2031" },
            ],
          }}
          action={{
            label: "Simuler une trajectoire de réduction",
            to: urls.consommation,
          }}
        />
      </div>
      <div className="fr-col-12 fr-col-xl-4 fr-grid-row">
        <GuideContent title="Que se passe-t-il avant 2031 ?">
          <p className="fr-text--sm fr-mb-2w">
            La première phase de loi Climat et Résilience consiste à{" "}
            <strong>
              réduire nationalement de 50 % la consommation d'espaces NAF (Naturels,
              Agricoles et Forestiers) entre 2021 et 2031
            </strong>
            , par rapport à la consommation de la période 2011-2020, aussi appelée
            période de référence.
          </p>
          <p className="fr-text--sm fr-mb-0">
            Sur le territoire de {name},{" "}
            <strong>
              {formatNumber({ number: conso_2011_2020 })} ha ont été consommés entre
              2011 et 2020 selon les données du Portail National de
              l'artificialisation
            </strong>
            .
          </p>
        </GuideContent>
      </div>
    </div>
  );
};

export default SyntheseConso;
