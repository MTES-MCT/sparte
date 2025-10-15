export class ControlStateManager {
    private controlValues: Map<string, any> = new Map();
    private updateCallbacks: Set<() => void> = new Set();

    getControlValue(controlId: string): any {
        return this.controlValues.get(controlId);
    }

    setControlValue(controlId: string, value: any): void {
        this.controlValues.set(controlId, value);
        this.notifyUpdate();
    }

    initializeControlValue(controlId: string, initialValue: any): void {
        if (!this.controlValues.has(controlId)) {
            this.controlValues.set(controlId, initialValue);
        }
    }

    subscribe(callback: () => void): () => void {
        this.updateCallbacks.add(callback);
        return () => this.updateCallbacks.delete(callback);
    }

    private notifyUpdate(): void {
        this.updateCallbacks.forEach(callback => callback());
    }
}

