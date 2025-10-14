import { VisibilityControl } from "../controls/VisibilityControl";
import { OpacityControl } from "../controls/OpacityControl";
import type { BaseControlInterface, ControlType } from "../types/controls";

type ControlFactory = () => BaseControlInterface;

const controlRegistry: Record<ControlType, ControlFactory> = {
    visibility: () => new VisibilityControl(),
    opacity: () => new OpacityControl(),
};

export function createControl(type: ControlType): BaseControlInterface {
    const factory = controlRegistry[type];
    if (!factory) {
        throw new Error(`Unknown control type: ${type}`);
    }
    return factory();
}
