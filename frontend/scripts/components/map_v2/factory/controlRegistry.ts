import { VisibilityControl } from "../controls/VisibilityControl";
import { OpacityControl } from "../controls/OpacityControl";
import { OcsgeMillesimeControl } from "../controls/OcsgeMillesimeControl";
import { OcsgeDiffMillesimeControl } from "../controls/OcsgeDiffMillesimeControl";
import { OcsgeNomenclatureControl } from "../controls/OcsgeNomenclatureControl";
import { OcsgeNomenclatureFilterControl } from "../controls/OcsgeNomenclatureFilterControl";
import type { BaseControlInterface, ControlType } from "../types/controls";

type ControlFactory = () => BaseControlInterface;

const controlRegistry: Record<ControlType, ControlFactory> = {
    visibility: () => new VisibilityControl(),
    opacity: () => new OpacityControl(),
    'ocsge-millesime': () => new OcsgeMillesimeControl(),
    'ocsge-diff-millesime': () => new OcsgeDiffMillesimeControl(),
    'ocsge-nomenclature': () => new OcsgeNomenclatureControl(),
    'ocsge-nomenclature-filter': () => new OcsgeNomenclatureFilterControl(),
};

export function createControl(type: ControlType): BaseControlInterface {
    const factory = controlRegistry[type];
    if (!factory) {
        throw new Error(`Unknown control type: ${type}`);
    }
    return factory();
}
