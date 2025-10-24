import React from "react";
import type { BaseSource } from "../sources/baseSource";
import type { BaseLayer } from "../layers/baseLayer";
import type { StatsManager } from "../stats/StatsManager";

export type ControlType = 'visibility' | 'opacity' | 'ocsge-millesime' | 'ocsge-nomenclature' | 'ocsge-nomenclature-filter';

export type ControlValue = boolean | number | string | string[];

export interface ControlGroup {
    id: string;
    label: string;
    description?: string;
    controls: Control[];
}

export interface BaseControl {
    id: string;
    type: ControlType;
    targetLayers: string[];
}

export interface VisibilityControl extends BaseControl {
    type: 'visibility';
    defaultValue: boolean;
    disabled?: boolean;
}

export interface OpacityControl extends BaseControl {
    type: 'opacity';
    defaultValue: number;
    disabled?: boolean;
}

export interface OcsgeMillesimeControl extends BaseControl {
    type: 'ocsge-millesime';
    sourceId: string;
    defaultValue: string;
    disabled?: boolean;
}

export interface OcsgeNomenclatureControl extends BaseControl {
    type: 'ocsge-nomenclature';
    defaultValue: 'couverture' | 'usage';
    linkedFilterId?: string;
    disabled?: boolean;
}

export interface OcsgeNomenclatureFilterControl extends BaseControl {
    type: 'ocsge-nomenclature-filter';
    defaultValue: string[];
    disabled?: boolean;
}

export type Control = VisibilityControl | OpacityControl | OcsgeMillesimeControl | OcsgeNomenclatureControl | OcsgeNomenclatureFilterControl;

export interface ControlContext {
    manager: ControlsManagerInterface;
    sources: Map<string, BaseSource>;
    layers: Map<string, BaseLayer>;
    controlId: string;
    controlConfig: Control;
    statsManager?: StatsManager;
}

export interface ControlUIProps {
    control: Control;
    value: ControlValue;
    disabled?: boolean;
    onChange: (value: ControlValue) => void;
    layerId: string;
    context?: ControlContext;
}

export interface BaseControlInterface {
    apply(
        targetLayers: string[],
        value: ControlValue,
        context: ControlContext
    ): Promise<void>;
    getValue(layerId: string, context?: ControlContext): ControlValue;
    createUI(props: ControlUIProps): React.ReactElement;
}

export interface ControlsConfig {
    groups: ControlGroup[];
}

export interface ControlsManagerInterface {
    getGroups(): ControlGroup[];
    applyControl(controlId: string, value: ControlValue): Promise<void>;
    getControlValue(controlId: string): ControlValue;
    isGroupVisible(groupId: string): boolean;
    subscribe(callback: () => void): () => void;
    getControlInstance(controlId: string): BaseControlInterface | undefined;
    getControlContext(controlId: string): ControlContext;
    updateControlValue(controlId: string, value: ControlValue): void;
}
