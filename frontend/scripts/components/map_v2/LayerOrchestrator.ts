import { BaseLayer } from "./layers/baseLayer";
import { BaseSource } from "./sources/baseSource";
import { MapLibreMapper } from "./maplibre/mappers";

export class LayerOrchestrator {
    private layers = new Map<string, BaseLayer>();
    private sources = new Map<string, BaseSource>();
    private mapper: MapLibreMapper | null = null;

    setMapper(mapper: MapLibreMapper): void {
        this.mapper = mapper;
    }

    async addSource(source: BaseSource): Promise<void> {
        if (this.sources.has(source.options.id)) return;

        await source.load();
        this.sources.set(source.options.id, source);
        if (this.mapper && source.loaded) {
            this.mapper.addSource(source);
        }
    }

    async addLayer(layer: BaseLayer): Promise<void> {
        if (this.layers.has(layer.options.id)) return;

        await layer.load();
        this.layers.set(layer.options.id, layer);
        if (this.mapper && layer.loaded) {
            this.mapper.addLayer(layer);
        }

    }

    removeLayer(layerId: string): void {
        this.layers.delete(layerId);
        this.mapper?.removeLayer(layerId);
    }

    removeSource(sourceId: string): void {
        this.sources.delete(sourceId);
        this.mapper?.removeSource(sourceId);
    }

}
