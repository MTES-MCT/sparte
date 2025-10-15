import { createControl } from "../factory/controlRegistry";
import type { BaseSource } from "../sources/baseSource";
import type { BaseLayer } from "../layers/baseLayer";
import type {
    ControlGroup,
    Control,
    ControlContext,
    BaseControlInterface,
    ControlsManager as IControlsManager,
} from "../types/controls";
import { ControlStateManager } from "./ControlStateManager";

export class ControlsManager implements IControlsManager {
    private stateManager: ControlStateManager;
    private controlInstances: Map<string, BaseControlInterface> = new Map();
    private groups: ControlGroup[];
    private sources: Map<string, BaseSource>;
    private layers: Map<string, BaseLayer>;

    constructor(
        groups: ControlGroup[],
        sources: Map<string, BaseSource>,
        layers: Map<string, BaseLayer>
    ) {
        this.groups = groups;
        this.sources = sources;
        this.layers = layers;

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
                const defaultValue = (control as any).defaultValue;
                this.stateManager.initializeControlValue(control.id, defaultValue);
            });
        });
    }

    async applyControl(controlId: string, value: any): Promise<void> {
        const control = this.findControl(controlId);
        const controlInstance = this.controlInstances.get(controlId);

        if (!control || !controlInstance) return;

        const context = this.buildContext(controlId);
        const targetLayers = control.targetLayers || [];
        await controlInstance.apply(targetLayers, value, context);

        this.stateManager.setControlValue(controlId, value);
    }

    getControlValue(controlId: string): any {
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

    updateControlValue(controlId: string, value: any): void {
        this.stateManager.setControlValue(controlId, value);
    }

    private buildContext(controlId: string): ControlContext {
        const control = this.findControl(controlId);
        return {
            manager: this,
            sources: this.sources,
            layers: this.layers,
            controlId,
            controlConfig: control
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
