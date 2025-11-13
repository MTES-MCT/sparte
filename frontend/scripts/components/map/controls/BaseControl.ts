import React from "react";
import type { ControlUIProps, BaseControlInterface, ControlContext, ControlValue } from "../types/controls";

export abstract class BaseControl implements BaseControlInterface {

    abstract apply(
        targetLayers: string[],
        value: ControlValue,
        context: ControlContext
    ): Promise<void>;

    abstract getValue(layerId: string, context?: ControlContext): ControlValue;

    abstract createUI(props: ControlUIProps): React.ReactElement;
}
