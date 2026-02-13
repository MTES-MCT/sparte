import React from "react";
import { ProjectDetailResultType } from "@services/types/project";
import { LandDetailResultType } from "@services/types/land";
import { FricheOverview, FricheAbstract } from "@components/features/friches";
import FricheStatus from "@components/features/status/FricheStatus";

interface SyntheseFricheProps {
  landData: LandDetailResultType;
  projectData: ProjectDetailResultType;
}

const SyntheseFriche: React.FC<SyntheseFricheProps> = ({
  landData,
  projectData,
}) => {
  return (
    <div className="fr-mt-7w">
      {landData.has_friche ? (
        <>
          <FricheOverview
            friche_status_details={landData.friche_status_details}
            className="fr-mb-3w"
          />
          <FricheAbstract
            friche_status={landData.friche_status}
            friche_status_details={landData.friche_status_details}
            name={landData.name}
            className="fr-mt-2w"
            link={projectData.urls.friches}
          />
        </>
      ) : (
        <FricheStatus />
      )}
    </div>
  );
};

export default SyntheseFriche;
