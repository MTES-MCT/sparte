import React from "react";
import { BaseControl } from "./BaseControl";
import type { ControlUIProps, OcsgeMillesimeIndexControl as OcsgeMillesimeIndexControlType, ControlContext } from "../types/controls";
import type { LayerInterface } from "../types/layerInterface";
import type { SourceInterface } from "../types/sourceInterface";
import { OcsgeMillesimeIndexControl as OcsgeMillesimeIndexControlComponent } from "../ui/controls/OcsgeMillesimeIndexControl";

export class OcsgeMillesimeIndexControl extends BaseControl {

    async apply(
        _targetLayers: string[],
        value: string,
        context: ControlContext
    ): Promise<void> {
        const control = context.controlConfig as OcsgeMillesimeIndexControlType;
        const source = context.sources.get(control.sourceId) as SourceInterface;

        if (source?.setMillesime) {
            const [indexStr, departement] = value.split('_');
            const index = Number.parseInt(indexStr, 10);
            await source.setMillesime(index, departement);
        }

        if (control.linkedMillesimeIds && context.manager) {
            for (const linkedId of control.linkedMillesimeIds) {
                if (context.manager.getControlValue(linkedId) !== value) {
                    await context.manager.applyControl(linkedId, value);
                }
            }
        }
    }

    getValue(layerId: string, context?: ControlContext): string | undefined {
        const layer = context?.layers.get(layerId) as LayerInterface;
        const millesimeIndex = layer?.getCurrentMillesime?.();
        const departement = layer?.getCurrentDepartement?.();

        if (millesimeIndex !== undefined && departement) {
            return `${millesimeIndex}_${departement}`;
        }
        return undefined;
    }

    createUI(props: ControlUIProps): React.ReactElement {
        return React.createElement(OcsgeMillesimeIndexControlComponent, props);
    }
}
