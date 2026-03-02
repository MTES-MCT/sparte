import React from "react";
import styled from "styled-components";
import { theme } from "@theme";
import { Millesime } from "@services/types/land";
import Tag from "@components/ui/Tag";

interface LandMillesimeTableProps {
    millesimes: Millesime[];
    territory_name?: string;
    is_interdepartemental?: boolean;
}

const MillesimeGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: ${theme.spacing.md};
`;

const MillesimeCard = styled.div`
    background: ${theme.colors.backgroundAlt};
    border-radius: ${theme.radius.default};
    padding: ${theme.spacing.md};
`;

const MillesimeTitle = styled.div`
    font-size: ${theme.fontSize.sm};
    font-weight: ${theme.fontWeight.semibold};
    color: ${theme.colors.primary};
    margin-bottom: ${theme.spacing.sm};
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
`;

const MillesimeIndex = styled.span`
    background: ${theme.colors.primaryBg};
    color: ${theme.colors.primary};
    padding: 0.15rem 0.5rem;
    border-radius: ${theme.radius.tag};
    font-size: ${theme.fontSize.xs};
    font-weight: ${theme.fontWeight.bold};
`;

const YearList = styled.ul`
    margin: 0;
    padding: 0;
    list-style: none;
`;

const YearItem = styled.li`
    font-size: ${theme.fontSize.sm};
    color: ${theme.colors.text};
    padding: ${theme.spacing.xs} 0;
    border-bottom: 1px solid ${theme.colors.border};

    &:last-child {
        border-bottom: none;
    }
`;

const YearLabel = styled.span`
    font-weight: ${theme.fontWeight.semibold};
    color: ${theme.colors.text};
`;

const DepartementList = styled.span`
    color: ${theme.colors.textLight};
`;

const BadgeList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing.sm};
`;

const TerritoryName = styled.p`
    font-size: ${theme.fontSize.sm};
    color: ${theme.colors.textLight};
    margin: 0 0 ${theme.spacing.md} 0;
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

export const LandMillesimeTable: React.FC<LandMillesimeTableProps> = ({ 
    millesimes, 
    territory_name, 
    is_interdepartemental = false 
}) => {
    const groupedMillesimes = groupMillesimes(millesimes);
    const uniqueYears = Array.from(new Set(millesimes.map(m => m.year))).sort((a, b) => a - b);

    return (
        <div>
            {territory_name && (
                <TerritoryName>Territoire : <strong>{territory_name}</strong></TerritoryName>
            )}

            {is_interdepartemental ? (
                <MillesimeGrid>
                    {Object.entries(groupedMillesimes).map(([index, years]) => (
                        <MillesimeCard key={index}>
                            <MillesimeTitle>
                                <MillesimeIndex>n°{index}</MillesimeIndex>
                                Millésime
                            </MillesimeTitle>
                            <YearList>
                                {Object.entries(years).map(([year, departements]) => (
                                    <YearItem key={`${index}-${year}`}>
                                        <YearLabel>{year}</YearLabel>
                                        <DepartementList> — {departements.join(', ')}</DepartementList>
                                    </YearItem>
                                ))}
                            </YearList>
                        </MillesimeCard>
                    ))}
                </MillesimeGrid>
            ) : (
                <BadgeList>
                    {uniqueYears.map((year) => (
                        <Tag key={year} variant="primary" size="md">{year}</Tag>
                    ))}
                </BadgeList>
            )}
        </div>
    );
};
