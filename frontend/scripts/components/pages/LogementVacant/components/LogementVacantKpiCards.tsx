import React from "react";
import Triptych from "@components/ui/Triptych";
import Kpi from "@components/ui/Kpi";
import { LogementVacantAbstract } from "@components/features/logementVacant";
import { formatNumber } from "@utils/formatUtils";
import { useLogementVacantContext } from "../context/LogementVacantContext";

export const LogementVacantKpiCards: React.FC = () => {
  const {
    name,
    logementsVacantsStatus,
    logementsVacantsStatusDetails,
    endYear,
  } = useLogementVacantContext();

  const {
    logements_vacants_parc_prive,
    logements_vacants_parc_social,
    logements_vacants_parc_prive_percent,
    logements_vacants_parc_social_percent,
  } = logementsVacantsStatusDetails;

  const hasPriveData = logements_vacants_parc_prive !== null;
  const hasSocialData = logements_vacants_parc_social !== null;

  const priveFooterMetrics: [
    { icon: string; label: string; value: string },
    { icon: string; label: string; value: string }
  ] = [
    {
      icon: "bi bi-percent",
      label: "Part du parc privé",
      value: hasPriveData
        ? `${formatNumber({ number: logements_vacants_parc_prive_percent })} %`
        : "–",
    },
    {
      icon: "bi bi-calendar3",
      label: "Année",
      value: String(endYear),
    },
  ];

  const socialFooterMetrics: [
    { icon: string; label: string; value: string },
    { icon: string; label: string; value: string }
  ] = [
    {
      icon: "bi bi-percent",
      label: "Part du parc social",
      value: hasSocialData
        ? `${formatNumber({ number: logements_vacants_parc_social_percent })} %`
        : "–",
    },
    {
      icon: "bi bi-calendar3",
      label: "Année",
      value: String(endYear),
    },
  ];

  return (
    <div className="fr-mb-5w">
      <Triptych
        className="fr-mb-5w"
        definition={{
          content: (
            <>
              <p>
                On distingue deux formes principales de vacance des logements :{" "}
                <strong>la vacance conjoncturelle</strong>, qui est de courte
                durée et nécessaire à la fluidité du marché du logement, et{" "}
                <strong>la vacance structurelle</strong>, qui pourrait se
                substituer à la construction neuve de logements, souvent
                génératrice d'artificialisation des sols et contre laquelle il
                est légitime de lutter.
              </p>
              <p>
                Dans cette perspective, l'analyse proposée s'appuie sur une
                définition différenciée selon le type de parc : sont ainsi pris
                en compte les logements vacants depuis plus de deux ans dans le
                parc privé et ceux inoccupés depuis plus de 3 mois dans le parc
                des bailleurs sociaux.
              </p>
            </>
          ),
        }}
        donnees={{
          content: (
            <>
              <p>
                Les données sur la vacance des logements affichées sur cette
                page proviennent de la <strong>base LOVAC</strong> produite par
                le CEREMA pour le parc privé, ainsi que de la{" "}
                <strong>base RPLS</strong> produite par le Ministère de la
                Transition Écologique (MTE), pour ce qui concerne le parc des
                bailleurs sociaux.
              </p>
              <p>Ces données sont disponibles à l'échelle de la commune.</p>
              <p>
                Les données de consommation d'espaces NAF (CEREMA) et de la base
                SITADEL (MTE) sont également utilisées pour certains
                indicateurs.
              </p>
            </>
          ),
        }}
      />

      <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
        <div className="fr-col-12 fr-col-lg-6">
          <Kpi
            icon="bi bi-house"
            label="Logements vacants dans le parc privé"
            value={
              hasPriveData
                ? formatNumber({ number: logements_vacants_parc_prive, decimals: 0 })
                : "Indisponible"
            }
            variant="default"
            badge={hasPriveData && logements_vacants_parc_prive > 0 ? "Actionnable" : undefined}
            footer={{
              type: "metric",
              items: priveFooterMetrics,
            }}
          />
        </div>
        <div className="fr-col-12 fr-col-lg-6">
          <Kpi
            icon="bi bi-houses"
            label="Logements vacants dans le parc des bailleurs sociaux"
            value={
              hasSocialData
                ? formatNumber({ number: logements_vacants_parc_social, decimals: 0 })
                : "Indisponible"
            }
            variant="default"
            badge={hasSocialData && logements_vacants_parc_social > 0 ? "Actionnable" : undefined}
            footer={{
              type: "metric",
              items: socialFooterMetrics,
            }}
          />
        </div>
      </div>

      <LogementVacantAbstract
        logements_vacants_status={logementsVacantsStatus}
        logements_vacants_status_details={logementsVacantsStatusDetails}
        name={name}
      />
    </div>
  );
};
