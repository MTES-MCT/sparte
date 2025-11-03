import React, { useMemo } from "react";
import { BaseMap } from "./BaseMap";
import { defineMapConfig } from "../types/builder";
import { LandDetailResultType } from "@services/types/land";
import { LandFriche } from "@services/types/land_friches";
import { FrichesPopup } from "./popup/FrichesPopup";
import { BASE_SOURCES, BASE_LAYERS, BASE_CONTROLS } from "../constants/presets";

interface FrichesMapProps {
    landData: LandDetailResultType;
    frichesData?: LandFriche[];
    center?: [number, number] | null;
}

export const FrichesMap: React.FC<FrichesMapProps> = ({
    landData,
    frichesData,
    center
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
            { type: "friches" },
            { type: "friches-centroid" }
        ],
        layers: [
            ...BASE_LAYERS,
            { type: "ocsge-friches" },
            { type: "friches" },
            { type: "friches-centroid-cluster" }
        ],
        controlGroups: [
            ...BASE_CONTROLS,
            {
                id: "ocsge-friches-group",
                label: "OCS GE Friches",
                description: "Occupation du sol à grande échelle découpée aux friches du territoire",
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
                        defaultValue: 0.7
                    }
                ]
            },
            {
                id: "friches-group",
                label: "Friches",
                description: "Visualisation des friches du territoire recensées dans le dispositif Cartofriches",
                controls: [
                    {
                        id: "friches-visibility",
                        type: "visibility",
                        targetLayers: ["friches-layer", "friches-centroid-cluster"],
                        defaultValue: true
                    },
                    {
                        id: "friches-opacity",
                        type: "opacity",
                        targetLayers: ["friches-layer"],
                        defaultValue: 0.4
                    }
                ]
            }
        ],
        popups: [
            {
                layerId: "friches-layer",
                trigger: "click",
                title: "Friche",
                renderContent: (feature: any) => <FrichesPopup feature={feature} />,
            }
        ]
    }), [extendedLandData]);

    if (!frichesData) {
        return null;
    }

    return (
        <BaseMap
            id="friches-map"
            config={config}
            landData={extendedLandData}
            center={center}
        />
    );
};

