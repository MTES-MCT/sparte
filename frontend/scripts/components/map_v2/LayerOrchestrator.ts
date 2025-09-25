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
        await source.load();
        this.sources.set(source.options.id, source);
        if (this.mapper && source.loaded) {
            this.mapper.addSource(source);
        }
    }

    async addLayer(layer: BaseLayer): Promise<void> {
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

    toggleLayer(layerId: string, visible: boolean): void {
        const layer = this.layers.get(layerId);
        if (layer) {
            layer.setVisible(visible);
            this.mapper?.toggleVisibility(layerId, visible);
        }
    }

    updateLayerOptions(layerId: string, options: Record<string, any>): void {
        const layer = this.layers.get(layerId);
        if (layer) {
            layer.setOptions(options);
            this.mapper?.updateLayerStyle(layerId, options);
        }
    }

    updateLayerStyle(layerId: string, style: Record<string, any>): void {
        this.mapper?.updateLayerStyle(layerId, style);
    }

    getLayer(layerId: string): BaseLayer | undefined {
        return this.layers.get(layerId);
    }

    getSource(sourceId: string): BaseSource | undefined {
        return this.sources.get(sourceId);
    }

    getAllLayers(): BaseLayer[] {
        return Array.from(this.layers.values());
    }

    getAllSources(): BaseSource[] {
        return Array.from(this.sources.values());
    }
}
