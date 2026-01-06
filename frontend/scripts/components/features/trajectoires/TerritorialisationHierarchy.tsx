import React, { useState } from 'react';
import styled from 'styled-components';
import { TerritorialisationHierarchyItem } from '@services/types/land';
import GenericChart from '@components/charts/GenericChart';
import GuideContent from '@components/ui/GuideContent';
import Card from '@components/ui/Card';

type TerritorialisationHierarchyProps = {
    hierarchy: TerritorialisationHierarchyItem[];
    land_id: string;
    land_type: string;
    land_name: string;
    has_children: boolean;
    is_from_parent: boolean;
    parent_land_name: string | null;
    objectif: number | null;
};

const Container = styled.div`
    background-color: var(--background-alt-grey);
    border-radius: 4px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
`;

const Title = styled.h4`
    font-size: 1rem;
    font-weight: 700;
    margin: 0;
    color: var(--text-title-grey);
`;

const Subtitle = styled.p`
    font-size: 0.875rem;
    color: var(--text-mention-grey);
    margin: 0 0 1.5rem 0;
`;


const TimelineContainer = styled.div`
    display: flex;
    align-items: stretch;
    gap: 0;
    padding: 0.5rem 0;
    overflow-x: auto;
`;

const TimelineItem = styled.div<{ $isFirst: boolean; $isLast: boolean }>`
    display: flex;
    align-items: center;
    flex-shrink: 0;
`;

const Connector = styled.div`
    width: 32px;
    height: 2px;
    background: var(--border-default-grey);
    position: relative;

    &::after {
        content: '';
        position: absolute;
        right: -4px;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid var(--border-default-grey);
        border-top: 4px solid transparent;
        border-bottom: 4px solid transparent;
    }
`;

const HierarchyCard = styled(Card)<{ $isCurrent?: boolean }>`
    padding: 0.75rem 1rem;
    background: var(--background-default-grey);
    border: 1px solid var(--border-default-grey);
    gap: 0.25rem;
    ${({ $isCurrent }) => $isCurrent && `
        border: 2px solid var(--border-action-high-blue-france);
    `}
`;

const EmptyHierarchyCard = styled(Card)<{ $isCurrent?: boolean }>`
    padding: 0.75rem 1rem;
    background: var(--background-alt-grey);
    border: 2px dashed var(--border-default-grey);
    min-width: 120px;
    align-self: stretch;
    gap: 0.25rem;
    align-items: center;
    justify-content: center;
    ${({ $isCurrent }) => $isCurrent && `
        border: 2px solid var(--border-action-high-blue-france);
    `}
`;

const EmptyCardLabel = styled.span`
    font-size: 0.75rem;
    color: var(--text-mention-grey);
    text-align: center;
`;

const TerritoryName = styled.span`
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    line-height: 1.3;
`;

const ObjectifValue = styled.span`
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-action-high-blue-france);
    line-height: 1;
`;

const ObjectifLabel = styled.span`
    font-size: 0.625rem;
    color: var(--text-mention-grey);
    margin-top: 0.25rem;
    text-align: center;
`;

const StatusBadge = styled.span<{ $status: 'success' | 'pending' | 'waiting' }>`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.625rem;
    font-weight: 500;
    padding: 2px 6px;
    border-radius: 2px;
    margin-top: 0.5rem;
    background: ${props => {
        switch (props.$status) {
            case 'success': return 'var(--background-contrast-success)';
            case 'pending': return 'var(--background-contrast-warning)';
            case 'waiting': return 'var(--background-contrast-grey)';
        }
    }};
    color: ${props => {
        switch (props.$status) {
            case 'success': return 'var(--text-default-success)';
            case 'pending': return 'var(--text-default-warning)';
            case 'waiting': return 'var(--text-mention-grey)';
        }
    }};
    width: fit-content;
`;

const ChildrenCard = styled.div<{ $isExpanded: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1rem;
    background: ${props => props.$isExpanded ? 'var(--background-contrast-grey)' : 'var(--background-default-grey)'};
    border: 1px dashed var(--border-default-grey);
    border-radius: 4px;
    cursor: pointer;
    min-width: 180px;
    align-self: stretch;

    &:hover {
        background: var(--background-contrast-grey);
        border-color: var(--border-action-high-blue-france);
    }
`;

const ChildrenIcon = styled.div`
    font-size: 1.25rem;
    color: var(--text-action-high-blue-france);
    margin-bottom: 0.25rem;
`;

const ChildrenLabel = styled.span`
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text-action-high-blue-france);
    text-align: center;
`;

const MapSection = styled.div<{ $isVisible: boolean }>`
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-default-grey);
    display: ${props => props.$isVisible ? 'flex' : 'none'};
    flex-direction: row;
    gap: 1.5rem;
    align-items: flex-start;
`;

const MapContainer = styled.div`
    flex: 2;
    min-width: 0;
`;

const GuideContainer = styled.div`
    flex: 1;
    min-width: 280px;
`;

const InheritedNotice = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    background: var(--background-contrast-info);
    border-left: 3px solid var(--border-plain-info);
    border-radius: 0 4px 4px 0;
    margin-bottom: 1rem;

    i {
        color: var(--text-default-info);
        font-size: 1rem;
        flex-shrink: 0;
        margin-top: 2px;
    }
`;

const NoticeText = styled.p`
    font-size: 0.875rem;
    color: var(--text-default-grey);
    margin: 0;
    line-height: 1.5;

    strong {
        color: var(--text-title-grey);
    }
`;

// Item parent fictif pour la source du document de France (non affiché)
const LOI_CLIMAT_ITEM: TerritorialisationHierarchyItem = {
    land_id: 'LOI_CLIMAT',
    land_type: 'LOI',
    land_name: 'Loi Climat et Résilience',
    objectif: 50,
    parent_name: null,
    nom_document: 'Loi Climat et Résilience',
    document_url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043956924',
    document_comment: 'Article 194 de la loi n° 2021-1104 du 22 août 2021',
    is_in_document: true,
};

const FRANCE_ITEM: TerritorialisationHierarchyItem = {
    land_id: 'NATION',
    land_type: 'NATION',
    land_name: 'France',
    objectif: 50,
    parent_name: null,
    nom_document: 'Arrêté du 31 mai 2024',
    document_url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000049676333#:~:text=Pour%20tenir%20compte,p%C3%A9riode%202011%2D2021.',
    document_comment: null,
    is_in_document: true,
};

const TerritorialisationHierarchy = ({
    hierarchy,
    land_id,
    land_type,
    land_name,
    has_children,
    is_from_parent,
    parent_land_name,
    objectif
}: TerritorialisationHierarchyProps) => {
    const [showMap, setShowMap] = useState(false);

    if (!hierarchy || hierarchy.length === 0) {
        return null;
    }

    // Ajouter LOI_CLIMAT (non affiché) et France en premier si pas déjà présent
    const fullHierarchy = hierarchy[0]?.land_type === 'NATION'
        ? [LOI_CLIMAT_ITEM, ...hierarchy]
        : [LOI_CLIMAT_ITEM, FRANCE_ITEM, ...hierarchy];

    return (
        <Container>
            <Header>
                <i className="bi bi-diagram-3 fr-text-action-high--blue-france" style={{ fontSize: '1.25rem' }} />
                <Title>Territorialisation des objectifs</Title>
            </Header>
            <Subtitle>
                Pour {land_name}, la mise en œuvre des objectifs de réduction de la consommation d'espaces NAF s'appuie sur les documents de planification territoriale suivants :
            </Subtitle>
            {is_from_parent && parent_land_name && objectif !== null && (
                <InheritedNotice>
                    <i className="bi bi-info-circle-fill" />
                    <NoticeText>
                        <strong>{land_name}</strong> ne dispose pas d'un objectif de réduction territorialisé propre.
                        L'objectif affiché (<strong>-{objectif}%</strong>) est celui défini pour <strong>{parent_land_name}</strong>,
                        le territoire de niveau supérieur dans la chaîne de territorialisation.
                    </NoticeText>
                </InheritedNotice>
            )}
            <TimelineContainer>
                {fullHierarchy.map((item, index) => {
                    // Ne pas afficher le premier élément (LOI_CLIMAT)
                    if (index === 0) return null;
                    // Si objectif suggéré, le dernier de la hiérarchie n'est pas le territoire actuel
                    const isLastInHierarchy = index === fullHierarchy.length - 1;
                    const isCurrent = isLastInHierarchy && !is_from_parent;
                    const isFirst = index === 1;
                    const parentItem = fullHierarchy[index - 1];
                    return (
                        <TimelineItem key={item.land_id} $isFirst={isFirst} $isLast={isCurrent && !has_children}>
                            {index > 1 && <Connector />}
                            <HierarchyCard
                                empty
                                $isCurrent={isCurrent}
                                highlightBadgeIcon="bi bi-geo-alt-fill"
                            >
                                <TerritoryName>
                                    {item.land_name}
                                </TerritoryName>
                                <ObjectifValue>
                                    -{item.objectif}%
                                </ObjectifValue>
                                <ObjectifLabel>
                                    objectif fixé par<br />
                                    {parentItem.document_url ? (
                                        <a href={parentItem.document_url} target="_blank" rel="noopener noreferrer">
                                            {parentItem.nom_document}
                                        </a>
                                    ) : parentItem.nom_document}
                                </ObjectifLabel>
                            </HierarchyCard>
                        </TimelineItem>
                    );
                })}
                {is_from_parent && (
                    <TimelineItem $isFirst={false} $isLast={!has_children}>
                        <Connector />
                        <EmptyHierarchyCard
                            empty
                            $isCurrent
                            highlightBadgeIcon="bi bi-geo-alt-fill"
                        >
                            <TerritoryName>
                                {land_name}
                            </TerritoryName>
                            <EmptyCardLabel>
                                Objectif non défini
                            </EmptyCardLabel>
                            <StatusBadge $status="waiting">
                                <i className="bi bi-clock" />
                                En attente
                            </StatusBadge>
                        </EmptyHierarchyCard>
                    </TimelineItem>
                )}
                {has_children && (
                    <TimelineItem $isFirst={false} $isLast={false}>
                        <Connector />
                        <ChildrenCard
                            $isExpanded={showMap}
                            onClick={() => setShowMap(!showMap)}
                        >
                            <ChildrenIcon>
                                <i className={`bi bi-diagram-3${showMap ? '-fill' : ''}`} />
                            </ChildrenIcon>
                            <ChildrenLabel>Membres</ChildrenLabel>
                            <button className="fr-btn fr-btn--sm fr-btn--tertiary-no-outline fr-mt-1v">
                                {showMap ? 'Masquer la carte' : 'Voir la carte'}
                            </button>
                        </ChildrenCard>
                    </TimelineItem>
                )}
            </TimelineContainer>

            {has_children && (
                <MapSection $isVisible={showMap}>
                    <MapContainer>
                        <div className="bg-white fr-p-2w rounded">
                            <GenericChart
                                id="territorialisation_map"
                                isMap
                                land_id={land_id}
                                land_type={land_type}
                                showDataTable
                            />
                        </div>
                    </MapContainer>
                    <GuideContainer>
                        <GuideContent title="Lecture de la carte" column>
                            <p>Chaque territoire est coloré selon son objectif de réduction de consommation d'espaces.</p>
                            <p>Plus la couleur est foncée, plus l'objectif de réduction est ambitieux.</p>
                            <p>Survolez un territoire pour voir le détail de son objectif.</p>
                        </GuideContent>
                    </GuideContainer>
                </MapSection>
            )}
        </Container>
    );
};

export { TerritorialisationHierarchy };
