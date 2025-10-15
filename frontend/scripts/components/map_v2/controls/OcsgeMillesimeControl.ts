import React from "react";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { BaseControl } from "./BaseControl";
import type { ControlUIProps, OcsgeMillesimeControl as OcsgeMillesimeControlType, ControlContext } from "../types/controls";
import type { LayerInterface } from "../types/layerInterface";
import type { SourceInterface } from "../types/sourceInterface";

export class OcsgeMillesimeControl extends BaseControl {

    async apply(
        _targetLayers: string[],
        value: number,
        context: ControlContext
    ): Promise<void> {
        const control = context.controlConfig as OcsgeMillesimeControlType;
        const source = context.sources.get(control.sourceId) as SourceInterface;

        if (source?.setMillesime) {
            await source.setMillesime(value);
        }
    }

    getValue(layerId: string, context?: ControlContext): number | undefined {
        const layer = context?.layers.get(layerId) as LayerInterface;
        return layer?.getCurrentMillesime?.();
    }

    createUI(props: ControlUIProps): React.ReactElement {
        const control = props.control as OcsgeMillesimeControlType;

        let options: Array<{ value: number; label: string }> = [];
        if (props.context?.sources) {
            const source = props.context.sources.get(control.sourceId) as SourceInterface;
            if (source?.getAvailableMillesimes) {
                options = source.getAvailableMillesimes();
            }
        }

        return React.createElement(Select, {
            label: "Millésime",
            nativeSelectProps: {
                value: props.value as number,
                onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                    props.onChange(parseInt(e.target.value, 10))
            },
            children: options.map((option: { value: number; label: string }) =>
                React.createElement('option', {
                    key: option.value,
                    value: option.value
                }, option.label)
            ),
            disabled: props.disabled
        });
    }

}
