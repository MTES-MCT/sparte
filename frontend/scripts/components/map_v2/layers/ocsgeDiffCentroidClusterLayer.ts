import { BaseLayer } from "./baseLayer";

export class OcsgeDiffCentroidClusterLayer extends BaseLayer {
    constructor() {
        super({
            id: "ocsge-diff-centroid-cluster",
            type: "circle",
            source: "ocsge-diff-centroid-source",
            visible: true,
            opacity: 0.8,
            label: "Clusters de centroïdes OCSGE diff",
            description: "Groupes de centroïdes des changements d'occupation du sol",
        });
    }

    getOptions() {
        return {
            id: this.options.id,
            type: this.options.type,
            source: this.options.source,
            filter: ["has", "point_count"],
            layout: {
                visibility: this.options.visible ? "visible" : "none",
            },
            paint: {
                "circle-color": "#4318FF",
                "circle-radius": 20,
                "circle-opacity": this.options.opacity ?? 0.8,
            },
        };
    }
}

