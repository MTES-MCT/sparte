import React from "react";
import { Range } from "@codegouvfr/react-dsfr/Range";
import { BaseControl } from "./BaseControl";
import type { ControlUIProps, LayerVisibility } from "../types/controls";

export class OpacityControl extends BaseControl {
    readonly type = 'opacity' as const;

    apply(map: maplibregl.Map, layerId: string, value: number): void {
        if (!this.layerExists(map, layerId)) return;

        const layer = map.getLayer(layerId);
        if (!layer || !layer.type) return;

        const opacityProperty = this.getOpacityPropertyForLayerType(layer.type);
        if (opacityProperty) {
            map.setPaintProperty(layerId, opacityProperty, value);
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
            step: 0.01,
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

    isDisabled(layerVisibility: LayerVisibility): boolean {
        // L'opacité est désactivée quand la couche est masquée
        return !layerVisibility.visible;
    }
}
