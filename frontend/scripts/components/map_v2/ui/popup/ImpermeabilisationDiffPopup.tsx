import React from "react";
import styled from "styled-components";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
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

export const ImpermeabilisationDiffPopup: React.FC<PopupContentProps> = ({ 
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

    const isImpermeable = properties.new_is_impermeable === true;
    const isDesimpermeable = properties.new_not_impermeable === true;
    const surface = properties.surface || 0;
    const surfaceHa = surface / 10000; // Conversion m² vers hectares

    const getStatusText = () => {
        if (isImpermeable) return "Imperméabilisation";
        if (isDesimpermeable) return "Désimperméabilisation";
        return "Inconnu";
    };

    const getSurfaceText = () => {
        if (surface > 0) {
            return `${formatNumber({ number: surfaceHa })} ha (${formatNumber({ number: surface })} m²)`;
        }
        return 'Non renseigné';
    };

    const getEvolutionInfo = () => {
        const yearOld = properties.year_old;
        const yearNew = properties.year_new;
        const usOld = properties.us_old;
        const usNew = properties.us_new;
        const csOld = properties.cs_old;
        const csNew = properties.cs_new;
        
        return {
            period: `${yearOld} → ${yearNew}`,
            usage: `${usOld} (${getUsageLabel(usOld)}) → ${usNew} (${getUsageLabel(usNew)})`,
            couverture: `${csOld} (${getCouvertureLabel(csOld)}) → ${csNew} (${getCouvertureLabel(csNew)})`
        };
    };

    const evolution = getEvolutionInfo();

    const popupData = [
        {
            label: "Type",
            value: (
                <Badge 
					noIcon
                    severity={isImpermeable ? "error" : "success"}
                    small
                >
                    {getStatusText()}
                </Badge>
            )
        },
        {
            label: "Surface",
            value: getSurfaceText()
        },
        {
            label: "Période",
            value: evolution.period
        },
        {
            label: "Usage",
            value: evolution.usage
        },
        {
            label: "Couverture",
            value: evolution.couverture
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
