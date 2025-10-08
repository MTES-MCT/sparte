import { BaseLayer } from "./baseLayer";
import type { LayerState } from "../types";

export class EmpriseLayer extends BaseLayer {
    constructor() {
        super({
            id: "emprise-layer",
            type: "line",
            source: "emprise-source",
            visible: true,
            label: "Emprise",
            description: "Limites du territoire.",
        });
    }

    async load(): Promise<void> {
        this.loaded = true;
    }

    getOptions() {
        return {
            ...this.options,
            layout: {
                visibility: this.options.visible ? "visible" : "none",
                "line-cap": "round",
            },
            paint: {
                "line-color": "black",
                "line-width": 1.7,
                "line-opacity": this.options.opacity ?? 0.7,
            },
        };
    }

    getDefaultState(): LayerState {
        return {
            id: this.options.id,
            type: this.options.type,
            visibility: this.options.visible ?? true,
            opacity: this.options.opacity ?? 0.7,
            params: {},
        };
    }
}
