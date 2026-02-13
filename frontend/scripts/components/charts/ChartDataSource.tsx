import React from 'react';
import styled from 'styled-components';
import { theme } from '@theme';
import IconBadge from '@components/ui/IconBadge';

const Container = styled.div<{ $displayMode: 'tag' | 'text' }>`
  display: flex;
  align-items: ${props => props.$displayMode === 'tag' ? 'center' : 'flex-start'};
  gap: ${theme.spacing.sm};
`;

const TagsContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem;
`;

const SourceTag = styled.span`
  font-size: ${theme.fontSize.xs};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.textMuted};
  background: ${theme.badge.neutral.background};
  padding: 0.2rem ${theme.spacing.sm};
  border-radius: ${theme.radius};
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

export const SOURCES_DETAILS: Record<string, { label: string; html: string }> = {
  insee: {
    label: 'INSEE',
    html: `Historique des populations communales issues des recensements de la population (1876-2021) produits et diffusés par l'INSEE.<br/>Les données de population "estimée" ont été réalisées en utilisant une moyenne, permettant de projeter les tendances des années précédentes.`
  },
  majic: {
    label: 'Fichiers fonciers',
    html: `Données d'évolution des fichiers fonciers produits et diffusés par le Cerema depuis 2009 à partir des fichiers MAJIC (Mise A Jour de l'Information Cadastrale) de la DGFIP. Le dernier millésime de 2023 est la photographie du territoire au 1er janvier 2024, intégrant les évolutions réalisées au cours de l'année 2023.`
  },
  gpu: {
    label: 'GPU',
    html: `Zonages d'Urbanisme issus du Géoportail de l'Urbanisme (GPU) en date de juin 2023 : <a href='https://www.geoportail-urbanisme.gouv.fr/' target='_blank' rel='noopener'>https://www.geoportail-urbanisme.gouv.fr/</a>`
  },
  lovac: {
    label: 'LOVAC',
    html: `Base Logements vacants du parc privé par commune, EPCI, département et Région (LOVAC) produite par le Cerema.`
  },
  ocsge: {
    label: 'OCS GE',
    html: `Données d'OCcupation des Sols à Grande Echelle (OCS GE) de l'IGN.`
  },
  rpls: {
    label: 'RPLS',
    html: `Répertoire des logements locatifs des bailleurs sociaux (RPLS) produit par le Ministère de la Transition écologique.`
  },
  sitadel: {
    label: 'SITADEL',
    html: `Base des permis de construire et autres autorisations d'urbanisme (SITADEL) produite par le Ministère de la Transition écologique.`
  },
  cartofriches: {
    label: 'Cartofriches',
    html: `Cartofriches utilise des données nationales (BASIAS et BASOL1, appels à projets...) pour assurer une pré-identification des friches sur tout le territoire. Il a vocation à consolider ce recensement avec la participation des acteurs locaux au plus près du terrain, en intégrant les données des observatoires locaux et des études de recensement portées par des acteurs de l'aménagement. <a href='https://cartofriches.cerema.fr/cartofriches/' target='_blank' rel='noopener'>En savoir plus</a>`
  }
};

interface ChartDataSourceProps {
  sources: (keyof typeof SOURCES_DETAILS)[];
  displayMode?: 'tag' | 'text';
}

const ChartDataSource: React.FC<ChartDataSourceProps> = ({ sources, displayMode = 'tag' }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <Container $displayMode={displayMode}>
      <IconBadge icon="bi bi-database" $size={28} />
      {displayMode === 'text' ? (
        <TextContainer>
          {sources.map((src) => {
            const source = SOURCES_DETAILS[src];
            if (!source) return null;
            return (
              <p key={src} className="fr-text--xs fr-mb-0" dangerouslySetInnerHTML={{ __html: source.html }} />
            );
          })}
        </TextContainer>
      ) : (
        <TagsContainer>
          {sources.map((src) => {
            const source = SOURCES_DETAILS[src];
            if (!source) return null;
            return (
              <SourceTag key={src}>{source.label}</SourceTag>
            );
          })}
        </TagsContainer>
      )}
    </Container>
  );
};

export default ChartDataSource;
