export type LayerType =
	| "fill"
	| "line"
	| "symbol"
	| "circle"
	| "heatmap"
	| "fill-extrusion"
	| "raster"
	| "hillshade"
	| "background";

export interface BaseLayerOptions {
	id: string;
	type: LayerType;
	source: string;
	visible?: boolean;
	opacity?: number;
	filters?: any[];
	options?: Record<string, any>;
	onClick?: (event: any) => void;
	legend?: {
		title: string;
		items: Array<{ color: string; label: string }>;
	};
}

export abstract class BaseLayer {
	readonly options: BaseLayerOptions;
	loaded = false;

	constructor(options: BaseLayerOptions) {
		this.options = { ...options };
	}

	async load(): Promise<void> {
		this.loaded = true;
	}

	abstract getOptions(): Record<string, any>;

	setVisible(visible: boolean): void {
		this.options.visible = visible;
	}

	setFilters(filters: any[]): void {
		this.options.filters = filters;
	}

	setOptions(options: Partial<BaseLayerOptions>): void {
		Object.assign(this.options, options);
	}
}
