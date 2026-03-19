import React from "react";
import { LandDetailResultType } from "@services/types/land";
import { ProjectUrls } from "@utils/projectUrls";
import { formatNumber } from "@utils/formatUtils";
import Kpi from "@components/ui/Kpi";
import GuideContent from "@components/ui/GuideContent";
import LogementVacantStatus from "@components/features/status/LogementVacantStatus";
import { LogementVacantAbstract } from "@components/features/logementVacant";

interface SyntheseLogementVacantProps {
  landData: LandDetailResultType;
  urls: ProjectUrls;
}

const SyntheseLogementVacant: React.FC<SyntheseLogementVacantProps> = ({
  landData,
  urls,
}) => {
  if (!landData.has_logements_vacants_prive && !landData.has_logements_vacants_social) {
    return <LogementVacantStatus />;
  }

  const {
    logements_vacants_parc_prive,
    logements_vacants_parc_social,
  } = landData.logements_vacants_status_details;

  const hasPriveData = logements_vacants_parc_prive !== null;
  const hasSocialData = logements_vacants_parc_social !== null;
  const totalVacants = (hasPriveData ? logements_vacants_parc_prive : 0) + (hasSocialData ? logements_vacants_parc_social : 0);
  const isActionnable = totalVacants > 0;

  return (
    <div className="fr-grid-row fr-grid-row--gutters">
      <div className="fr-col-12 fr-col-xl-6 fr-grid-row">
        <Kpi
          icon="bi bi-house"
          label="Logements vacants"
          variant="default"
          badge={isActionnable ? "Actionnable" : undefined}
          value={formatNumber({ number: totalVacants, decimals: 0 })}
          footer={{
            type: "metric",
            items: [
              {
                icon: "bi bi-house",
                label: "Logements vacants dans le parc privé",
                value: hasPriveData ? formatNumber({ number: logements_vacants_parc_prive, decimals: 0 }) : "—",
              },
              {
                icon: "bi bi-houses",
                label: "Logements vacants dans le parc des bailleurs sociaux",
                value: hasSocialData ? formatNumber({ number: logements_vacants_parc_social, decimals: 0 }) : "—",
              },
            ],
          }}
          action={{
            label: "Voir le diagnostic des logements vacants",
            to: urls.logementVacant,
          }}
        />
      </div>
      <div className="fr-col-12 fr-col-xl-6 fr-grid-row">
        <GuideContent title="Les logements vacants : un levier pour la sobriété foncière">
          <LogementVacantAbstract
            logements_vacants_status={landData.logements_vacants_status}
            logements_vacants_status_details={landData.logements_vacants_status_details}
            name={landData.name}
            contentOnly
          />
        </GuideContent>
      </div>
    </div>
  );
};

export default SyntheseLogementVacant;
