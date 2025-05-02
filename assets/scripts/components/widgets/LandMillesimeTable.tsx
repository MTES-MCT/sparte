import { Millesime, MillesimeByIndex } from "@services/types/land";
import React from "react";
import styled from "styled-components";

interface LandMillesimeTableProps {
    millesimes: Millesime[];
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
    return millesimes.reduce((acc, { index, year, departement }) => {
        acc[index] ??= {};
        acc[index][year] ??= [];
        if (!acc[index][year].includes(departement)) {
            acc[index][year].push(departement);
        }
        return acc;
    }, {} as GroupedMillesimes);
}


export const LandMillesimeTable = ({ millesimes }: LandMillesimeTableProps) => {

    const groupedMillesimes = groupMillesimes(millesimes);
    return (
        <>
            {Object.entries(groupedMillesimes).map(([index, years]) => (
                <div key={index} className="fr-col-12 fr-col-md-6">
                    <FrCard className="fr-card">
                        <div className="fr-card__body">
                            <div className="fr-card__content">
                                <FrCardTitle  className="fr-card__title">
                                    Millésime #{index}
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
        </>
    )
}
