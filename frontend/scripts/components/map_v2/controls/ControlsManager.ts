import maplibregl from "maplibre-gl";
import { createControl } from "../factory/controlRegistry";
import type {
    ControlGroup,
    LayerVisibility,
    ControlsManager as IControlsManager,
} from "../types/controls";

export class ControlsManager implements IControlsManager {
    private map: maplibregl.Map;
    private groups: ControlGroup[];
    private layerVisibility: Map<string, LayerVisibility> = new Map();
    private updateCallbacks: Set<() => void> = new Set();
    private controlInstances: Map<string, any> = new Map();

    constructor(map: maplibregl.Map, groups: ControlGroup[]) {
        this.map = map;
        this.groups = groups;
        this.initializeControlInstances();
        this.initializeLayerVisibility();
    }

    private initializeControlInstances(): void {
        this.groups.forEach(group => {
            group.controls.forEach(control => {
                const instance = createControl(control.type);
                this.controlInstances.set(control.id, instance);
            });
        });
    }

    private initializeLayerVisibility(): void {
        this.groups.forEach(group => {
            group.targetLayers.forEach(layerId => {
                if (!this.layerVisibility.has(layerId)) {
                    this.layerVisibility.set(layerId, {
                        id: layerId,
                        label: layerId, // TODO: récupérer le vrai label
                        visible: true,
                        opacity: 1
                    });
                }
            });
        });
    }

    subscribe(callback: () => void): () => void {
        this.updateCallbacks.add(callback);
        return () => {
            this.updateCallbacks.delete(callback);
        };
    }

    private notifyUpdate(): void {
        this.updateCallbacks.forEach(callback => callback());
    }

    getGroups(): ControlGroup[] {
        return this.groups;
    }

    getLayerVisibility(layerId: string): LayerVisibility | undefined {
        return this.layerVisibility.get(layerId);
    }

    getAllLayerVisibility(): LayerVisibility[] {
        return Array.from(this.layerVisibility.values());
    }

    applyControl(layerId: string, controlId: string, value: any): void {
        const controlInstance = this.controlInstances.get(controlId);
        if (!controlInstance) return;

        // Appliquer le contrôle sur la carte
        controlInstance.apply(this.map, layerId, value);

        // Mettre à jour l'état interne
        this.updateLayerState(layerId, controlId, value);

        // Notifier les subscribers
        this.notifyUpdate();
    }

    private updateLayerState(layerId: string, controlId: string, value: any): void {
        const layerVisibility = this.layerVisibility.get(layerId);
        if (!layerVisibility) return;

        // Trouver le contrôle pour déterminer le type
        const control = this.groups
            .flatMap(g => g.controls)
            .find(c => c.id === controlId);

        if (!control) return;

        switch (control.type) {
            case 'visibility':
                layerVisibility.visible = value as boolean;
                break;
            case 'opacity':
                layerVisibility.opacity = value as number;
                break;
        }
    }

    getControlValue(layerId: string, controlId: string): any {
        const controlInstance = this.controlInstances.get(controlId);
        if (!controlInstance) return null;

        return controlInstance.getValue(this.map, layerId);
    }

    isControlDisabled(layerId: string, controlId: string): boolean {
        const controlInstance = this.controlInstances.get(controlId);
        const layerVisibility = this.layerVisibility.get(layerId);

        if (!controlInstance || !layerVisibility) return false;

        return controlInstance.isDisabled(layerVisibility);
    }

    getControlInstance(controlId: string): any {
        return this.controlInstances.get(controlId);
    }

    isGroupActive(groupId: string): boolean {
        const group = this.groups.find(g => g.id === groupId);
        if (!group) return false;

        return group.targetLayers.some(layerId => {
            const layerVisibility = this.layerVisibility.get(layerId);
            return layerVisibility?.visible;
        });
    }
}
