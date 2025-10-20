export { BaseMap } from './ui/BaseMap';
export { ImpermeabilisationMap } from './ui/ImpermeabilisationMap';
export { ImpermeabilisationDiffMap } from './ui/ImpermeabilisationDiffMap';

export { ControlsPanel } from './ui/controls/ControlsPanel';
export { ControlsGroup } from './ui/controls/ControlsGroup';
export { VisibilityControl, OpacityControl } from './controls';
export { ControlsManager } from './controls/ControlsManager';

export { StatsBar } from './ui/stats';

export { useMap } from './hooks/useMap';
export {
    getLastMillesimeIndex,
    getStartMillesimeIndex,
    getFirstDepartement,
    getAvailableMillesimes,
    getCouvertureLabel,
    getUsageLabel,
    getOcsgeLabel
} from './utils/ocsge';
export { BASE_SOURCES, BASE_LAYERS, BASE_CONTROLS } from './constants/presets';

export type { MapConfig, SourceConfig, LayerConfig } from './types/builder';
export type {
    Control,
    ControlType,
    ControlGroup,
    ControlsConfig,
    ControlsManager as IControlsManager
} from './types/controls';
export type { StatCategory } from './types/layer';
