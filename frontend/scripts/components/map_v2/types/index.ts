// Point d'entrée des types : on re-exporte uniquement ce qui est réellement utilisé
export type { LayerType, BaseLayerOptions } from "./layer";
export type { SourceType, BaseSourceOptions } from "./source";
export type { LayerId, LayerCategory } from "./registry";
export type {
	Control,
	ControlType,
	ControlGroup,
	ControlsConfig,
	ControlsManager
} from "./controls";
export type { LayerInterface } from "./layerInterface";
export type { SourceInterface } from "./sourceInterface";

export type {
	MapConfig,
	SourceConfig,
	LayerConfig,
} from "./builder";