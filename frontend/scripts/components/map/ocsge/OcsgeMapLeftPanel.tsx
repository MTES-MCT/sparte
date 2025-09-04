import React from 'react';
import { OcsgeMatrixSelector } from './OcsgeMatrixSelector';
import { OcsgeMapLegend } from './OcsgeMapLegend';
import { Selection, UserFilter } from './constants/selections';
import styled from 'styled-components';
import { OcsgeIndexSelector } from './OcsgeIndexSelector';
import { Millesime, MillesimeByIndex } from '@services/types/land';

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
    readonly availableMillesimes: Millesime[];
    readonly availableMillesimesByIndex: MillesimeByIndex[];
    readonly setIndex: (index: number) => void;
    readonly index: number;
    readonly userFilters: UserFilter[];
    readonly setUserFilters: (filters: UserFilter[]) => void;
}

const OcsgeMapLeftPanelWrapper = styled.aside`
    background-color: #ffffff;
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
    availableMillesimesByIndex,
    setIndex,
    index,
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
            <OcsgeIndexSelector
                index={index}
                setIndex={setIndex}
                availableMillesimes={availableMillesimes}
                availableMillesimesByIndex={availableMillesimesByIndex}
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