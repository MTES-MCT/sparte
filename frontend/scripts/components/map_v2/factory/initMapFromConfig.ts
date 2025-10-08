import { createSource } from "./sourceRegistry";
import { createLayer } from "./layerRegistry";
import { LayerOrchestrator } from "../LayerOrchestrator";

export async function initMapFromConfig(config: any, orchestrator: LayerOrchestrator) {
    for (const src of config.sources) {
        const source = createSource(src);
        await orchestrator.addSource(source);
    }

    for (const lyr of config.layers) {
        const layer = createLayer(lyr);
        await orchestrator.addLayer(layer);
    }
}
