import { BaseLayer } from "./baseLayer";
import type { LayerSpecification } from "maplibre-gl";

export class FrichesCentroidClusterLayer extends BaseLayer {
    constructor() {
        super({
            id: "friches-centroid-cluster",
            type: "circle",
            source: "friches-centroid-source",
            visible: true,
            opacity: 0.8,
        });
    }

    getOptions(): LayerSpecification[] {
        const clusterLayer: LayerSpecification = {
            id: `${this.options.id}-clusters`,
            type: "circle",
            source: this.options.source,
            filter: ["has", "point_count"],
            layout: {
                visibility: this.options.visible ? "visible" : "none"
            },
            paint: {
                "circle-color": "#4318FF",
                "circle-radius": 20,
                "circle-opacity": this.options.opacity ?? 0.8
            },
        };

        const clusterCountLayer: LayerSpecification = {
            id: `${this.options.id}-cluster-count`,
            type: "symbol",
            source: this.options.source,
            filter: ["has", "point_count"],
            layout: {
                "text-field": "{point_count}",
                "text-font": ["Marianne Regular"],
                "text-size": 14,
                "text-allow-overlap": true,
                "text-ignore-placement": true,
                visibility: this.options.visible ? "visible" : "none"
            },
            paint: {
                "text-color": "#FFFFFF",
                "text-halo-color": "#FFFFFF",
                "text-halo-width": 0.2,
            },
        };

        return [clusterLayer, clusterCountLayer];
    }

    setVisibility(visible: boolean): void {
        if (!this.map) return;

        const visibility = visible ? 'visible' : 'none';
        const clusterIds = [
            `${this.options.id}-clusters`,
            `${this.options.id}-cluster-count`
        ];

        for (const layerId of clusterIds) {
            if (this.map.getLayer(layerId)) {
                this.map.setLayoutProperty(layerId, 'visibility', visibility);
            }
        }

        this.options.visible = visible;
    }

    setOpacity(opacity: number): void {
        if (!this.map) return;

        if (this.map.getLayer(`${this.options.id}-clusters`)) {
            this.map.setPaintProperty(`${this.options.id}-clusters`, 'circle-opacity', opacity);
        }

        this.options.opacity = opacity;
    }
}

