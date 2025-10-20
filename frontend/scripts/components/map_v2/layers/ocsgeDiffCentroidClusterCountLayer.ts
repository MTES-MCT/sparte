import { BaseLayer } from "./baseLayer";

export class OcsgeDiffCentroidClusterCountLayer extends BaseLayer {
    constructor() {
        super({
            id: "ocsge-diff-centroid-cluster-count",
            type: "symbol",
            source: "ocsge-diff-centroid-source",
            visible: true,
            opacity: 1,
            label: "Nombre de centroïdes OCSGE diff par cluster",
            description: "Affiche le nombre de centroïdes dans chaque cluster",
        });
    }

    getOptions() {
        return {
            id: this.options.id,
            type: this.options.type,
            source: this.options.source,
            filter: ["has", "point_count"],
            layout: {
                "text-field": "{point_count}",
                "text-font": ["Marianne Regular"],
                "text-size": 14,
                "text-allow-overlap": true,
                "text-ignore-placement": true,
                visibility: this.options.visible ? "visible" : "none",
            },
            paint: {
                "text-color": "#FFFFFF",
                "text-halo-color": "#FFFFFF",
                "text-halo-width": 0.2,
            },
        };
    }
}

