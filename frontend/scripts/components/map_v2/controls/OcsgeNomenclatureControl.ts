import React from "react";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { BaseControl } from "./BaseControl";
import type { ControlUIProps, ControlContext, OcsgeNomenclatureControl as OcsgeNomenclatureControlType } from "../types/controls";
import type { LayerInterface } from "../types/layerInterface";

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
        const options = [
            { value: "couverture", label: "Couverture du sol" },
            { value: "usage", label: "Usage du sol" }
        ];

        return React.createElement(Select, {
            label: "Nomenclature",
            nativeSelectProps: {
                value: props.value as 'couverture' | 'usage',
                onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
                    const value = e.target.value as 'couverture' | 'usage';
                    props.onChange(value);
                }
            },
            children: options.map(option =>
                React.createElement('option', {
                    key: option.value,
                    value: option.value
                }, option.label)
            ),
            disabled: props.disabled
        });
    }

}
