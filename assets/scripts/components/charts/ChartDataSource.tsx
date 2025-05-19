import React from 'react';
import styled from 'styled-components';

const Container = styled.div<{ $displayMode: 'tag' | 'text' }>`
    display: flex;
    align-items: ${props => props.$displayMode === 'tag' ? 'center' : 'flex-start'};
    flex-direction: ${props => props.$displayMode === 'tag' ? 'row' : 'column'};
    gap: ${props => props.$displayMode === 'tag' ? '0' : '0.3rem'};
`;

const SourceLabel = styled.div<{ $displayMode: 'tag' | 'text' }>`
    margin: 0;
    font-size: ${props => props.$displayMode === 'tag' ? '0.75rem' : ''};
`;

const TagsContainer = styled.div`
    display: flex;
    align-items: center;
`;

const TextContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const SOURCES_DETAILS: Record<string, { label: string; html: string }> = {
    insee: {
        label: 'INSEE',
        html: `Historique des populations communales issues des recensements de la population (1876-2021) produits et diffusés par l'INSEE.<br/>Les données de population "estimée" ont été réalisées en utilisant une moyenne, permettant de projeter les tendances des années précédentes.`
    },
    majic: {
        label: 'FICHIERS FONCIERS',
        html: `Données d'évolution des fichiers fonciers produits et diffusés par le Cerema depuis 2009 à partir des fichiers MAJIC (Mise A Jour de l'Information Cadastrale) de la DGFIP. Le dernier millésime de 2023 est la photographie du territoire au 1er janvier 2023, intégrant les évolutions réalisées au cours de l'année 2022.`
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
};

interface ChartDataSourceProps {
  sources: (keyof typeof SOURCES_DETAILS)[];
  displayMode?: 'tag' | 'text';
}

const ChartDataSource: React.FC<ChartDataSourceProps> = ({ sources, displayMode = 'tag' }) => {
    if (!sources || sources.length === 0) return null;
    return (
        <Container $displayMode={displayMode}>
            <SourceLabel as={displayMode === 'text' ? 'h6' : 'span'} $displayMode={displayMode}>
                Source de données :
            </SourceLabel>
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
                            <span key={src} className="fr-tag fr-tag--sm fr-tag--blue fr-text--bold fr-ml-1w">
                                {source.label}
                            </span>
                        );
                    })}
                </TagsContainer>
            )}
        </Container>
    );
};

export default ChartDataSource;
