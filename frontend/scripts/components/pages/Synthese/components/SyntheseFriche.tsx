import React from "react";
import { LandDetailResultType } from "@services/types/land";
import { ProjectUrls } from "@utils/projectUrls";
import { formatNumber, pluralize } from "@utils/formatUtils";
import Kpi from "@components/ui/Kpi";
import GuideContent from "@components/ui/GuideContent";
import FricheStatus from "@components/features/status/FricheStatus";
import { FricheAbstractContent } from "@components/features/friches/FricheAbstractContent";

interface SyntheseFricheProps {
  landData: LandDetailResultType;
  urls: ProjectUrls;
}

const SyntheseFriche: React.FC<SyntheseFricheProps> = ({
  landData,
  urls,
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
    <div className="fr-grid-row fr-grid-row--gutters">
      <div className="fr-col-12 fr-col-xl-6 fr-grid-row">
        <Kpi
          icon="bi bi-building-x"
          label="Friches sans projet"
          variant="default"
          badge={friche_sans_projet_count > 0 ? "Actionnable" : undefined}
          value={<>{formatNumber({ number: friche_sans_projet_surface })} <span>ha</span></>}
          description={`${friche_sans_projet_count} ${pluralize(friche_sans_projet_count, "friche")}`}
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
          action={{
            label: "Voir le diagnostic des friches",
            to: urls.friches,
          }}
        />
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
  );
};

export default SyntheseFriche;
