import React from 'react';
import styled from 'styled-components';
import { TerritorialisationHierarchyItem } from '@services/types/land';

type TerritorialisationHierarchyProps = {
    hierarchy: TerritorialisationHierarchyItem[];
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

const Icon = styled.span`
    font-size: 1rem;
    filter: grayscale(1) brightness(10);
`;

const Title = styled.h4`
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0;
    color: #4a4a4a;
    text-transform: uppercase;
    letter-spacing: 0.5px;
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

const TerritorialisationHierarchy = ({ hierarchy }: TerritorialisationHierarchyProps) => {
    if (!hierarchy || hierarchy.length === 0) {
        return null;
    }

    return (
        <Container>
            <Header>
                <IconWrapper>
                    <Icon>📊</Icon>
                </IconWrapper>
                <Title>Chaîne de territorialisation</Title>
            </Header>
            <TimelineContainer>
                {hierarchy.map((item, index) => {
                    const isCurrent = index === hierarchy.length - 1;
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
            </TimelineContainer>
        </Container>
    );
};

export { TerritorialisationHierarchy };
