import maplibregl from "maplibre-gl";
import { BaseLayer } from "../../layers/baseLayer";
import { BaseSource } from "../../sources/baseSource";
import { createVisibilityMapper } from "./visibility";
import { createFiltersMapper } from "./filters";
import { createEventsMapper } from "./events";
import { createStyleMapper } from "./style";
import { createSourcesMapper } from "./sources";

export class MapLibreMapper {
    private map: maplibregl.Map | null = null;
    private visibilityMapper = createVisibilityMapper();
    private filtersMapper = createFiltersMapper();
    private eventsMapper = createEventsMapper();
    private styleMapper = createStyleMapper();
    private sourcesMapper = createSourcesMapper();

    setMap(map: maplibregl.Map): void {
        this.map = map;
    }

    addLayer(layer: BaseLayer): void {
        if (!this.map || this.map.getLayer(layer.options.id)) return;

        const layerConfig = layer.getOptions();

        if (this.map.isStyleLoaded() && this.map.getSource(layer.options.source)) {
            this.map.addLayer(layerConfig as any);
            if (layer.options.onClick) {
                this.eventsMapper.addClickHandler(this.map, layer.options.id, layer.options.onClick);
            }
        } else {
            const addLayerWhenReady = () => {
                if (this.map && this.map.isStyleLoaded() && this.map.getSource(layer.options.source) && !this.map.getLayer(layer.options.id)) {
                    this.map.addLayer(layerConfig as any);
                    if (layer.options.onClick) {
                        this.eventsMapper.addClickHandler(this.map, layer.options.id, layer.options.onClick);
                    }
                }
            };

            this.map.on('styledata', addLayerWhenReady);
            this.map.on('sourcedata', addLayerWhenReady);
        }
    }

    removeLayer(layerId: string): void {
        if (!this.map) return;

        if (this.map.getLayer(layerId)) {
            this.map.removeLayer(layerId);
        }
    }

    toggleVisibility(layerId: string, visible: boolean): void {
        if (!this.map) return;

        this.visibilityMapper.toggleVisibility(this.map, layerId, visible);
    }

    addSource(source: BaseSource): void {
        if (!this.map || this.map.getSource(source.options.id)) return;

        const sourceConfig = source.getOptions();

        if (this.map.isStyleLoaded()) {
            this.sourcesMapper.addSource(this.map, sourceConfig);
        } else {
            this.map.on('styledata', () => {
                if (this.map && !this.map.getSource(source.options.id)) {
                    this.sourcesMapper.addSource(this.map, sourceConfig);
                }
            });
        }
    }

    removeSource(sourceId: string): void {
        if (!this.map) return;

        this.sourcesMapper.removeSource(this.map, sourceId);
    }


    updateLayerFilters(layerId: string, filters: any[]): void {
        if (!this.map) return;

        this.filtersMapper.updateFilters(this.map, layerId, filters);
    }

    updateLayerStyle(layerId: string, style: Record<string, any>): void {
        if (!this.map) return;

        this.styleMapper.updateStyle(this.map, layerId, style);
    }

    getMap(): maplibregl.Map | null {
        return this.map;
    }
}
