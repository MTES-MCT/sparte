import maplibregl from "maplibre-gl";
import React from "react";

// Types de base pour les contrôles
export type ControlType = 'visibility' | 'opacity';

export interface ControlGroup {
    id: string;
    label: string;
    description?: string;
    targetLayers: string[];
    controls: Control[];
    expanded?: boolean;
}

export interface BaseControl {
    id: string;
    type: ControlType;
    disabledWhenHidden?: boolean;
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

export type Control = VisibilityControl | OpacityControl;

// Interface pour les contrôles spécialisés
export interface ControlUIProps {
    control: Control;
    value: any;
    disabled?: boolean;
    onChange: (value: any) => void;
    layerId: string;
}

// Interface pour les contrôles de base
export interface BaseControlInterface {
    readonly type: ControlType;
    apply(map: maplibregl.Map, layerId: string, value: any): void;
    getValue(map: maplibregl.Map, layerId: string): any;
    createUI(props: ControlUIProps): React.ReactElement;
    isDisabled(layerVisibility: LayerVisibility): boolean;
}

// État de visibilité des couches
export interface LayerVisibility {
    id: string;
    label: string;
    visible: boolean;
    opacity?: number;
}

// Configuration des contrôles
export interface ControlsConfig {
    groups: ControlGroup[];
}

// Interface pour le gestionnaire de contrôles
export interface ControlsManager {
    getGroups(): ControlGroup[];
    getLayerVisibility(layerId: string): LayerVisibility | undefined;
    getAllLayerVisibility(): LayerVisibility[];
    applyControl(layerId: string, controlId: string, value: any): void;
    subscribe(callback: () => void): () => void;
}
