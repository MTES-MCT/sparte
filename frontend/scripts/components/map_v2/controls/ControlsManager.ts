import { createControl } from "../factory/controlRegistry";
import type { BaseSource } from "../sources/baseSource";
import type { BaseLayer } from "../layers/baseLayer";
import type {
    ControlGroup,
    Control,
    ControlContext,
    BaseControlInterface,
    ControlsManagerInterface,
    ControlValue,
} from "../types/controls";
import type { StatsManager } from "../stats/StatsManager";
import { ControlStateManager } from "./ControlStateManager";

export class ControlsManager implements ControlsManagerInterface {
    private stateManager: ControlStateManager;
    private controlInstances: Map<string, BaseControlInterface> = new Map();
    private groups: ControlGroup[];
    private sources: Map<string, BaseSource>;
    private layers: Map<string, BaseLayer>;
    private statsManager?: StatsManager;

    constructor(
        groups: ControlGroup[],
        sources: Map<string, BaseSource>,
        layers: Map<string, BaseLayer>,
        statsManager?: StatsManager
    ) {
        this.groups = groups;
        this.sources = sources;
        this.layers = layers;
        this.statsManager = statsManager;

        this.initializeControlInstances();

        this.stateManager = new ControlStateManager();

        this.initializeControlValuesFromConfig();
    }

    private initializeControlInstances(): void {
        this.groups.forEach(group => {
            group.controls.forEach(control => {
                const instance = createControl(control.type);
                this.controlInstances.set(control.id, instance);
            });
        });
    }

    private initializeControlValuesFromConfig(): void {
        this.groups.forEach(group => {
            group.controls.forEach(control => {
                // Extraire la valeur par défaut selon le type de contrôle
                let defaultValue: ControlValue;
                switch (control.type) {
                    case 'visibility':
                        defaultValue = control.defaultValue ?? true;
                        break;
                    case 'opacity':
                        defaultValue = control.defaultValue ?? 1;
                        break;
                    case 'ocsge-millesime':
                        // Si pas de defaultValue, récupérer la valeur du layer
                        if (control.defaultValue !== undefined) {
                            defaultValue = control.defaultValue;
                        } else {
                            const targetLayer = control.targetLayers?.[0];
                            const layer = targetLayer ? this.layers.get(targetLayer) : undefined;
                            defaultValue = (layer as any)?.getCurrentMillesime?.() ?? 0;
                        }
                        break;
                    case 'ocsge-nomenclature':
                        // Si pas de defaultValue, récupérer la valeur du layer
                        if (control.defaultValue !== undefined) {
                            defaultValue = control.defaultValue;
                        } else {
                            const targetLayer = control.targetLayers?.[0];
                            const layer = targetLayer ? this.layers.get(targetLayer) : undefined;
                            defaultValue = (layer as any)?.getCurrentNomenclature?.() ?? 'couverture';
                        }
                        break;
                    case 'ocsge-nomenclature-filter':
                        defaultValue = control.defaultValue;
                        break;
                    default:
                        defaultValue = false;
                }
                this.stateManager.initializeControlValue(control.id, defaultValue);
            });
        });
    }

    /**
     * Applique les valeurs par défaut des contrôles aux layers
     * Cette méthode doit être appelée après la création du ControlsManager
     * pour initialiser l'état visuel des layers selon la configuration
     */
    async applyDefaultValues(): Promise<void> {
        for (const group of this.groups) {
            for (const control of group.controls) {
                const defaultValue = this.stateManager.getControlValue(control.id);
                const controlInstance = this.controlInstances.get(control.id);

                if (!controlInstance || defaultValue === undefined) continue;

                const context = this.buildContext(control.id);
                const targetLayers = control.targetLayers || [];

                // Appliquer la valeur par défaut aux layers
                await controlInstance.apply(targetLayers, defaultValue, context);
            }
        }
    }

    async applyControl(controlId: string, value: ControlValue): Promise<void> {
        const control = this.findControl(controlId);
        const controlInstance = this.controlInstances.get(controlId);

        if (!control || !controlInstance) return;

        const context = this.buildContext(controlId);
        const targetLayers = control.targetLayers || [];
        await controlInstance.apply(targetLayers, value, context);

        this.stateManager.setControlValue(controlId, value);
    }

    getControlValue(controlId: string): ControlValue {
        return this.stateManager.getControlValue(controlId);
    }

    getGroups(): ControlGroup[] {
        return this.groups;
    }

    isGroupVisible(groupId: string): boolean {
        const group = this.groups.find(g => g.id === groupId);
        if (!group) return true;

        const visibilityControl = group.controls.find(c => c.type === 'visibility');
        if (!visibilityControl) return true;

        const isVisible = this.stateManager.getControlValue(visibilityControl.id);
        return isVisible ?? true;
    }

    subscribe(callback: () => void): () => void {
        return this.stateManager.subscribe(callback);
    }

    getControlInstance(controlId: string): BaseControlInterface | undefined {
        return this.controlInstances.get(controlId);
    }

    getControlContext(controlId: string): ControlContext {
        return this.buildContext(controlId);
    }

    updateControlValue(controlId: string, value: ControlValue): void {
        this.stateManager.setControlValue(controlId, value);
    }

    private buildContext(controlId: string): ControlContext {
        const control = this.findControl(controlId);
        if (!control) {
            throw new Error(`Control with id ${controlId} not found`);
        }
        return {
            manager: this,
            sources: this.sources,
            layers: this.layers,
            controlId,
            controlConfig: control,
            statsManager: this.statsManager
        };
    }

    private findControl(controlId: string): Control | undefined {
        for (const group of this.groups) {
            const control = group.controls.find(c => c.id === controlId);
            if (control) return control;
        }
        return undefined;
    }
}
