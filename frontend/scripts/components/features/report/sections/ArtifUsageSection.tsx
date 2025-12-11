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

interface ArtifUsageSectionProps {
    landData: LandDetailResultType;
}

const ArtifUsageSection: React.FC<ArtifUsageSectionProps> = ({ landData }) => {
  // Récupérer le dernier millésime disponible
  const millesimes = landData.millesimes || [];
  const maxIndex = millesimes.length > 0 ? Math.max(...millesimes.map(m => m.index)) : 0;
  const minIndex = maxIndex > 0 ? maxIndex - 1 : 0;

  return (
    <SectionContainer>
      <SectionTitle>Répartition par type d'usage</SectionTitle>

      <>
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
      </>
    </SectionContainer>
  );
};

export default ArtifUsageSection;
