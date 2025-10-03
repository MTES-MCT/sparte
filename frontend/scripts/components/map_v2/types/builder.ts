import type { LayerId, LayerCategory } from './registry';

export interface SourceConfig {
    id: string;
    type: 'orthophoto' | 'emprise' | 'ocsge';
    [k: string]: unknown;
}

export interface LayerConfig<L extends LayerId = LayerId, K extends LayerCategory = LayerCategory> {
    id: L;
    type: K;
    source: string;
    [k: string]: unknown;
}

export interface MapConfig {
    sources: SourceConfig[];
    layers: LayerConfig[];
}

export function defineMapConfig<const T extends MapConfig>(cfg: T): T {
    return cfg;
}


