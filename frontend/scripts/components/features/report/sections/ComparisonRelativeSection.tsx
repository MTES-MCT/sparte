import React from "react";
import { LandDetailResultType } from "@services/types/land";
import GenericChart from "@components/charts/GenericChart";
import {
    Paragraph,
    SectionContainer,
    SectionTitle,
    ChartContainer,
    DataTableContainer,
} from "../styles";

interface ComparisonRelativeSectionProps {
    landData: LandDetailResultType;
    startYear: number;
    endYear: number;
}

const ComparisonRelativeSection: React.FC<ComparisonRelativeSectionProps> = ({ landData, startYear, endYear }) => {

  return (
    <SectionContainer>
      <SectionTitle>Consommation relative</SectionTitle>

      <>
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
      </>
    </SectionContainer>
    );
};

export default ComparisonRelativeSection;
