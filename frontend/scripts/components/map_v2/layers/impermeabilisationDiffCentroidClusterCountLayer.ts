import { BaseLayer } from "./baseLayer";
import type { LayerSpecification, FilterSpecification } from "maplibre-gl";

export class ImpermeabilisationDiffCentroidClusterCountLayer extends BaseLayer {
    constructor() {
        super({
            id: "impermeabilisation-diff-centroid-cluster-count",
            type: "symbol",
            source: "impermeabilisation-diff-centroid-source",
            visible: true,
            opacity: 1,
            label: "Nombre de centroïdes imperméabilisation diff par cluster",
            description: "Affiche le nombre de centroïdes dans chaque cluster d'imperméabilisation",
        });
    }

    getOptions(): LayerSpecification {
        return {
            id: this.options.id,
            type: this.options.type as 'symbol',
            source: this.options.source,
            filter: ["has", "point_count"] as FilterSpecification,
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
        } as LayerSpecification;
    }
}

