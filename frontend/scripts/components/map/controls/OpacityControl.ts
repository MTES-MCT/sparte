import React from "react";
import { BaseControl } from "./BaseControl";
import type { ControlUIProps, ControlContext } from "../types/controls";
import type { LayerInterface } from "../types/layerInterface";
import { OpacityControl as OpacityControlComponent } from "../ui/controls/OpacityControl";

export class OpacityControl extends BaseControl {

    async apply(
        targetLayers: string[],
        value: number,
        context: ControlContext
    ): Promise<void> {
        for (const layerId of targetLayers) {
            const layer = context.layers.get(layerId) as LayerInterface;
            if (layer?.setOpacity) {
                layer.setOpacity(value);
            }
        }
    }

    getValue(layerId: string, context?: ControlContext): number {
        const layer = context?.layers.get(layerId) as LayerInterface;
        return layer?.getOpacity?.() ?? 1;
    }

    createUI(props: ControlUIProps): React.ReactElement {
        return React.createElement(OpacityControlComponent, props);
    }
}
