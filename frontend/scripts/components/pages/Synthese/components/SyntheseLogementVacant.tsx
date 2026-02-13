import React from "react";
import { ProjectDetailResultType } from "@services/types/project";
import { LandDetailResultType } from "@services/types/land";
import {
  LogementVacantOverview,
  LogementVacantAbstract,
} from "@components/features/logementVacant";
import LogementVacantStatus from "@components/features/status/LogementVacantStatus";

interface SyntheseLogementVacantProps {
  landData: LandDetailResultType;
  projectData: ProjectDetailResultType;
}

const SyntheseLogementVacant: React.FC<SyntheseLogementVacantProps> = ({
  landData,
  projectData,
}) => {
  return (
    <div className="fr-mt-5w">
      {landData.has_logements_vacants ? (
        <>
          <LogementVacantOverview
            logements_vacants_status_details={
              landData.logements_vacants_status_details
            }
            className="fr-mb-3w"
          />
          <LogementVacantAbstract
            logements_vacants_status={landData.logements_vacants_status}
            logements_vacants_status_details={
              landData.logements_vacants_status_details
            }
            name={landData.name}
            className="fr-mt-2w"
            link={projectData.urls.logementVacant}
          />
        </>
      ) : (
        <LogementVacantStatus />
      )}
    </div>
  );
};

export default SyntheseLogementVacant;
