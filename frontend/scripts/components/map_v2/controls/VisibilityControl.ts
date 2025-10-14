import React from "react";
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch";
import { BaseControl } from "./BaseControl";
import type { ControlUIProps, LayerVisibility } from "../types/controls";

export class VisibilityControl extends BaseControl {
    readonly type = 'visibility' as const;

    apply(map: maplibregl.Map, layerId: string, value: boolean): void {
        if (!this.layerExists(map, layerId)) return;

        map.setLayoutProperty(layerId, 'visibility', value ? 'visible' : 'none');
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

    isDisabled(_layerVisibility: LayerVisibility): boolean {
        return false; // Le contrôle de visibilité n'est jamais désactivé
    }
}
