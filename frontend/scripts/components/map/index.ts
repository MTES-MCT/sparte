export { BaseMap } from './ui/BaseMap';
export { ImpermeabilisationMap } from './ui/ImpermeabilisationMap';
export { ImpermeabilisationDiffMap } from './ui/ImpermeabilisationDiffMap';
export { ArtificialisationMap } from './ui/ArtificialisationMap';
export { ArtificialisationDiffMap } from './ui/ArtificialisationDiffMap';
export { FrichesOcsgeCouvertureMap } from './ui/FrichesOcsgeCouvertureMap';
export { FrichesImpermeableMap } from './ui/FrichesImpermeableMap';
export { FrichesArtificialMap } from './ui/FrichesArtificialMap';
export { FrichesMap } from './ui/FrichesMap';

export { ControlsPanel } from './ui/controls/ControlsPanel';
export { ControlsGroup } from './ui/controls/ControlsGroup';
export { VisibilityControl, OpacityControl } from './controls';
export { ControlsManager } from './controls/ControlsManager';

export { StatsBar } from './ui/stats';

export { useMap } from './hooks/useMap';
export { useMapSync } from './hooks/useMapSync';
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
    ControlsManagerInterface as IControlsManager
} from './types/controls';
export type { StatCategory } from './types/layer';
