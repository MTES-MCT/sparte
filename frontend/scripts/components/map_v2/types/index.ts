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
