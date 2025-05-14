import React from 'react';
import styled from 'styled-components';

const TagGroup = styled.div`
    display: flex;
    align-items: center;
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
  chartId: string;
}

const ChartDataSource: React.FC<ChartDataSourceProps> = ({ sources, chartId }) => {
    if (!sources || sources.length === 0) return null;
    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="fr-text--xs fr-mb-0 fr-mr-1w">Source de données :</span>
            <TagGroup>
                {sources.map((src) => {
                    const source = SOURCES_DETAILS[src];
                    if (!source) return null;
                    const tooltipId = `tooltip-${chartId}-${src}`;
                    const tagId = `tag-${chartId}-${src}`;
                    return (
                        <React.Fragment key={src}>
                            <span className="fr-tag fr-tag--sm fr-tag--blue fr-text--bold" role="button" id={tagId} aria-describedby={tooltipId} tabIndex={0}>
                            {source.label}
                            </span>
                            <span className="fr-tooltip fr-placement" id={tooltipId} role="tooltip" aria-hidden="true" dangerouslySetInnerHTML={{ __html: source.html }} />
                        </React.Fragment>
                    );
                })}
            </TagGroup>
        </div>
    );
};

export default ChartDataSource;
