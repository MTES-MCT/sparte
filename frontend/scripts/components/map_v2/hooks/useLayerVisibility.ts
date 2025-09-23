import { useCallback, useState, useEffect } from "react";
import { LayerVisibility } from "../types";
import { LayerOrchestrator } from "../LayerOrchestrator";

const opacityPropertyMap: Record<string, string> = {
  raster: "raster-opacity",
  line: "line-opacity",
  fill: "fill-opacity",
};

export const useLayerVisibility = (
    orchestrator: LayerOrchestrator | null,
    initialLayers: LayerVisibility[]
) => {
    const [layers, setLayers] = useState<LayerVisibility[]>([]);

    useEffect(() => {
        if (orchestrator && initialLayers.length > 0) {
            setLayers(initialLayers);
        }
    }, [orchestrator, initialLayers]);

    const toggleLayer = useCallback(
        (layerId: string, visible: boolean) => {
            if (!orchestrator) return;

            setLayers(prevLayers =>
                prevLayers.map(layer =>
                    layer.id === layerId ? { ...layer, visible } : layer
                )
            );

            orchestrator.toggleLayer(layerId, visible);
        },
        [orchestrator]
    );

    const setLayerOpacity = useCallback(
        (layerId: string, opacity: number) => {
            if (!orchestrator) return;

            setLayers(prevLayers =>
                prevLayers.map(layer =>
                    layer.id === layerId ? { ...layer, opacity } : layer
                )
            );

            const layer = orchestrator.getLayer(layerId);
            if (!layer) return;

            layer.setOptions({ opacity });

            const opacityProperty = opacityPropertyMap[layer.options.type];
            if (opacityProperty) {
                orchestrator.updateLayerStyle(layerId, { [opacityProperty]: opacity });
            }
        },
        [orchestrator]
    );

    return {
        layers,
        toggleLayer,
        setLayerOpacity,
    };
};
