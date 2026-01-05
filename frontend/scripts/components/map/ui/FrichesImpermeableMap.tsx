import React, { useMemo } from "react";
import type maplibregl from "maplibre-gl";
import { BaseMap } from "./BaseMap";
import { defineMapConfig } from "../types/builder";
import { LandDetailResultType } from "@services/types/land";
import { LandFriche } from "@services/types/land_friches";
import { OcsgeFrichesInfo } from "./infoPanel";
import { BASE_SOURCES, BASE_LAYERS, BASE_CONTROLS } from "../constants/presets";
import { OCSGE_LAYER_NOMENCLATURES } from "../constants/ocsge_nomenclatures";

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
                id: "ocsge-friches-impermeable-group",
                label: "Surfaces imperméables",
                description: "Surfaces imperméables des friches (OCS GE).",
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
                        defaultValue: 0.8
                    },
                    {
                        id: "ocsge-friches-impermeable-filter",
                        type: "ocsge-nomenclature-filter",
                        targetLayers: ["ocsge-friches-impermeable-layer"],
                        defaultValue: OCSGE_LAYER_NOMENCLATURES.impermeabilisation.couverture
                    }
                ]
            }
        ],
        infoPanels: [
            {
                layerId: "ocsge-friches-impermeable-layer",
                title: "Surfaces imperméables",
                renderContent: (feature: maplibregl.MapGeoJSONFeature) => <OcsgeFrichesInfo feature={feature} showUsage={false} />,
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

