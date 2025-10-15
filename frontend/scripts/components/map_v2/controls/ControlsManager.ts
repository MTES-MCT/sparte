import maplibregl from "maplibre-gl";
import { createControl } from "../factory/controlRegistry";
import type { BaseSource } from "../sources/baseSource";
import type { BaseLayer } from "../layers/baseLayer";
import type {
    ControlGroup,
    LayerVisibility,
    ControlsManager as IControlsManager,
} from "../types/controls";

export class ControlsManager implements IControlsManager {
    private map: maplibregl.Map;
    private groups: ControlGroup[];
    private sources: Map<string, BaseSource>;
    private layers: Map<string, BaseLayer>;
    private layerVisibility: Map<string, LayerVisibility> = new Map();
    private updateCallbacks: Set<() => void> = new Set();
    private controlInstances: Map<string, any> = new Map();
    private controlValues: Map<string, any> = new Map();

    constructor(
        map: maplibregl.Map,
        groups: ControlGroup[],
        sources: Map<string, BaseSource>,
        layers: Map<string, BaseLayer>
    ) {
        this.map = map;
        this.groups = groups;
        this.sources = sources;
        this.layers = layers;
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
            const groupTargetLayers = group.targetLayers || [];

            group.controls.forEach(control => {
                const targetLayers = control.targetLayers || groupTargetLayers;

                targetLayers.forEach(layerId => {
                    if (!this.layerVisibility.has(layerId)) {
                        this.layerVisibility.set(layerId, {
                            id: layerId,
                            label: layerId,
                            visible: true,
                            opacity: 1
                        });
                    }
                });

                // Initialiser la valeur par défaut du contrôle
                this.controlValues.set(control.id, control.defaultValue);
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

    // Dispatcher générique pour les sources
    async applyToSource(sourceId: string, method: string, value: any): Promise<void> {
        const source = this.sources.get(sourceId);
        if (!source) {
            console.warn(`Source ${sourceId} non trouvée`);
            return;
        }

        const methodFn = (source as any)[method];
        if (typeof methodFn === 'function') {
            await methodFn.call(source, value);
        } else {
            console.warn(`Méthode ${method} non trouvée sur la source ${sourceId}`);
        }
    }

    // Dispatcher générique pour les layers
    async applyToLayer(layerId: string, method: string, value: any): Promise<void> {
        const layer = this.layers.get(layerId);
        if (!layer) {
            console.warn(`Layer ${layerId} non trouvée`);
            return;
        }

        const methodFn = (layer as any)[method];
        if (typeof methodFn === 'function') {
            await methodFn.call(layer, value);
        } else {
            console.warn(`Méthode ${method} non trouvée sur la layer ${layerId}`);
        }
    }

    async applyControl(layerId: string, controlId: string, value: any): Promise<void> {
        // Trouver le contrôle dans les groupes
        const control = this.findControl(controlId);
        if (!control) return;

        const controlInstance = this.controlInstances.get(controlId);
        if (!controlInstance) return;

        // Récupérer les targetLayers (du contrôle ou du groupe)
        const group = this.findGroupByControlId(controlId);
        const targetLayers = control.targetLayers || group?.targetLayers || [];

        // Le contrôle délègue au manager via applyToSource/applyToLayer
        await controlInstance.apply(targetLayers, value, {
            manager: this,
            sources: this.sources,
            layers: this.layers,
            controlId: controlId,
            controlConfig: control
        });

        // Mettre à jour l'état interne
        this.updateLayerState(targetLayers, controlInstance.constructor.name, value);
        this.controlValues.set(controlId, value);

        // Notifier les subscribers
        this.notifyUpdate();
    }

    private updateLayerState(targetLayers: string[], controlClassName: string, value: any): void {
        targetLayers.forEach(layerId => {
            const layerVisibility = this.layerVisibility.get(layerId);
            if (!layerVisibility) return;

            switch (controlClassName) {
                case 'VisibilityControl':
                    layerVisibility.visible = value as boolean;
                    break;
                case 'OpacityControl':
                    layerVisibility.opacity = value as number;
                    break;
                // MillesimeControl ne modifie pas le layerVisibility
            }
        });
    }

    private findControl(controlId: string): any {
        for (const group of this.groups) {
            const control = group.controls.find(c => c.id === controlId);
            if (control) return control;
        }
        return null;
    }

    private findGroupByControlId(controlId: string): ControlGroup | undefined {
        return this.groups.find(group =>
            group.controls.some(c => c.id === controlId)
        );
    }

    getControlValue(layerId: string, controlId: string): any {
        const storedValue = this.controlValues.get(controlId);
        if (storedValue !== undefined) {
            return storedValue;
        }

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

        const groupTargetLayers = group.targetLayers || [];

        const allTargetLayers = new Set<string>();

        groupTargetLayers.forEach(layer => allTargetLayers.add(layer));
        group.controls.forEach(control => {
            (control.targetLayers || []).forEach(layer => allTargetLayers.add(layer));
        });

        return Array.from(allTargetLayers).some(layerId => {
            const layerVisibility = this.layerVisibility.get(layerId);
            return layerVisibility?.visible;
        });
    }

    // Méthodes helper pour les contrôles
    getSourceByLayerId(layerId: string): BaseSource | undefined {
        const layer = this.layers.get(layerId);
        if (!layer) return undefined;

        const sourceId = layer.getSource();
        return this.sources.get(sourceId);
    }

    getSourceIdByLayerId(layerId: string): string | undefined {
        const layer = this.layers.get(layerId);
        return layer?.getSource();
    }
}
