import { BaseLayer } from "./layers/baseLayer";
import type { LayerState, ControlAppliers, StyleDiff } from "./types";
import { BaseSource } from "./sources/baseSource";
import { MapLibreMapper } from "./maplibre/mappers";

export class LayerOrchestrator {
    private layers = new Map<string, BaseLayer>();
    private sources = new Map<string, BaseSource>();
    private mapper: MapLibreMapper | null = null;
    private onChangeCallback?: () => void;
    private layerStates = new Map<string, LayerState>();
    private controlAppliers = new Map<string, ControlAppliers>();

    setMapper(mapper: MapLibreMapper): void {
        this.mapper = mapper;
    }

    setOnChangeCallback(callback: () => void): void {
        this.onChangeCallback = callback;
    }

    async addSource(source: BaseSource): Promise<void> {
        await source.load();
        this.sources.set(source.options.id, source);
        if (this.mapper && source.loaded) {
            this.mapper.addSource(source);
        }
        if (this.onChangeCallback) this.onChangeCallback();
    }

    async addLayer(layer: BaseLayer): Promise<void> {
        await layer.load();
        this.layers.set(layer.options.id, layer);
        if (this.mapper && layer.loaded) {
            this.mapper.addLayer(layer);
        }

        // initialisation des états et des contrôles
        const state = layer.getDefaultState();
        this.layerStates.set(layer.options.id, state);
        this.controlAppliers.set(layer.options.id, layer.getControlAppliers());
        if (this.onChangeCallback) this.onChangeCallback();
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
        if (!layer) return;

        if (layer.options.visible === visible) return;
        layer.setVisible(visible);

        this.mapper?.toggleVisibility(layerId, visible);
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

    getLayerControls(layerId: string): any[] {
        const layer = this.layers.get(layerId);
        const defs = layer ? layer.getControlDefinitions() : [];
        const state = this.layerStates.get(layerId);
        if (!state) return [];
        return defs.map(def => ({ ...def, value: this.resolveValueByPath(state, def.valuePath) }));
    }

    applyLayerControl(layerId: string, controlId: string, value: any): void {
        const appliers = this.controlAppliers.get(layerId);
        const state = this.layerStates.get(layerId);
        const layer = this.layers.get(layerId);
        if (!appliers || !state || !layer) return;

        const applier = appliers[controlId];
        if (!applier) return;

        const { nextState, styleDiff } = applier(state, value);
        this.layerStates.set(layerId, nextState);
        this.applyStyleDiff(layerId, styleDiff);

        const map = this.mapper?.getMap();
        if (map) {
            layer.applyChanges(map);
        }
        if (this.onChangeCallback) this.onChangeCallback();
    }

    getLayerLabel(layerId: string): string | null {
        const layer = this.layers.get(layerId);
        if (!layer) return null;
        return layer.getLabel();
    }

    getLayerDescription(layerId: string): string | null {
        const layer = this.layers.get(layerId);
        if (!layer) return null;
        return layer.getDescription();
    }

    getLayerUIState(layerId: string): { id: string; label: string; visible: boolean; opacity?: number; description?: string } | null {
        const layer = this.layers.get(layerId) as any;
        if (!layer) return null;
        const state = this.layerStates.get(layerId);
        return {
            id: layer.options.id,
            label: layer.getLabel(),
            visible: state ? !!state.visibility : !!layer.options.visible,
            opacity: state ? state.opacity : layer.options.opacity,
            description: layer.getDescription(),
        };
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

    setLayerOpacity(layerId: string, opacity: number): void {
        const layer = this.layers.get(layerId);
        const state = this.layerStates.get(layerId);
        if (!layer || !state) return;
        const next = { ...state, opacity } as LayerState;
        this.layerStates.set(layerId, next);
        const opacityProperty = layer.getOpacityStyleProperty();
        if (opacityProperty) {
            this.mapper?.updateLayerStyle(layerId, { [opacityProperty]: opacity });
        }
    }

    applyLayerChanges(layerId: string): void {
        const layer = this.layers.get(layerId);
        if (layer && (layer as any).applyChanges && this.mapper) {
            const map = this.mapper.getMap();
            if (map) {
                (layer as any).applyChanges(map);
            }
        }
    }

    getLayerControlsConfig(layerId: string): any {
        const layer = this.layers.get(layerId);
        if (layer && (layer as any).getControlsConfig) {
            return (layer as any).getControlsConfig();
        }
        return null;
    }

    private resolveValueByPath(state: LayerState, path: string): any {
        const parts = path.split('.');
        let current: any = state;
        for (const p of parts) {
            if (current == null) return undefined;
            current = current[p];
        }
        return current;
    }

    private applyStyleDiff(layerId: string, diff?: StyleDiff) {
        if (!diff) return;
        if (diff.layout) {
            Object.entries(diff.layout).forEach(([k, v]) => this.mapper?.updateLayerStyle(layerId, { [`layout.${k}`]: v }));
        }
        if (diff.paint) {
            Object.entries(diff.paint).forEach(([k, v]) => this.mapper?.updateLayerStyle(layerId, { [k]: v }));
        }
        if (diff.filter) {
            this.mapper?.updateLayerStyle(layerId, { filter: diff.filter as any });
        }
    }
}
