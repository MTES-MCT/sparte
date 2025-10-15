import React from "react";
import { Range } from "@codegouvfr/react-dsfr/Range";
import { BaseControl } from "./BaseControl";
import type { ControlUIProps, ControlContext } from "../types/controls";
import type { LayerInterface } from "../types/layerInterface";

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
        return React.createElement(Range, {
            hideMinMax: true,
            small: true,
            min: 0,
            max: 1,
            step: 0.1,
            label: "Opacité",
            classes: { label: "fr-text--sm fr-mb-0" },
            disabled: props.disabled,
            nativeInputProps: {
                value: props.value as number,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                    props.onChange(parseFloat(e.target.value))
            }
        });
    }

}
