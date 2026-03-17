import { BaseLayer } from "./baseLayer";
import type { RasterLayerSpecification } from "maplibre-gl";

export class OrthophotoOverlayLayer extends BaseLayer {
    constructor() {
        super({
            id: "orthophoto-overlay-layer",
            type: "raster",
            source: "orthophoto-source",
            visible: true,
        });
    }

    getOptions(): RasterLayerSpecification[] {
        return [{
            id: this.options.id,
            type: "raster",
            source: this.options.source,
            layout: {
                visibility: this.options.visible ? "visible" : "none",
            },
            paint: {
                "raster-opacity": this.options.opacity ?? 1,
            },
        } as RasterLayerSpecification];
    }
}
