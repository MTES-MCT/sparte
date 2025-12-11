import React from "react";
import { LandDetailResultType } from "@services/types/land";
import GenericChart from "@components/charts/GenericChart";
import {
    Paragraph,
    SectionContainer,
    SectionTitle,
    SubTitle,
    ChartContainer,
    DataTableContainer,
    IntroBox,
    KeyPointsBox,
} from "../shared";

interface ArtifDetailSectionProps {
    landData: LandDetailResultType;
}

const ArtifDetailSection: React.FC<ArtifDetailSectionProps> = ({ landData }) => {
  // Récupérer le dernier millésime disponible
  const millesimes = landData.millesimes || [];
  const maxIndex = millesimes.length > 0 ? Math.max(...millesimes.map(m => m.index)) : 0;
  const minIndex = maxIndex > 0 ? maxIndex - 1 : 0;

  return (
    <SectionContainer>
      <SectionTitle>Détail de l'artificialisation</SectionTitle>

      <>
        <IntroBox>
          <p>
            Les données d'artificialisation sont issues de l'OCS GE (Occupation des Sols à
            Grande Échelle) et sont disponibles à partir de 2017. Elles permettent de mesurer
            précisément les surfaces artificialisées et désartificialisées sur le territoire.
          </p>
        </IntroBox>

        <SubTitle>Synthèse de l'artificialisation</SubTitle>
        <Paragraph>
          Le graphique ci-dessous présente une vue d'ensemble de l'artificialisation sur
          votre territoire : surface totale artificialisée, évolution dans le temps, et
          part du territoire artificialisée.
        </Paragraph>

        <ChartContainer>
          <GenericChart
            id="artif_synthese_export"
              land_id={landData.land_id}
              land_type={landData.land_type}
              sources={["ocsge"]}
            showToolbar={false}
            hideDetails
          />
        </ChartContainer>

        <SubTitle>Flux d'artificialisation et désartificialisation</SubTitle>
        <Paragraph>
          L'artificialisation nette correspond au solde entre les surfaces nouvellement
          artificialisées et les surfaces désartificialisées (retour à un état naturel,
          agricole ou forestier). Le graphique suivant présente ces flux annuels.
        </Paragraph>

        <ChartContainer>
          <GenericChart
            id="artif_net_flux_export"
              land_id={landData.land_id}
              land_type={landData.land_type}
              params={{
                millesime_new_index: maxIndex,
                millesime_old_index: minIndex,
              }}
              sources={["ocsge"]}
            showToolbar={false}
            hideDetails
          />
        </ChartContainer>
        <KeyPointsBox>
          <h4>Points clés</h4>
          <ul>
            <li>
              <strong>Artificialisation brute</strong> : surfaces qui passent d'un état non
              artificialisé à un état artificialisé
            </li>
            <li>
              <strong>Désartificialisation</strong> : surfaces qui passent d'un état
              artificialisé à un état non artificialisé (renaturalisation)
            </li>
            <li>
              <strong>Artificialisation nette</strong> : différence entre artificialisation
              brute et désartificialisation
            </li>
            <li>
              <strong>Objectif ZAN 2050</strong> : atteindre une artificialisation nette égale
              à zéro (autant de surfaces artificialisées que désartificialisées)
            </li>
          </ul>
        </KeyPointsBox>

        {landData.child_land_types && landData.child_land_types.length > 0 && (
          <>
            <SubTitle>Cartographie de l'artificialisation</SubTitle>
            <Paragraph>
              La carte ci-dessous présente la proportion de sols artificialisés par territoire,
              ainsi que les flux d'artificialisation et de désartificialisation.
            </Paragraph>

            <ChartContainer>
              <GenericChart
                id="artif_map_export"
                  land_id={landData.land_id}
                  land_type={landData.land_type}
                  params={{
                    index: maxIndex,
                    previous_index: minIndex,
                    child_land_type: landData.child_land_types[0],
                  }}
                  sources={["ocsge"]}
                  showToolbar={false}
                isMap
                hideDetails
              />
            </ChartContainer>

            <DataTableContainer>
              <GenericChart
                id="artif_map_export"
                  land_id={landData.land_id}
                  land_type={landData.land_type}
                  params={{
                    index: maxIndex,
                    previous_index: minIndex,
                    child_land_type: landData.child_land_types[0],
                  }}
                  sources={["ocsge"]}
                dataTableOnly
                compactDataTable
              />
            </DataTableContainer>
          </>
        )}
        </>
    </SectionContainer>
    );
};

export default ArtifDetailSection;
