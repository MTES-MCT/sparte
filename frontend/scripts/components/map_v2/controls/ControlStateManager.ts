import type { ControlValue } from "../types/controls";

export class ControlStateManager {
    private readonly controlValues: Map<string, ControlValue> = new Map();
    private readonly updateCallbacks: Set<() => void> = new Set();

    getControlValue(controlId: string): ControlValue {
        return this.controlValues.get(controlId);
    }

    setControlValue(controlId: string, value: ControlValue): void {
        this.controlValues.set(controlId, value);
        this.notifyUpdate();
    }

    initializeControlValue(controlId: string, initialValue: ControlValue): void {
        if (!this.controlValues.has(controlId)) {
            this.controlValues.set(controlId, initialValue);
        }
    }

    subscribe(callback: () => void): () => void {
        this.updateCallbacks.add(callback);
        return () => this.updateCallbacks.delete(callback);
    }

    private notifyUpdate(): void {
        for (const callback of Array.from(this.updateCallbacks)) {
            callback();
        }
    }
}

