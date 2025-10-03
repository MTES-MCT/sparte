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
import type { LayerId, LayerCategory } from "./registry";

export interface LayerState {
	id: LayerId;
	type: LayerType;
	kind?: LayerCategory;
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

export interface BaseControlDefinition<T = any> {
	id: string;
	type: ControlType;
	label: string;
	valueSelector: (state: LayerState) => T;
	disabledWhenHidden?: boolean;
}

export interface ToggleControlDefinition extends BaseControlDefinition<boolean> {
	type: "toggle";
}

export interface SliderControlDefinition extends BaseControlDefinition<number> {
	type: "slider";
	min: number;
	max: number;
	step?: number;
}

export interface SelectOption<T = string> {
	value: T;
	label: string;
}

export interface SelectControlDefinition<T = string> extends BaseControlDefinition<T> {
	type: "select";
	options: Array<SelectOption<T>>;
}

export interface MultiSelectControlDefinition<T = string> extends BaseControlDefinition<T[]> {
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
