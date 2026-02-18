import React from "react";
import { ProjectDetailResultType } from "@services/types/project";
import { LandDetailResultType } from "@services/types/land";
import { formatNumber, pluralize } from "@utils/formatUtils";
import Kpi from "@components/ui/Kpi";
import CallToAction from "@components/ui/CallToAction";
import GuideContent from "@components/ui/GuideContent";
import FricheStatus from "@components/features/status/FricheStatus";
import { FricheAbstractContent } from "@components/features/friches/FricheAbstractContent";

interface SyntheseFricheProps {
  landData: LandDetailResultType;
  projectData: ProjectDetailResultType;
}

const SyntheseFriche: React.FC<SyntheseFricheProps> = ({
  landData,
  projectData,
}) => {
  if (!landData.has_friche) {
    return <FricheStatus />;
  }

  const {
    friche_sans_projet_surface,
    friche_sans_projet_count,
    friche_sans_projet_surface_artif,
    friche_sans_projet_surface_imper,
  } = landData.friche_status_details;

  return (
    <div className="fr-mt-5w fr-mb-10w">
      <div className="fr-grid-row fr-grid-row--gutters fr-mb-2w">
        <div className="fr-col-12 fr-col-xl-6 fr-grid-row">
          <div className="fr-col-12">
            <Kpi
              icon="bi bi-building-x"
              label="Friches sans projet"
              variant="info"
              badge={friche_sans_projet_count > 0 ? "Actionnable" : undefined}
              value={<>{formatNumber({ number: friche_sans_projet_surface })} <span>ha</span></>}
              detail={`${friche_sans_projet_count} ${pluralize(friche_sans_projet_count, "friche")}`}
              footer={{
                type: "metric",
                items: [
                  {
                    icon: "bi bi-bricks",
                    label: "Surfaces artificialisées",
                    value: `${formatNumber({ number: friche_sans_projet_surface_artif })} ha`,
                  },
                  {
                    icon: "bi bi-droplet-fill",
                    label: "Surfaces imperméables",
                    value: `${formatNumber({ number: friche_sans_projet_surface_imper })} ha`,
                  },
                ],
              }}
            />
          </div>
        </div>
        <div className="fr-col-12 fr-col-xl-6 fr-grid-row">
          <GuideContent title="Les friches : un levier pour la sobriété foncière">
            <FricheAbstractContent
              friche_status={landData.friche_status}
              friche_status_details={landData.friche_status_details}
              name={landData.name}
            />
          </GuideContent>
        </div>
      </div>

      <CallToAction
        title="Explorer les données sur les friches"
        text="Découvrez une analyse détaillée des friches sur votre territoire : localisation, surface, statut, et potentiel de réhabilitation."
        actions={[
          { label: "Diagnostic des friches", to: projectData.urls.friches },
        ]}
      />
    </div>
  );
};

export default SyntheseFriche;
