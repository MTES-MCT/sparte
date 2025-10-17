import { PopupState } from "../types/popup";

export class PopupStateManager {
    private popupState: PopupState = {
        isVisible: false,
        feature: null,
        event: null,
        position: { x: 0, y: 0 },
        layerId: null
    };
    private updateCallbacks: Set<(state: PopupState) => void> = new Set();

    updateState(newState: Partial<PopupState>): void {
        this.popupState = { ...this.popupState, ...newState };
        this.notifyUpdate();
    }

    getState(): PopupState {
        return { ...this.popupState };
    }

    subscribe(callback: (state: PopupState) => void): () => void {
        this.updateCallbacks.add(callback);
        return () => this.updateCallbacks.delete(callback);
    }

    private notifyUpdate(): void {
        this.updateCallbacks.forEach(callback => callback(this.popupState));
    }

    reset(): void {
        this.popupState = {
            isVisible: false,
            feature: null,
            event: null,
            position: { x: 0, y: 0 },
            layerId: null
        };
        this.notifyUpdate();
    }

    destroy(): void {
        this.updateCallbacks.clear();
    }
}
