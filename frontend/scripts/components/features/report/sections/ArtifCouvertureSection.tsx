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

interface ArtifCouvertureSectionProps {
    landData: LandDetailResultType;
}

const ArtifCouvertureSection: React.FC<ArtifCouvertureSectionProps> = ({ landData }) => {
  // Récupérer le dernier millésime disponible
  const millesimes = landData.millesimes || [];
  const maxIndex = millesimes.length > 0 ? Math.max(...millesimes.map(m => m.index)) : 0;
  const minIndex = maxIndex > 0 ? maxIndex - 1 : 0;

  return (
    <SectionContainer>
      <SectionTitle>Répartition par type de couverture</SectionTitle>

      <>
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
      </>
    </SectionContainer>
  );
};

export default ArtifCouvertureSection;
