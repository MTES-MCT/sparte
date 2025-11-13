import React, { useMemo } from "react";
import type maplibregl from "maplibre-gl";
import { BaseMap } from "./BaseMap";
import { defineMapConfig } from "../types/builder";
import { LandDetailResultType } from "@services/types/land";
import { LandFriche } from "@services/types/land_friches";
import { BASE_SOURCES, BASE_LAYERS, BASE_CONTROLS } from "../constants/presets";

interface FrichesArtificialMapProps {
    landData: LandDetailResultType;
    frichesData?: LandFriche[];
    center?: [number, number] | null;
    onMapLoad?: (map: maplibregl.Map) => void;
}

export const FrichesArtificialMap: React.FC<FrichesArtificialMapProps> = ({
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
            { type: "ocsge-friches-artificial" },
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
                id: "ocsge-friches-artificial-group",
                label: "Surfaces artificialisées",
                description: "Surfaces artificialisées des friches (OCS GE).",
                controls: [
                    {
                        id: "ocsge-friches-artificial-visibility",
                        type: "visibility",
                        targetLayers: ["ocsge-friches-artificial-layer"],
                        defaultValue: true
                    },
                    {
                        id: "ocsge-friches-artificial-opacity",
                        type: "opacity",
                        targetLayers: ["ocsge-friches-artificial-layer"],
                        defaultValue: 0.6
                    }
                ]
            }
        ]
    }), [extendedLandData]);

    if (!frichesData) {
        return null;
    }

    return (
        <BaseMap
            id="friches-artificial-map"
            config={config}
            landData={extendedLandData}
            center={center}
            onMapLoad={onMapLoad}
        />
    );
};

