import React from "react";
import { BaseControl } from "./BaseControl";
import type { ControlUIProps, ControlContext } from "../types/controls";
import type { LayerInterface } from "../types/layerInterface";
import { VisibilityControl as VisibilityControlComponent } from "../ui/controls/VisibilityControl";

export class VisibilityControl extends BaseControl {

    async apply(
        targetLayers: string[],
        value: boolean,
        context: ControlContext
    ): Promise<void> {
        for (const layerId of targetLayers) {
            const layer = context.layers.get(layerId) as LayerInterface;
            if (layer?.setVisibility) {
                layer.setVisibility(value);
            }
        }
    }

    getValue(layerId: string, context?: ControlContext): boolean {
        const layer = context?.layers.get(layerId) as LayerInterface;
        return layer?.getVisibility?.() ?? true;
    }

    createUI(props: ControlUIProps): React.ReactElement {
        return React.createElement(VisibilityControlComponent, props);
    }
}
