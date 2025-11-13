import React, { useMemo } from "react";
import type maplibregl from "maplibre-gl";
import { BaseMap } from "./BaseMap";
import { defineMapConfig } from "../types/builder";
import { LandDetailResultType } from "@services/types/land";
import { LandFriche } from "@services/types/land_friches";
import { OcsgeFrichesInfo } from "./infoPanel";
import { BASE_SOURCES, BASE_LAYERS, BASE_CONTROLS } from "../constants/presets";
import { OCSGE_LAYER_NOMENCLATURES } from "../constants/ocsge_nomenclatures";

interface FrichesOcsgeUsageMapProps {
    landData: LandDetailResultType;
    frichesData?: LandFriche[];
    center?: [number, number] | null;
    onMapLoad?: (map: maplibregl.Map) => void;
}

export const FrichesOcsgeUsageMap: React.FC<FrichesOcsgeUsageMapProps> = ({
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
            { type: "ocsge-friches", nomenclature: "usage" },
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
                    },
                    {
                        id: "friches-opacity",
                        type: "opacity",
                        targetLayers: ["friches-layer-outline"],
                        defaultValue: 1
                    }
                ]
            },
            {
                id: "ocsge-friches-group",
                label: "Usage (OCS GE)",
                description: "Données d'usage du sol à grande échelle (OCS GE).",
                controls: [
                    {
                        id: "ocsge-friches-visibility",
                        type: "visibility",
                        targetLayers: ["ocsge-friches-layer"],
                        defaultValue: true
                    },
                    {
                        id: "ocsge-friches-opacity",
                        type: "opacity",
                        targetLayers: ["ocsge-friches-layer"],
                        defaultValue: 0.8
                    },
                    {
                        id: "ocsge-friches-filter",
                        type: "ocsge-nomenclature-filter",
                        targetLayers: ["ocsge-friches-layer"],
                        defaultValue: OCSGE_LAYER_NOMENCLATURES.artificialisation.usage
                    }
                ]
            }
        ],
        infoPanels: [
            {
                layerId: "ocsge-friches-layer",
                title: "Usage (OCS GE)",
                renderContent: (feature: maplibregl.MapGeoJSONFeature) => <OcsgeFrichesInfo feature={feature} showCouverture={false} />,
            }
        ]
    }), [extendedLandData]);

    if (!frichesData) {
        return null;
    }

    return (
        <BaseMap
            id="friches-ocsge-usage-map"
            config={config}
            landData={extendedLandData}
            center={center}
            onMapLoad={onMapLoad}
        />
    );
};

