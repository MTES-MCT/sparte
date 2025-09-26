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
	private lastEnabledOpacity?: number;

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

	getOpacityStyleProperty(): string | null {
		const mapping: Partial<Record<LayerType, string>> = {
			raster: "raster-opacity",
			line: "line-opacity",
			fill: "fill-opacity",
		};
		return mapping[this.options.type] ?? null;
	}

	setLastEnabledOpacity(opacity: number | undefined): void {
		this.lastEnabledOpacity = opacity;
	}

	getLastEnabledOpacity(): number | undefined {
		return this.lastEnabledOpacity;
	}
}
