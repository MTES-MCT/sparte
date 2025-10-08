import { BaseLayer } from "./baseLayer";

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
}
