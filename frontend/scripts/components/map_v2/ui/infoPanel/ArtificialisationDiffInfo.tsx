import React from "react";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { formatNumber } from "@utils/formatUtils";
import type maplibregl from "maplibre-gl";
import { getCouvertureLabel, getUsageLabel } from "../../utils/ocsge";
import { InfoContent } from "./InfoContent";
import { InfoRow } from "./InfoRow";
import { InfoLabel } from "./InfoLabel";
import { InfoValue } from "./InfoValue";

interface ArtificialisationDiffInfoProps {
    feature: maplibregl.MapGeoJSONFeature;
}

export const ArtificialisationDiffInfo: React.FC<ArtificialisationDiffInfoProps> = ({ feature }) => {
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

    const isArtificial = properties.new_is_artificial === true;
    const isDesartificial = properties.new_not_artificial === true;
    const surface = properties.surface || 0;
    const surfaceHa = surface / 10000;

    const getStatusText = (): string => {
        if (isArtificial) return "Artificialisation";
        if (isDesartificial) return "Désartificialisation";
        return "Inconnu";
    };

    const getSurfaceText = (): string => {
        if (surface > 0) {
            return `${formatNumber({ number: surfaceHa })} ha (${formatNumber({ number: surface })} m²)`;
        }
        return 'Non renseigné';
    };

    const getEvolutionInfo = (): {period: string; usage: string; couverture: string} => {
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

    const infoData = [
        {
            label: "Type",
            value: (
                <Badge 
					noIcon
                    severity={isArtificial ? "error" : "success"}
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
        <InfoContent>
            {infoData.map((item, index) => (
                <InfoRow key={`${item.label}-${index}`}>
                    <InfoLabel>{item.label}</InfoLabel>
                    <InfoValue>{item.value}</InfoValue>
                </InfoRow>
            ))}
        </InfoContent>
    );
};

