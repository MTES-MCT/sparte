import type { LayerType, BaseLayerOptions } from "../types/layer";

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
}
