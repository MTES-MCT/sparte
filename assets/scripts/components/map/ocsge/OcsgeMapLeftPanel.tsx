import React from 'react';
import { OcsgeMatrixSelector } from './OcsgeMatrixSelector';
import { OcsgeMapLegend } from './OcsgeMapLegend';
import { Selection, UserFilter } from './constants/selections';
import styled from 'styled-components';
import { OcsgeYearSelector } from './OcsgeYearSelector';

const LeftPanelTitle = styled.div`
    font-size: 1.2em;
    font-weight: bold;
`

const LeftPanelDescriptionWrapper = styled.span`
    p {
        margin-bottom: 10px;
        font-size: 1em;
        line-height: 1.5em;
    }
`


interface OcsgeMapLeftPanelProps {
    readonly setSelection: (selection: Selection) => void;
    readonly selection: Selection;
    readonly availableMillesimes: number[];
    readonly setYear: (year: number) => void;
    readonly year: number;
    readonly userFilters: UserFilter[];
    readonly setUserFilters: (filters: UserFilter[]) => void;
}

const OcsgeMapLeftPanelWrapper = styled.aside`
    background-color: rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(8px);
    padding: 15px;
    max-width: 450px;
    width: 450px;
    max-height: 70vh;
    border-radius: 6px;
`

export const OcsgeMapLeftPanel = ({
    userFilters,
    setUserFilters,
    setSelection,
    selection,
    availableMillesimes,
    setYear,
    year,
}: OcsgeMapLeftPanelProps) => {
    return (
        <OcsgeMapLeftPanelWrapper>
            <LeftPanelTitle>Représentations</LeftPanelTitle>
            <OcsgeMatrixSelector
                setSelection={setSelection}
                selection={selection}
            />
            <LeftPanelDescriptionWrapper>
                <selection.Description />
            </LeftPanelDescriptionWrapper>
            <LeftPanelTitle>Année</LeftPanelTitle>
            <OcsgeYearSelector
                year={year}
                setYear={setYear}
                availableMillesimes={availableMillesimes}
            />
            <LeftPanelDescriptionWrapper>
                <p>
                    Les années disponibles correspondent aux <a target='_blank' href="https://geoservices.ign.fr/ocsge#telechargement">millésimes de données
                    OCS GE disponibles pour le département de votre territoire.</a>
                </p>
            </LeftPanelDescriptionWrapper>
        <OcsgeMapLegend
            matrix={selection.matrix}
            userFilters={userFilters}
            setUserFilters={setUserFilters}
            selection={selection}
        
        />
    </OcsgeMapLeftPanelWrapper>
    )
}