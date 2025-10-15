import maplibregl from "maplibre-gl";
import React from "react";

// Types de base pour les contrôles
export type ControlType = 'visibility' | 'opacity' | 'millesime';

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

export interface MillesimeControl extends BaseControl {
    type: 'millesime';
    defaultValue: number;
    options: Array<{ value: number; label: string }>;
    sourceId: string;
    disabled?: boolean;
}

export type Control = VisibilityControl | OpacityControl | MillesimeControl;

// Contexte passé aux contrôles pour accéder au manager et aux objets
export interface ControlContext {
    manager: any; // ControlsManager (any pour éviter circular dependency)
    sources: Map<string, any>; // BaseSource instances
    layers: Map<string, any>; // BaseLayer instances
    controlId: string; // ID du contrôle en cours
    controlConfig: any; // Config du contrôle en cours
}

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
    apply(
        targetLayers: string[],
        value: any,
        context: ControlContext
    ): Promise<void>;
    getValue(map: maplibregl.Map, layerId: string): any;
    createUI(props: ControlUIProps): React.ReactElement;
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
