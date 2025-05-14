import { Millesime, MillesimeByIndex } from "@services/types/land";
import React from "react";
import styled from "styled-components";

interface LandMillesimeTableProps {
    millesimes: Millesime[];
    territory_name?: string;
    is_interdepartemental?: boolean;
    scrollMarginTop?: string;
}

const FrCard = styled.div`
    background-color: var(--background-alt-grey);
`;

const FrCardTitle = styled.h3`
    color: var(--text-action-high-blue-france);
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

export const LandMillesimeTable = ({ millesimes, territory_name, is_interdepartemental = false, scrollMarginTop = '200px' }: LandMillesimeTableProps) => {
    const groupedMillesimes = groupMillesimes(millesimes);

    return (
        <div className="fr-alert fr-alert--info bg-white" id="millesimes-table" style={{ scrollMarginTop: scrollMarginTop }}>
            <h6 className="fr-alert__title">
                Millésimes disponibles pour le territoire de{" "}
                <strong>{territory_name}</strong>
            </h6>
            {is_interdepartemental ? (
                <div className="fr-grid-row fr-grid-row--gutters fr-mt-2w fr-mb-1w">
                    {Object.entries(groupedMillesimes).map(([index, years]) => (
                        <div key={index} className="fr-col-12 fr-col-md-6">
                            <FrCard className="fr-card">
                                <div className="fr-card__body">
                                    <div className="fr-card__content">
                                        <FrCardTitle className="fr-card__title">
                                            Millésime n°{index}
                                        </FrCardTitle>
                                        <ul className="fr-card__desc">
                                            {Object.entries(years).map(([year, departements]) => (
                                                <li key={`${index}-${year}`}>
                                                    <div><span className="fr-text--bold">{year} :</span> {departements.join(', ')}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </FrCard>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {millesimes
                        .map((m) => m.year)
                        .toSorted((a, b) => a - b)
                        .map((year) => (
                            <div key={year} className="fr-badge fr-mr-1w">{year}</div>
                        ))
                    }
                </>
            )}
        </div>
    );
}
