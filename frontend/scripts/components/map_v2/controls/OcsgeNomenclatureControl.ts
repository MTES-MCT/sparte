import React from "react";
import { BaseControl } from "./BaseControl";
import type { ControlUIProps, ControlContext, OcsgeNomenclatureControl as OcsgeNomenclatureControlType } from "../types/controls";
import type { LayerInterface } from "../types/layerInterface";
import { OcsgeNomenclatureControl as OcsgeNomenclatureControlComponent } from "../ui/controls/OcsgeNomenclatureControl";

export class OcsgeNomenclatureControl extends BaseControl {
    async apply(
        targetLayers: string[],
        value: 'couverture' | 'usage',
        context: ControlContext
    ): Promise<void> {
        for (const layerId of targetLayers) {
            const layer = context.layers.get(layerId) as LayerInterface;
            if (layer?.setNomenclature) {
                await layer.setNomenclature(value);
            }
        }

        this.syncOcsgeNomenclatureFilterControl(targetLayers, context);
    }

    private syncOcsgeNomenclatureFilterControl(targetLayers: string[], context: ControlContext): void {
        const control = context.controlConfig as OcsgeNomenclatureControlType;

        if (!control.linkedFilterId || !context.manager || targetLayers.length === 0) return;

        const layer = context.layers.get(targetLayers[0]) as LayerInterface;
        if (layer?.getCurrentFilter) {
            const newFilterValue = layer.getCurrentFilter();
            context.manager.updateControlValue(control.linkedFilterId, newFilterValue);
        }
    }

    getValue(layerId: string, context?: ControlContext): 'couverture' | 'usage' | undefined {
        const layer = context?.layers.get(layerId) as LayerInterface;
        return layer?.getCurrentNomenclature?.();
    }

    createUI(props: ControlUIProps): React.ReactElement {
        return React.createElement(OcsgeNomenclatureControlComponent, props);
    }
}
