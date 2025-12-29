import React, { useState } from 'react';
import styled from 'styled-components';
import { TerritorialisationHierarchyItem } from '@services/types/land';
import GenericChart from '@components/charts/GenericChart';

type TerritorialisationHierarchyProps = {
    hierarchy: TerritorialisationHierarchyItem[];
    land_id: string;
    land_type: string;
    land_name: string;
    has_children: boolean;
};

const Container = styled.div`
    background: linear-gradient(135deg, #faf8fb 0%, #f5f0f7 100%);
    border-radius: 12px;
    padding: 1.5rem 2rem;
    margin-bottom: 1.5rem;
    border: 1px solid rgba(165, 88, 160, 0.15);
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
`;

const IconWrapper = styled.div`
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #A558A0 0%, #8B4789 100%);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 3px 8px rgba(165, 88, 160, 0.25);
`;

const Icon = styled.i`
    font-size: 1.1rem;
    color: white;
`;

const Title = styled.h4`
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0;
    color: #4a4a4a;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const Subtitle = styled.p`
    font-size: 0.8rem;
    color: #888;
    margin: 0 0 1rem 0;
`;


const TimelineContainer = styled.div`
    display: flex;
    align-items: stretch;
    gap: 0;
    padding: 0.5rem 0;
`;

const TimelineItem = styled.div<{ $isFirst: boolean; $isLast: boolean }>`
    display: flex;
    align-items: center;
    flex-shrink: 0;
`;

const Connector = styled.div`
    width: 40px;
    height: 2px;
    background: linear-gradient(90deg, rgba(165, 88, 160, 0.3), rgba(165, 88, 160, 0.5));
    position: relative;

    &::after {
        content: '';
        position: absolute;
        right: -4px;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid rgba(165, 88, 160, 0.5);
        border-top: 4px solid transparent;
        border-bottom: 4px solid transparent;
    }
`;

const Card = styled.div<{ $isCurrent: boolean }>`
    display: flex;
    flex-direction: column;
    padding: ${props => props.$isCurrent ? '1rem 1.5rem' : '0.75rem 1.25rem'};
    background: ${props => props.$isCurrent
        ? 'linear-gradient(135deg, #A558A0 0%, #8B4789 100%)'
        : 'white'};
    color: ${props => props.$isCurrent ? 'white' : '#3a3a3a'};
    border-radius: 12px;
    box-shadow: ${props => props.$isCurrent
        ? '0 6px 20px rgba(165, 88, 160, 0.35)'
        : '0 2px 8px rgba(0,0,0,0.06)'};
    border: ${props => props.$isCurrent ? 'none' : '1px solid #eee'};
    transition: all 0.2s ease;
    position: relative;
    min-width: ${props => props.$isCurrent ? '180px' : '150px'};

    ${props => props.$isCurrent && `
        &::before {
            content: 'Territoire actuel';
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 0.65rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background: #A558A0;
            color: white;
            padding: 2px 10px;
            border-radius: 10px;
            white-space: nowrap;
        }
    `}

    &:hover {
        transform: translateY(-3px);
        box-shadow: ${props => props.$isCurrent
            ? '0 8px 25px rgba(165, 88, 160, 0.4)'
            : '0 4px 12px rgba(0,0,0,0.1)'};
    }
`;

const TerritoryName = styled.span<{ $isCurrent: boolean }>`
    font-size: ${props => props.$isCurrent ? '1rem' : '0.875rem'};
    font-weight: ${props => props.$isCurrent ? '600' : '500'};
    margin-bottom: 0.35rem;
    line-height: 1.3;
`;

const DocumentBadge = styled.span<{ $isCurrent: boolean }>`
    display: inline-block;
    font-size: 0.65rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    padding: 2px 8px;
    border-radius: 4px;
    margin-bottom: 0.5rem;
    background: ${props => props.$isCurrent ? 'rgba(255,255,255,0.2)' : 'rgba(165, 88, 160, 0.1)'};
    color: ${props => props.$isCurrent ? 'rgba(255,255,255,0.9)' : '#A558A0'};
    width: fit-content;
`;

const ObjectifValue = styled.span<{ $isCurrent: boolean }>`
    font-size: ${props => props.$isCurrent ? '1.5rem' : '1.1rem'};
    font-weight: 700;
    color: ${props => props.$isCurrent ? 'white' : '#A558A0'};
    line-height: 1;
`;

const ObjectifLabel = styled.span<{ $isCurrent: boolean }>`
    font-size: 0.7rem;
    color: ${props => props.$isCurrent ? 'rgba(255,255,255,0.7)' : '#888'};
    margin-top: 0.25rem;
`;

const ChildrenCard = styled.div<{ $isExpanded: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.25rem;
    background: ${props => props.$isExpanded ? 'rgba(165, 88, 160, 0.08)' : 'white'};
    border: 1px dashed ${props => props.$isExpanded ? '#A558A0' : '#ccc'};
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 150px;
    align-self: stretch;

    &:hover {
        background: rgba(165, 88, 160, 0.08);
        border-color: #A558A0;
        transform: translateY(-3px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
`;

const ChildrenIcon = styled.div`
    font-size: 1.25rem;
    margin-bottom: 0.25rem;
`;

const ChildrenLabel = styled.span`
    font-size: 0.75rem;
    font-weight: 500;
    color: #A558A0;
    text-align: center;
`;

const ChildrenAction = styled.span`
    font-size: 0.65rem;
    color: #888;
    margin-top: 0.25rem;
`;

const MapSection = styled.div<{ $isVisible: boolean }>`
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(165, 88, 160, 0.15);
    display: ${props => props.$isVisible ? 'block' : 'none'};
`;

const MapDescription = styled.p`
    font-size: 0.85rem;
    color: #666;
    margin: 0 0 1rem 0;
`;

const FRANCE_ITEM: TerritorialisationHierarchyItem = {
    land_id: 'NATION',
    land_type: 'NATION',
    land_name: 'France',
    objectif: 50,
    parent_name: null,
    nom_document: 'Loi Climat et Résilience',
    document_url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043956924',
    document_comment: 'Article 194 de la loi n° 2021-1104 du 22 août 2021',
};

const TerritorialisationHierarchy = ({
    hierarchy,
    land_id,
    land_type,
    land_name,
    has_children
}: TerritorialisationHierarchyProps) => {
    const [showMap, setShowMap] = useState(false);

    if (!hierarchy || hierarchy.length === 0) {
        return null;
    }

    // Ajouter France en premier si pas déjà présent
    const fullHierarchy = hierarchy[0]?.land_type === 'NATION'
        ? hierarchy
        : [FRANCE_ITEM, ...hierarchy];

    return (
        <Container>
            <Header>
                <IconWrapper>
                    <Icon className="bi bi-diagram-3" />
                </IconWrapper>
                <Title>Chaîne de territorialisation</Title>
            </Header>
            <Subtitle>
                L'objectif de réduction de votre territoire provient d'une déclinaison progressive depuis l'échelon national.
            </Subtitle>
            <TimelineContainer>
                {fullHierarchy.map((item, index) => {
                    const isCurrent = index === fullHierarchy.length - 1;
                    const isFirst = index === 0;
                    return (
                        <TimelineItem key={item.land_id} $isFirst={isFirst} $isLast={isCurrent}>
                            {index > 0 && <Connector />}
                            <Card $isCurrent={isCurrent}>
                                <TerritoryName $isCurrent={isCurrent}>
                                    {item.land_name}
                                </TerritoryName>
                                <DocumentBadge $isCurrent={isCurrent}>
                                    {item.nom_document}
                                </DocumentBadge>
                                <ObjectifValue $isCurrent={isCurrent}>
                                    -{item.objectif}%
                                </ObjectifValue>
                                <ObjectifLabel $isCurrent={isCurrent}>
                                    objectif de réduction
                                </ObjectifLabel>
                            </Card>
                        </TimelineItem>
                    );
                })}
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
                            <ChildrenAction>
                                {showMap ? 'Masquer' : 'Voir la carte'}
                            </ChildrenAction>
                        </ChildrenCard>
                    </TimelineItem>
                )}
            </TimelineContainer>

            {has_children && (
                <MapSection $isVisible={showMap}>
                    <MapDescription>
                        Objectifs de réduction assignés à chaque membre de {land_name}.
                    </MapDescription>
                    <div className="bg-white fr-p-2w rounded">
                        <GenericChart
                            id="territorialisation_map"
                            isMap
                            land_id={land_id}
                            land_type={land_type}
                            showDataTable
                        />
                    </div>
                </MapSection>
            )}
        </Container>
    );
};

export { TerritorialisationHierarchy };
