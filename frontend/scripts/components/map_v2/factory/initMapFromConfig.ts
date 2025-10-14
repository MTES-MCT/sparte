import maplibregl from "maplibre-gl";
import { createSource } from "./sourceRegistry";
import { createLayer } from "./layerRegistry";
import type { MapConfig } from "../types/builder";

export async function initMapFromConfig(config: MapConfig, map: maplibregl.Map): Promise<void> {
    for (const src of config.sources) {
        const source = createSource(src);
        await source.load();
        map.addSource(source.options.id, source.getOptions() as any);
    }

    for (const lyr of config.layers) {
        const layer = createLayer(lyr);
        await layer.load();
        map.addLayer(layer.getOptions() as any);
    }
}
