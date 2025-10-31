import React from "react";
import { BaseMap } from "./BaseMap";
import { defineMapConfig } from "../types/builder";
import { LandDetailResultType } from "@services/types/land";
import { FrichesPopup } from "./popup/FrichesPopup";
import { BASE_SOURCES, BASE_LAYERS, BASE_CONTROLS } from "../constants/presets";

interface FrichesMapProps {
    landData: LandDetailResultType;
    center?: [number, number] | null;
}

export const FrichesMap: React.FC<FrichesMapProps> = ({
    landData,
    center
}) => {

    const config = defineMapConfig({
        sources: [
            ...BASE_SOURCES,
            { type: "friches" },
            { type: "friches-centroid" }
        ],
        layers: [
            ...BASE_LAYERS,
            { type: "friches" },
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
                renderContent: (feature) => <FrichesPopup feature={feature} />,
            }
        ]
    });

    return (
        <BaseMap
            id="friches-map"
            config={config}
            landData={landData}
            center={center}
        />
    );
};

