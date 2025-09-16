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

	// Méthodes utilitaires pour la gestion des layers
	setVisible(visible: boolean): void {
		this.options.visible = visible;
	}

	setOpacity(opacity: number): void {
		this.options.opacity = opacity;
	}

	getId(): string {
		return this.options.id;
	}

	getSource(): string {
		return this.options.source;
	}

	isVisible(): boolean {
		return this.options.visible ?? true;
	}

	getOpacity(): number {
		return this.options.opacity ?? 1;
	}
}
