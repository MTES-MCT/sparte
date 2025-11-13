import type { BaseLayerOptions } from "../types/layer";
import type { LayerInterface } from "../types/layerInterface";
import type maplibregl from "maplibre-gl";
import type { LayerSpecification } from "maplibre-gl";

export abstract class BaseLayer implements Pick<LayerInterface, 'getId' | 'getSource' | 'getOpacity' | 'setOpacity' | 'getVisibility' | 'setVisibility'> {
	readonly options: BaseLayerOptions;
	loaded = false;
	protected map?: maplibregl.Map;
	private hoveredFeatureId: string | null = null;

	constructor(options: BaseLayerOptions) {
		this.options = {
			visible: true, // surchargé par les contrôles
			opacity: 1, // surchargé par les contrôles
			...options
		};
	}

	// Injection des dépendances: map
	attach(map: maplibregl.Map): void {
		this.map = map;

		// Configurer le hover highlight si activé
		if (this.options.hoverHighlight?.enabled) {
			this.setupHoverHighlight();
		}
	}

	protected setupHoverHighlight(): void {
		if (!this.map || !this.options.hoverHighlight) return;

		const layerId = this.getId();
		const { propertyField } = this.options.hoverHighlight;

		this.map.on('mousemove', layerId, (e) => {
			if (e.features && e.features.length > 0) {
				const feature = e.features[0];
				const featureId = feature.properties?.[propertyField];

				if (featureId && featureId !== this.hoveredFeatureId) {
					this.hoveredFeatureId = featureId;
					this.applyHoverEffect(propertyField, featureId);
				}
			}
		});

		this.map.on('mouseleave', layerId, () => {
			if (this.hoveredFeatureId !== null) {
				this.hoveredFeatureId = null;
				this.removeHoverEffect();
			}
		});
	}

	protected applyHoverEffect(propertyField: string, featureId: string): void {
		if (!this.map || !this.options.hoverHighlight) return;

		const layerId = this.getId();
		const layer = this.map.getLayer(layerId);
		if (!layer) return;

		const opacityProperty = this.getOpacityPropertyForLayerType(layer.type);
		if (!opacityProperty) return;

		const hoverOpacity = this.options.hoverHighlight.hoverOpacity ?? 0;

		const opacityExpression = [
			"case",
			["==", ["get", propertyField], featureId],
			hoverOpacity,
			this.options.opacity ?? 1
		];

		this.map.setPaintProperty(layerId, opacityProperty, opacityExpression);
	}

	protected removeHoverEffect(): void {
		if (!this.map) return;

		const layerId = this.getId();
		const layer = this.map.getLayer(layerId);
		if (!layer) return;

		const opacityProperty = this.getOpacityPropertyForLayerType(layer.type);
		if (!opacityProperty) return;

		// Réinitialiser l'opacité à sa valeur par défaut
		this.map.setPaintProperty(layerId, opacityProperty, this.options.opacity ?? 1);
	}

	async load(): Promise<void> {
		this.loaded = true;
	}

	abstract getOptions(): LayerSpecification[];

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

	getVisibility(): boolean {
		return this.options.visible ?? true;
	}

	getOpacity(): number {
		return this.options.opacity ?? 1;
	}
}
