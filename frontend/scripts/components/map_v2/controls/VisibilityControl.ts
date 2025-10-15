import React from "react";
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch";
import { BaseControl } from "./BaseControl";
import type { ControlUIProps, ControlContext } from "../types/controls";
import type { LayerInterface } from "../types/layerInterface";

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
        return React.createElement(ToggleSwitch, {
            inputTitle: "Visibilité",
            label: "Visibilité",
            labelPosition: "left",
            checked: props.value as boolean,
            onChange: props.onChange,
            classes: { label: "fr-text--sm fr-mb-0" },
            disabled: props.disabled
        });
    }

}
