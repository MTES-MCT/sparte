import React from "react";
import { BaseControl } from "./BaseControl";
import type { ControlUIProps, OcsgeMillesimeControl as OcsgeMillesimeControlType, ControlContext } from "../types/controls";
import type { LayerInterface } from "../types/layerInterface";
import type { SourceInterface } from "../types/sourceInterface";
import { OcsgeMillesimeControl as OcsgeMillesimeControlComponent } from "../ui/controls/OcsgeMillesimeControl";

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
        return React.createElement(OcsgeMillesimeControlComponent, props);
    }
}
