import React from "react";
import GenericChart from "@components/charts/GenericChart";
import GuideContent from "@components/ui/GuideContent";
import BaseCard from "@components/ui/BaseCard";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { useGetLogementVacantAutorisationStatsQuery } from "@services/api";
import { formatNumber } from "@utils/formatUtils";
import { useLogementVacantContext } from "../context/LogementVacantContext";

const ComprendreLesDonnees: React.FC = () => {
  const { landId, landType, endYear, name } = useLogementVacantContext();

  const { data: stats } = useGetLogementVacantAutorisationStatsQuery({
    land_id: landId,
    land_type: landType,
    end_date: endYear,
  });

  if (!stats) {
    return null;
  }

  const {
    autorisations,
    percent_autorisations_on_parc: percentAutorisationsOnParc,
    vacants_prive: vacantsPriv,
    percent_vacants_prive: percentVacantsPriv,
    vacants_social: vacantsSocial,
    percent_vacants_social: percentVacantsSocial,
    ratio,
  } = stats;

  const pluralAutorisations = autorisations > 1 ? "s" : "";
  const verbAutorisations =
    autorisations > 1 ? "ont été délivrées" : "a été délivrée";
  const pluralPriv = vacantsPriv > 1 ? "s" : "";
  const verbPriv = vacantsPriv > 1 ? "étaient vacants" : "était vacant";
  const pluralSocial = vacantsSocial > 1 ? "s" : "";
  const verbSocial = vacantsSocial > 1 ? "étaient vacants" : "était vacant";

  let ratioInterpretation = "";
  if (ratio > 100) {
    const times = formatNumber({ number: ratio / 100, decimals: 2 });
    ratioInterpretation = `il y a ${times} fois plus de logements vacants que d'autorisations de construction de logement.`;
  } else if (ratio === 100) {
    ratioInterpretation =
      "il y a autant de logements vacants que d'autorisations de construction de logement.";
  } else if (ratio > 0) {
    const times = formatNumber({ number: 100 / ratio, decimals: 2 });
    ratioInterpretation = `il y a ${times} fois moins de logements vacants que d'autorisations de construction de logements.`;
  }

  return (
    <GuideContent title="Comprendre les données">
      <p>
        En {endYear}, sur le territoire de {name},{" "}
        <strong>
          {autorisations} autorisation{pluralAutorisations} de construction de
          logement{pluralAutorisations} {verbAutorisations}
        </strong>
        , ce qui correspondrait à une augmentation de{" "}
        {formatNumber({ number: percentAutorisationsOnParc, decimals: 2 })}% de
        son parc de logements total.
      </p>

      <p>
        Au 1er janvier de cette même année, sur le territoire de {name},{" "}
        <strong>
          {vacantsPriv} logement{pluralPriv} du parc privé (soit{" "}
          {formatNumber({ number: percentVacantsPriv, decimals: 2 })}% du parc
          de logements privé)
        </strong>{" "}
        {verbPriv} depuis plus de 2 ans, et{" "}
        <strong>
          {vacantsSocial} logement{pluralSocial} du parc des bailleurs sociaux
          (soit {formatNumber({ number: percentVacantsSocial, decimals: 2 })}%
          du parc de logements des bailleurs sociaux)
        </strong>{" "}
        {verbSocial} depuis plus de 3 mois.
      </p>

      {ratioInterpretation && (
        <p>
          Sur le territoire de {name}, en {endYear},{" "}
          <strong>{ratioInterpretation}</strong>
        </p>
      )}
    </GuideContent>
  );
};

export const LogementVacantAutorisation: React.FC = () => {
  const { landId, landType, startYear, endYear } = useLogementVacantContext();
  const hasAutorisationLogement = true;

  return (
    <>
      {hasAutorisationLogement ? (
        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-xl-8 fr-grid-row">
            <BaseCard className="h-100">
              <GenericChart
                id="logement_vacant_autorisation_ratio_progression_chart"
                land_id={landId}
                land_type={landType}
                params={{
                  start_date: String(startYear),
                  end_date: String(endYear),
                }}
                sources={["sitadel", "lovac", "rpls"]}
                showDataTable={true}
              />
            </BaseCard>
          </div>
          <div className="fr-col-12 fr-col-xl-4 fr-grid-row">
            <ComprendreLesDonnees />
          </div>
        </div>
      ) : (
        <BaseCard>
          <Alert
            severity="warning"
            title="Données non disponibles"
            description="Les données sur les autorisations de construction de logements ne sont pas encore disponibles pour ce territoire."
          />
        </BaseCard>
      )}
    </>
  );
};
