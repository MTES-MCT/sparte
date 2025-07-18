import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ProjectDetailResultType } from "@services/types/project";
import { LandDetailResultType } from "@services/types/land";
import Loader from "@components/ui/Loader";
import { formatNumber } from "@utils/formatUtils";
import { MillesimeDisplay } from "@components/features/ocsge/MillesimeDisplay";
import { LandMillesimeTable } from "@components/features/ocsge/LandMillesimeTable";
import { useArtificialisation } from "@hooks/useArtificialisation";
import { FricheOverview, FricheAbstract } from "@components/features/friches";
import {
  LogementVacantOverview,
  LogementVacantAbstract,
} from "@components/features/logementVacant";
import FricheStatus from "@components/features/status/FricheStatus";
import LogementVacantStatus from "@components/features/status/LogementVacantStatus";
import { ConsommationChart } from "@components/charts/consommation/ConsommationChart";
import CallToAction from "@components/ui/CallToAction";
import styled from "styled-components";
import { ArtifSyntheseChart } from "@components/charts/artificialisation/ArtifSyntheseChart";

interface SyntheseProps {
  projectData: ProjectDetailResultType;
  landData: LandDetailResultType;
}


const SyntheseConso = ({ landData, projectData, levierSkipLinkClickHandler }: {
    landData: LandDetailResultType;
    projectData: ProjectDetailResultType;
    levierSkipLinkClickHandler: () => void;
}) => {
  const { land_id, land_type, name } = landData;
  const { urls } = projectData;

  return (
    <div className="fr-mt-5w fr-mb-10w">
      <div className="fr-grid-row fr-grid-row--gutters fr-mb-2w">
        <div className="fr-col-12 fr-col-md-6 fr-grid-row">
          <div className="bg-white fr-p-3w rounded w-100">
            <div className="fr-mb-3w">
              <ConsommationChart
                id="conso_annual"
                land_id={land_id}
                land_type={land_type}
                showToolbar={false}
              />
            </div>
          </div>
        </div>
        <div className="fr-col-12 fr-col-md-6 fr-grid-row">
          <div className="bg-white fr-p-3w rounded w-100">
            <p className="fr-text--sm fr-mb-2w">
              La première phase de loi Climat et Résilience consiste à réduire
              nationnalement de <strong>50 %</strong> la consommation d'espaces NAF (Naturels,
              Agricoles et Forestiers) entre 2021 et 2031, par rapport à la
              consommation de la période <strong>2011-2020</strong>, aussi
              appelée période de référence.
            </p>
            <p className="fr-text--sm fr-mb-2w">
              Sur le territoire de {name},{" "}
              <strong>41,2 ha ont été consommés entre 2011 et 2020</strong>.{" "}
              <strong>
                La consommation d'espaces de ce territoire ne devrait donc pas
                dépasser un total de 20,6 ha sur la période 2021-2030 pour respecter l'objectif national.
              </strong>
            </p>
            <p className="fr-text--sm fr-mb-2w">
              Depuis 2021, <strong>10 ha d'espaces NAF ont été consommés</strong>.
              <strong>
              {" "}<span className="fr-badge--success">L'objectif national de réduction serait donc actuellement respecté</span></strong> par le territoire 
              de {name}, avec un taux de consommation de{" "}
              <strong>{formatNumber({ number: 10 / 41.2 * 100 })}%</strong> de la consommation observée
              par rapport à celle de la période de référence.
            </p>
            <p className="fr-text--sm fr-mb-2w">
              Cependant, si la consommation d'espaces de ce territoire se poursuit au même
              rythme,  <strong><span className="fr-badge--error">l'objectif national de réduction à horizon 2031 serait dépassé en 2028.</span></strong>
            </p>
            <p className="fr-text--sm">
                <strong>
                  <i className="bi bi-exclamation-triangle text-danger fr-mr-1w" /> Il est important de noter que l'objectif national est en cours de territorialisation.
                </strong>
            </p>
          </div>
        </div>
      </div>
      <CallToAction
        title={`Diagnostiquer et simuler la consommation d'espaces NAF de ${name}`}
        text="Découvrez dans notre diagnostic de consommation d’espaces NAF : analyse détaillée de la consommation d’espaces NAF par destination, mise en relation avec l’évolution démographique, et comparaison avec une selection de territoires similaires."
      >
        <div className="d-flex align-items-center gap-3">
          <Link
            to={urls.consommation}
            className="fr-btn fr-icon-arrow-right-line fr-btn--icon-right fr-text--sm"
          >
            Diagnostic de la consommation
          </Link>
          <Link
            to={urls.trajectoires}
            className="fr-btn fr-icon-arrow-right-line fr-btn--icon-right fr-text--sm"
          >
            Simulation de trajectoire de consommation
          </Link>
        </div>
      </CallToAction>
    </div>
  );
};

const SyntheseArtif = ({ landData, projectData }: SyntheseProps) => {
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
      <div className="fr-col-12 fr-col-md-6 fr-grid-row">
        <div className="bg-white fr-p-3w rounded w-100">
          <div className="fr-mb-3w">
            <ArtifSyntheseChart
              land_id={landData.land_id}
              land_type={landData.land_type}
            />
          </div>

        </div>
      </div>
      <div className="fr-col-12 fr-col-md-6 fr-grid-row">
        <div className="bg-white fr-p-3w rounded w-100">
          <p className="fr-text--sm fr-mb-2w">
            La deuxième phase de la loi Climat et Résilience consiste à atteindre{" "}
            <strong>
              l'objectif de Zéro Artificialisation Nette en 2050
            </strong>
            , mesurée avec des données, non plus de consommation d'espaces, mais
            d'artificialisation du sol. L'artificialisation nette
            correspond à la différence entre les surfaces artificialisées et les
            surfaces désartificialisées. Les données d'artificialisation sont produites 
            à partir des données OCS GE.
          </p>
          <LandMillesimeTable
            millesimes={landData.millesimes}
            territory_name={landData.name}
            is_interdepartemental={landData.is_interdepartemental}
          />
          <p className="fr-text--sm fr-mt-2w">
            Sur le territoire de {landData.name}, <MillesimeDisplay
              is_interdepartemental={landData.is_interdepartemental}
              landArtifStockIndex={data}
              between={true}
              className="fr-text--sm"
            />, <strong>l'artificialisation nette est de {formatNumber({ number: data.flux_surface })} ha</strong>.
          </p>
          <p className="fr-text--sm fr-mt-2w">
            Cette donnée a pour le moment un caractère informatif puisqu'elle n'est pas encore réglementaire.
            Cependant, <strong>elle permet une analyse plus fine de l'évolution des sols et permet de se projeter
            plus concrètement dans une dynamique de sobriété foncière</strong>.
          </p>
          <p className="fr-text--sm fr-mt-2w">
            Notamment, la notion d'artificialisation
            {" "}<strong>nette</strong> permet de prendre en compte les surfaces désartificialisées, et ainsi de mieux valoriser
            les initiatives locales de renaturation des sols, tout en permettant de continuer à développer son
            territoire durablement.
        </p>
        </div>
      </div>
            <CallToAction
        title="Diagnostiquer l'artificialisation des sols et explorer les données"
        text="Découvrez dans notre diagnostic d'artificialisation : analyse détaillée de l'artificialisation des sols par destination, mise en relation avec l’évolution démographique, et comparaison avec une selection de territoires similaires."
      >
        <div className="d-flex align-items-center gap-3">
        <Link
            to={projectData.urls.artificialisation}
            className="fr-btn fr-mt-3w fr-icon-arrow-right-line fr-btn--icon-right fr-text--sm"
          >
            Diagnostic de l'artificialisation
          </Link>

        </div>
      </CallToAction>
    </div>
  );
};

const SyntheseLogementVacant = ({ landData, projectData }: SyntheseProps) => {
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

const SyntheseFriche = ({ landData, projectData }: SyntheseProps) => {
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

const Synthese: React.FC<SyntheseProps> = ({ projectData, landData }) => {
  const levierRef = useRef(null)
  const levierSkipLinkClickHandler = () => {
    const offset = 200;
    const elementPosition = levierRef.current.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - offset;
    if (levierRef.current) {
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };


  return (
    <div className="fr-container--fluid fr-p-3w">
        <h2>Période 2021-2030 : mesure et objectifs de consommation d'espaces</h2>
      <SyntheseConso landData={landData} projectData={projectData} levierSkipLinkClickHandler={levierSkipLinkClickHandler} />
      {landData.has_ocsge && (
        <>
        <h2>Période 2021 - 2050 : mesure et objectifs de l’artificialisation des sols</h2>
        <SyntheseArtif landData={landData} projectData={projectData} />
        </>
      )}
      <h2 ref={levierRef} id="agir-leviers-sobriete-fonciere" className="fr-mt-10w">Agir : les leviers de la sobriété foncière</h2>
      <h3>Vacance des Logements</h3>
      <SyntheseLogementVacant landData={landData} projectData={projectData} />
      <h3>Réhabilitation des friches</h3>
      <SyntheseFriche landData={landData} projectData={projectData} />
    </div>
  );
};

export default Synthese;
