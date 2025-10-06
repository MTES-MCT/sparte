import type { LayerState, ControlDefinition, ControlAppliers } from "../types";
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

	getDefaultState(): LayerState {
		return {
			id: this.options.id,
			type: this.options.type,
			visibility: this.options.visible ?? true,
			opacity: this.options.opacity ?? 1,
			params: {},
		};
	}

	getControlDefinitions(): ControlDefinition[] {
		return [
			{
				id: "visible",
				type: "toggle",
				label: "Visibilité",
				valueSelector: (s: LayerState) => s.visibility,
			},
			{
				id: "opacity",
				type: "slider",
				label: "Opacité",
				valueSelector: (s: LayerState) => s.opacity,
				min: 0,
				max: 1,
				step: 0.1,
				disabledWhenHidden: true,
			} as any,
		];
	}

	getControlAppliers(): ControlAppliers {
		return {
			visible: (state, value) => {
				const visible = !!value;
				return {
					nextState: { ...state, visibility: visible },
					styleDiff: { layout: { visibility: visible ? "visible" : "none" } },
				};
			},
			opacity: (state, value) => {
				const numeric = typeof value === 'number' ? value : parseFloat(value);
				const safe = Number.isNaN(numeric) ? state.opacity : numeric;
				const opacityProp = this.getOpacityStyleProperty();
				const paint = opacityProp ? { [opacityProp]: safe } : undefined;
				return {
					nextState: { ...state, opacity: safe },
					styleDiff: paint ? { paint } : {},
				};
			},
		};
	}

	getLabel(): string {
		return this.options.label || this.options.id;
	}

	getDescription(): string {
		return this.options.description || "Couche de données géographiques";
	}

	// Hook d'application de changements (par défaut: no-op)
	applyChanges(_map: any): void { }
}
