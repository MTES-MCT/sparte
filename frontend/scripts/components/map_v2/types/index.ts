export interface LayerVisibility {
	id: string;
	label: string;
	visible: boolean;
	opacity?: number;
	description?: string;
}

export interface LayerControlsConfig {
	layers?: LayerVisibility[];
	showControls?: boolean;
}

import type { LayerType } from "../layers/baseLayer";

export interface LayerState {
	id: string;
	type: LayerType;
	visibility: boolean;
	opacity: number;
	params: Record<string, unknown>;
}

export interface StyleDiff {
	layout?: Record<string, any>;
	paint?: Record<string, any>;
	filter?: any[];
}

export type ControlType = "toggle" | "slider" | "select" | "multiselect" | "button";

export interface BaseControlDefinition {
	id: string;
	type: ControlType;
	label: string;
	valuePath: string;
	disabledWhenHidden?: boolean;
}

export interface ToggleControlDefinition extends BaseControlDefinition {
	type: "toggle";
}

export interface SliderControlDefinition extends BaseControlDefinition {
	type: "slider";
	min: number;
	max: number;
	step?: number;
}

export interface SelectOption<T = string> {
	value: T;
	label: string;
}

export interface SelectControlDefinition<T = string> extends BaseControlDefinition {
	type: "select";
	options: Array<SelectOption<T>>;
}

export interface MultiSelectControlDefinition<T = string> extends BaseControlDefinition {
	type: "multiselect";
	options: Array<SelectOption<T>>;
}

export interface ButtonControlDefinition extends BaseControlDefinition {
	type: "button";
}

export type ControlDefinition =
	| ToggleControlDefinition
	| SliderControlDefinition
	| SelectControlDefinition
	| MultiSelectControlDefinition
	| ButtonControlDefinition;

export interface ControlApplierResult {
	nextState: LayerState;
	styleDiff?: StyleDiff;
}

export type ControlApplier = (state: LayerState, value: any) => ControlApplierResult;
export type ControlAppliers = Record<string, ControlApplier>;
export type ControlView = (ControlDefinition & { value: any });

export interface FillMapLayer {
	id: string;
	type: "fill";
	source: string;
	sourceLayer: string;
	filter?: any[];
	style: {
		color: any;
		opacity: number;
		outlineColor?: string;
	};
}
