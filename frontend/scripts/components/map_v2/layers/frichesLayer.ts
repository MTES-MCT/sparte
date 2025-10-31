import { BaseLayer } from "./baseLayer";
import type { LayerSpecification } from "maplibre-gl";

export class FrichesLayer extends BaseLayer {
    constructor() {
        super({
            id: "friches-layer",
            type: "fill",
            source: "friches-source",
            visible: true,
            opacity: 0.4,
        });
    }

    getOptions(): LayerSpecification[] {
        return [{
            id: this.options.id,
            type: "fill",
            source: this.options.source,
            layout: {
                visibility: this.options.visible ? "visible" : "none"
            },
            paint: {
                "fill-color": [
                    "match",
                    ["get", "friche_statut"],
                    "friche reconvertie", "#18753C",
                    "friche avec projet", "#0063CB",
                    "friche sans projet", "#B34000",
                    "#FFFFFF" // couleur par défaut
                ],
                "fill-opacity": this.options.opacity ?? 0.4,
            },
        } as LayerSpecification];
    }
}

