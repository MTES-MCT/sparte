// Composants principaux
export { BaseMap } from './ui/BaseMap';
export { ImpermeabilisationMap } from './ui/ImpermeabilisationMap';

// Contrôles
export { ControlsPanel } from './ui/controls/ControlsPanel';
export { ControlsGroup } from './ui/controls/ControlsGroup';
export { VisibilityControl, OpacityControl } from './controls';
export { ControlsManager } from './controls/ControlsManager';

// Hooks
export { useMaplibre } from './hooks/useMaplibre';

// Types
export type { MapConfig, SourceConfig, LayerConfig } from './types/builder';
export type {
    Control,
    ControlType,
    ControlGroup,
    LayerVisibility,
    ControlsConfig,
    ControlsManager as IControlsManager
} from './types/controls';
