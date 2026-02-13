import React from "react";
import { Link } from "react-router-dom";
import { ProjectDetailResultType } from "@services/types/project";
import { LandDetailResultType } from "@services/types/land";
import { formatNumber } from "@utils/formatUtils";
import { ConsommationChart } from "@components/charts/consommation/ConsommationChart";
import CallToAction from "@components/ui/CallToAction";
import GuideContent from "@components/ui/GuideContent";
import ConsoCorrectionStatus from "@components/features/status/ConsoCorrectionStatus";
import BaseCard from "@components/ui/BaseCard";

interface SyntheseConsoProps {
  landData: LandDetailResultType;
  projectData: ProjectDetailResultType;
}

const ConsoContentDefault = ({
  landData,
}: {
  landData: LandDetailResultType;
}) => {
  const { name } = landData;
  const { conso_2011_2020 } = landData.conso_details;

  return (
    <>
      <p className="fr-text--sm fr-mb-2w">
        La première phase de loi Climat et Résilience consiste à{" "}
        <strong>
          réduire nationalement de 50 % la consommation d'espaces NAF (Naturels,
          Agricoles et Forestiers) entre 2021 et 2031
        </strong>
        , par rapport à la consommation de la période 2011-2020, aussi appelée
        période de référence.
      </p>
      <p className="fr-text--sm fr-mb-0">
        Sur le territoire de {name},{" "}
        <strong>
          {formatNumber({ number: conso_2011_2020 })} ha ont été consommés entre
          2011 et 2020 selon les données du Portail National de
          l'artificialisation
        </strong>
        .
      </p>
    </>
  );
};

const ConsoContentTerritorialise = ({
  landData,
}: {
  landData: LandDetailResultType;
}) => {
  const { name, conso_details } = landData;
  const {
    conso_2011_2020,
    allowed_conso_2021_2030,
    currently_respecting_regulation,
    allowed_conso_raised_to_1ha_2021_2030,
    conso_since_2021,
    current_percent_use,
    respecting_regulation_by_2030,
    projected_percent_use_by_2030,
  } = conso_details;

  return (
    <>
      <p className="fr-text--sm fr-mb-2w">
        La première phase de loi Climat et Résilience consiste à réduire
        nationalement de <strong>50 %</strong> la consommation d'espaces NAF
        (Naturels, Agricoles et Forestiers) entre 2021 et 2031, par rapport à la
        consommation de la période <strong>2011-2020</strong>, aussi appelée
        période de référence.
      </p>
      <p className="fr-text--sm fr-mb-2w">
        Sur le territoire de {name},{" "}
        <strong>
          {formatNumber({ number: conso_2011_2020 })} ha ont été consommés entre
          2011 et 2020
        </strong>
        .{" "}
        <strong>
          La consommation d'espaces de ce territoire ne devrait donc pas
          dépasser un total de{" "}
          {formatNumber({ number: allowed_conso_2021_2030 })} ha sur la période
          2021-2030 pour respecter l'objectif national.
        </strong>
      </p>
      {allowed_conso_raised_to_1ha_2021_2030 && (
        <p className="fr-text--sm fr-mb-2w">
          La situation de {name} est un cas particulier car sa consommation est
          inférieure à 2 ha sur la période de référence (2011-2020). L'objectif
          de réduction de 50% ne s'applique pas dans ce cas, et son objectif de
          consommation d'espaces NAF est donc de ne pas dépasser 1 ha sur la
          période 2021-2031.{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.legifrance.gouv.fr/loda/id/JORFTEXT000043956924#:~:text=3%C2%B0%20bis%20Une,%C3%A0%20un%20hectare."
          >
            Source
          </a>
          .
        </p>
      )}

      <p className="fr-text--sm fr-mb-2w">
        Depuis 2021,{" "}
        <strong>
          {formatNumber({ number: conso_since_2021 })} ha d'espaces NAF ont été
          consommés
        </strong>
        .{" "}
        <strong>
          {currently_respecting_regulation ? (
            <span className="fr-badge--success">
              L'objectif national de réduction serait donc actuellement respecté
            </span>
          ) : (
            <span className="fr-badge--error">
              L'objectif national de réduction ne serait pas respecté
            </span>
          )}
        </strong>{" "}
        par le territoire de {name}, avec un taux de consommation de{" "}
        <strong>{formatNumber({ number: current_percent_use })}%</strong> de la
        consommation observée par rapport à celle de la période de référence.
      </p>

      <p className="fr-text--sm fr-mb-2w">
        {respecting_regulation_by_2030 ? (
          <>
            Le territoire de {name}{" "}
            <strong>
              <span className="fr-badge--success">
                devrait respecter l'objectif national de réduction à horizon
                2031
              </span>
            </strong>
          </>
        ) : (
          <>
            Cependant, le territoire de {name}{" "}
            <strong>
              <span className="fr-badge--error">
                ne devrait pas respecter l'objectif national de réduction à
                horizon 2031
              </span>
            </strong>
          </>
        )}
        , avec un taux de consommation projeté de{" "}
        <strong>
          {formatNumber({ number: projected_percent_use_by_2030 })}%
        </strong>{" "}
        par rapport à la consommation de la période de référence.
      </p>
      <p className="fr-text--sm">
        <strong>
          <i className="bi bi-exclamation-triangle text-danger fr-mr-1w" /> Il
          est important de noter que l'objectif national est en cours de
          territorialisation et que les objectifs locaux pourront différer en
          fonction des documents d'urbanisme en vigueur.
        </strong>
      </p>
    </>
  );
};

const SyntheseConso: React.FC<SyntheseConsoProps> = ({
  landData,
  projectData,
}) => {
  const { has_conso, consommation_correction_status } = landData;

  if (!has_conso) {
    return <ConsoCorrectionStatus status={consommation_correction_status} />;
  }

  const { land_id, land_type, name, conso_details } = landData;
  const { urls } = projectData;
  const { trajectoire_conso_is_territorialise } = conso_details;

  const consoContent = trajectoire_conso_is_territorialise ? (
    <ConsoContentTerritorialise landData={landData} />
  ) : (
    <ConsoContentDefault landData={landData} />
  );

  return (
    <div className="fr-mt-5w fr-mb-10w">
      <div className="fr-grid-row fr-grid-row--gutters fr-mb-2w">
        <div className="fr-col-12 fr-col-md-6 fr-grid-row">
          <BaseCard $padding="lg">
            <ConsommationChart
              id="conso_annual"
              land_id={land_id}
              land_type={land_type}
              showToolbar={true}
            />
          </BaseCard>
        </div>
        <div className="fr-col-12 fr-col-md-6 fr-grid-row">
          <GuideContent title="Que se passe-t-il avant 2031 ?">
            {consoContent}
          </GuideContent>
        </div>
      </div>
      <CallToAction
        title={`Diagnostiquer et simuler la consommation d'espaces NAF de ${name}`}
        text="Découvrez dans notre diagnostic de consommation d'espaces NAF : analyse détaillée de la consommation d'espaces NAF par destination, mise en relation avec l'évolution démographique, et comparaison avec d'autres territoires."
      >
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
      </CallToAction>
    </div>
  );
};

export default SyntheseConso;
