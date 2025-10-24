import { BaseLayer } from "./baseLayer";
import type { LineLayerSpecification } from "maplibre-gl";

export class EmpriseLayer extends BaseLayer {
    constructor() {
        super({
            id: "emprise-layer",
            type: "line",
            source: "emprise-source",
            visible: true,
        });
    }

    async load(): Promise<void> {
        this.loaded = true;
    }

    getOptions(): LineLayerSpecification {
        return {
            id: this.options.id,
            type: "line",
            source: this.options.source,
            layout: {
                visibility: this.options.visible ? "visible" : "none",
                "line-cap": "round",
            },
            paint: {
                "line-color": "black",
                "line-width": 1.7,
                "line-opacity": this.options.opacity ?? 0.7,
            },
        } as LineLayerSpecification;
    }
}
