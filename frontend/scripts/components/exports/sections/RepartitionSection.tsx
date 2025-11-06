import React from "react";
import styled from "styled-components";
import { LandDetailResultType } from "@services/types/land";
import GenericChart from "@components/charts/GenericChart";
import Paragraph from "../Paragraph";
import {
  SectionContainer,
  SectionTitle,
  SubTitle,
  ChartContainer,
  DataTableContainer,
  ConclusionBox,
} from "../ExportStyles";

interface RepartitionSectionProps {
  landData: LandDetailResultType;
}

const Content = styled.div``;

const RepartitionSection: React.FC<RepartitionSectionProps> = ({ landData }) => {
  // Récupérer le dernier millésime disponible
  const millesimes = landData.millesimes || [];
  const maxIndex = millesimes.length > 0 ? Math.max(...millesimes.map(m => m.index)) : 0;
  const minIndex = maxIndex > 0 ? maxIndex - 1 : 0;

  return (
    <SectionContainer>
      <SectionTitle>Répartitions des surfaces artificialisées par couverture et usage</SectionTitle>

      <Content>
        <Paragraph>
          L'OCS GE permet d'analyser finement les surfaces artificialisées selon deux
          dimensions complémentaires : la couverture du sol (ce qui couvre physiquement
          le sol) et l'usage du sol (l'utilisation qui en est faite).
        </Paragraph>

        <SubTitle>Répartition par type de couverture</SubTitle>
        <Paragraph>
          La couverture du sol décrit la nature physique de ce qui recouvre le territoire :
          surfaces imperméabilisées (bâti, routes, parkings), surfaces stabilisées (cours,
          allées), surfaces herbacées, etc.
        </Paragraph>

        <ChartContainer>
          <GenericChart
            id="pie_artif_by_couverture_export"
            land_id={landData.land_id}
            land_type={landData.land_type}
            params={{
              index: maxIndex,
            }}
            sources={["ocsge"]}
            showToolbar={false}
            hideDetails
          />
        </ChartContainer>

        <DataTableContainer>
          <GenericChart
            id="pie_artif_by_couverture_export"
            land_id={landData.land_id}
            land_type={landData.land_type}
            params={{
              index: maxIndex,
            }}
            sources={["ocsge"]}
            dataTableOnly
            compactDataTable
          />
        </DataTableContainer>

        <SubTitle>Flux d'artificialisation par type de couverture</SubTitle>
        <Paragraph>
          Ce graphique montre quels types de couverture ont été principalement artificialisés
          ou désartificialisés au cours de la période.
        </Paragraph>

        <ChartContainer>
          <GenericChart
            id="artif_flux_by_couverture_export"
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

        <DataTableContainer>
          <GenericChart
            id="artif_flux_by_couverture_export"
            land_id={landData.land_id}
            land_type={landData.land_type}
            params={{
              millesime_new_index: maxIndex,
              millesime_old_index: minIndex,
            }}
            sources={["ocsge"]}
            dataTableOnly
            compactDataTable
          />
        </DataTableContainer>

        <SubTitle>Répartition par type d'usage</SubTitle>
        <Paragraph>
          L'usage du sol indique la fonction ou l'activité qui se déroule sur le territoire :
          usage résidentiel, production (agriculture, industrie), services, infrastructures
          de transport, etc.
        </Paragraph>

        <ChartContainer>
          <GenericChart
            id="pie_artif_by_usage_export"
            land_id={landData.land_id}
            land_type={landData.land_type}
            params={{
              index: maxIndex,
            }}
            sources={["ocsge"]}
            showToolbar={false}
            hideDetails
          />
        </ChartContainer>

        <DataTableContainer>
          <GenericChart
            id="pie_artif_by_usage_export"
            land_id={landData.land_id}
            land_type={landData.land_type}
            params={{
              index: maxIndex,
            }}
            sources={["ocsge"]}
            dataTableOnly
            compactDataTable
          />
        </DataTableContainer>

        <SubTitle>Flux d'artificialisation par type d'usage</SubTitle>
        <Paragraph>
          Ce graphique montre quels usages ont contribué à l'artificialisation ou à la
          désartificialisation au cours de la période.
        </Paragraph>

        <ChartContainer>
          <GenericChart
            id="artif_flux_by_usage_export"
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

        <DataTableContainer>
          <GenericChart
            id="artif_flux_by_usage_export"
            land_id={landData.land_id}
            land_type={landData.land_type}
            params={{
              millesime_new_index: maxIndex,
              millesime_old_index: minIndex,
            }}
            sources={["ocsge"]}
            dataTableOnly
            compactDataTable
          />
        </DataTableContainer>

        <ConclusionBox>
          <h4>Analyse croisée couverture-usage</h4>
          <p>
            L'analyse combinée de la couverture et de l'usage permet d'identifier précisément
            les dynamiques d'artificialisation sur le territoire. Par exemple, une surface
            imperméabilisée (couverture CS1.1) peut avoir différents usages (résidentiel US6,
            commercial US3, industriel US2, etc.). Cette granularité permet d'adapter les
            politiques publiques aux réalités locales.
          </p>
        </ConclusionBox>
      </Content>
    </SectionContainer>
  );
};

export default RepartitionSection;
