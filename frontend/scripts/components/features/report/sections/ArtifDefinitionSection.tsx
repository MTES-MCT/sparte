import React from "react";
import styled from "styled-components";
import {
    Paragraph,
    SectionContainer,
    SectionTitle,
    SubTitle,
    SubSubTitle,
    HighlightBox,
    InfoBox,
    QuoteBox,
} from "../styles";

const ComparisonTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-size: 0.75rem;

  th,
  td {
    padding: 0.75rem;
    text-align: left;
    border: 1px solid #ddd;
  }

  thead {
    background: #f0f0f0;
  }

  th {
    font-weight: 600;
    color: #333;
  }

  tbody tr:nth-child(even) {
    background: #fafafa;
  }

  @media print {
    font-size: 0.8rem;
  }
`;

const ArtifDefinitionSection: React.FC = () => {
  return (
    <SectionContainer>
      <SectionTitle>Artificialisation</SectionTitle>

      <>
        <SubTitle>Définition légale</SubTitle>
        <Paragraph>
          L'article 192 modifie le code de l'urbanisme et donne une définition de
          l'artificialisation telle qu'elle doit être considérée et évaluée dans les
          documents d'urbanisme et de planification :
        </Paragraph>

        <QuoteBox>
          <p>
            « Au sein des documents de planification et d'urbanisme, lorsque la loi ou
            le règlement prévoit des objectifs de réduction de l'artificialisation des
            sols ou de son rythme, ces objectifs sont fixés et évalués en considérant comme :
          </p>
          <ul>
            <li>
              <strong>a) Artificialisée</strong> une surface dont les sols sont soit
              imperméabilisés en raison du bâti ou d'un revêtement, soit stabilisés et
              compactés, soit constitués de matériaux composites ;
            </li>
            <li>
              <strong>b) Non artificialisée</strong> une surface soit naturelle, nue ou
              couverte d'eau, soit végétalisée, constituant un habitat naturel ou utilisée
              à usage de cultures.
            </li>
          </ul>
          <p>
            Un décret en Conseil d'État fixe les conditions d'application du présent article.
            Il établit notamment une nomenclature des sols artificialisés ainsi que l'échelle
            à laquelle l'artificialisation des sols doit être appréciée dans les documents
            de planification et d'urbanisme. »
          </p>
        </QuoteBox>

        <Paragraph>
          Cet article est le premier à définir textuellement ce qui doit être considéré
          comme artificialisé et non artificialisé. Les composantes des espaces artificialisés
          sont explicitement d'une grande finesse de définition, tant géographique que
          descriptive.
        </Paragraph>

        <SubTitle>Décret d'application et OCS GE</SubTitle>
        <Paragraph>
          Le décret d'application du 29 avril 2022 précise encore la notion d'artificialisation
          au sens de la loi Climat et Résilience qui est traduite dans l'OCS GE comme la somme
          des surfaces anthropisées (CS1.1), sans les carrières (US1.3), et des surfaces
          herbacées (CS2.2) à usage de production secondaire, tertiaire, résidentielle ou
          réseaux (US2, US3, US235, US4, US5).
        </Paragraph>

        <HighlightBox>
          <SubSubTitle>Qu'est-ce que l'OCS GE ?</SubSubTitle>
          <p>
            L'<strong>Occupation des Sols à Grande Échelle (OCS GE)</strong> est une base de
            données géographique qui décrit de manière précise l'occupation et l'usage des
            sols sur l'ensemble du territoire français. Elle combine deux nomenclatures :
          </p>
          <ul>
            <li><strong>Couverture du sol (CS)</strong> : ce qui couvre physiquement le sol (bâti, végétation, eau, etc.)</li>
            <li><strong>Usage du sol (US)</strong> : l'utilisation faite du sol (résidentiel, agricole, commercial, etc.)</li>
          </ul>
          <p>
            Cette base de données permet de mesurer précisément l'artificialisation et la
            désartificialisation des sols, conformément aux exigences de la loi Climat et
            Résilience.
          </p>
        </HighlightBox>

        <InfoBox>
          <SubSubTitle>Différence entre consommation d'espaces et artificialisation</SubSubTitle>
          <ComparisonTable>
            <thead>
              <tr>
                <th>Critère</th>
                <th>Consommation d'espaces NAF</th>
                <th>Artificialisation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Période</strong></td>
                <td>2021-2031</td>
                <td>À partir de 2031</td>
              </tr>
              <tr>
                <td><strong>Définition</strong></td>
                <td>Création ou extension d'espaces urbanisés</td>
                <td>Solde entre artificialisation et désartificialisation</td>
              </tr>
              <tr>
                <td><strong>Source de données</strong></td>
                <td>Fichiers fonciers (Majic/CEREMA)</td>
                <td>OCS GE (Occupation des Sols à Grande Échelle)</td>
              </tr>
              <tr>
                <td><strong>Objectif</strong></td>
                <td>Réduction de 50% par rapport à 2011-2020</td>
                <td>Zéro artificialisation nette en 2050</td>
              </tr>
            </tbody>
          </ComparisonTable>
        </InfoBox>
      </>
    </SectionContainer>
    );
};

export default ArtifDefinitionSection;
