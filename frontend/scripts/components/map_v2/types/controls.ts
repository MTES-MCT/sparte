import maplibregl from "maplibre-gl";
import React from "react";

export type ControlType = 'visibility' | 'opacity' | 'ocsge-millesime' | 'ocsge-nomenclature' | 'ocsge-nomenclature-filter';

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
    defaultValue: number;
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
    manager: any;
    sources: Map<string, any>;
    layers: Map<string, any>;
    controlId: string;
    controlConfig: any;
}

export interface ControlUIProps {
    control: Control;
    value: any;
    disabled?: boolean;
    onChange: (value: any) => void;
    layerId: string;
    context?: ControlContext;
}

export interface BaseControlInterface {
    apply(
        targetLayers: string[],
        value: any,
        context: ControlContext
    ): Promise<void>;
    getValue(layerId: string, context?: ControlContext): any;
    createUI(props: ControlUIProps): React.ReactElement;
}

export interface ControlsConfig {
    groups: ControlGroup[];
}

export interface ControlsManager {
    getGroups(): ControlGroup[];
    applyControl(controlId: string, value: any): void;
    getControlValue(controlId: string): any;
    isGroupVisible(groupId: string): boolean;
    subscribe(callback: () => void): () => void;
    getControlInstance(controlId: string): BaseControlInterface | undefined;
    getControlContext(controlId: string): ControlContext;
    updateControlValue(controlId: string, value: any): void;
}
