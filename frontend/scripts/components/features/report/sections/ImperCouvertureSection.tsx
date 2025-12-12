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

interface ImperCouvertureSectionProps {
    landData: LandDetailResultType;
}

const ImperCouvertureSection: React.FC<ImperCouvertureSectionProps> = ({ landData }) => {
  // Récupérer le dernier millésime disponible
  const millesimes = landData.millesimes || [];
  const maxIndex = millesimes.length > 0 ? Math.max(...millesimes.map(m => m.index)) : 0;
  const minIndex = maxIndex > 0 ? maxIndex - 1 : 0;

  return (
    <SectionContainer>
      <SectionTitle>Répartition de l'imperméabilisation par type de couverture</SectionTitle>

      <>
        <Paragraph>
          La couverture du sol décrit la nature physique de ce qui recouvre le territoire.
          L'imperméabilisation correspond aux surfaces dont les sols sont rendus imperméables
          en raison du bâti ou d'un revêtement (routes, parkings, etc.).
        </Paragraph>

        <ChartContainer>
          <GenericChart
            id="pie_imper_by_couverture_export"
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
            id="pie_imper_by_couverture_export"
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

        <SubTitle>Flux d'imperméabilisation par type de couverture</SubTitle>
        <Paragraph>
          Ce graphique montre quels types de couverture ont contribué à l'imperméabilisation
          ou à la désimperméabilisation au cours de la période.
        </Paragraph>

        <ChartContainer>
          <GenericChart
            id="imper_flux_by_couverture_export"
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
            id="imper_flux_by_couverture_export"
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

export default ImperCouvertureSection;
