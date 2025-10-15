import React from "react";
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch";
import { BaseControl } from "./BaseControl";
import type { ControlUIProps, LayerVisibility, ControlContext } from "../types/controls";

export class VisibilityControl extends BaseControl {

    async apply(
        targetLayers: string[],
        value: boolean,
        context: ControlContext
    ): Promise<void> {
        for (const layerId of targetLayers) {
            await context.manager.applyToLayer(layerId, 'setVisibility', value);
        }
    }

    getValue(map: maplibregl.Map, layerId: string): boolean {
        if (!this.layerExists(map, layerId)) return true;

        const visibility = map.getLayoutProperty(layerId, 'visibility');
        return visibility === 'visible';
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
