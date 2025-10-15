import type { BaseLayerOptions } from "../types/layer";
import type maplibregl from "maplibre-gl";

export abstract class BaseLayer {
	readonly options: BaseLayerOptions;
	loaded = false;
	protected map?: maplibregl.Map;

	constructor(options: BaseLayerOptions) {
		this.options = { ...options };
	}

	// Injection des dépendances: map
	attach(map: maplibregl.Map): void {
		this.map = map;
	}

	async load(): Promise<void> {
		this.loaded = true;
	}

	abstract getOptions(): Record<string, any>;

	setVisibility(visible: boolean): void {
		if (!this.map) return;

		const layerId = this.getId();
		if (!this.map.getLayer(layerId)) return;

		const visibility = visible ? 'visible' : 'none';
		this.map.setLayoutProperty(layerId, 'visibility', visibility);
		this.options.visible = visible;
	}

	setOpacity(opacity: number): void {
		if (!this.map) return;

		const layerId = this.getId();
		const layer = this.map.getLayer(layerId);
		if (!layer) return;

		const opacityProperty = this.getOpacityPropertyForLayerType(layer.type);
		if (opacityProperty) {
			this.map.setPaintProperty(layerId, opacityProperty, opacity);
			this.options.opacity = opacity;
		}
	}

	getVisibility(): boolean {
		return this.options.visible ?? true;
	}

	getOpacity(): number {
		return this.options.opacity ?? 1;
	}

	protected getOpacityPropertyForLayerType(layerType: string): string | null {
		switch (layerType) {
			case 'fill':
				return 'fill-opacity';
			case 'line':
				return 'line-opacity';
			case 'raster':
				return 'raster-opacity';
			case 'symbol':
				return 'text-opacity';
			case 'circle':
				return 'circle-opacity';
			default:
				return null;
		}
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

	getOpacityValue(): number {
		return this.options.opacity ?? 1;
	}
}
