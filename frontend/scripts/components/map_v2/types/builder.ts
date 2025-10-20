import type { LayerId, LayerCategory } from './registry';
import type { ControlGroup } from './controls';
import type { LayerPopupConfig } from './popup';

type MillesimeRaw = { index: number;[k: string]: unknown };

export interface OrthophotoSourceConfig {
    type: 'orthophoto';
}

export interface EmpriseSourceConfig {
    type: 'emprise';
}

export interface OcsgeSourceConfig {
    type: 'ocsge';
}

export interface OcsgeDiffSourceConfig {
    type: 'ocsge-diff';
}

export interface OcsgeDiffCentroidSourceConfig {
    type: 'ocsge-diff-centroid';
}

export type SourceConfig =
    | OrthophotoSourceConfig
    | EmpriseSourceConfig
    | OcsgeSourceConfig
    | OcsgeDiffSourceConfig
    | OcsgeDiffCentroidSourceConfig;

interface BaseLayerConfig {
    type: LayerCategory;
    stats?: boolean;
}

export interface OrthophotoLayerConfig extends BaseLayerConfig {
    type: 'orthophoto';
}

export interface EmpriseLayerConfig extends BaseLayerConfig {
    type: 'emprise';
}

type NomenclatureType = 'couverture' | 'usage';

export interface ImpermeabilisationLayerConfig extends BaseLayerConfig {
    type: 'impermeabilisation';
    nomenclature?: NomenclatureType;
}

export interface ArtificialisationLayerConfig extends BaseLayerConfig {
    type: 'artificialisation';
    nomenclature?: NomenclatureType;
}

export interface ImpermeabilisationDiffLayerConfig extends BaseLayerConfig {
    type: 'impermeabilisation-diff';
}

export interface OcsgeDiffCentroidClusterLayerConfig extends BaseLayerConfig {
    type: 'ocsge-diff-centroid-cluster';
}

export interface OcsgeDiffCentroidClusterCountLayerConfig extends BaseLayerConfig {
    type: 'ocsge-diff-centroid-cluster-count';
}

export type LayerConfig =
    | OrthophotoLayerConfig
    | EmpriseLayerConfig
    | ImpermeabilisationLayerConfig
    | ArtificialisationLayerConfig
    | ImpermeabilisationDiffLayerConfig
    | OcsgeDiffCentroidClusterLayerConfig
    | OcsgeDiffCentroidClusterCountLayerConfig;

export interface MapConfig {
    sources?: SourceConfig[];
    layers?: LayerConfig[];
    controlGroups?: ControlGroup[];
    popups?: LayerPopupConfig[];
}

export function defineMapConfig<const T extends MapConfig>(cfg: T): T {
    return cfg;
}


