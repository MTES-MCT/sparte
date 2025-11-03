import React from "react";
import styled from "styled-components";
import { formatNumber } from "@utils/formatUtils";
import { PopupContentProps } from "../../types/popup";
import { getCouvertureLabel, getUsageLabel } from "../../utils/ocsge";

const PopupContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const PopupRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
`;

const PopupLabel = styled.span`
    font-weight: 500;
    color: #666;
    font-size: 0.8rem;
    min-width: 120px;
`;

const PopupValue = styled.span`
    font-weight: 400;
    text-align: right;
    word-wrap: break-word;
    font-size: 0.8rem;
    color: #1e1e1e;
    flex: 1;
`;

export const ImpermeabilisationPopup: React.FC<PopupContentProps> = ({ 
    feature 
}) => {
    const properties = feature?.properties;
	
    if (!properties) {
        return (
            <PopupContent>
                <PopupRow>
                    <PopupLabel>Information</PopupLabel>
                    <PopupValue>Aucune donnée disponible</PopupValue>
                </PopupRow>
            </PopupContent>
        );
    }

    const surface = properties.surface || 0;
    const surfaceHa = surface / 10000; // Conversion m² vers hectares
    const codeCs = properties.code_cs;
    const codeUs = properties.code_us;
    const year = properties.year;

    const getSurfaceText = () => {
        if (surface > 0) {
            return `${formatNumber({ number: surfaceHa })} ha (${formatNumber({ number: surface })} m²)`;
        }
        return 'Non renseigné';
    };

    const popupData = [
        {
            label: "Surface",
            value: getSurfaceText()
        },
        {
            label: "Année",
            value: year || 'Non renseigné'
        },
        {
            label: "Couverture",
            value: `${codeCs} - ${getCouvertureLabel(codeCs)}`
        },
        {
            label: "Usage",
            value: `${codeUs} - ${getUsageLabel(codeUs)}`
        }
    ];

    return (
        <PopupContent>
            {popupData.map((item, index) => (
                <PopupRow key={`${item.label}-${index}`}>
                    <PopupLabel>{item.label}</PopupLabel>
                    <PopupValue>{item.value}</PopupValue>
                </PopupRow>
            ))}
        </PopupContent>
    );
};
