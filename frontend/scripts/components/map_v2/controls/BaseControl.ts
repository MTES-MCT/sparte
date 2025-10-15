import React from "react";
import type { ControlUIProps, BaseControlInterface, ControlContext } from "../types/controls";

export abstract class BaseControl implements BaseControlInterface {

    abstract apply(
        targetLayers: string[],
        value: any,
        context: ControlContext
    ): Promise<void>;

    abstract getValue(layerId: string, context?: ControlContext): any;

    abstract createUI(props: ControlUIProps): React.ReactElement;
}
