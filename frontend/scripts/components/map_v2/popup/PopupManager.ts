import maplibregl from "maplibre-gl";
import { LayerPopupConfig, PopupState } from "../types/popup";
import { PopupStateManager } from "./PopupStateManager";

export class PopupManager {
    private map: maplibregl.Map;
    private popupConfigs: Map<string, LayerPopupConfig> = new Map();
    private stateManager: PopupStateManager;

    constructor(map: maplibregl.Map) {
        this.map = map;
        this.stateManager = new PopupStateManager();
    }

    registerPopup(config: LayerPopupConfig): void {
        this.popupConfigs.set(config.layerId, config);
        this.setupLayerEvents(config);
    }

    private setupLayerEvents(config: LayerPopupConfig): void {
        const { layerId, trigger } = config;

        if (trigger === 'click') {
            this.map.on('click', layerId, (e) => {
                this.handleClick(e, config);
            });
        }

        if (trigger === 'hover') {
            this.map.on('mouseenter', layerId, () => {
                this.map.getCanvas().style.cursor = 'pointer';
            });

            this.map.on('mouseleave', layerId, () => {
                this.map.getCanvas().style.cursor = '';
                this.hidePopup();
            });

            this.map.on('mousemove', layerId, (e) => {
                this.handleHover(e, config);
            });
        }
    }

    private handleClick(event: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }, config: LayerPopupConfig): void {
        const feature = event.features?.[0];
        if (!feature) return;

        const currentState = this.stateManager.getState();
        if (currentState.isVisible && currentState.feature === feature) {
            this.hidePopup();
            return;
        }

        this.showPopup(feature, event, config);
    }

    private handleHover(event: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }, config: LayerPopupConfig): void {
        const feature = event.features?.[0];
        if (!feature) return;

        this.showPopup(feature, event, config);
    }

    private showPopup(feature: maplibregl.MapGeoJSONFeature, event: maplibregl.MapMouseEvent, config: LayerPopupConfig): void {
        const { lngLat } = event;
        const point = this.map.project(lngLat);

        this.stateManager.updateState({
            isVisible: true,
            feature,
            event,
            position: { x: point.x, y: point.y },
            layerId: config.layerId
        });

        config.onOpen?.(feature);
    }

    hidePopup(): void {
        const currentState = this.stateManager.getState();
        if (!currentState.isVisible) return;

        const config = this.popupConfigs.get(currentState.layerId!);
        config?.onClose?.();

        this.stateManager.reset();
    }

    getPopupState(): PopupState {
        return this.stateManager.getState();
    }

    subscribe(callback: (state: PopupState) => void): () => void {
        return this.stateManager.subscribe(callback);
    }

    destroy(): void {
        this.popupConfigs.clear();
        this.stateManager.destroy();
    }
}
