import maplibregl from "maplibre-gl";
import { createSource } from "./sourceRegistry";
import { createLayer } from "./layerRegistry";
import type { MapConfig } from "../types/builder";
import type { BaseSource } from "../sources/baseSource";
import type { BaseLayer } from "../layers/baseLayer";

export interface InitMapResult {
    sources: Map<string, BaseSource>;
    layers: Map<string, BaseLayer>;
}

export async function initMapFromConfig(config: MapConfig, map: maplibregl.Map): Promise<InitMapResult> {
    const sources = new Map<string, BaseSource>();
    const layers = new Map<string, BaseLayer>();

    for (const src of config.sources) {
        const source = createSource(src);
        await source.load();

        // Injection des dépendances: map, sourceId
        source.attach(map, src.id);

        map.addSource(src.id, source.getOptions() as any);
        sources.set(src.id, source);
    }

    for (const lyr of config.layers) {
        const layer = createLayer(lyr);
        await layer.load();

        // Injection des dépendances: map
        layer.attach(map);

        map.addLayer(layer.getOptions() as any);
        layers.set(lyr.id, layer);
    }

    return { sources, layers };
}
