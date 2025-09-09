import React from "react";
import { Map, SourceSpecification, LayerSpecification, StyleSpecification, NavigationControl, FullscreenControl, MapLayerMouseEvent } from "maplibre-gl";

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

// Types pour les popups
export interface PopupConfig {
	layerId: string;
	renderContent: (feature: any, event: MapLayerMouseEvent) => React.ReactNode | string;
}

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
	popups?: PopupConfig[];
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
	popups?: PopupConfig[];
} 