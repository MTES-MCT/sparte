import { BaseLayer } from "./baseLayer";
import type { LayerSpecification, FilterSpecification } from "maplibre-gl";
import maplibregl from "maplibre-gl";
import { createArtificialisationDonutChart } from "../utils/donutChart";

export class ArtificialisationDiffCentroidClusterLayer extends BaseLayer {
    private markers: Record<string, maplibregl.Marker> = {};
    private markersOnScreen: Record<string, maplibregl.Marker> = {};
    private sourceId = "artificialisation-diff-centroid-source";

    private updateMarkersBound: () => void;
    private handleDataBound: (e: maplibregl.MapSourceDataEvent) => void;

    constructor() {
        super({
            id: "artificialisation-diff-centroid-cluster",
            type: "circle", // Type factice, pas vraiment utilisé
            source: "artificialisation-diff-centroid-source",
            visible: true,
            opacity: 1,
            label: "Clusters d'artificialisation (donut charts)",
            description: "Affiche les clusters sous forme de donut charts",
        });

        this.updateMarkersBound = this.updateMarkers.bind(this);
        this.handleDataBound = this.handleData.bind(this);
    }

    attach(map: maplibregl.Map): void {
        super.attach(map);

        // Configurer les listeners pour mettre à jour les markers
        map.on('data', this.handleDataBound);
    }

    private handleData(e: maplibregl.MapSourceDataEvent): void {
        if (!this.map || e.sourceId !== this.sourceId || !e.isSourceLoaded) return;

        // Configurer les listeners une seule fois après le chargement de la source
        this.map.off('data', this.handleDataBound);
        this.map.on('move', this.updateMarkersBound);
        this.map.on('moveend', this.updateMarkersBound);
        this.updateMarkers();
    }

    private updateMarkers(): void {
        if (!this.map) return;

        const newMarkers: Record<string, maplibregl.Marker> = {};
        const features = this.map.querySourceFeatures(this.sourceId);

        // Pour chaque cluster visible, créer un HTML marker
        for (let i = 0; i < features.length; i++) {
            const coords = features[i].geometry;
            const props = features[i].properties;

            if (!props || !props.cluster || coords.type !== 'Point') continue;

            const id = props.cluster_id;
            const coordinates = coords.coordinates as [number, number];

            let marker = this.markers[id];
            if (!marker) {
                const el = createArtificialisationDonutChart({
                    artificialisation_count: props.artificialisation_count || 0,
                    desartificialisation_count: props.desartificialisation_count || 0
                });

                marker = this.markers[id] = new maplibregl.Marker({
                    element: el
                }).setLngLat(coordinates);
            }
            newMarkers[id] = marker;

            if (!this.markersOnScreen[id]) {
                marker.addTo(this.map);
            }
        }

        // Supprimer les markers qui ne sont plus visibles
        for (const id in this.markersOnScreen) {
            if (!newMarkers[id]) {
                this.markersOnScreen[id].remove();
            }
        }

        this.markersOnScreen = newMarkers;
    }

    // Créer un layer invisible pour permettre querySourceFeatures
    getOptions(): LayerSpecification {
        return {
            id: this.options.id,
            type: 'circle',
            source: this.options.source,
            filter: ['has', 'point_count'], // Filtrer seulement les clusters
            layout: {
                visibility: 'none' // Invisible mais présent pour querySourceFeatures
            },
            paint: {
                'circle-radius': 0,
                'circle-opacity': 0
            }
        } as LayerSpecification;
    }

    setVisibility(visible: boolean): void {
        this.options.visible = visible;

        // Montrer/cacher tous les markers
        if (visible) {
            for (const id in this.markersOnScreen) {
                if (this.map && !this.markersOnScreen[id].getElement().parentElement) {
                    this.markersOnScreen[id].addTo(this.map);
                }
            }
        } else {
            for (const id in this.markersOnScreen) {
                this.markersOnScreen[id].remove();
            }
            if (!visible) {
                this.markersOnScreen = {};
            }
        }
    }

    // Nettoyer les markers quand le layer est détruit
    destroy(): void {
        if (this.map) {
            this.map.off('move', this.updateMarkersBound);
            this.map.off('moveend', this.updateMarkersBound);
            this.map.off('data', this.handleDataBound);
        }

        // Supprimer tous les markers
        for (const id in this.markersOnScreen) {
            this.markersOnScreen[id].remove();
        }
        this.markers = {};
        this.markersOnScreen = {};
    }
}
