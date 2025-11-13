import { InfoPanelState, LayerInfo } from "../types/infoPanel";

export class InfoPanelStateManager {
    private readonly state: InfoPanelState = {
        layers: []
    };
    private readonly updateCallbacks: Set<(state: InfoPanelState) => void> = new Set();

    addLayer(layerInfo: LayerInfo): void {
        const existingIndex = this.state.layers.findIndex(l => l.layerId === layerInfo.layerId);

        if (existingIndex >= 0) {
            this.state.layers[existingIndex] = layerInfo;
        } else {
            this.state.layers.push(layerInfo);
        }

        this.notifyUpdate();
    }

    removeLayer(layerId: string): void {
        this.state.layers = this.state.layers.filter(l => l.layerId !== layerId);
        this.notifyUpdate();
    }

    getState(): InfoPanelState {
        return { ...this.state, layers: [...this.state.layers] };
    }

    subscribe(callback: (state: InfoPanelState) => void): () => void {
        this.updateCallbacks.add(callback);
        return () => this.updateCallbacks.delete(callback);
    }

    private notifyUpdate(): void {
        this.updateCallbacks.forEach(callback => callback(this.getState()));
    }

    clear(): void {
        this.state.layers = [];
        this.notifyUpdate();
    }

    destroy(): void {
        this.updateCallbacks.clear();
    }
}

