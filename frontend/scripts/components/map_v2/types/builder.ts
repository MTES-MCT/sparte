import type { LayerCategory } from './registry';
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

export interface OcsgeArtifDiffSourceConfig {
    type: 'ocsge-artif-diff';
}

export interface OcsgeArtifDiffCentroidSourceConfig {
    type: 'ocsge-artif-diff-centroid';
}

export interface FrichesSourceConfig {
    type: 'friches';
}

export interface FrichesCentroidSourceConfig {
    type: 'friches-centroid';
}

export type SourceConfig =
    | OrthophotoSourceConfig
    | EmpriseSourceConfig
    | OcsgeSourceConfig
    | OcsgeDiffSourceConfig
    | OcsgeDiffCentroidSourceConfig
    | OcsgeArtifDiffSourceConfig
    | OcsgeArtifDiffCentroidSourceConfig
    | FrichesSourceConfig
    | FrichesCentroidSourceConfig;

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

export interface ArtificialisationDiffLayerConfig extends BaseLayerConfig {
    type: 'artificialisation-diff';
}

export interface ImpermeabilisationDiffCentroidClusterLayerConfig extends BaseLayerConfig {
    type: 'impermeabilisation-diff-centroid-cluster';
}

export interface ArtificialisationDiffCentroidClusterLayerConfig extends BaseLayerConfig {
    type: 'artificialisation-diff-centroid-cluster';
}

export interface FrichesLayerConfig extends BaseLayerConfig {
    type: 'friches';
}

export interface FrichesCentroidClusterLayerConfig extends BaseLayerConfig {
    type: 'friches-centroid-cluster';
}

export type LayerConfig =
    | OrthophotoLayerConfig
    | EmpriseLayerConfig
    | ImpermeabilisationLayerConfig
    | ArtificialisationLayerConfig
    | ImpermeabilisationDiffLayerConfig
    | ArtificialisationDiffLayerConfig
    | ImpermeabilisationDiffCentroidClusterLayerConfig
    | ArtificialisationDiffCentroidClusterLayerConfig
    | FrichesLayerConfig
    | FrichesCentroidClusterLayerConfig;

export interface MapConfig {
    sources?: SourceConfig[];
    layers?: LayerConfig[];
    controlGroups?: ControlGroup[];
    popups?: LayerPopupConfig[];
}

export function defineMapConfig<const T extends MapConfig>(cfg: T): T {
    return cfg;
}


