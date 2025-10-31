import React from "react";
import styled from "styled-components";
import { formatNumber } from "@utils/formatUtils";
import { PopupContentProps } from "../../types/popup";
import { STATUT_BADGE_CONFIG } from "@components/features/friches/constants";

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

const IconZoneActivite = styled.i`
    font-size: 1.2rem;
`;

export const FrichesPopup: React.FC<PopupContentProps> = ({ 
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

    const getBadgeClass = (statut: string) => {
        return STATUT_BADGE_CONFIG[statut as keyof typeof STATUT_BADGE_CONFIG] ?? 'fr-badge--info';
    };

    const popupData = [
        {
            label: "Nom",
            value: properties.site_nom ?? 'Non renseigné'
        },
        {
            label: "Type",
            value: properties.friche_type ?? 'Non renseigné'
        },
        {
            label: "Statut",
            value: properties.friche_statut ? (
                <span className={`fr-badge fr-badge--no-icon text-lowercase fr-text--xs ${getBadgeClass(properties.friche_statut)}`}>
                    {properties.friche_statut}
                </span>
            ) : 'Non renseigné'
        },
        {
            label: "Pollution",
            value: properties.friche_sol_pollution ?? 'Non renseigné'
        },
        {
            label: "Surface",
            value: properties.surface ? formatNumber({ number: properties.surface / 10000 }) + ' ha' : 'Non renseigné'
        },
        {
            label: "Zone d'activité",
            value: (
                <IconZoneActivite className={`bi ${properties.friche_is_in_zone_activite ? 'bi-check text-success' : 'bi-x text-danger'}`}/>
            )
        },
        {
            label: "Zonage environnemental",
            value: properties.friche_zonage_environnemental ?? 'Non renseigné'
        },
        {
            label: "Type de zone",
            value: properties.friche_type_zone ?? 'Non renseigné'
        },
        {
            label: "Surface artificialisée",
            value: `${formatNumber({ number: properties.surface_artif })} ha (${formatNumber({ number: properties.percent_artif })} %)`
        },
        {
            label: "Surface imperméabilisée",
            value: `${formatNumber({ number: properties.surface_imper })} ha (${formatNumber({ number: properties.percent_imper })} %)`
        }
    ];

    return (
        <PopupContent>
            {popupData.map((item, index) => (
                <PopupRow key={`${item.label}-${index}`}>
                    <PopupLabel>{item.label}</PopupLabel>
                    <PopupValue>{typeof item.value === 'string' ? item.value : item.value}</PopupValue>
                </PopupRow>
            ))}
        </PopupContent>
    );
};

