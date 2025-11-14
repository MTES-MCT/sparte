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

        const unclusteredPointLayer: LayerSpecification = {
            id: `${this.options.id}-unclustered-point`,
            type: "circle",
            source: this.options.source,
            filter: ["!", ["has", "point_count"]],
            layout: {
                visibility: this.options.visible ? "visible" : "none"
            },
            paint: {
                "circle-radius": 6,
                "circle-color": "#4318FF",
                "circle-opacity": 1
            },
        };

        return [clusterLayer, clusterCountLayer, unclusteredPointLayer];
    }

    setVisibility(visible: boolean): void {
        if (!this.map) return;

        const visibility = visible ? 'visible' : 'none';
        const layerIds = [
            `${this.options.id}-clusters`,
            `${this.options.id}-cluster-count`,
            `${this.options.id}-unclustered-point`
        ];

        for (const layerId of layerIds) {
            if (this.map.getLayer(layerId)) {
                this.map.setLayoutProperty(layerId, 'visibility', visibility);
            }
        }

        this.options.visible = visible;
    }

    setOpacity(opacity: number): void {
        if (!this.map) return;

        const clusterLayerId = `${this.options.id}-clusters`;
        const unclusteredLayerId = `${this.options.id}-unclustered-point`;

        if (this.map.getLayer(clusterLayerId)) {
            this.map.setPaintProperty(clusterLayerId, 'circle-opacity', opacity);
        }

        if (this.map.getLayer(unclusteredLayerId)) {
            this.map.setPaintProperty(unclusteredLayerId, 'circle-opacity', opacity);
        }

        this.options.opacity = opacity;
    }
}

