import React from "react";
import { LogementVacantAutorisationProps } from "../types";
import { ConsoGraph } from "@components/charts/conso/ConsoGraph";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { useGetLogementVacantAutorisationStatsQuery } from "@services/api";
import { formatNumber } from "@utils/formatUtils";

const GaugeExplanationText: React.FC<{
  landId: string;
  landType: string;
  startYear: number;
  endYear: number;
  territoryName: string;
}> = ({ landId, landType, startYear, endYear, territoryName }) => {
  const { data: stats } = useGetLogementVacantAutorisationStatsQuery({
    land_id: landId,
    land_type: landType,
    start_date: startYear,
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
    ratio: lastRatio,
  } = stats;

  const pluralAutorisations = autorisations > 1 ? "s" : "";
  const verbAutorisations = autorisations > 1 ? "ont été délivrées" : "a été délivrée";
  const pluralPriv = vacantsPriv > 1 ? "s" : "";
  const verbPriv = vacantsPriv > 1 ? "étaient vacants" : "était vacant";
  const pluralSocial = vacantsSocial > 1 ? "s" : "";
  const verbSocial = vacantsSocial > 1 ? "étaient vacants" : "était vacant";

  let ratioInterpretation = "";
  if (lastRatio > 100) {
    const times = formatNumber({ number: lastRatio / 100, decimals: 2 });
    ratioInterpretation = `Autrement dit, il y a ${times} fois plus de logements vacants que d'autorisations de construction de logement.`;
  } else if (lastRatio === 100) {
    ratioInterpretation = "Autrement dit, il y a autant de logements vacants que d'autorisations de construction de logement.";
  } else if (lastRatio > 0) {
    const times = formatNumber({ number: 100 / lastRatio, decimals: 2 });
    ratioInterpretation = `Autrement dit, il y a ${times} fois moins de logements vacants que d'autorisations de construction de logements.`;
  }

  return (
    <div className="bg-white fr-p-3w h-100" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ marginBottom: '1rem' }}>
        <svg style={{ width: '48px', height: '48px', fill: '#48d5a7', marginBottom: '1rem' }} viewBox="0 0 512 512">
          <path d="M247.5 4.5c-3 2.9-3.2 6.4-.4 9.8l2 2.7 109.7.2 109.7.3 5.3 2.2c10.8 4.4 18.7 13.5 21.7 24.8 1.2 4.9 1.5 13.8 1.5 53.8v47.8l2.6 2.6c2 2 3.1 2.4 5.7 1.9 6.9-1.3 6.7.6 6.7-53.7 0-31.3-.4-50.7-1.1-54.1-3.9-19-20.7-35.8-39.7-39.7C467.6 2.3 432 2 357.9 2h-108zm-29 .8c-9.6 3.8-18.2 10.5-23.6 18.4l-3 4.3-74.7.2-74.7.3-5.1 2.7C30.9 34.6 24 42.3 21.7 48.6c-1.6 4.6-1.7 13.5-1.5 149.9l.3 145 2.7 5.1c1.5 2.8 4.9 7.1 7.6 9.5l4.8 4.3-17.5 27C3.1 412.6.6 417 .3 420.9c-.4 5.2 2.3 11 6.9 14.4 3.7 2.8 11.6 3.4 15.8 1.2 1.8-.9 23.7-17.2 48.7-36.1 39.3-29.8 45.8-34.4 48.8-34.4h3.5v34.8c0 34.6 0 34.9 2.3 39.3 1.3 2.4 4.3 5.7 6.6 7.4l4.3 3 89.8.3 89.7.2 12.4 26.8c6.8 14.7 13.5 27.9 15 29.4 5 5.1 11 4.9 16.6-.7l3.3-3.3V451h7.3c8.6 0 13.8-2.1 18.4-7.3 1.8-2 3.7-5.3 4.2-7.4.7-2.5 1.1-25.8 1.1-66.5v-62.7l39.8 30.2c21.8 16.5 41.3 30.9 43.2 31.9 7.3 3.8 16.6.6 20.8-7.3s3.5-9.7-14.8-37.9c-8.9-13.8-16.1-25.2-15.9-25.4s3.1-1.1 6.4-2.1c16.4-4.7 28-15.4 34.6-32 2.4-6 2.4-6.3 2.7-49.7l.3-43.8-2.5-2.5c-3-3-6.4-3.2-9.9-.5l-2.6 2.1-.3 42.7-.3 42.7-3.1 6.5c-3.8 8-10.1 14.5-17.4 17.9l-5.5 2.6-119 .3c-65.5.1-120.5 0-122.2-.3l-3.3-.6-.2-115.2c-.3-109.8-.4-115.4-2.2-119.2-2.4-5.3-7.9-12-11.6-14.2-1.7-.9-3-2.1-3-2.6 0-1.7 6.8-7 13.2-10.3 4.9-2.5 6.9-4.1 7.4-5.9 1-3.9-.4-7.3-3.6-9-3.4-1.7-3.5-1.7-7.5-.2m-18.2 39.1c4.2 1.7 8.3 6.6 9.7 11.4 1.4 5.1 1.4 277.3 0 282.4-1.4 4.8-5.5 9.7-9.7 11.4-2.6 1.1-17 1.4-77.6 1.4H48.4l-4.4-2.3c-3-1.4-5.3-3.6-6.7-6.2l-2.3-4v-283l2.3-4c1.4-2.6 3.7-4.8 6.7-6.3l4.4-2.2h74.3c60.6 0 75 .3 77.6 1.4M308.6 299H379v67.5c0 65.6-.1 67.5-1.9 68.5-1.3.7-39.9 1-117.8 1-103.2 0-116.1-.2-118.1-1.6-2.2-1.5-2.2-1.5-2.2-35V366h30.5c28.7 0 30.8-.1 36.2-2.1 9.8-3.7 18-13.9 19.8-24.7l.7-4.2H288c60.9 0 61.8 0 64.4-2.1 3.4-2.7 3.6-7.9.4-10.9-2.1-2-3.2-2-64.5-2H226v-22.3l6.1.7c3.4.3 37.9.6 76.5.6M465 322.7c8.5 13.1 16.5 25.5 17.8 27.6 3.1 4.7 2.4 5.6-2 2.5-3.1-2.1-52.8-39.7-65.5-49.6l-5.5-4.2h39.9zM88 368.8c-18.5 14.7-71.6 53.9-71.8 53.2-.2-.6 7-12.4 16-26.2 8.9-13.8 17-26.1 17.8-27.4 1.5-2.4 1.5-2.4 21.5-2.4h20zm261 98.4c0 8.9-.2 15.9-.4 15.7-.6-.5-14.6-30.9-14.6-31.5 0-.2 3.4-.4 7.5-.4h7.5z"/>
        </svg>
        <h3 className="fr-h6 fr-mb-2w">Comprendre les données</h3>
      </div>

      <p className="fr-text--sm fr-mb-2w">
        En {endYear}, sur le territoire de {territoryName},{" "}
        <strong>
          {autorisations} autorisation{pluralAutorisations} de construction de logement{pluralAutorisations} {verbAutorisations}
        </strong>
        , ce qui correspondrait à une augmentation de {formatNumber({ number: percentAutorisationsOnParc, decimals: 2 })}% de son parc de logements total.
      </p>

      <p className="fr-text--sm fr-mb-2w">
        Au 1er janvier de cette même année, sur le territoire de {territoryName},{" "}
        <strong>
          {vacantsPriv} logement{pluralPriv} du parc privé (soit {formatNumber({ number: percentVacantsPriv, decimals: 2 })}% du parc de logements privé)
        </strong>{" "}
        {verbPriv} depuis plus de 2 ans, et{" "}
        <strong>
          {vacantsSocial} logement{pluralSocial} du parc des bailleurs sociaux (soit {formatNumber({ number: percentVacantsSocial, decimals: 2 })}% du parc de logements des bailleurs sociaux)
        </strong>{" "}
        {verbSocial} depuis plus de 3 mois.
      </p>

      <p className="fr-text--sm fr-mb-0">
        Sur le territoire de {territoryName},{" "}
        <strong>
          le nombre de logements vacants représente donc, en proportion, {formatNumber({ number: lastRatio, decimals: 2 })}% du nombre d'autorisations de construction de logements.
        </strong>{" "}
        {ratioInterpretation}
      </p>
    </div>
  );
};

export const LogementVacantAutorisation: React.FC<LogementVacantAutorisationProps> = ({
  landId,
  landType,
  startYear,
  endYear,
  hasAutorisationLogement,
  territoryName,
}) => {
  return (
    <div className="fr-mb-5w">
      <h2 className="fr-h4 fr-mb-3w">Logements vacants et autorisations de construction de logements</h2>

      {hasAutorisationLogement ? (
        <>
          {/* Chart 1: Comparison */}
          <div className="fr-mb-3w bg-white fr-p-2w rounded">
            <ConsoGraph
              id="logement_vacant_autorisation_comparison_chart"
              land_id={landId}
              land_type={landType}
              params={{
                start_date: String(startYear),
                end_date: String(endYear),
              }}
              sources={["sitadel", "lovac", "rpls"]}
              showDataTable={true}
            />
          </div>

          {/* Chart 2: Gauge + descriptive text */}
          <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
            <div className="fr-col-12 fr-col-lg-6">
              <div className="bg-white fr-p-2w h-100">
                <ConsoGraph
                  id="logement_vacant_autorisation_ratio_gauge_chart"
                  land_id={landId}
                  land_type={landType}
                  params={{
                    start_date: String(startYear),
                    end_date: String(endYear),
                  }}
                  sources={["sitadel", "lovac", "rpls"]}
                  showDataTable={false}
                />
              </div>
            </div>
            <div className="fr-col-12 fr-col-lg-6">
              <GaugeExplanationText
                landId={landId}
                landType={landType}
                startYear={startYear}
                endYear={endYear}
                territoryName={territoryName}
              />
            </div>
          </div>

          {/* Chart 3: Ratio Progression */}
          <div className="fr-mb-3w bg-white fr-p-2w rounded">
            <ConsoGraph
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
          </div>
        </>
      ) : (
        <div className="bg-white fr-p-3w rounded">
          <Alert
            severity="warning"
            title="Données non disponibles"
            description="Les données sur les autorisations de construction de logements ne sont pas encore disponibles pour ce territoire."
          />
        </div>
      )}
    </div>
  );
};
