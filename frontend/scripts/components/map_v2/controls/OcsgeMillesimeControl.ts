import React from "react";
import { BaseControl } from "./BaseControl";
import type { ControlUIProps, OcsgeMillesimeControl as OcsgeMillesimeControlType, ControlContext } from "../types/controls";
import type { LayerInterface } from "../types/layerInterface";
import type { SourceInterface } from "../types/sourceInterface";
import { OcsgeMillesimeControl as OcsgeMillesimeControlComponent } from "../ui/controls/OcsgeMillesimeControl";

export class OcsgeMillesimeControl extends BaseControl {

    async apply(
        _targetLayers: string[],
        value: string,
        context: ControlContext
    ): Promise<void> {
        const control = context.controlConfig as OcsgeMillesimeControlType;
        const source = context.sources.get(control.sourceId) as SourceInterface;

        if (source?.setMillesime) {
            // Parser la valeur "index_departement" pour extraire index et département
            const [indexStr, departement] = value.split('_');
            const index = parseInt(indexStr, 10);
            await source.setMillesime(index, departement);
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
        return React.createElement(OcsgeMillesimeControlComponent, props);
    }
}
