import { BaseLayer } from "./baseLayer";
import type { LayerState, ControlDefinition, ControlAppliers } from "../types";

export class OrthophotoLayer extends BaseLayer {
    constructor() {
        super({
            id: "orthophoto-layer",
            type: "raster",
            source: "orthophoto-source",
            visible: true,
            label: "Fond de carte",
            description: "Image géographique du territoire national.",
        });
    }

    getOptions() {
        return {
            ...this.options,
            layout: {
                visibility: this.options.visible ? "visible" : "none",
            },
            paint: {
                "raster-opacity": this.options.opacity ?? 1,
            },
        };
    }

    getDefaultState(): LayerState {
        return {
            id: this.options.id,
            type: this.options.type,
            visibility: this.options.visible ?? true,
            opacity: this.options.opacity ?? 1,
            params: {},
        };
    }
}
