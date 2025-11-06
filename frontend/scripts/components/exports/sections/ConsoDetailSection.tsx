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
} from "../ExportStyles";

interface ConsoDetailSectionProps {
  landData: LandDetailResultType;
  startYear: number;
  endYear: number;
}

const Content = styled.div``;

const ConsoDetailSection: React.FC<ConsoDetailSectionProps> = ({ landData, startYear, endYear }) => {

  return (
    <SectionContainer>
      <SectionTitle>Détail de la consommation d'espaces</SectionTitle>

      <Content>
        <SubTitle>Évolution annuelle de la consommation totale</SubTitle>
          <Paragraph>
            Le graphique ci-dessous présente l'évolution annuelle de la consommation d'espaces
            NAF (Naturels, Agricoles et Forestiers) sur votre territoire.
          </Paragraph>

          <ChartContainer>
            <GenericChart
              id="annual_total_conso_chart_export"
              land_id={landData.land_id}
              land_type={landData.land_type}
              params={{
                start_date: String(startYear),
                end_date: String(endYear),
              }}
              sources={["majic"]}
              showToolbar={false}
              hideDetails
            />
          </ChartContainer>

          <DataTableContainer>
            <GenericChart
              id="annual_total_conso_chart_export"
              land_id={landData.land_id}
              land_type={landData.land_type}
              params={{
                start_date: String(startYear),
                end_date: String(endYear),
              }}
              sources={["majic"]}
              dataTableOnly
              compactDataTable
            />
          </DataTableContainer>

          <SubTitle>Consommation par destination</SubTitle>
          <Paragraph>
            La répartition de la consommation d'espaces par destination permet d'identifier
            les principaux facteurs de consommation : habitat, activités économiques, infrastructures
            de transport, etc.
          </Paragraph>

          <ChartContainer>
            <GenericChart
              id="chart_determinant_export"
              land_id={landData.land_id}
              land_type={landData.land_type}
              params={{
                start_date: String(startYear),
                end_date: String(endYear),
              }}
              sources={["majic"]}
              showToolbar={false}
              hideDetails
            />
          </ChartContainer>

          <DataTableContainer>
            <GenericChart
              id="chart_determinant_export"
              land_id={landData.land_id}
              land_type={landData.land_type}
              params={{
                start_date: String(startYear),
                end_date: String(endYear),
              }}
              sources={["majic"]}
              dataTableOnly
              compactDataTable
            />
          </DataTableContainer>

          <SubTitle>Répartition totale par destination</SubTitle>
          <Paragraph>
            Le graphique ci-dessous présente la répartition en pourcentage de la consommation
            totale par destination sur la période {startYear}-{endYear}.
          </Paragraph>

          <ChartContainer>
            <GenericChart
              id="pie_determinant_export"
              land_id={landData.land_id}
              land_type={landData.land_type}
              params={{
                start_date: String(startYear),
                end_date: String(endYear),
              }}
              sources={["majic"]}
              showToolbar={false}
              hideDetails
            />
          </ChartContainer>

          {landData.child_land_types && landData.child_land_types.length > 0 && (
            <>
              <SubTitle>Cartographie de la consommation relative</SubTitle>
              <Paragraph>
                La carte ci-dessous présente la consommation d'espaces relative à la surface
                de chaque territoire (en % de la surface totale). Plus la couleur est foncée,
                plus la consommation relative est importante.
              </Paragraph>

              <ChartContainer>
                <GenericChart
                  id="conso_map_relative_export"
                  land_id={landData.land_id}
                  land_type={landData.land_type}
                  params={{
                    start_date: String(startYear),
                    end_date: String(endYear),
                    child_land_type: landData.child_land_types[0],
                  }}
                  sources={["majic"]}
                  showToolbar={false}
                  isMap
                  hideDetails
                />
              </ChartContainer>

              <DataTableContainer>
                <GenericChart
                  id="conso_map_relative_export"
                  land_id={landData.land_id}
                  land_type={landData.land_type}
                  params={{
                    start_date: String(startYear),
                    end_date: String(endYear),
                    child_land_type: landData.child_land_types[0],
                  }}
                  sources={["majic"]}
                  dataTableOnly
                  compactDataTable
                />
              </DataTableContainer>

              <SubTitle>Cartographie de la consommation absolue</SubTitle>
              <Paragraph>
                La carte ci-dessous présente la consommation d'espaces en valeur absolue
                (en hectares). La taille des bulles est proportionnelle à la consommation
                sur chaque territoire.
              </Paragraph>

              <ChartContainer>
                <GenericChart
                  id="conso_map_bubble_export"
                  land_id={landData.land_id}
                  land_type={landData.land_type}
                  params={{
                    start_date: String(startYear),
                    end_date: String(endYear),
                    child_land_type: landData.child_land_types[0],
                  }}
                  sources={["majic"]}
                  showToolbar={false}
                  isMap
                  hideDetails
                />
              </ChartContainer>

              <DataTableContainer>
                <GenericChart
                  id="conso_map_bubble_export"
                  land_id={landData.land_id}
                  land_type={landData.land_type}
                  params={{
                    start_date: String(startYear),
                    end_date: String(endYear),
                    child_land_type: landData.child_land_types[0],
                  }}
                  sources={["majic"]}
                  dataTableOnly
                  compactDataTable
                />
              </DataTableContainer>
            </>
          )}
      </Content>
    </SectionContainer>
  );
};

export default ConsoDetailSection;
