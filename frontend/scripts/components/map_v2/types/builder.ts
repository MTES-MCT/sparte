import type { LayerId, LayerCategory } from './registry';
import type { ControlGroup } from './controls';
import type { LayerPopupConfig } from './popup';

type MillesimeRaw = { index: number;[k: string]: unknown };

export interface OrthophotoSourceConfig {
    id: string;
    type: 'orthophoto';
}

export interface EmpriseSourceConfig {
    id: string;
    type: 'emprise';
    land_type: string;
    land_id: string;
}

export interface OcsgeSourceConfig {
    id: string;
    type: 'ocsge';
    millesimes: MillesimeRaw[];
    departements: string[];
    millesimeIndex?: number;
}

export interface OcsgeDiffSourceConfig {
    id: string;
    type: 'ocsge-diff';
    millesimes: MillesimeRaw[];
    departements: string[];
    startMillesimeIndex?: number;
    endMillesimeIndex?: number;
}

export interface OcsgeDiffCentroidSourceConfig {
    id: string;
    type: 'ocsge-diff-centroid';
    startMillesimeIndex: number;
    endMillesimeIndex: number;
    departement: string;
}

export type SourceConfig =
    | OrthophotoSourceConfig
    | EmpriseSourceConfig
    | OcsgeSourceConfig
    | OcsgeDiffSourceConfig
    | OcsgeDiffCentroidSourceConfig;

interface BaseLayerConfig {
    id: LayerId;
    type: LayerCategory;
    source: string;
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
    millesimeIndex: number;
    departement: string;
    millesimes?: Array<{ index: number; year?: number }>;
    nomenclature?: NomenclatureType;
}

export interface ArtificialisationLayerConfig extends BaseLayerConfig {
    type: 'artificialisation';
    millesimeIndex: number;
    departement: string;
    millesimes?: Array<{ index: number; year?: number }>;
    nomenclature?: NomenclatureType;
}

export interface ImpermeabilisationDiffLayerConfig extends BaseLayerConfig {
    type: 'impermeabilisation-diff';
    startMillesimeIndex: number;
    endMillesimeIndex: number;
    departement: string;
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
    sources: SourceConfig[];
    layers: LayerConfig[];
    controlGroups?: ControlGroup[];
    popups?: LayerPopupConfig[];
}

export function defineMapConfig<const T extends MapConfig>(cfg: T): T {
    return cfg;
}


