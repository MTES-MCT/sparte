import { BaseLayer } from "./baseLayer";
import type { LayerSpecification } from "maplibre-gl";
import maplibregl from "maplibre-gl";

export abstract class BaseDiffCentroidClusterLayer extends BaseLayer {
    private markers: Record<string, maplibregl.Marker> = {};
    private markersOnScreen: Record<string, maplibregl.Marker> = {};

    private readonly updateMarkersBound: () => void;
    private readonly handleDataBound: (e: maplibregl.MapSourceDataEvent) => void;

    constructor(
        id: string,
        sourceId: string,
        label: string,
        description: string
    ) {
        super({
            id,
            type: "circle",
            source: sourceId,
            label,
            description,
        });

        this.updateMarkersBound = this.updateMarkers.bind(this);
        this.handleDataBound = this.handleData.bind(this);
    }

    protected abstract getSourceId(): string;

    protected abstract createDonutElement(properties: Record<string, any>): HTMLElement;

    attach(map: maplibregl.Map): void {
        super.attach(map);

        // Listener temporaire pour détecter quand la source de données est chargée
        // Une fois chargée, on configure les vrais listeners (move/moveend)
        map.on('data', this.handleDataBound);
    }

    private handleData(e: maplibregl.MapSourceDataEvent): void {
        if (!this.map || e.sourceId !== this.getSourceId() || !e.isSourceLoaded) return;

        // La source est maintenant chargée, on peut configurer les vrais listeners
        // et supprimer le listener temporaire 'data'
        this.map.off('data', this.handleDataBound);
        this.map.on('move', this.updateMarkersBound);
        this.map.on('moveend', this.updateMarkersBound);
        this.updateMarkers();
    }

    private updateMarkers(): void {
        if (!this.map) return;

        const newMarkers = this.createMarkersFromFeatures();
        this.updateMarkersVisibility(newMarkers);
        this.removeInvisibleMarkers(newMarkers);
        this.updateMarkersOnScreen(newMarkers);
    }

    private createMarkersFromFeatures(): Record<string, maplibregl.Marker> {
        const newMarkers: Record<string, maplibregl.Marker> = {};
        const features = this.map!.querySourceFeatures(this.getSourceId());

        for (let i = 0; i < features.length; i++) {
            const marker = this.createMarkerFromFeature(features[i]);
            if (marker) {
                newMarkers[marker.id] = marker.marker;
            }
        }

        return newMarkers;
    }

    private createMarkerFromFeature(feature: any): { id: string; marker: maplibregl.Marker } | null {
        const coords = feature.geometry;
        const props = feature.properties;

        if (!props || !props.cluster || coords.type !== 'Point') return null;

        const id = props.cluster_id;
        const coordinates = coords.coordinates as [number, number];

        let marker = this.markers[id];
        if (!marker) {
            const el = this.createDonutElement(props);
            marker = this.markers[id] = new maplibregl.Marker({
                element: el
            }).setLngLat(coordinates);
        }

        return { id, marker };
    }

    private updateMarkersVisibility(newMarkers: Record<string, maplibregl.Marker>): void {
        if (!this.options.visible) return;

        for (const id in newMarkers) {
            if (!this.markersOnScreen[id]) {
                newMarkers[id].addTo(this.map!);
            }
        }
    }

    private removeInvisibleMarkers(newMarkers: Record<string, maplibregl.Marker>): void {
        for (const id in this.markersOnScreen) {
            if (!newMarkers[id]) {
                this.markersOnScreen[id].remove();
                delete this.markersOnScreen[id];
            }
        }
    }

    private updateMarkersOnScreen(newMarkers: Record<string, maplibregl.Marker>): void {
        this.markersOnScreen = this.options.visible ? newMarkers : {};
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

    abstract setOpacity(_opacity: number): void;

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

