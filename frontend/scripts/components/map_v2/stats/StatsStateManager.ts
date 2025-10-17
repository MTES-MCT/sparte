import type { StatCategory } from "../types/layer";
import type { LayerId } from "../types/registry";

export interface StatsState {
    layerId: LayerId | null;
    categories: StatCategory[];
    isVisible: boolean;
}

export class StatsStateManager {
    private state: StatsState = {
        layerId: null,
        categories: [],
        isVisible: false
    };
    private listeners: Set<(state: StatsState) => void> = new Set();

    getState(): StatsState {
        return { ...this.state };
    }

    updateState(newState: Partial<StatsState>): void {
        this.state = { ...this.state, ...newState };
        this.notifyListeners();
    }

    reset(): void {
        this.state = {
            layerId: null,
            categories: [],
            isVisible: false
        };
        this.notifyListeners();
    }

    subscribe(callback: (state: StatsState) => void): () => void {
        this.listeners.add(callback);
        return () => {
            this.listeners.delete(callback);
        };
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.getState()));
    }

    destroy(): void {
        this.listeners.clear();
    }
}

