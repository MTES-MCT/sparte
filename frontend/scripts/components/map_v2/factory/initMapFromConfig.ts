import maplibregl from "maplibre-gl";
import { createSource } from "./sourceRegistry";
import { createLayer } from "./layerRegistry";
import type { MapConfig } from "../types/builder";
import type { BaseSource } from "../sources/baseSource";
import type { BaseLayer } from "../layers/baseLayer";
import type { LandDetailResultType } from "@services/types/land";

export interface InitMapResult {
    sources: Map<string, BaseSource>;
    layers: Map<string, BaseLayer>;
}

export async function initMapFromConfig(
    config: MapConfig,
    map: maplibregl.Map,
    landData: LandDetailResultType
): Promise<InitMapResult> {
    const sources = new Map<string, BaseSource>();
    const layers = new Map<string, BaseLayer>();

    for (const src of config.sources || []) {
        const sourceId = `${src.type}-source`;
        const source = createSource(src, landData);
        await source.load();

        source.attach(map, sourceId);
        map.addSource(sourceId, source.getOptions());
        sources.set(sourceId, source);
    }

    for (const lyr of config.layers || []) {
        const layerId = `${lyr.type}-layer`;
        const layer = createLayer(lyr, landData);
        await layer.load();

        layer.attach(map);
        map.addLayer(layer.getOptions());
        layers.set(layerId, layer);
    }

    return { sources, layers };
}
