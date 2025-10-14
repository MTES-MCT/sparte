// Point d'entrée des types : on re-exporte uniquement ce qui est réellement utilisé
export type { LayerType, BaseLayerOptions } from "./layer";
export type { SourceType, BaseSourceOptions } from "./source";
export type { LayerId, LayerCategory } from "./registry";
export type {
	Control,
	ControlType,
	ControlGroup,
	LayerVisibility,
	ControlsConfig,
	ControlsManager
} from "./controls";

// La définition des configs carte est dans builder
export type {
	MapConfig,
	SourceConfig,
	LayerConfig,
} from "./builder";