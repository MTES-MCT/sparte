import type { Millesime } from "@services/types/land";
import type { NomenclatureType } from "./ocsge";

export const layerCategories = ['orthophoto', 'emprise', 'impermeabilisation', 'artificialisation', 'impermeabilisation-diff', 'impermeabilisation-diff-centroid-cluster', 'impermeabilisation-diff-centroid-cluster-count'] as const;
export type LayerCategory = typeof layerCategories[number];

export const layerIds = ['orthophoto-layer', 'emprise-layer', 'impermeabilisation-layer', 'artificialisation-layer', 'impermeabilisation-diff-layer', 'impermeabilisation-diff-centroid-cluster', 'impermeabilisation-diff-centroid-cluster-count'] as const;
export type LayerId = typeof layerIds[number];

export type LayerIdToCategory = {
    'orthophoto-layer': 'orthophoto';
    'emprise-layer': 'emprise';
    'impermeabilisation-layer': 'impermeabilisation';
    'artificialisation-layer': 'artificialisation';
    'impermeabilisation-diff-layer': 'impermeabilisation-diff';
    'impermeabilisation-diff-centroid-cluster': 'impermeabilisation-diff-centroid-cluster';
    'impermeabilisation-diff-centroid-cluster-count': 'impermeabilisation-diff-centroid-cluster-count';
};

export const layerCategoryToFactory = {
    orthophoto: 'orthophoto',
    emprise: 'emprise',
    impermeabilisation: 'impermeabilisation',
    'impermeabilisation-diff': 'impermeabilisation-diff',
    'impermeabilisation-diff-centroid-cluster': 'impermeabilisation-diff-centroid-cluster',
    'impermeabilisation-diff-centroid-cluster-count': 'impermeabilisation-diff-centroid-cluster-count',
} as const;

// Types de configuration pour les layers
export interface BaseLayerConfig {
    type: LayerCategory;
}

export interface OcsgeLayerConfig extends BaseLayerConfig {
    type: 'impermeabilisation' | 'artificialisation';
    millesimeIndex: number;
    departement: string;
    nomenclature?: NomenclatureType;
    millesimes?: Array<{ index: number; year?: number }>;
}

export interface OcsgeDiffLayerConfig extends BaseLayerConfig {
    type: 'impermeabilisation-diff';
    startMillesimeIndex: number;
    endMillesimeIndex: number;
    departement: string;
}

export interface EmptyLayerConfig extends BaseLayerConfig {
    type: 'orthophoto' | 'emprise' | 'impermeabilisation-diff-centroid-cluster' | 'impermeabilisation-diff-centroid-cluster-count';
}

export type LayerConfig = OcsgeLayerConfig | OcsgeDiffLayerConfig | EmptyLayerConfig;

// Types de configuration pour les sources
export interface BaseSourceConfig {
    type: string;
}

export interface EmpriseSourceConfig extends BaseSourceConfig {
    type: 'emprise';
    land_type: string;
    land_id: number;
}

export interface OcsgeSourceConfig extends BaseSourceConfig {
    type: 'ocsge';
    millesimes: Millesime[];
    departements: string[];
    millesimeIndex?: number;
}

export interface OcsgeDiffSourceConfig extends BaseSourceConfig {
    type: 'ocsge-diff';
    millesimes: Millesime[];
    departements: string[];
    startMillesimeIndex?: number;
    endMillesimeIndex?: number;
}

export interface OcsgeDiffCentroidSourceConfig extends BaseSourceConfig {
    type: 'ocsge-diff-centroid';
    startMillesimeIndex: number;
    endMillesimeIndex: number;
    departement: string;
}

export interface EmptySourceConfig extends BaseSourceConfig {
    type: 'orthophoto';
}

export type SourceConfig = EmpriseSourceConfig | OcsgeSourceConfig | OcsgeDiffSourceConfig | OcsgeDiffCentroidSourceConfig | EmptySourceConfig;


