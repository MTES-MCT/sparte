import React from "react";
import { Map, SourceSpecification, LayerSpecification, StyleSpecification, NavigationControl, FullscreenControl } from "maplibre-gl";
import { LayerControlsConfig } from "../../types";

export interface MapControls {
	scrollZoom?: boolean;
	navigationControl?: boolean;
	fullscreenControl?: boolean;
	cooperativeGestures?: boolean;
}

export type ControlRefs = {
	navigationControl?: NavigationControl;
	fullscreenControl?: FullscreenControl;
};


export interface BaseMapProps {
	id: string;
	className?: string;
	style?: StyleSpecification;
	bounds: [number, number, number, number];
	maxBounds?: [number, number, number, number];
	sources?: Array<{
		id: string;
		source: SourceSpecification;
	}>;
	layers?: Array<{
		id: string;
		layer: LayerSpecification;
	}>;
	controls?: MapControls;
	onMapLoad?: (map: Map) => void;
	showZoomIndicator?: boolean;
	layerControls?: LayerControlsConfig;
}

export interface MapSource {
	id: string;
	source: SourceSpecification;
}

export interface MapLayer {
	id: string;
	layer: LayerSpecification;
}

export interface MapConfig {
	style: StyleSpecification;
	bounds: [number, number, number, number];
	maxBounds?: [number, number, number, number];
	controls?: MapControls;
	sources?: MapSource[];
	layers?: MapLayer[];
} 