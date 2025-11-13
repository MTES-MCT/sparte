import React, { useMemo } from "react";
import type maplibregl from "maplibre-gl";
import { BaseMap } from "./BaseMap";
import { defineMapConfig } from "../types/builder";
import { LandDetailResultType } from "@services/types/land";
import { LandFriche } from "@services/types/land_friches";
import { FrichesInfo } from "./infoPanel";
import { BASE_SOURCES, BASE_LAYERS, BASE_CONTROLS } from "../constants/presets";

interface FrichesMapProps {
    landData: LandDetailResultType;
    frichesData?: LandFriche[];
    center?: [number, number] | null;
    onMapLoad?: (map: maplibregl.Map) => void;
}

export const FrichesMap: React.FC<FrichesMapProps> = ({
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
            { type: "friches" },
            { type: "friches-centroid" }
        ],
        layers: [
            ...BASE_LAYERS,
            { type: "friches" },
            { type: "friches-outline" },
            { type: "friches-centroid-cluster" }
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
                        targetLayers: ["friches-layer", "friches-layer-outline", "friches-centroid-cluster"],
                        defaultValue: true
                    },
                    {
                        id: "friches-opacity",
                        type: "opacity",
                        targetLayers: ["friches-layer", "friches-layer-outline"],
                        defaultValue: 0.8
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
            id="friches-ocsge-map"
            config={config}
            landData={extendedLandData}
            center={center}
            onMapLoad={onMapLoad}
        />
    );
};

