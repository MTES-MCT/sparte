import React from "react";
import styled from "styled-components";
import GenericChart from "@components/charts/GenericChart";
import GuideContent from "@components/ui/GuideContent";
import Kpi from "@components/ui/Kpi";
import BaseCard from "@components/ui/BaseCard";
import Notice from "@components/ui/Notice";
import { formatNumber } from "@utils/formatUtils";
import { useTrajectoiresContext } from "../context/TrajectoiresContext";

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #161616;
`;

const MutedText = styled.p`
  color: #666;
  margin: 0;
`;

const ColoredStrong = styled.strong<{ $color: string }>`
  color: ${({ $color }) => $color};
`;

export const TrajectoiresChildrenStats: React.FC = () => {
  const {
    landData,
    landId,
    landType,
    name,
    childrenLandTypesLabel,
    consoProjetee2031,
    tauxAtteinte2031,
    depassement2031,
    allowedConso2021_2030,
    isDGALNMember,
  } = useTrajectoiresContext();

  const { territorialisation } = landData;

  if (
    !territorialisation?.has_children ||
    !isDGALNMember ||
    !territorialisation?.children_stats
  ) {
    return null;
  }

  const { children_stats } = territorialisation;

  const projectionKpis: [
    { icon: string; label: string; value: string },
    { icon: string; label: string; value: string }
  ] = [
    {
      icon: "bi bi-bullseye",
      label: "Conso. max autorisée",
      value: `${formatNumber({ number: allowedConso2021_2030 })} ha`,
    },
    {
      icon:
        depassement2031 > 0
          ? "bi bi-exclamation-triangle"
          : "bi bi-check-circle",
      label: depassement2031 > 0 ? "Dépassement" : "Marge",
      value: `${depassement2031 > 0 ? "+" : ""}${formatNumber({ number: depassement2031 })} ha`,
    },
  ];

  return (
    <div className="fr-mt-5w">
      <SectionTitle>
        Suivi de la territorialisation des {childrenLandTypesLabel} de {name}
      </SectionTitle>

      <Notice
        type="default"
        title="Section réservée DGALN"
        message="Cette section est réservée aux agents de la DGALN et n'est pas visible par les autres utilisateurs."
      />

      <MutedText className="fr-text--sm fr-mb-2w fr-mt-3w">
        Suivez la progression de chaque territoire vers son objectif.
      </MutedText>

      <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
        <div className="fr-col-6 fr-col-lg-4">
          <Kpi
            icon="bi bi-check-circle"
            label={`${children_stats.en_bonne_voie} territoire${children_stats.en_bonne_voie > 1 ? "s" : ""} en bonne voie`}
            value={children_stats.en_bonne_voie}
            variant="success"
          />
        </div>
        <div className="fr-col-6 fr-col-lg-4">
          <Kpi
            icon="bi bi-exclamation-triangle"
            label={`${children_stats.vont_depasser} territoire${children_stats.vont_depasser > 1 ? "s risquent" : " risque"} de dépasser`}
            value={children_stats.vont_depasser}
            variant="default"
          />
        </div>
        <div className="fr-col-6 fr-col-lg-4">
          <Kpi
            icon="bi bi-x-circle"
            label={`${children_stats.deja_depasse} territoire${children_stats.deja_depasse > 1 ? "s ont" : " a"} déjà dépassé`}
            value={children_stats.deja_depasse}
            variant="error"
          />
        </div>
      </div>

      <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
        <div className="fr-col-12 fr-col-lg-9">
          <BaseCard className="h-100">
            <GenericChart
              id="territorialisation_progress_map"
              isMap
              land_id={landId}
              land_type={landType}
              showDataTable
            />
          </BaseCard>
        </div>
        <div className="fr-col-12 fr-col-lg-3">
          <GuideContent title="Lecture de la carte">
            <p>
              <ColoredStrong $color="#34D399">
                {children_stats.en_bonne_voie}
              </ColoredStrong>{" "}
              {children_stats.en_bonne_voie > 1
                ? "territoires sont"
                : "territoire est"}{" "}
              en bonne voie pour respecter leur maximum autorisé.
            </p>
            <p>
              <ColoredStrong $color="#FBBF24">
                {children_stats.vont_depasser}
              </ColoredStrong>{" "}
              {children_stats.vont_depasser > 1
                ? "territoires risquent"
                : "territoire risque"}{" "}
              de dépasser leur objectif de réduction au rythme actuel de
              consommation d'espace.
            </p>
            <p>
              <ColoredStrong $color="#F87171">
                {children_stats.deja_depasse}
              </ColoredStrong>{" "}
              {children_stats.deja_depasse > 1
                ? "territoires ont"
                : "territoire a"}{" "}
              déjà dépassé leur maximum autorisé.
            </p>
            <MutedText className="fr-text--sm">
              Survolez un territoire pour voir les détails.
            </MutedText>
          </GuideContent>
        </div>
      </div>

      <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
        <div className="fr-col-12 fr-col-lg-9">
          <BaseCard className="h-100">
            <GenericChart
              id="territorialisation_rythme_map"
              isMap
              land_id={landId}
              land_type={landType}
              showDataTable
            />
          </BaseCard>
        </div>
        <div className="fr-col-12 fr-col-lg-3">
          <GuideContent title="Lecture de la carte">
            <p>
              Compare la consommation annuelle actuelle à la consommation
              annualisée autorisée pour atteindre l'objectif de réduction.
            </p>
            <p>
              <ColoredStrong $color="#34D399">Vert</ColoredStrong> : consomme
              moins que le rythme autorisé.
              <br />
              <ColoredStrong $color="#B71C1C">Rouge</ColoredStrong> : consomme
              plus que le rythme autorisé.
            </p>
            <MutedText className="fr-text--sm">
              Survolez un territoire pour voir les détails.
            </MutedText>
          </GuideContent>
        </div>
      </div>

      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-lg-6">
          <BaseCard className="h-100">
            <GenericChart
              id="territorialisation_conso_map"
              isMap
              land_id={landId}
              land_type={landType}
              showDataTable
            />
          </BaseCard>
        </div>
        <div className="fr-col-12 fr-col-lg-6">
          <BaseCard className="h-100">
            <GenericChart
              id="territorialisation_restante_map"
              isMap
              land_id={landId}
              land_type={landType}
              showDataTable
            />
          </BaseCard>
        </div>
      </div>

      <SectionTitle className="fr-mt-5w">
        Projection de {name} à l'horizon 2031 au rythme actuel
      </SectionTitle>
      <MutedText className="fr-text--sm fr-mb-2w">
        Estimation de la situation en 2031 si le rythme de consommation actuel
        se maintient.
      </MutedText>

      <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
        <div className="fr-col-6 fr-col-md-3">
          <Kpi
            icon="bi bi-graph-up-arrow"
            label="Consommation projetée en 2031"
            value={
              <>
                {formatNumber({ number: consoProjetee2031 })} <span>ha</span>
              </>
            }
            variant="default"
          />
        </div>
        <div className="fr-col-6 fr-col-md-3">
          <Kpi
            icon="bi bi-bullseye"
            label="Consommation max autorisée"
            value={
              <>
                {formatNumber({ number: allowedConso2021_2030 })}{" "}
                <span>ha</span>
              </>
            }
            variant="default"
          />
        </div>
        <div className="fr-col-6 fr-col-md-3">
          <Kpi
            icon="bi bi-percent"
            label="de l'objectif atteint en 2031"
            value={`${formatNumber({ number: tauxAtteinte2031, decimals: 1 })}%`}
            variant={tauxAtteinte2031 > 100 ? "error" : "success"}
            badge={
              tauxAtteinte2031 > 100 ? "Taux de dépassement" : "Dans l'objectif"
            }
          />
        </div>
        <div className="fr-col-6 fr-col-md-3">
          <Kpi
            icon={
              depassement2031 > 0
                ? "bi bi-exclamation-triangle"
                : "bi bi-check-circle"
            }
            label={
              depassement2031 > 0
                ? "de dépassement projeté"
                : "de marge disponible"
            }
            value={
              <>
                {depassement2031 > 0 ? "+" : ""}
                {formatNumber({ number: depassement2031 })} <span>ha</span>
              </>
            }
            variant={depassement2031 > 0 ? "error" : "success"}
            badge={depassement2031 > 0 ? "Dépassement" : "Marge"}
          />
        </div>
      </div>
    </div>
  );
};
