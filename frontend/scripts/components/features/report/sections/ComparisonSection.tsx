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
    NoteBox,
} from "../styles";

interface ComparisonSectionProps {
    landData: LandDetailResultType;
    startYear: number;
    endYear: number;
}

const ComparisonSection: React.FC<ComparisonSectionProps> = ({ landData, startYear, endYear }) => {

  return (
    <SectionContainer>
      <SectionTitle>Comparaison avec une sélection de territoires</SectionTitle>

      <>
        <Paragraph>
          Cette section permet de situer votre territoire par rapport à d'autres territoires
          comparables en termes de consommation d'espaces. La comparaison porte sur la
          consommation absolue (en hectares) et la consommation relative (rapportée à la
          surface du territoire).
        </Paragraph>

        <SubTitle>Consommation absolue</SubTitle>
        <Paragraph>
          Le graphique ci-dessous présente la consommation annuelle d'espaces en hectares
          pour votre territoire et les territoires les plus proches géographiquement.
        </Paragraph>

        <ChartContainer>
          <GenericChart
            id="comparison_chart_export"
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
            id="comparison_chart_export"
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

        <SubTitle>Consommation relative</SubTitle>
        <Paragraph>
          Pour une comparaison plus équitable entre territoires de tailles différentes,
          la consommation peut être rapportée à la surface du territoire (en % de la surface).
          Cela permet de mieux comparer l'intensité de la consommation d'espaces.
        </Paragraph>

        <ChartContainer>
          <GenericChart
            id="surface_proportional_chart_export"
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
            id="surface_proportional_chart_export"
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

        <NoteBox>
          <h4>Note méthodologique</h4>
          <p>
            Les territoires de comparaison sont sélectionnés automatiquement en fonction
            de leur proximité géographique avec votre territoire. Cette approche permet
            de comparer des territoires soumis à des dynamiques et contraintes similaires.
          </p>
        </NoteBox>
      </>
    </SectionContainer>
    );
};

export default ComparisonSection;
