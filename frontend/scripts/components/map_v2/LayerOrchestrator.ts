import { BaseLayer } from "./layers/baseLayer";
import { BaseSource } from "./sources/baseSource";
import { MapLibreMapper } from "./maplibre/mappers";

export class LayerOrchestrator {
    private layers: Map<string, BaseLayer> = new Map();
    private sources: Map<string, BaseSource> = new Map();
    private mapper: MapLibreMapper | null = null;

    setMapper(mapper: MapLibreMapper): void {
        this.mapper = mapper;
    }

    addLayer(layer: BaseLayer): void {
        this.layers.set(layer.options.id, layer);
        if (this.mapper) {
            this.mapper.addLayer(layer);
        }
    }

    removeLayer(layerId: string): void {
        const layer = this.layers.get(layerId);
        if (layer) {
            this.layers.delete(layerId);
            if (this.mapper) {
                this.mapper.removeLayer(layerId);
            }
        }
    }

    toggleLayer(layerId: string, visible: boolean): void {
        const layer = this.layers.get(layerId);
        if (layer) {
            layer.setVisible(visible);
            if (this.mapper) {
                this.mapper.toggleVisibility(layerId, visible);
            }
        }
    }

    updateFilter(layerId: string, filters: any[]): void {
        const layer = this.layers.get(layerId);
        if (layer) {
            layer.setFilters(filters);
            if (this.mapper) {
                this.mapper.updateLayerFilters(layerId, filters);
            }
        }
    }

    updateLayerOptions(layerId: string, options: Record<string, any>): void {
        const layer = this.layers.get(layerId);
        if (layer) {
            layer.setOptions(options);
            if (this.mapper) {
                this.mapper.updateLayerStyle(layerId, options);
            }
        }
    }

    updateLayerStyle(layerId: string, style: Record<string, any>): void {
        if (this.mapper) {
            this.mapper.updateLayerStyle(layerId, style);
        }
    }

    addSource(source: BaseSource): void {
        this.sources.set(source.options.id, source);
        if (this.mapper) {
            this.mapper.addSource(source);
        }
    }

    removeSource(sourceId: string): void {
        this.sources.delete(sourceId);
        if (this.mapper) {
            this.mapper.removeSource(sourceId);
        }
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
