import type { SourceConfig, LayerConfig } from "../types/builder";
import type { ControlGroup } from "../types/controls";

export const BASE_SOURCES: SourceConfig[] = [
    { type: "orthophoto" },
    { type: "emprise" }
];

export const BASE_LAYERS: LayerConfig[] = [
    { type: "orthophoto" },
    { type: "emprise" }
];

export const BASE_CONTROLS: ControlGroup[] = [
    {
        id: "orthophoto-group",
        label: "Fond de carte",
        description: "Image aérienne du territoire",
        controls: [
            {
                id: "orthophoto-visibility",
                type: "visibility",
                targetLayers: ["orthophoto-layer"],
                defaultValue: true
            },
            {
                id: "orthophoto-opacity",
                type: "opacity",
                targetLayers: ["orthophoto-layer"],
                defaultValue: 1
            }
        ]
    },
    {
        id: "emprise-group",
        label: "Emprise du territoire",
        description: "Contour géographique du territoire",
        controls: [
            {
                id: "emprise-visibility",
                type: "visibility",
                targetLayers: ["emprise-layer"],
                defaultValue: true
            },
            {
                id: "emprise-opacity",
                type: "opacity",
                targetLayers: ["emprise-layer"],
                defaultValue: 1
            }
        ]
    }
];
