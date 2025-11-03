import React from "react";
import { formatNumber } from "@utils/formatUtils";
import { GenericPopup } from "../GenericPopup";
import { STATUT_BADGE_CONFIG } from "@components/features/friches/constants";
import styled from "styled-components";

interface FrichesPopupProps {
    feature: any;
}

const IconZoneActivite = styled.i`
    font-size: 1.5rem;
`;

export const FrichesPopup: React.FC<FrichesPopupProps> = ({ feature }) => {
    const properties = feature.properties;
    
    if (!properties) {
        return <GenericPopup title="Aucune information disponible" data={[]} />;
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
            value: (
                <span className={`fr-badge fr-badge--no-icon text-lowercase fr-text--xs ${getBadgeClass(properties.friche_statut)}`}>
                    {properties.friche_statut ?? 'Non renseigné'}
                </span>
            )
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
            value: `${formatNumber({ number: properties.surface_artif })} ha (${formatNumber({ number: properties.percent_artif })} %)`,
        },
        {
            label: "Surface imperméable",
            value: `${formatNumber({ number: properties.surface_imper })} ha (${formatNumber({ number: properties.percent_imper })} %)`,
        }
        
    ];

    return (
        <GenericPopup 
            title={`Friche ${properties.site_id}`}
            data={popupData}
        />
    );
}; 