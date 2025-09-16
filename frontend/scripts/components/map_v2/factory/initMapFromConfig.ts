import maplibregl from "maplibre-gl";
import { createSource } from "./sourceRegistry";
import { createLayer } from "./layerRegistry";

export async function initMapFromConfig(config: any, map: maplibregl.Map) {
    // Ajouter les sources
    for (const src of config.sources) {
        const source = createSource(src);
        await source.load();
        if (source.loaded) {
            map.addSource(source.options.id, source.getOptions() as any);
        }
    }

    // Ajouter les layers
    for (const lyr of config.layers) {
        const layer = createLayer(lyr);
        await layer.load();
        if (layer.loaded) {
            const layerConfig = layer.getOptions();
            map.addLayer(layerConfig as any);
        }
    }
}
