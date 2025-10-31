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
        sourceId: string
    ) {
        super({
            id,
            type: "circle",
            source: sourceId,
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

        for (const feature of features) {
            const marker = this.createMarkerFromFeature(feature);
            if (marker) {
                newMarkers[marker.id] = marker.marker;
            }
        }

        return newMarkers;
    }

    private createMarkerFromFeature(feature: any): { id: string; marker: maplibregl.Marker } | null {
        const coords = feature.geometry;
        const props = feature.properties;

        if (!props?.cluster || coords.type !== 'Point') return null;

        const id = props.cluster_id;
        const coordinates = coords.coordinates as [number, number];

        let marker = this.markers[id];
        if (!marker) {
            const el = this.createDonutElement(props);
            marker = this.markers[id] = new maplibregl.Marker({
                element: el
            }).setLngLat(coordinates);
        } else {
            const oldElement = marker.getElement();
            const isOnScreen = this.markersOnScreen[id] !== undefined;

            if ((oldElement as any)._donutCleanup) {
                (oldElement as any)._donutCleanup();
                delete (oldElement as any)._donutCleanup;
            }

            if (isOnScreen) {
                marker.remove();
            }

            const newElement = this.createDonutElement(props);
            marker = this.markers[id] = new maplibregl.Marker({
                element: newElement
            }).setLngLat(coordinates);

            if (isOnScreen && this.map) {
                marker.addTo(this.map);
            }
        }

        return { id, marker };
    }

    private updateMarkersVisibility(newMarkers: Record<string, maplibregl.Marker>): void {
        if (!this.options.visible) return;

        for (const id in newMarkers) {
            if (!this.markersOnScreen[id]) {
                newMarkers[id].addTo(this.map);
            }
        }
    }

    private removeInvisibleMarkers(newMarkers: Record<string, maplibregl.Marker>): void {
        for (const id in this.markersOnScreen) {
            if (!newMarkers[id]) {
                const marker = this.markersOnScreen[id];
                // Cleanup des événements donut avant de supprimer le marker
                const element = marker.getElement();
                if ((element as any)._donutCleanup) {
                    (element as any)._donutCleanup();
                    delete (element as any)._donutCleanup;
                }
                marker.remove();
                delete this.markersOnScreen[id];
            }
        }
    }

    private updateMarkersOnScreen(newMarkers: Record<string, maplibregl.Marker>): void {
        this.markersOnScreen = this.options.visible ? newMarkers : {};
    }

    // Layer technique nécessaire pour que querySourceFeatures() fonctionne
    // Les markers HTML (donut charts) sont gérés séparément via updateMarkers()
    getOptions(): LayerSpecification[] {
        return [{
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
        } as LayerSpecification];
    }

    setVisibility(visible: boolean): void {
        this.options.visible = visible;

        if (visible) {
            this.updateMarkers();
        } else {
            for (const id in this.markersOnScreen) {
                this.markersOnScreen[id].remove();
            }
            this.markersOnScreen = {};
        }
    }

    destroy(): void {
        // Nettoyer tous les listeners
        if (this.map) {
            this.map.off('move', this.updateMarkersBound);
            this.map.off('moveend', this.updateMarkersBound);
            this.map.off('data', this.handleDataBound);
        }

        // Supprimer tous les markers de la carte et leurs événements
        for (const id in this.markersOnScreen) {
            const marker = this.markersOnScreen[id];
            // Cleanup des événements donut
            const element = marker.getElement();
            if ((element as any)._donutCleanup) {
                (element as any)._donutCleanup();
                delete (element as any)._donutCleanup;
            }
            marker.remove();
        }

        // Cleanup également des markers non affichés
        for (const id in this.markers) {
            if (!this.markersOnScreen[id]) {
                const element = this.markers[id].getElement();
                if ((element as any)._donutCleanup) {
                    (element as any)._donutCleanup();
                    delete (element as any)._donutCleanup;
                }
            }
        }

        // Vider les collections
        this.markers = {};
        this.markersOnScreen = {};
    }
}

