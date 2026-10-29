import { BaseLayer } from "./baseLayer";
import * as maplibregl from "maplibre-gl";
import { bbox, booleanPointInPolygon, buffer, convex, featureCollection, lineString, point } from "@turf/turf";
import type { LandDetailResultType } from "@services/types/land";
import {
    OCSGE_DIFF_DONUT_CLICK_MAX_ZOOM,
    OCSGE_DIFF_MIN_COMMUNES_FOR_COMMUNE_MODE,
    OCSGE_DIFF_CLUSTER_HOVER_MAX_LEAVES,
    OCSGE_DIFF_CLUSTER_HOVER_COLOR,
    OCSGE_DIFF_CLUSTER_ZONE_FILL_OPACITY,
    OCSGE_DIFF_CLUSTER_ZONE_PADDING_PX,
    OCSGE_DIFF_HOVER_OUTLINE_MIN_WIDTH,
    OCSGE_DIFF_HOVER_OUTLINE_MAX_WIDTH,
    OCSGE_DIFF_HOVER_OUTLINE_PULSE_PERIOD_MS,
} from "../constants/config";

const EMPTY_FC: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };

type Coord = [number, number];

/** Regroupement par commune des centroïdes, calculé côté client à partir du GeoJSON brut. */
export interface CommuneGroupingConfig {
    /** Propriété portant le code commune (ex. `COMM`). */
    communeProperty: string;
    /** Propriétés vraies quand le sol a gagné / perdu l'état suivi. */
    increaseProperty: string;
    decreaseProperty: string;
    /** Noms des surfaces cumulées lus par le donut. */
    increaseCountProperty: string;
    decreaseCountProperty: string;
}

export interface DiffCentroidClusterOptions {
    /** Zoom à partir duquel les objets sont affichés ; undefined = pas de seuil. */
    objectsMinZoom?: number;
    /** Zoom auquel les donuts ont disparu (fondu sur le niveau précédent) ; undefined = toujours visibles. */
    donutsFadeOutZoom?: number;
    /** Calque des polygones d'objets, dont le contour est interrogé au survol. */
    objectsLayerId?: string;
    /** Active le regroupement par commune (sinon proximité uniquement). */
    communeGrouping?: CommuneGroupingConfig;
    /** Territoire courant, pour ne garder que ses objets dans le regroupement par commune. */
    landData?: LandDetailResultType;
}

/** Un donut à afficher : cluster de proximité (MapLibre) ou commune (calcul client). */
interface ClusterInfo {
    key: string;
    coordinates: Coord;
    pointCount: number;
    properties: Record<string, any>;
    /** Cluster MapLibre : source et identifiant pour retrouver ses membres. */
    sourceId?: string;
    clusterId?: number;
    /** Commune : membres déjà connus. */
    leaves?: Coord[];
}

interface CommuneGroup {
    code: string;
    leaves: Coord[];
    increase: number;
    decrease: number;
}

export abstract class BaseDiffCentroidClusterLayer extends BaseLayer {
    private markers: Record<string, maplibregl.Marker> = {};
    private markersOnScreen: Record<string, maplibregl.Marker> = {};

    private readonly updateMarkersBound: () => void;
    private readonly handleDataBound: (e: maplibregl.MapSourceDataEvent) => void;

    private readonly objectsMinZoom?: number;
    private readonly donutsFadeOutZoom?: number;
    private readonly objectsLayerId?: string;
    private readonly communeGrouping?: CommuneGroupingConfig;
    private readonly landData?: LandDetailResultType;

    /** GeoJSON brut par URL de source, pour le regroupement par commune. */
    private rawFeaturesByUrl = new Map<string, Promise<GeoJSON.Feature[]>>();
    private rawFeaturesLoaded = new Map<string, GeoJSON.Feature[]>();

    /** Jeton pour ignorer les réponses asynchrones obsolètes au survol. */
    private hoverRequestId = 0;
    /** Donut dont les objets sont mis en évidence (survol). */
    private hoveredClusterKey: string | null = null;
    /** Pas de mise en évidence pendant l'animation qui suit un clic sur un donut. */
    private hoverSuppressed = false;
    private pulseFrame = 0;

    constructor(id: string, sourceId: string, options: DiffCentroidClusterOptions = {}) {
        super({
            id,
            type: "circle",
            source: sourceId,
        });
        this.objectsMinZoom = options.objectsMinZoom;
        this.donutsFadeOutZoom = options.donutsFadeOutZoom;
        this.objectsLayerId = options.objectsLayerId;
        this.communeGrouping = options.communeGrouping;
        this.landData = options.landData;

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
        if (!this.map || !e.isSourceLoaded) return;
        const baseId = this.getSourceId();
        if (e.sourceId !== baseId && !e.sourceId.startsWith(`${baseId}-dept-`)) return;

        // La source est maintenant chargée, on peut configurer les vrais listeners
        // et supprimer le listener temporaire 'data'
        this.map.off('data', this.handleDataBound);
        this.map.on('move', this.updateMarkersBound);
        this.map.on('moveend', this.updateMarkersBound);
        this.updateMarkers();
    }

    private updateMarkers(): void {
        if (!this.map) return;

        const opacity = this.getMarkersOpacity();
        const clusters = opacity > 0 ? this.collectClusters() : [];
        const newMarkers = this.createMarkersFromClusters(clusters);
        for (const id in newMarkers) {
            newMarkers[id].getElement().style.opacity = String(opacity);
        }
        this.updateMarkersVisibility(newMarkers);
        this.removeInvisibleMarkers(newMarkers);
        this.updateMarkersOnScreen(newMarkers);

        // Plus de donuts (trop zoomé), ou le donut survolé a disparu (déplacement,
        // changement de mode) : on retire la mise en évidence.
        if (opacity <= 0 || (this.hoveredClusterKey && !newMarkers[this.hoveredClusterKey])) {
            this.clearHover();
        }
    }

    /** 1 jusqu'au zoom d'effacement moins un, 0 à partir du zoom d'effacement, fondu linéaire entre les deux. */
    private getMarkersOpacity(): number {
        if (!this.map || this.donutsFadeOutZoom === undefined) return 1;
        const zoom = this.map.getZoom();
        return Math.min(1, Math.max(0, this.donutsFadeOutZoom - zoom));
    }

    /** Zoom de repli au clic sur un donut dont on ne connaît pas les membres : au moins le seuil des objets, un cran plus près. */
    private getClickTargetZoom(): number {
        const zoom = this.map?.getZoom() ?? 0;
        return Math.max(this.objectsMinZoom ?? 0, zoom + 1);
    }

    /** Au clic sur un donut : cadrer l'étendue de ses objets. */
    private zoomToClusterExtent(cluster: ClusterInfo): void {
        this.getLeaves(cluster).then((leaves) => {
            if (!this.map) return;
            if (leaves.length === 0) {
                // Membres inconnus (cluster au-delà du garde-fou) : simple rapprochement.
                this.map.easeTo({ center: cluster.coordinates, zoom: this.getClickTargetZoom() });
                return;
            }
            const [minX, minY, maxX, maxY] = bbox(featureCollection(leaves.map((c) => point(c))));
            this.map.fitBounds([[minX, minY], [maxX, maxY]], { padding: 80, maxZoom: OCSGE_DIFF_DONUT_CLICK_MAX_ZOOM });
        });
    }

    private getSourceIds(): string[] {
        if (!this.map) return [this.getSourceId()];
        const baseId = this.getSourceId();
        const style = this.map.getStyle();
        if (!style?.sources) return [baseId];

        return Object.keys(style.sources).filter(
            id => id === baseId || id.startsWith(`${baseId}-dept-`)
        );
    }

    /**
     * Donuts à afficher : par commune si assez de communes sont visibles à
     * l'écran (et que leurs données sont chargées), par proximité sinon.
     */
    private collectClusters(): ClusterInfo[] {
        const communes = this.collectCommuneClusters();
        if (communes) return communes;
        return this.collectProximityClusters();
    }

    private collectProximityClusters(): ClusterInfo[] {
        const clusters: ClusterInfo[] = [];
        for (const sourceId of this.getSourceIds()) {
            for (const feature of this.map!.querySourceFeatures(sourceId)) {
                const props = feature.properties;
                if (!props?.cluster || feature.geometry.type !== 'Point') continue;
                clusters.push({
                    key: `${sourceId}_${props.cluster_id}`,
                    sourceId,
                    clusterId: props.cluster_id,
                    coordinates: feature.geometry.coordinates as Coord,
                    pointCount: props.point_count,
                    properties: props,
                });
            }
        }
        return clusters;
    }

    // ---- Regroupement par commune ----------------------------------------------

    /** URLs GeoJSON des sources de centroïdes (principale + départements supplémentaires). */
    private getSourceUrls(): string[] {
        if (!this.map) return [];
        const sources = this.map.getStyle()?.sources ?? {};
        const urls: string[] = [];
        for (const sourceId of this.getSourceIds()) {
            const spec = sources[sourceId] as maplibregl.GeoJSONSourceSpecification | undefined;
            if (spec && typeof spec.data === "string") urls.push(spec.data);
        }
        return urls;
    }

    /** Lance le chargement des GeoJSON manquants ; relance l'affichage à l'arrivée. */
    private ensureRawFeatures(urls: string[]): boolean {
        let allLoaded = true;
        for (const url of urls) {
            if (this.rawFeaturesLoaded.has(url)) continue;
            allLoaded = false;
            if (this.rawFeaturesByUrl.has(url)) continue;
            const promise = fetch(url)
                .then((r) => r.json() as Promise<GeoJSON.FeatureCollection>)
                .then((fc) => fc.features ?? [])
                .catch((): GeoJSON.Feature[] => []);
            this.rawFeaturesByUrl.set(url, promise);
            promise.then((features) => {
                this.rawFeaturesLoaded.set(url, features);
                this.updateMarkers();
            });
        }
        return allLoaded;
    }

    /** Reproduit côté client le filtre territoire de la source. */
    private isInTerritory(props: Record<string, any>): boolean {
        const land = this.landData;
        if (!land?.land_type || !land?.land_id) return true;
        if (land.land_type === "CUSTOM") {
            const customs = props.CUSTOM;
            return Array.isArray(customs) && customs.some((c) => String(c) === String(land.land_id));
        }
        return String(props[land.land_type]) === String(land.land_id);
    }

    private isTrue(value: unknown): boolean {
        return value === true || value === "true";
    }

    private groupByCommune(urls: string[]): CommuneGroup[] {
        const cfg = this.communeGrouping!;
        const groups = new Map<string, CommuneGroup>();
        for (const url of urls) {
            for (const feature of this.rawFeaturesLoaded.get(url) ?? []) {
                const props = feature.properties ?? {};
                if (feature.geometry.type !== "Point" || !this.isInTerritory(props)) continue;
                const increase = this.isTrue(props[cfg.increaseProperty]);
                const decrease = this.isTrue(props[cfg.decreaseProperty]);
                if (!increase && !decrease) continue;
                const code = String(props[cfg.communeProperty] ?? "");
                if (!code) continue;

                let group = groups.get(code);
                if (!group) {
                    group = { code, leaves: [], increase: 0, decrease: 0 };
                    groups.set(code, group);
                }
                group.leaves.push(feature.geometry.coordinates as Coord);
                const surface = Number(props.surface) || 0;
                if (increase) group.increase += surface;
                if (decrease) group.decrease += surface;
            }
        }
        return Array.from(groups.values());
    }

    /**
     * Donuts par commune, ou null s'il faut rester en proximité : regroupement
     * désactivé, données pas encore chargées, ou moins de deux communes visibles.
     */
    private collectCommuneClusters(): ClusterInfo[] | null {
        if (!this.map || !this.communeGrouping) return null;

        const urls = this.getSourceUrls();
        if (urls.length === 0 || !this.ensureRawFeatures(urls)) return null;

        const bounds = this.map.getBounds();
        const groups = this.groupByCommune(urls);
        const visibleCount = groups.filter((g) => g.leaves.some((c) => bounds.contains(c))).length;
        if (visibleCount < OCSGE_DIFF_MIN_COMMUNES_FOR_COMMUNE_MODE) return null;

        const cfg = this.communeGrouping;
        return groups.map((g): ClusterInfo => {
            const n = g.leaves.length;
            const center: Coord = [
                g.leaves.reduce((sum, c) => sum + c[0], 0) / n,
                g.leaves.reduce((sum, c) => sum + c[1], 0) / n,
            ];
            return {
                key: `commune_${g.code}`,
                coordinates: center,
                pointCount: n,
                leaves: g.leaves,
                properties: {
                    cluster: true,
                    point_count: n,
                    [cfg.increaseCountProperty]: g.increase,
                    [cfg.decreaseCountProperty]: g.decrease,
                },
            };
        });
    }

    // ---- Markers (donuts) ------------------------------------------------------

    private createMarkersFromClusters(clusters: ClusterInfo[]): Record<string, maplibregl.Marker> {
        const newMarkers: Record<string, maplibregl.Marker> = {};
        for (const cluster of clusters) {
            newMarkers[cluster.key] = this.createMarkerFromCluster(cluster);
        }
        return newMarkers;
    }

    private createMarkerFromCluster(cluster: ClusterInfo): maplibregl.Marker {
        const { key, coordinates, properties: props } = cluster;

        let marker = this.markers[key];
        if (marker) {
            const oldElement = marker.getElement();
            const isOnScreen = this.markersOnScreen[key] !== undefined;

            if ((oldElement as any)._donutCleanup) {
                (oldElement as any)._donutCleanup();
                delete (oldElement as any)._donutCleanup;
            }

            if (isOnScreen) {
                marker.remove();
            }

            const newElement = this.createDonutElement(props);
            this.addClusterHandlers(newElement, cluster);
            marker = this.markers[key] = new maplibregl.Marker({
                element: newElement
            }).setLngLat(coordinates);

            if (isOnScreen && this.map) {
                marker.addTo(this.map);
            }
        } else {
            const el = this.createDonutElement(props);
            this.addClusterHandlers(el, cluster);
            marker = this.markers[key] = new maplibregl.Marker({
                element: el
            }).setLngLat(coordinates);
        }

        return marker;
    }

    private addClusterHandlers(element: HTMLElement, cluster: ClusterInfo): void {
        element.style.cursor = 'pointer';

        element.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!this.map) return;

            // Le donut va disparaître : on retire sa mise en évidence tout de suite
            // et on ignore les survols pendant l'animation.
            this.clearHover();
            this.hoverSuppressed = true;
            this.map.once('moveend', () => { this.hoverSuppressed = false; });

            if (this.objectsMinZoom !== undefined) {
                this.zoomToClusterExtent(cluster);
                return;
            }
            const source = this.map.getSource(cluster.sourceId!) as any;
            if (!source?.getClusterExpansionZoom) return;
            source.getClusterExpansionZoom(cluster.clusterId).then((zoom: number) => {
                if (this.map) {
                    const targetZoom = Math.max(zoom, this.map.getZoom() + 2);
                    this.map.easeTo({ center: cluster.coordinates, zoom: targetZoom });
                }
            });
        });

        if (this.objectsMinZoom !== undefined) {
            element.addEventListener('mouseenter', () => this.showHover(cluster));
            element.addEventListener('mouseleave', () => {
                if (this.hoveredClusterKey === cluster.key) this.clearHover();
            });
        }
    }

    // ---- Survol d'un donut : zone couverte par ses objets et contour pulsant ----

    private get zoneSourceId(): string {
        return `${this.options.id}-zone-source`;
    }

    private get zoneLayerId(): string {
        return `${this.options.id}-zone-layer`;
    }

    private get zoneOutlineLayerId(): string {
        return `${this.options.id}-zone-outline-layer`;
    }

    private get hoverOutlineSourceId(): string {
        return `${this.options.id}-hover-outline-source`;
    }

    private get hoverOutlineLayerId(): string {
        return `${this.options.id}-hover-outline-layer`;
    }

    private ensureHoverLayers(map: maplibregl.Map): void {
        if (!map.getSource(this.zoneSourceId)) {
            map.addSource(this.zoneSourceId, { type: "geojson", data: EMPTY_FC });
        }
        if (!map.getLayer(this.zoneLayerId)) {
            map.addLayer({
                id: this.zoneLayerId,
                type: "fill",
                source: this.zoneSourceId,
                paint: {
                    "fill-color": OCSGE_DIFF_CLUSTER_HOVER_COLOR,
                    "fill-opacity": OCSGE_DIFF_CLUSTER_ZONE_FILL_OPACITY,
                },
            });
        }
        if (!map.getLayer(this.zoneOutlineLayerId)) {
            map.addLayer({
                id: this.zoneOutlineLayerId,
                type: "line",
                source: this.zoneSourceId,
                paint: {
                    "line-color": OCSGE_DIFF_CLUSTER_HOVER_COLOR,
                    "line-width": 1,
                    "line-opacity": 0.8,
                },
            });
        }
        if (!map.getSource(this.hoverOutlineSourceId)) {
            map.addSource(this.hoverOutlineSourceId, { type: "geojson", data: EMPTY_FC });
        }
        if (!map.getLayer(this.hoverOutlineLayerId)) {
            map.addLayer({
                id: this.hoverOutlineLayerId,
                type: "line",
                source: this.hoverOutlineSourceId,
                layout: { "line-join": "round" },
                paint: {
                    "line-color": OCSGE_DIFF_CLUSTER_HOVER_COLOR,
                    "line-width": OCSGE_DIFF_HOVER_OUTLINE_MIN_WIDTH,
                },
            });
        }
    }

    private setSourceData(sourceId: string, data: GeoJSON.FeatureCollection | GeoJSON.Feature): void {
        if (!this.map) return;
        this.ensureHoverLayers(this.map);
        (this.map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(data);
    }

    /**
     * Enveloppe convexe des objets, tamponnée d'une marge constante à l'écran.
     * Un ou deux objets donnent une pastille ou une capsule.
     */
    private buildZone(leaves: Coord[]): GeoJSON.Feature | null {
        if (!this.map || leaves.length === 0) return null;

        const points = featureCollection(leaves.map((c) => point(c)));
        const shape = (leaves.length >= 3 ? convex(points) : null)
            ?? (leaves.length === 2 ? lineString(leaves) : point(leaves[0]));

        // Mètres par pixel à ce zoom et à cette latitude (projection Web Mercator).
        const lat = this.map.getCenter().lat;
        const metersPerPixel = (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, this.map.getZoom());
        const paddingKm = (OCSGE_DIFF_CLUSTER_ZONE_PADDING_PX * metersPerPixel) / 1000;

        return buffer(shape, paddingKm, { units: "kilometers" }) ?? null;
    }

    /**
     * Polygones des objets du donut : interrogés sur le contour (déjà chargé,
     * même invisible) dans l'emprise de la zone, puis retenus seulement si l'un
     * des centroïdes du donut tombe dedans. Les zones voisines se chevauchent,
     * un simple test « centre dans la zone » prendrait leurs objets.
     */
    private findObjectsInZone(zone: GeoJSON.Feature, leaves: Coord[]): GeoJSON.Feature[] {
        if (!this.map || !this.objectsLayerId || leaves.length === 0) return [];
        const outlinePrefix = `${this.objectsLayerId}-outline`;
        const layers = (this.map.getStyle()?.layers ?? [])
            .map((l) => l.id)
            .filter((id) => id.startsWith(outlinePrefix) && this.map!.getLayer(id));
        if (layers.length === 0) return [];

        const [minX, minY, maxX, maxY] = bbox(zone);
        const sw = this.map.project([minX, minY]);
        const ne = this.map.project([maxX, maxY]);
        const features = this.map.queryRenderedFeatures(
            [[Math.min(sw.x, ne.x), Math.min(sw.y, ne.y)], [Math.max(sw.x, ne.x), Math.max(sw.y, ne.y)]],
            { layers }
        );

        const leafPoints = leaves.map((c) => point(c));
        const containsALeaf = (geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon): boolean => {
            const [pMinX, pMinY, pMaxX, pMaxY] = bbox(geometry);
            return leafPoints.some((leaf) => {
                const [x, y] = leaf.geometry.coordinates;
                return x >= pMinX && x <= pMaxX && y >= pMinY && y <= pMaxY && booleanPointInPolygon(leaf, geometry);
            });
        };

        return features
            .filter((f) => f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon")
            .filter((f) => containsALeaf(f.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon))
            .map((f): GeoJSON.Feature => ({ type: "Feature", properties: {}, geometry: f.geometry }));
    }

    private startPulse(): void {
        if (this.pulseFrame || !this.map) return;
        const map = this.map;
        const tick = (now: number) => {
            if (!map.getLayer(this.hoverOutlineLayerId)) { this.pulseFrame = 0; return; }
            const phase = (1 + Math.sin((2 * Math.PI * now) / OCSGE_DIFF_HOVER_OUTLINE_PULSE_PERIOD_MS)) / 2;
            const width = OCSGE_DIFF_HOVER_OUTLINE_MIN_WIDTH + (OCSGE_DIFF_HOVER_OUTLINE_MAX_WIDTH - OCSGE_DIFF_HOVER_OUTLINE_MIN_WIDTH) * phase;
            map.setPaintProperty(this.hoverOutlineLayerId, "line-width", width);
            this.pulseFrame = requestAnimationFrame(tick);
        };
        this.pulseFrame = requestAnimationFrame(tick);
    }

    private stopPulse(): void {
        if (this.pulseFrame) {
            cancelAnimationFrame(this.pulseFrame);
            this.pulseFrame = 0;
        }
    }

    /** Membres du donut : connus pour une commune, demandés à MapLibre pour un cluster de proximité. */
    private getLeaves(cluster: ClusterInfo): Promise<Coord[]> {
        if (cluster.leaves) return Promise.resolve(cluster.leaves);
        const source = this.map?.getSource(cluster.sourceId!) as maplibregl.GeoJSONSource | undefined;
        if (!source?.getClusterLeaves || cluster.clusterId === undefined || cluster.pointCount > OCSGE_DIFF_CLUSTER_HOVER_MAX_LEAVES) {
            return Promise.resolve([]);
        }
        return source.getClusterLeaves(cluster.clusterId, OCSGE_DIFF_CLUSTER_HOVER_MAX_LEAVES, 0)
            .then((leaves) => leaves
                .filter((leaf) => leaf.geometry.type === "Point")
                .map((leaf) => (leaf.geometry as GeoJSON.Point).coordinates as Coord))
            .catch((): Coord[] => []);
    }

    /** Au survol d'un donut : la zone couverte par ses objets et le contour pulsant de ses polygones. */
    private showHover(cluster: ClusterInfo): void {
        if (!this.map || this.hoverSuppressed) return;
        this.hoveredClusterKey = cluster.key;
        const requestId = ++this.hoverRequestId;

        this.getLeaves(cluster).then((leaves) => {
            // Le survol a changé entre-temps : on ignore cette réponse.
            if (requestId !== this.hoverRequestId || this.hoveredClusterKey !== cluster.key) return;
            const zone = this.buildZone(leaves);
            this.setSourceData(this.zoneSourceId, zone ?? EMPTY_FC);
            const objects = zone ? this.findObjectsInZone(zone, leaves) : [];
            this.setSourceData(this.hoverOutlineSourceId, { type: "FeatureCollection", features: objects });
            if (objects.length > 0) this.startPulse(); else this.stopPulse();
        });
    }

    private clearHover(): void {
        this.hoveredClusterKey = null;
        this.hoverRequestId++;
        this.stopPulse();
        if (this.map?.getSource(this.zoneSourceId)) {
            this.setSourceData(this.zoneSourceId, EMPTY_FC);
            this.setSourceData(this.hoverOutlineSourceId, EMPTY_FC);
        }
    }

    // ---- Gestion des markers --------------------------------------------------

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
    getOptions(): maplibregl.LayerSpecification[] {
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
        } as maplibregl.LayerSpecification];
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
            this.clearHover();
        }
    }

    destroy(): void {
        // Nettoyer tous les listeners
        if (this.map) {
            this.map.off('move', this.updateMarkersBound);
            this.map.off('moveend', this.updateMarkersBound);
            this.map.off('data', this.handleDataBound);
            this.hoverRequestId++;
            this.stopPulse();
            for (const layerId of [this.hoverOutlineLayerId, this.zoneOutlineLayerId, this.zoneLayerId]) {
                if (this.map.getLayer(layerId)) this.map.removeLayer(layerId);
            }
            for (const sourceId of [this.hoverOutlineSourceId, this.zoneSourceId]) {
                if (this.map.getSource(sourceId)) this.map.removeSource(sourceId);
            }
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
