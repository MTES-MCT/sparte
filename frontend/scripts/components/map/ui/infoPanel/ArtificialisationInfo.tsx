import React from "react";
import { formatNumber } from "@utils/formatUtils";
import type maplibregl from "maplibre-gl";
import { getCouvertureLabel, getUsageLabel } from "../../utils/ocsge";
import { InfoContent } from "./InfoContent";
import { InfoRow } from "./InfoRow";
import { InfoLabel } from "./InfoLabel";
import { InfoValue } from "./InfoValue";

interface ArtificialisationInfoProps {
    feature: maplibregl.MapGeoJSONFeature;
}

export const ArtificialisationInfo: React.FC<ArtificialisationInfoProps> = ({ feature }) => {
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

    const surface = properties.surface || 0;
    const surfaceHa = surface / 10000;
    const codeCs = properties.code_cs;
    const codeUs = properties.code_us;
    const year = properties.year;

    const getSurfaceText = (): string => {
        if (surface > 0) {
            return `${formatNumber({ number: surfaceHa })} ha (${formatNumber({ number: surface })} m²)`;
        }
        return 'Non renseigné';
    };

    const infoData = [
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

