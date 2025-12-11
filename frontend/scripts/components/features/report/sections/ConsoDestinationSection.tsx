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
} from "../styles";

interface ConsoDestinationSectionProps {
    landData: LandDetailResultType;
    startYear: number;
    endYear: number;
}

const ConsoDestinationSection: React.FC<ConsoDestinationSectionProps> = ({ landData, startYear, endYear }) => {

  return (
    <SectionContainer>
      <SectionTitle>Consommation par destination</SectionTitle>

      <>
        <SubTitle>Évolution annuelle par destination</SubTitle>
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
      </>
    </SectionContainer>
  );
};

export default ConsoDestinationSection;
