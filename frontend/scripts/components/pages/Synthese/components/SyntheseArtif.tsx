import React from "react";
import { ProjectDetailResultType } from "@services/types/project";
import { LandDetailResultType } from "@services/types/land";
import { formatNumber } from "@utils/formatUtils";
import Loader from "@components/ui/Loader";
import { MillesimeDisplay } from "@components/features/ocsge/MillesimeDisplay";
import { useArtificialisation } from "@hooks/useArtificialisation";
import Kpi from "@components/ui/Kpi";
import OcsgeStatus from "@components/features/status/OcsgeStatus";
import GuideContent from "@components/ui/GuideContent";

interface SyntheseArtifProps {
  landData: LandDetailResultType;
  projectData: ProjectDetailResultType;
}

const SyntheseArtif: React.FC<SyntheseArtifProps> = ({
  landData,
  projectData,
}) => {
  const { has_ocsge, ocsge_status } = landData;

  if (!has_ocsge) {
    return <OcsgeStatus status={ocsge_status} />;
  }

  const {
    landArtifStockIndex: data,
    isLoading,
    error,
  } = useArtificialisation({
    landData,
  });

  if (isLoading) return <Loader />;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div className="fr-grid-row fr-grid-row--gutters">
      <div className="fr-col-12 fr-col-xl-4 fr-grid-row">
        <Kpi
          icon={data.flux_surface > 0 ? "bi bi-arrow-up" : data.flux_surface < 0 ? "bi bi-arrow-down" : "bi bi-dash"}
          label="Artificialisation nette"
          description="Période actuelle"
          value={<>{data.flux_surface > 0 ? "+" : ""}{formatNumber({ number: data.flux_surface })} <span>ha</span></>}
          variant={data.flux_surface > 0 ? "error" : data.flux_surface < 0 ? "success" : "info"}
          footer={{
            type: "period",
            periods: [
              { label: data.flux_previous_years.length > 0 ? data.flux_previous_years.join("-") : "—", active: true },
              { label: data.years.length > 0 ? data.years.join("-") : "—" },
            ],
          }}
          action={{
            label: "Voir le diagnostic d'artificialisation",
            to: projectData.urls.artificialisation,
          }}
        />
      </div>
      <div className="fr-col-12 fr-col-xl-4 fr-grid-row">
        <Kpi
          icon="bi bi-heart-arrow"
          label="Artificialisation nette"
          description="Période de réduction"
          value={<>Zéro</>}
          variant="info"
          footer={{
            type: "period",
            periods: [
              { label: "2031", active: true },
              { label: "2050" },
            ],
          }}
          action={{
            label: "Voir le diagnostic d'artificialisation",
            to: projectData.urls.artificialisation,
          }}
        />
      </div>
      <div className="fr-col-12 fr-col-xl-4 fr-grid-row">
        <GuideContent
          title="Que se passe-t-il après 2031 ?"
        >
          <p className="fr-text--sm fr-mb-2w">
            La deuxième phase de la loi Climat et Résilience consiste à
            atteindre{" "}
            <strong>
              l'objectif de Zéro Artificialisation Nette en 2050
            </strong>
            , mesurée avec des données, non plus de consommation d'espaces, mais d'artificialisation du sol (OCS GE).
            L'artificialisation nette correspond à la différence entre les surfaces artificialisées et les surfaces désartificialisées.
          </p>
          <p className="fr-text--sm fr-mb-0">
            Sur le territoire de {landData.name},{" "}
            <MillesimeDisplay
              is_interdepartemental={landData.is_interdepartemental}
              landArtifStockIndex={data}
              between={true}
              className="fr-text--sm"
            />
            ,{" "}
            <strong>
              l'artificialisation nette est de{" "}
              {formatNumber({ number: data.flux_surface })} ha
            </strong>
            ,
            <strong>
              {" "}
              soit {formatNumber({ number: data.flux_percent })}% de la surface
              totale du territoire
            </strong>
            .
          </p>
        </GuideContent>
      </div>
    </div>
  );
};

export default SyntheseArtif;
