import { Millesime } from "@services/types/land";
import React from "react";
import styled from "styled-components";

interface LandMillesimeTableProps {
    millesimes: Millesime[];
    territory_name?: string;
    is_interdepartemental?: boolean;
    scrollMarginTop?: string;
    compact?: boolean;
}

const Card = styled.div<{ $compact?: boolean }>`
    background-color: var(--background-alt-grey);
    padding: ${props => props.$compact ? '0.5rem' : '1rem'};
    height: 100%;
`;

const FrCardTitle = styled.p<{ $compact?: boolean }>`
    font-weight: 600;
    font-size: ${props => props.$compact ? '0.75rem' : '1rem'};
`;

const ListTitle = styled.p<{ $compact?: boolean }>`
    margin-bottom: 0.5rem;
    font-size: ${props => props.$compact ? '0.875rem' : '1rem'};
    font-weight: 600;
`;

const CompactListItem = styled.li<{ $compact?: boolean }>`
    font-size: ${props => props.$compact ? '0.75rem' : 'inherit'};
`;

const Badge = styled.div<{ $compact?: boolean }>`
    font-size: ${props => props.$compact ? '0.75rem' : 'inherit'};
`;

type GroupedMillesimes = {
    [index: number]: {
        [year: number]: string[];
    }
}

const groupMillesimes = (millesimes: Millesime[]): GroupedMillesimes => {
    return millesimes.reduce((acc, { index, year, departement, departement_name }) => {
        acc[index] ??= {};
        acc[index][year] ??= [];
        const deptDisplay = departement_name ? `${departement_name} (${departement})` : departement;
        if (!acc[index][year].includes(deptDisplay)) {
            acc[index][year].push(deptDisplay);
        }
        return acc;
    }, {} as GroupedMillesimes);
}

export const LandMillesimeTable = ({ millesimes, territory_name, is_interdepartemental = false, scrollMarginTop = '200px', compact = false }: LandMillesimeTableProps) => {
    const groupedMillesimes = groupMillesimes(millesimes);

    return (
        <div className="fr-alert fr-alert--info bg-white" id="millesimes-table" style={{ scrollMarginTop: scrollMarginTop }}>
            <ListTitle $compact={compact}>
                Millésimes OCS GE disponibles pour le territoire de {territory_name}
            </ListTitle>
            {is_interdepartemental ? (
                <div className="fr-grid-row fr-grid-row--gutters">
                    {Object.entries(groupedMillesimes).map(([index, years]) => (
                        <div key={index} className="fr-col-12 fr-col-md-6">
                            <Card $compact={compact}>
                                <FrCardTitle className="fr-card__title" $compact={compact}>
                                    Millésime n°{index}
                                </FrCardTitle>
                                <ul className="fr-card__desc">
                                    {Object.entries(years).map(([year, departements]) => (
                                        <CompactListItem key={`${index}-${year}`} $compact={compact}>
                                            <div><span className="fr-text--bold">{year} :</span> {departements.join(', ')}</div>
                                        </CompactListItem>
                                    ))}
                                </ul>
                            </Card>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {millesimes
                        .map((m) => m.year)
                        .sort((a, b) => a - b)
                        .map((year) => (
                            <Badge key={year} className="fr-badge fr-mr-1w" $compact={compact}>{year}</Badge>
                        ))
                    }
                </>
            )}
        </div>
    );
}
