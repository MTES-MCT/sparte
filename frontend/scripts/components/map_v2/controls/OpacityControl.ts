import React from "react";
import { Range } from "@codegouvfr/react-dsfr/Range";
import { BaseControl } from "./BaseControl";
import type { ControlUIProps, LayerVisibility, ControlContext } from "../types/controls";

export class OpacityControl extends BaseControl {

    async apply(
        targetLayers: string[],
        value: number,
        context: ControlContext
    ): Promise<void> {
        for (const layerId of targetLayers) {
            await context.manager.applyToLayer(layerId, 'setOpacity', value);
        }
    }

    getValue(map: maplibregl.Map, layerId: string): number {
        if (!this.layerExists(map, layerId)) return 1;

        const layer = map.getLayer(layerId);
        if (!layer || !layer.type) return 1;

        const opacityProperty = this.getOpacityPropertyForLayerType(layer.type);
        if (!opacityProperty) return 1;

        return (map.getPaintProperty(layerId, opacityProperty) as number) ?? 1;
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
