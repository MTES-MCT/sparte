import React from "react";
import styled from "styled-components";
import GenericChart from "@components/charts/GenericChart";
import GuideContent from "@components/ui/GuideContent";
import BaseCard from "@components/ui/BaseCard";
import { useTrajectoiresContext } from "../context/TrajectoiresContext";

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #161616;
`;

export const TrajectoiresProjection: React.FC = () => {
  const { landId, landType, hasCustomTarget, targetCustom } =
    useTrajectoiresContext();

  return (
    <div className="fr-mt-5w">
      <SectionTitle>Projection jusqu'en 2030</SectionTitle>
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-xl-9 fr-grid-row">
          <BaseCard>
            {landId && landType && (
              <GenericChart
                id="objective_chart"
                land_id={landId}
                land_type={landType}
                sources={["majic"]}
                showDataTable
                params={
                  hasCustomTarget ? { target_2031_custom: targetCustom } : {}
                }
              />
            )}
          </BaseCard>
        </div>
        <div className="fr-col-12 fr-col-xl-3 fr-grid-row">
          <GuideContent title="Comment lire ce graphique ?">
            <p>
              Ce graphique compare la <strong>consommation réelle</strong>{" "}
              d'espaces avec la <strong>trajectoire théorique</strong>{" "}
              permettant d'atteindre l'objectif de réduction en 2030.
            </p>
            <p>
              Si les <strong>barres grises</strong> (réel) sont plus hautes que
              les <strong>barres colorées</strong> (objectif), le territoire
              doit ralentir son rythme de consommation afin de respecter
              l'objectif.
            </p>
            <p>
              Les lignes montrent le cumul : si la{" "}
              <strong>ligne grise</strong> reste en-dessous de la{" "}
              <strong>ligne pointillée</strong>, le territoire est en bonne voie
              pour respecter son objectif de réduction.
            </p>
          </GuideContent>
        </div>
      </div>
    </div>
  );
};
