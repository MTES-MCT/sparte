import React from "react";
import {
    Paragraph,
    SectionContainer,
    SectionTitle,
    SubTitle,
    HighlightBox,
} from "../styles";

const DefinitionSection: React.FC = () => {
  return (
    <SectionContainer>
      <SectionTitle>Définition de la consommation d'espaces NAF (Naturel, Agricole et Forestier) et contexte juridique</SectionTitle>

      <>
        <Paragraph>
          Chaque année, 24 000 ha d'espaces NAF sont consommés
          en moyenne en France, soit près de 5 terrains de football par heure. Tous les territoires
          sont concernés : en particulier 61% de la consommation d'espaces est constatée dans les
          territoires sans tension immobilière.
        </Paragraph>

        <Paragraph>
          Les conséquences sont écologiques (érosion de la biodiversité, aggravation du risque de
          ruissellement, limitation du stockage carbone) mais aussi socio-économiques (coûts des
          équipements publics, augmentation des temps de déplacement et de la facture énergétique
          des ménages, dévitalisation des territoires en déprise, diminution du potentiel de
          production agricole etc.).
        </Paragraph>

        <HighlightBox>
          <h3>Objectif Zéro Artificialisation Nette (ZAN)</h3>
          <p>
            La France s'est donc fixée l'objectif d'atteindre le « zéro artificialisation nette
            des sols » en 2050, avec un objectif intermédiaire de réduction de moitié de la
            consommation d'espaces naturels, agricoles et forestiers dans les dix prochaines
            années 2021-2031 (en se basant sur les données allant du 01/01/2021 au 31/12/2030)
            par rapport à la décennie précédente 2011-2021 (en se basant sur les données allant
            du 01/01/2011 au 31/12/2020).
          </p>
        </HighlightBox>

        <SubTitle>Cadre législatif</SubTitle>
        <Paragraph>
          Les dispositions introduites par la <strong>loi n° 2021-1104 du 22 août 2021</strong> portant
          lutte contre le dérèglement climatique et renforcement de la résilience face à ses effets
          (dite « Loi Climat et résilience ») ont été complétées par la <strong>loi n° 2023-630 du
          20 juillet 2023</strong> visant à faciliter la mise en œuvre des objectifs de lutte contre
          l'artificialisation des sols et à renforcer l'accompagnement des élus locaux.
        </Paragraph>

        <SubTitle>Période 2021-2031 : Consommation d'espaces NAF (Naturel, Agricole et Forestier)</SubTitle>
        <Paragraph>
          Pour la période 2021-2031, il s'agit de raisonner en consommation d'espaces.
        </Paragraph>
        <Paragraph>
          La consommation d'espaces NAF est entendue comme
          « la création ou l'extension effective d'espaces urbanisés sur le territoire concerné »
          (article 194 de la loi Climat et résilience).
        </Paragraph>
        <Paragraph>
          La loi adoptée en 2023 précise qu'à l'échelle d'un même territoire, « la transformation
          effective d'espaces urbanisés ou construits en espaces naturels, agricoles et forestiers
          du fait d'une désartificialisation peut être comptabilisée en déduction de cette consommation ».
        </Paragraph>
        <Paragraph>
          Au niveau national, la consommation d'espaces NAF est
          mesurée par les fichiers fonciers retraités par le CEREMA.
        </Paragraph>

        <SubTitle>À partir de 2031 : Artificialisation</SubTitle>
        <Paragraph>
          A partir de 2031, il s'agit de raisonner en artificialisation.
        </Paragraph>
        <Paragraph>
          L'artificialisation nette est définie comme « le solde de l'artificialisation et de la
          désartificialisation des sols constatées sur un périmètre et sur une période donnés »
          (article L.101-2-1 du code de l'urbanisme).
        </Paragraph>
        <Paragraph>
          Au niveau national, l'artificialisation est mesurée par l'occupation des sols à grande
          échelle (OCS GE), en cours d'élaboration, dont la production sera engagée sur l'ensemble
          du territoire national d'ici fin 2024.
        </Paragraph>
      </>
    </SectionContainer>
  );
};

export default DefinitionSection;
