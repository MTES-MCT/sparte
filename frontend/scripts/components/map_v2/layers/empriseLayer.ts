import { BaseLayer } from "./baseLayer";

export class EmpriseLayer extends BaseLayer {
    constructor() {
        super({
            id: "emprise-layer",
            type: "line",
            source: "emprise-source",
            visible: true,
        });
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
}