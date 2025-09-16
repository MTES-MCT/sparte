export interface LayerVisibility {
	id: string;
	label: string;
	visible: boolean;
	opacity?: number;
	description?: string;
}


import type { LayerType, BaseLayerOptions } from "./layer";
import type { SourceType, BaseSourceOptions } from "./source";
import type { LayerId, LayerCategory } from "./registry";





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

// Re-exports des types de base
export type { LayerType, BaseLayerOptions } from "./layer";
export type { SourceType, BaseSourceOptions } from "./source";

export type MapLayer = LineMapLayer | RasterMapLayer;

export interface LayerVisibility {
  id: string;
  name: string;
  visible: boolean;
  opacity?: number;
}

export interface LayerControlsConfig {
  layers: LayerVisibility[];
  showControls?: boolean;
}