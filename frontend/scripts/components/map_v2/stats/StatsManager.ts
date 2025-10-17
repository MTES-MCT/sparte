import maplibregl from "maplibre-gl";
import type { StatCategory } from "../types/layer";
import type { LayerId } from "../types/registry";
import { StatsStateManager, type StatsState } from "./StatsStateManager";

interface LayerStatsConfig {
    layerId: LayerId;
    extractStats: (features: maplibregl.MapGeoJSONFeature[]) => StatCategory[];
}

export class StatsManager {
    private map: maplibregl.Map;
    private statsConfigs: Map<LayerId, LayerStatsConfig> = new Map();
    private stateManager: StatsStateManager;
    private enabledLayers: Set<LayerId> = new Set();
    private updateTimeouts: Map<LayerId, NodeJS.Timeout> = new Map();
    private boundUpdateStats: Map<LayerId, () => void> = new Map();

    constructor(map: maplibregl.Map) {
        this.map = map;
        this.stateManager = new StatsStateManager();
    }

    registerStats(layerId: LayerId, extractStats: (features: maplibregl.MapGeoJSONFeature[]) => StatCategory[]): void {
        this.statsConfigs.set(layerId, {
            layerId,
            extractStats
        });
    }

    enableStats(layerId: LayerId): void {
        const config = this.statsConfigs.get(layerId);
        if (!config) {
            console.warn(`No stats config found for layer: ${layerId}`);
            return;
        }

        this.enabledLayers.add(layerId);

        const boundUpdate = () => this.updateStats(layerId);
        this.boundUpdateStats.set(layerId, boundUpdate);

        this.map.on('moveend', boundUpdate);
        this.map.on('sourcedata', boundUpdate);
        this.map.on('style.load', boundUpdate);
        this.map.on('data', boundUpdate);

        // Mise à jour immédiate
        if (this.map.isStyleLoaded() && this.map.areTilesLoaded()) {
            this.updateStats(layerId);
        }
    }

    disableStats(layerId: LayerId): void {
        this.enabledLayers.delete(layerId);

        const timeout = this.updateTimeouts.get(layerId);
        if (timeout) {
            clearTimeout(timeout);
            this.updateTimeouts.delete(layerId);
        }

        const boundUpdate = this.boundUpdateStats.get(layerId);
        if (boundUpdate) {
            this.map.off('moveend', boundUpdate);
            this.map.off('sourcedata', boundUpdate);
            this.map.off('style.load', boundUpdate);
            this.map.off('data', boundUpdate);
            this.boundUpdateStats.delete(layerId);
        }
    }

    private updateStats(layerId: LayerId): void {
        if (!this.enabledLayers.has(layerId)) return;

        const existingTimeout = this.updateTimeouts.get(layerId);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }

        const timeout = setTimeout(() => {
            this.performUpdateStats(layerId);
        }, 100);

        this.updateTimeouts.set(layerId, timeout);
    }

    private performUpdateStats(layerId: LayerId): void {
        const config = this.statsConfigs.get(layerId);
        if (!config) return;

        const layer = this.map.getLayer(layerId);
        if (!layer) return;

        const features = this.map.queryRenderedFeatures(undefined, {
            layers: [layerId]
        });

        if (features.length === 0) {
            return;
        }

        const categories = config.extractStats(features);

        this.stateManager.updateState({
            layerId,
            categories,
            isVisible: true
        });
    }

    getStatsState(): StatsState {
        return this.stateManager.getState();
    }

    subscribe(callback: (state: StatsState) => void): () => void {
        return this.stateManager.subscribe(callback);
    }

    destroy(): void {
        this.enabledLayers.forEach(layerId => {
            this.disableStats(layerId);
        });
        this.statsConfigs.clear();
        this.stateManager.destroy();
    }
}

