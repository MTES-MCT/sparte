import React from "react";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { BaseControl } from "./BaseControl";
import type { ControlUIProps, MillesimeControl as MillesimeControlType, ControlContext } from "../types/controls";

export class MillesimeControl extends BaseControl {

    async apply(
        _targetLayers: string[],
        value: number,
        context: ControlContext
    ): Promise<void> {
        const sourceId = context.controlConfig?.sourceId;

        await context.manager.applyToSource(sourceId, 'setMillesime', value);
    }

    getValue(_map: maplibregl.Map, layerId: string): number {
        // Récupérer la valeur actuelle du millésime depuis les métadonnées de la couche
        // Pour l'instant, on retourne la valeur par défaut
        return 1;
    }

    createUI(props: ControlUIProps): React.ReactElement {
        const control = props.control as MillesimeControlType;

        return React.createElement(Select, {
            label: "Millésime",
            nativeSelectProps: {
                value: props.value as number,
                onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                    props.onChange(parseInt(e.target.value, 10))
            },
            children: control.options.map(option =>
                React.createElement('option', {
                    key: option.value,
                    value: option.value
                }, option.label)
            ),
            disabled: props.disabled
        });
    }

}
