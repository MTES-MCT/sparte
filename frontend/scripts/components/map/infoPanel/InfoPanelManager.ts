import maplibregl from "maplibre-gl";
import { LayerInfoConfig, InfoPanelState } from "../types/infoPanel";
import { InfoPanelStateManager } from "./InfoPanelStateManager";

export class InfoPanelManager {
    private readonly map: maplibregl.Map;
    private readonly infoConfigs: Map<string, LayerInfoConfig> = new Map();
    private readonly stateManager: InfoPanelStateManager;

    constructor(map: maplibregl.Map) {
        this.map = map;
        this.stateManager = new InfoPanelStateManager();
    }

    registerInfo(config: LayerInfoConfig): void {
        this.infoConfigs.set(config.layerId, config);
        this.setupLayerEvents(config);
    }

    private setupLayerEvents(config: LayerInfoConfig): void {
        const { layerId } = config;

        this.map.on('mouseenter', layerId, () => {
            this.map.getCanvas().style.cursor = 'pointer';
        });

        this.map.on('mouseleave', layerId, () => {
            this.map.getCanvas().style.cursor = '';
            this.removeLayerInfo(layerId);
        });

        this.map.on('mousemove', layerId, (e) => {
            this.handleHover(e, config);
        });
    }

    private handleHover(event: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }, config: LayerInfoConfig): void {
        const feature = event.features?.[0];
        if (!feature) return;

        this.stateManager.addLayer({
            layerId: config.layerId,
            title: config.title,
            feature
        });

        config.onOpen?.(feature);
    }

    private removeLayerInfo(layerId: string): void {
        const config = this.infoConfigs.get(layerId);
        config?.onClose?.();
        this.stateManager.removeLayer(layerId);
    }

    getState(): InfoPanelState {
        return this.stateManager.getState();
    }

    subscribe(callback: (state: InfoPanelState) => void): () => void {
        return this.stateManager.subscribe(callback);
    }

    destroy(): void {
        this.infoConfigs.clear();
        this.stateManager.destroy();
    }
}

