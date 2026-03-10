import React from "react";
import { LandDetailResultType } from "@services/types/land";
import { ProjectUrls } from "@utils/projectUrls";
import { formatNumber } from "@utils/formatUtils";
import Loader from "@components/ui/Loader";
import { MillesimeDisplay } from "@components/features/ocsge/MillesimeDisplay";
import { OcsgeDrawerProvider } from "@components/features/ocsge/OcsgeDrawerContext";
import { useArtificialisation } from "@hooks/useArtificialisation";
import Kpi from "@components/ui/Kpi";
import OcsgeStatus from "@components/features/status/OcsgeStatus";
import GuideContent from "@components/ui/GuideContent";

interface SyntheseArtifProps {
  landData: LandDetailResultType;
  urls: ProjectUrls;
}

const SyntheseArtifContent: React.FC<SyntheseArtifProps> = ({
  landData,
  urls,
}) => {
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
    <OcsgeDrawerProvider millesimes={landData.millesimes} territoryName={landData.name} isInterdepartemental={landData.is_interdepartemental}>
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-xl-6 fr-grid-row">
          <Kpi
            icon={data.flux_surface > 0 ? "bi bi-arrow-up" : data.flux_surface < 0 ? "bi bi-arrow-down" : "bi bi-dash"}
            label="Artificialisation nette observée"
            value={<>{data.flux_surface > 0 ? "+" : ""}{formatNumber({ number: data.flux_surface })} <span>ha</span></>}
            variant={data.flux_surface > 0 ? "error" : data.flux_surface < 0 ? "success" : "default"}
            footer={{
              type: "period",
              from: landData.is_interdepartemental
                ? `Millésime n°${data.millesime_index - 1}`
                : data.flux_previous_years.length > 0 ? data.flux_previous_years.join("-") : "—",
              to: landData.is_interdepartemental
                ? `Millésime n°${data.millesime_index}`
                : data.years.length > 0 ? data.years.join("-") : "—",
            }}
            action={{
              label: "Voir le diagnostic d'artificialisation",
              to: urls.artificialisation,
            }}
          />
        </div>
        <div className="fr-col-12 fr-col-xl-6 fr-grid-row">
          <GuideContent title="Qu'est ce que le ZAN ?">
          <p className="fr-text--sm">
              À partir de 2031, l'objectif est d'atteindre <strong>Zéro Artificialisation Nette</strong> :
              toute nouvelle artificialisation doit être compensée par une désartificialisation équivalente.
              Cela implique de <strong>renaturer des espaces</strong> pour compenser les nouvelles constructions.
            </p>
            <p className="fr-text--sm fr-mb-0">
              A titre d'exemple,
              Sur le territoire de {landData.name},{" "}
              <MillesimeDisplay
                is_interdepartemental={landData.is_interdepartemental}
                landArtifStockIndex={data}
                between={true}
                className="fr-text--sm"
              />
              , <strong>l'artificialisation nette est de{" "}
              {formatNumber({ number: data.flux_surface })} ha</strong>.
            </p>
          </GuideContent>
        </div>
      </div>
    </OcsgeDrawerProvider>
  );
};

const SyntheseArtif: React.FC<SyntheseArtifProps> = ({
  landData,
  urls,
}) => {
  if (!landData.has_ocsge) {
    return <OcsgeStatus status={landData.ocsge_status} />;
  }

  return <SyntheseArtifContent landData={landData} urls={urls} />;
};

export default SyntheseArtif;
