import React from "react";
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
import { ArtifSyntheseChart } from "@components/charts/artificialisation/ArtifSyntheseChart";
import ConsoCorrectionStatus, { ConsoCorrectionStatusEnum } from "@components/features/status/ConsoCorrectionStatus";
import OcsgeStatus from "@components/features/status/OcsgeStatus";

interface SyntheseProps {
  projectData: ProjectDetailResultType;
  landData: LandDetailResultType;
}


const SyntheseConso = ({ landData, projectData }: {
    landData: LandDetailResultType;
    projectData: ProjectDetailResultType;
}) => {
  const { land_id, land_type, name, conso_details } = landData;
  const { 
    conso_2011_2020,
    allowed_conso_2021_2030,
    conso_since_2021,
    currently_respecting_regulation,
    current_percent_use,
    respecting_regulation_by_2030,
    projected_percent_use_by_2030,
    allowed_conso_raised_to_1ha_2021_2030
  } = conso_details;
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
              <strong>{formatNumber({number: conso_2011_2020})} ha ont été consommés entre 2011 et 2020</strong>.{" "}
          
              <strong>
                La consommation d'espaces de ce territoire ne devrait donc pas
                dépasser un total de {formatNumber({number: allowed_conso_2021_2030})} ha sur la période 2021-2030 pour respecter l'objectif national.
              </strong>
            </p>
            {allowed_conso_raised_to_1ha_2021_2030 && (
              <p className="fr-text--sm fr-mb-2w">
                  La situation de {name} est un cas particulier car sa consommation est
                  inférieure à 2 ha sur la période de référence (2011-2020). L'objectif de réduction de 50% ne s'applique
                  pas dans ce cas, et son objectif de consommation d'espaces NAF est donc de ne pas dépasser 1 ha sur la période 2021-2031.{" "}
                  <a target="_blank" href="https://www.legifrance.gouv.fr/loda/id/JORFTEXT000043956924#:~:text=3%C2%B0%20bis%20Une,%C3%A0%20un%20hectare.">Source</a>.
              </p>
            )}

            <p className="fr-text--sm fr-mb-2w">
              Depuis 2021, <strong>{formatNumber({number: conso_since_2021})} ha d'espaces NAF ont été consommés</strong>.{" "}
              <strong>{currently_respecting_regulation ? (
                <span className="fr-badge--success">L'objectif national de réduction serait donc actuellement respecté</span>
              ) : (
                <span className="fr-badge--error">L'objectif national de réduction ne serait pas respecté</span>
              )}</strong>{" "}

              par le territoire  de {name}, avec un taux de consommation de{" "}
              <strong>{formatNumber({ number: current_percent_use })}%</strong> de la consommation observée
              par rapport à celle de la période de référence.
            </p>

            <p className="fr-text--sm fr-mb-2w">
              {respecting_regulation_by_2030 ? (
                <>Le territoire de {name} <strong><span className="fr-badge--success">devrait respecter l'objectif national de réduction à horizon 2031</span></strong></>
              ) : (
                <>Cependant, le territoire de {name} <strong><span className="fr-badge--error">ne devrait pas respecter l'objectif national de réduction à horizon 2031</span></strong></>
              )}
              , avec un taux de consommation projeté de{" "}
              <strong>{formatNumber({ number: projected_percent_use_by_2030 })}%</strong> par rapport à la consommation de la période de référence.
            </p>
            <p className="fr-text--sm">
                <strong>
                  <i className="bi bi-exclamation-triangle text-danger fr-mr-1w" /> Il est important de noter que l'objectif national est en cours de territorialisation
                  et que les objectifs locaux pourront différer en fonction des documents d'urbanisme en vigueur.
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
            />, <strong>l'artificialisation nette est de {formatNumber({ number: data.flux_surface })} ha</strong>,
            <strong> soit {formatNumber({ number: data.flux_percent })}% de la surface totale du territoire</strong>.          
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
  const { consommation_correction_status, ocsge_status, has_conso, has_ocsge } = landData;
  return (
    <div className="fr-container--fluid fr-p-3w">
      <h2>Comprendre : les objectifs de sobriété foncière</h2>
      <h3>Période 2021-2030 : mesure de la consommation d'espaces</h3>
      {has_conso ? (
          <SyntheseConso landData={landData} projectData={projectData} />
      ) : <ConsoCorrectionStatus status={consommation_correction_status} />}
      <h3>Période 2021 - 2050 : mesure de l’artificialisation des sols</h3>
      {has_ocsge ? (
        <SyntheseArtif landData={landData} projectData={projectData} />
       ) : <OcsgeStatus status={ocsge_status} />}
      <h2 id="agir-leviers-sobriete-fonciere" className="fr-mt-10w">Agir : les leviers de la sobriété foncière</h2>
      <h3>Vacance des Logements</h3>
      <SyntheseLogementVacant landData={landData} projectData={projectData} />
      <h3>Réhabilitation des friches</h3>
      <SyntheseFriche landData={landData} projectData={projectData} />
    </div>
  );
};

export default Synthese;
