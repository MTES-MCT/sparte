import { BaseLayer } from "./baseLayer";
import type { LayerSpecification } from "maplibre-gl";
import maplibregl from "maplibre-gl";
import { createImpermeabilisationDonutChart } from "../utils/donutChart";

export class ImpermeabilisationDiffCentroidClusterLayer extends BaseLayer {
    private markers: Record<string, maplibregl.Marker> = {};
    private markersOnScreen: Record<string, maplibregl.Marker> = {};
    private sourceId = "impermeabilisation-diff-centroid-source";

    private updateMarkersBound: () => void;
    private handleDataBound: (e: maplibregl.MapSourceDataEvent) => void;

    constructor() {
        super({
            id: "impermeabilisation-diff-centroid-cluster",
            type: "circle",
            source: "impermeabilisation-diff-centroid-source",
            label: "Clusters d'imperméabilisation (donut charts)",
            description: "Affiche les clusters sous forme de donut charts",
        });

        this.updateMarkersBound = this.updateMarkers.bind(this);
        this.handleDataBound = this.handleData.bind(this);
    }

    attach(map: maplibregl.Map): void {
        super.attach(map);

        // Listener temporaire pour détecter quand la source de données est chargée
        // Une fois chargée, on configurera les vrais listeners (move/moveend)
        map.on('data', this.handleDataBound);
    }

    private handleData(e: maplibregl.MapSourceDataEvent): void {
        if (!this.map || e.sourceId !== this.sourceId || !e.isSourceLoaded) return;

        // La source est maintenant chargée, on peut configurer les vrais listeners
        // et supprimer le listener temporaire 'data'
        this.map.off('data', this.handleDataBound);
        this.map.on('move', this.updateMarkersBound);
        this.map.on('moveend', this.updateMarkersBound);
        this.updateMarkers();
    }

    private updateMarkers(): void {
        if (!this.map) return;

        const newMarkers: Record<string, maplibregl.Marker> = {};
        const features = this.map.querySourceFeatures(this.sourceId);

        // Créer/actualiser les markers pour chaque cluster visible
        for (let i = 0; i < features.length; i++) {
            const coords = features[i].geometry;
            const props = features[i].properties;

            if (!props || !props.cluster || coords.type !== 'Point') continue;

            const id = props.cluster_id;
            const coordinates = coords.coordinates as [number, number];

            let marker = this.markers[id];
            if (!marker) {
                const el = createImpermeabilisationDonutChart({
                    impermeabilisation_count: props.impermeabilisation_count || 0,
                    desimpermeabilisation_count: props.desimpermeabilisation_count || 0
                });

                marker = this.markers[id] = new maplibregl.Marker({
                    element: el
                }).setLngLat(coordinates);
            }
            newMarkers[id] = marker;
        }

        // Gestion de l'affichage selon la visibilité de la couche
        if (this.options.visible) {
            // Ajouter les nouveaux markers à la carte
            for (const id in newMarkers) {
                if (!this.markersOnScreen[id]) {
                    newMarkers[id].addTo(this.map);
                }
            }
        }


        for (const id in this.markersOnScreen) {
            if (!newMarkers[id]) {
                this.markersOnScreen[id].remove();
                delete this.markersOnScreen[id];
            }
        }

        // Mettre à jour la liste des markers affichés
        if (this.options.visible) {
            this.markersOnScreen = newMarkers;
        } else {
            this.markersOnScreen = {};
        }
    }

    // Layer technique nécessaire pour que querySourceFeatures() fonctionne
    // Les markers HTML (donut charts) sont gérés séparément via updateMarkers()
    getOptions(): LayerSpecification {
        return {
            id: this.options.id,
            type: 'circle',
            source: this.options.source,
            filter: ['has', 'point_count'],
            layout: {
                visibility: 'visible'
            },
            paint: {
                'circle-radius': 0,
                'circle-opacity': 0
            }
        } as LayerSpecification;
    }

    setVisibility(visible: boolean): void {
        this.options.visible = visible;

        if (visible) {
            // Réafficher tous les markers existants
            for (const id in this.markers) {
                const marker = this.markers[id];
                if (this.map && !marker.getElement().parentElement) {
                    marker.addTo(this.map);
                    this.markersOnScreen[id] = marker;
                }
            }
        } else {
            // Cacher tous les markers actuellement affichés
            for (const id in this.markersOnScreen) {
                this.markersOnScreen[id].remove();
            }
            this.markersOnScreen = {};
        }
    }

    setOpacity(_opacity: number): void {
    }

    destroy(): void {
        // Nettoyer tous les listeners
        if (this.map) {
            this.map.off('move', this.updateMarkersBound);
            this.map.off('moveend', this.updateMarkersBound);
            this.map.off('data', this.handleDataBound);
        }

        // Supprimer tous les markers de la carte
        for (const id in this.markersOnScreen) {
            this.markersOnScreen[id].remove();
        }

        // Vider les collections
        this.markers = {};
        this.markersOnScreen = {};
    }
}

