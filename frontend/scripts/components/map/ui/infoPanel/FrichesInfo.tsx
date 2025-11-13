import React from "react";
import styled from "styled-components";
import { formatNumber } from "@utils/formatUtils";
import type maplibregl from "maplibre-gl";
import { STATUT_BADGE_CONFIG } from "@components/features/friches/constants";
import { InfoContent } from "./InfoContent";
import { InfoRow } from "./InfoRow";
import { InfoLabel } from "./InfoLabel";
import { InfoValue } from "./InfoValue";

const IconZoneActivite = styled.i`
    font-size: 0.9rem;
`;

interface FrichesInfoProps {
    feature: maplibregl.MapGeoJSONFeature;
}

export const FrichesInfo: React.FC<FrichesInfoProps> = ({ feature }) => {
    const properties = feature?.properties;
    
    if (!properties) {
        return (
            <InfoContent>
                <InfoRow>
                    <InfoLabel>Information</InfoLabel>
                    <InfoValue>Aucune donnée disponible</InfoValue>
                </InfoRow>
            </InfoContent>
        );
    }

    const getBadgeClass = (statut: string): string => {
        return STATUT_BADGE_CONFIG[statut as keyof typeof STATUT_BADGE_CONFIG] ?? 'fr-badge--info';
    };

    const infoData = [
        {
            label: "Identifiant",
            value: properties.site_id ?? 'Non renseigné'
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
            label: "Surface",
            value: properties.surface ? formatNumber({ number: properties.surface / 10000 }) + ' ha' : 'Non renseigné'
        },
        {
            label: "Surface artificialisée",
            value: `${formatNumber({ number: properties.surface_artif })} ha (${formatNumber({ number: properties.percent_artif })} %)`
        },
        {
            label: "Surface imperméable",
            value: `${formatNumber({ number: properties.surface_imper })} ha (${formatNumber({ number: properties.percent_imper })} %)`
        }
    ];

    return (
        <InfoContent>
            {infoData.map((item, index) => (
                <InfoRow key={`${item.label}-${index}`}>
                    <InfoLabel>{item.label}</InfoLabel>
                    <InfoValue>{typeof item.value === 'string' ? item.value : item.value}</InfoValue>
                </InfoRow>
            ))}
        </InfoContent>
    );
};

