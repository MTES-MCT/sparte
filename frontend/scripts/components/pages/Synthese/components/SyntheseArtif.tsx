import React from "react";
import { Link } from "react-router-dom";
import { ProjectDetailResultType } from "@services/types/project";
import { LandDetailResultType } from "@services/types/land";
import { formatNumber } from "@utils/formatUtils";
import Loader from "@components/ui/Loader";
import { MillesimeDisplay } from "@components/features/ocsge/MillesimeDisplay";
import { LandMillesimeTable } from "@components/features/ocsge/LandMillesimeTable";
import { useArtificialisation } from "@hooks/useArtificialisation";
import { ArtifSyntheseChart } from "@components/charts/artificialisation/ArtifSyntheseChart";
import CallToAction from "@components/ui/CallToAction";
import OcsgeStatus from "@components/features/status/OcsgeStatus";
import GuideContent from "@components/ui/GuideContent";
import BaseCard from "@components/ui/BaseCard";

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

  const drawerContent = (
    <>
      <LandMillesimeTable
        millesimes={landData.millesimes}
        territory_name={landData.name}
        is_interdepartemental={landData.is_interdepartemental}
      />
      <p className="fr-text--sm fr-mt-2w">
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
      <p className="fr-text--sm fr-mt-2w">
        Cette donnée a pour le moment un caractère informatif puisqu'elle n'est
        pas encore réglementaire. Cependant,{" "}
        <strong>
          elle permet une analyse plus fine de l'évolution des sols et permet de
          se projeter plus concrètement dans une dynamique de sobriété foncière
        </strong>
        .
      </p>
      <p className="fr-text--sm fr-mt-2w">
        Notamment, la notion d'artificialisation <strong>nette</strong> permet
        de prendre en compte les surfaces désartificialisées, et ainsi de mieux
        valoriser les initiatives locales de renaturation des sols, tout en
        permettant de continuer à développer son territoire durablement.
      </p>
    </>
  );

  return (
    <div className="fr-mt-5w fr-mb-10w">
      <div className="fr-grid-row fr-grid-row--gutters fr-mb-2w">
        <div className="fr-col-12 fr-col-md-6 fr-grid-row">
          <BaseCard $padding="lg">
            <ArtifSyntheseChart
              land_id={landData.land_id}
              land_type={landData.land_type}
            />
          </BaseCard>
        </div>
        <div className="fr-col-12 fr-col-md-6 fr-grid-row">
          <GuideContent
            title="Que se passe-t-il après 2031 ?"
            DrawerTitle="Artificialisation des sols — Données détaillées"
            drawerChildren={drawerContent}
          >
            <p className="fr-text--sm fr-mb-2w">
              La deuxième phase de la loi Climat et Résilience consiste à
              atteindre{" "}
              <strong>
                l'objectif de Zéro Artificialisation Nette en 2050
              </strong>
              , mesurée avec des données d'artificialisation du sol produites à
              partir de l'OCS GE.
            </p>
            <p className="fr-text--sm fr-mb-0">
              Sur le territoire de {landData.name},{" "}
              <strong>
                l'artificialisation nette est de{" "}
                {formatNumber({ number: data.flux_surface })} ha
              </strong>
              , soit{" "}
              <strong>
                {formatNumber({ number: data.flux_percent })}% de la surface
                totale
              </strong>
              .
            </p>
          </GuideContent>
        </div>
      </div>
      <CallToAction
        title="Diagnostiquer l'artificialisation des sols et explorer les données"
        text="Découvrez une analyse détaillée de l'artificialisation et des surfaces artificialisées sur votre territoire"
      >
        <Link
          to={projectData.urls.artificialisation}
          className="fr-btn fr-icon-arrow-right-line fr-btn--icon-right fr-text--sm"
        >
          Diagnostic de l'artificialisation
        </Link>
      </CallToAction>
    </div>
  );
};

export default SyntheseArtif;
