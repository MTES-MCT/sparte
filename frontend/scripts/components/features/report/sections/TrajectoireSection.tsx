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
    InfoBox,
    SimulationBox,
} from "../styles";

interface TrajectoireSectionProps {
    landData: LandDetailResultType;
}

const TrajectoireSection: React.FC<TrajectoireSectionProps> = ({ landData }) => {
  return (
    <SectionContainer>
      <SectionTitle>Trajectoires de consommation d'espace</SectionTitle>

      <>
        <Paragraph>
          La loi Climat & Résilience fixe l'objectif d'atteindre le « zéro artificialisation
          nette des sols » en 2050, avec un objectif intermédiaire de réduction de moitié de
          la consommation d'espaces naturels, agricoles et forestiers dans les dix prochaines
          années 2021-2031 (en se basant sur les données allant du 01/01/2021 au 31/12/2030)
          par rapport à la décennie précédente 2011-2021 (en se basant sur les données allant
          du 01/01/2011 au 31/12/2020).
        </Paragraph>

        <InfoBox>
          <h3>Déclinaison dans les documents d'urbanisme</h3>
          <p>
            Cette trajectoire nationale progressive est à décliner dans les documents de
            planification et d'urbanisme :
          </p>
          <ul>
            <li>Avant le <strong>22 novembre 2024</strong> pour les SRADDET</li>
            <li>Avant le <strong>22 février 2027</strong> pour les SCoT</li>
            <li>Avant le <strong>22 février 2028</strong> pour les PLU(i) et cartes communales</li>
          </ul>
          <p>
            Elle doit être conciliée avec l'objectif de soutien de la construction durable,
            en particulier dans les territoires où l'offre de logements et de surfaces
            économiques est insuffisante au regard de la demande.
          </p>
        </InfoBox>

        <SubTitle>Projets d'envergure nationale</SubTitle>
        <Paragraph>
          La loi prévoit également que la consommation foncière des projets d'envergure
          nationale ou européenne et d'intérêt général majeur sera comptabilisée au niveau
          national, et non au niveau régional ou local. Ces projets seront énumérés par
          arrêté du ministre chargé de l'urbanisme, en fonction de catégories définies dans
          la loi, après consultation des régions, de la conférence régionale et du public.
          Un forfait de 12 500 hectares est déterminé pour la période 2021-2031, dont
          10 000 hectares font l'objet d'une péréquation entre les régions couvertes par
          un SRADDET.
        </Paragraph>

        <SubTitle>Garanties pour les communes</SubTitle>
        <Paragraph>
          Afin de tenir compte des besoins de l'ensemble des territoires, une surface
          minimale d'un hectare de consommation est garantie à toutes les communes
          couvertes par un document d'urbanisme prescrit, arrêté ou approuvé avant le
          22 août 2026, pour la période 2021-2031. Cette « garantie communale » peut
          être mutualisée au niveau intercommunal à la demande des communes.
        </Paragraph>

        <Paragraph>
          Quant aux communes littorales soumises au recul du trait de côte, qui sont
          listées par décret et qui ont mis en place un projet de recomposition spatiale,
          elles peuvent considérer, avant même que la désartificialisation soit effective,
          comme « désartificialisées » les surfaces situées dans la zone menacée à horizon
          30 ans et qui seront ensuite désartificialisées.
        </Paragraph>

        <SimulationBox>
          <h3>Simulation pour votre territoire</h3>
          <p>
            Dès aujourd'hui, Mon Diagnostic Artificialisation vous permet de vous projeter
            dans cet objectif de réduction de la consommation d'espaces NAF (Naturels,
            Agricoles et Forestiers) d'ici à 2031 et de simuler divers scénarii.
          </p>
          <p>
            Vous avez choisi de personnaliser votre objectif non-réglementaire de réduction
            à hauteur de 50.0 % et le graphique ci-dessous vous montre un aperçu des
            tendances annuelles maximales que votre territoire ne devrait pas dépasser
            d'ici à 2031.
          </p>
        </SimulationBox>

        <ChartContainer>
          <GenericChart
            id="objective_chart_export"
            land_id={landData.land_id}
            land_type={landData.land_type}
            params={{
              target_2031_custom: 50,
            }}
            sources={["majic"]}
            showToolbar={false}
            hideDetails
          />
        </ChartContainer>

        <DataTableContainer>
          <GenericChart
            id="objective_chart_export"
            land_id={landData.land_id}
            land_type={landData.land_type}
            params={{
              target_2031_custom: 50,
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

export default TrajectoireSection;
