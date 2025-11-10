import React, { useMemo } from "react";
import type maplibregl from "maplibre-gl";
import { BaseMap } from "./BaseMap";
import { defineMapConfig } from "../types/builder";
import { LandDetailResultType } from "@services/types/land";
import { LandFriche } from "@services/types/land_friches";
import { FrichesInfo } from "./infoPanel";
import { BASE_SOURCES, BASE_LAYERS, BASE_CONTROLS } from "../constants/presets";

interface FrichesImpermeableMapProps {
    landData: LandDetailResultType;
    frichesData?: LandFriche[];
    center?: [number, number] | null;
    onMapLoad?: (map: maplibregl.Map) => void;
}

export const FrichesImpermeableMap: React.FC<FrichesImpermeableMapProps> = ({
    landData,
    frichesData,
    center,
    onMapLoad
}) => {
    const fricheSiteIds = useMemo(() => {
        return frichesData?.map(f => f.site_id) || [];
    }, [frichesData]);

    const extendedLandData = useMemo(() => ({
        ...landData,
        fricheSiteIds
    }), [landData, fricheSiteIds]) as LandDetailResultType & { fricheSiteIds?: string[] };

    const config = useMemo(() => defineMapConfig({
        sources: [
            ...BASE_SOURCES,
            { type: "ocsge-friches" },
            { type: "friches" }
        ],
        layers: [
            ...BASE_LAYERS,
            { type: "ocsge-friches-impermeable" },
            { type: "friches-outline" }
        ],
        controlGroups: [
            ...BASE_CONTROLS,
            {
                id: "friches-group",
                label: "Friches",
                description: "Visualisation des friches du territoire recensées dans le dispositif Cartofriches",
                controls: [
                    {
                        id: "friches-visibility",
                        type: "visibility",
                        targetLayers: ["friches-layer-outline"],
                        defaultValue: true
                    }
                ]
            },
            {
                id: "ocsge-friches-impermeable-group",
                label: "Zones imperméables",
                description: "Zones imperméables des friches (OCS GE).",
                controls: [
                    {
                        id: "ocsge-friches-impermeable-visibility",
                        type: "visibility",
                        targetLayers: ["ocsge-friches-impermeable-layer"],
                        defaultValue: true
                    },
                    {
                        id: "ocsge-friches-impermeable-opacity",
                        type: "opacity",
                        targetLayers: ["ocsge-friches-impermeable-layer"],
                        defaultValue: 0.9
                    }
                ]
            }
        ],
        infoPanels: [
            {
                layerId: "friches-layer",
                title: "Friche",
                renderContent: (feature: maplibregl.MapGeoJSONFeature) => <FrichesInfo feature={feature} />,
            }
        ]
    }), [extendedLandData]);

    if (!frichesData) {
        return null;
    }

    return (
        <BaseMap
            id="friches-impermeable-map"
            config={config}
            landData={extendedLandData}
            center={center}
            onMapLoad={onMapLoad}
        />
    );
};

