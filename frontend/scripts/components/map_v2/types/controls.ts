import maplibregl from "maplibre-gl";
import React from "react";

// Types de base pour les contrôles
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
    defaultValue: string[];  // Codes sélectionnés par défaut
    disabled?: boolean;
}

export type Control = VisibilityControl | OpacityControl | OcsgeMillesimeControl | OcsgeNomenclatureControl | OcsgeNomenclatureFilterControl;

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
    context?: ControlContext;
}

// Interface pour les contrôles de base
export interface BaseControlInterface {
    apply(
        targetLayers: string[],
        value: any,
        context: ControlContext
    ): Promise<void>;
    getValue(layerId: string, context?: ControlContext): any;
    createUI(props: ControlUIProps): React.ReactElement;
}

// Configuration des contrôles
export interface ControlsConfig {
    groups: ControlGroup[];
}

// Interface pour le gestionnaire de contrôles
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
