// Bouchon du socle MapLibre (components/stage/mapLibre.ts) pour les tests Jest : maplibre-gl n'y
// est pas résoluble, et jsdom n'a pas de WebGL. La carte d'essai ne dessine rien : elle consigne
// ce que le moteur lui demande et émet les événements que le test annonce.
//
// À brancher dans un fichier de test par :
//   jest.mock('./mapLibre', () => jest.requireActual('../../__fixtures__/mapLibreStub').mapLibreModule);
import type { MapLabel } from '../components/stage/mapLibre';

type Listener = (event?: unknown) => void;
type Call = { method: string; args: unknown[] };
type StubLayer = { id: string; source?: string; beforeId?: string; filter?: unknown };
type FeatureTarget = { source: string; sourceLayer?: string; id: string };

// Carte d'essai : ce que les moteurs lisent et écrivent sur une carte MapLibre
export class StubMap {
    // Tout ce qui a été demandé à la carte, dans l'ordre
    calls: Call[] = [];
    sources = new Map<string, { spec: unknown; data: unknown }>();
    layers: StubLayer[] = [];
    // État de chaque entité, par source puis par identifiant
    states = new Map<string, Map<string, Record<string, unknown>>>();
    zoom = 5;
    // Zoom maximal demandé ; null : celui de MapLibre
    maxZoom: number | null = null;
    removed = false;
    // Attributs des entités que les tuiles dessinent sous le pointeur
    rendered: Record<string, unknown>[] = [];
    // Attributs des entités dessinées par couche : ce que rend une recherche limitée à des couches
    drawn: Record<string, Record<string, unknown>[]> = {};
    // Forme que les tuiles donnent à une entité, par ses attributs ; sans elle, l'entité n'en a pas
    shapes = new Map<Record<string, unknown>, unknown>();
    // Sources dont des tuiles chargent encore
    loadingSources = new Set<string>();
    private readonly listeners = new Map<string, Set<Listener>>();
    private readonly canvas = { style: { cursor: '' } };

    private record(method: string, ...args: unknown[]): void {
        this.calls.push({ method, args });
    }

    on(type: string, listener: Listener): void {
        const listeners = this.listeners.get(type) ?? new Set<Listener>();
        this.listeners.set(type, listeners);
        listeners.add(listener);
    }

    once(type: string, listener: Listener): void {
        const wrapped: Listener & { original?: Listener } = (event) => {
            this.off(type, wrapped);
            listener(event);
        };
        wrapped.original = listener;
        this.on(type, wrapped);
    }

    off(type: string, listener: Listener): void {
        const listeners = this.listeners.get(type);
        listeners?.forEach((registered: Listener & { original?: Listener }) => {
            if (registered === listener || registered.original === listener) listeners.delete(registered);
        });
    }

    // La carte émet un événement, comme MapLibre le fait ; à appeler dans act()
    fire(type: string, event: Record<string, unknown> = {}): void {
        [...(this.listeners.get(type) ?? [])].forEach((listener) => listener({ point: { x: 0, y: 0 }, lngLat: { lng: 0, lat: 0 }, ...event }));
    }

    addSource(id: string, spec: { data?: unknown }): void {
        this.record('addSource', id, spec);
        this.sources.set(id, { spec, data: spec.data });
    }

    getSource(id: string): { setData: (data: unknown) => void } | undefined {
        const source = this.sources.get(id);
        return (
            source && {
                setData: (data) => {
                    this.record('setData', id, data);
                    source.data = data;
                },
            }
        );
    }

    isSourceLoaded(id: string): boolean {
        return this.sources.has(id) && !this.loadingSources.has(id);
    }

    addLayer(layer: StubLayer, beforeId?: string): void {
        this.record('addLayer', layer, beforeId);
        this.layers.push({ ...layer, beforeId });
    }

    getLayer(id: string): StubLayer | undefined {
        return this.layers.find((layer) => layer.id === id);
    }

    setFeatureState(target: FeatureTarget, state: Record<string, unknown>): void {
        this.record('setFeatureState', target, state);
        const states = this.states.get(target.source) ?? new Map<string, Record<string, unknown>>();
        this.states.set(target.source, states);
        states.set(target.id, { ...states.get(target.id), ...state });
    }

    setFilter(layerId: string, filter: unknown): void {
        this.record('setFilter', layerId, filter);
        this.getLayer(layerId).filter = filter;
    }

    setPaintProperty(layerId: string, name: string, value: unknown): void {
        this.record('setPaintProperty', layerId, name, value);
    }

    setLayoutProperty(layerId: string, name: string, value: unknown): void {
        this.record('setLayoutProperty', layerId, name, value);
    }

    removeLayer(id: string): void {
        this.record('removeLayer', id);
        this.layers = this.layers.filter((layer) => layer.id !== id);
    }

    removeSource(id: string): void {
        this.record('removeSource', id);
        this.sources.delete(id);
    }

    // Comme MapLibre : un point puis des options, ou des options seules pour toute la vue
    queryRenderedFeatures(first?: unknown, second?: { layers?: string[] }): { properties: Record<string, unknown>; layer?: { id: string }; geometry?: unknown }[] {
        const options = second ?? (first as { layers?: string[] } | undefined);
        const layered = (options?.layers ?? []).flatMap((id) => (this.drawn[id] ?? []).map((properties) => ({ properties, layer: { id }, geometry: this.shapes.get(properties) })));
        return [...this.rendered.map((properties) => ({ properties, geometry: this.shapes.get(properties) })), ...layered];
    }

    // Un degré vaut dix pixels
    project([lng, lat]: [number, number]): { x: number; y: number } {
        return { x: lng * 10, y: lat * 10 };
    }

    getCanvas(): { style: { cursor: string } } {
        return this.canvas;
    }

    getZoom(): number {
        return this.zoom;
    }

    setLayerZoomRange(layerId: string, minZoom: number, maxZoom: number): void {
        this.record('setLayerZoomRange', layerId, minZoom, maxZoom);
    }

    setMaxZoom(maxZoom: number | null): void {
        this.record('setMaxZoom', maxZoom);
        this.maxZoom = maxZoom;
    }

    // La carte passe à un zoom, comme sous la molette ; à appeler dans act()
    zoomTo(zoom: number): void {
        this.zoom = zoom;
        this.fire('zoom');
    }

    triggerRepaint(): void {
        this.record('triggerRepaint');
    }

    remove(): void {
        this.removed = true;
    }

    // État d'une entité d'une source
    stateOf(source: string, id: string): Record<string, unknown> {
        return this.states.get(source)?.get(id) ?? {};
    }

    // Demandes d'une méthode faites à la carte depuis le repère donné (voir mark)
    callsOf(method: string, since = 0): unknown[][] {
        return this.calls.slice(since).filter((call) => call.method === method).map((call) => call.args);
    }

    // Repère dans la suite des demandes : celles qui suivent se lisent par callsOf(méthode, repère)
    mark(): number {
        return this.calls.length;
    }
}

type Fit = { map: StubMap; bounds: unknown; padding: unknown; durationMs: number };

type MapLibreStub = {
    // Cartes créées depuis la dernière remise à zéro, dans l'ordre
    maps: StubMap[];
    // Options de création de chaque carte
    creations: { controls: string; maxZoom?: number }[];
    // Le navigateur sait créer une carte (WebGL présent)
    webgl: boolean;
    // Présence du fichier de tuiles ; null tant qu'elle n'est pas connue
    tilesAvailable: boolean | null;
    // Fichiers de tuiles absents, par la fin de leur adresse, quand les autres sont présents
    missingFiles: string[];
    // Adresses de tuiles dont la présence a été demandée
    tilesUrls: (string | null)[];
    // Préparations de carte demandées avant sa création, avec l'adresse de tuiles donnée
    prepared: (string | null)[];
    // Cadrages demandés, dans l'ordre
    fits: Fit[];
    // Étiquettes posées sur la carte
    labels: MapLabel[];
    // Infobulle affichée, null si aucune
    tooltip: { name: string; value: string } | null;
    // Pastille de l'infobulle affichée : la couleur de la classe de l'élément, null sans classe
    tooltipSwatch: string | null;
    // Point où le repère du toucher est posé, null s'il ne l'est pas
    touchMark: unknown;
    // Annonce une nouvelle taille du conteneur de la carte ; à appeler dans act()
    resize: () => void;
    reset: () => void;
};

const NO_RESIZE = (): void => undefined;

export const mapLibreStub: MapLibreStub = {
    maps: [],
    creations: [],
    webgl: true,
    tilesAvailable: true,
    missingFiles: [],
    tilesUrls: [],
    prepared: [],
    fits: [],
    labels: [],
    tooltip: null,
    tooltipSwatch: null,
    touchMark: null,
    resize: NO_RESIZE,
    reset: () => {
        mapLibreStub.maps = [];
        mapLibreStub.creations = [];
        mapLibreStub.webgl = true;
        mapLibreStub.tilesAvailable = true;
        mapLibreStub.missingFiles = [];
        mapLibreStub.tilesUrls = [];
        mapLibreStub.prepared = [];
        mapLibreStub.fits = [];
        mapLibreStub.labels = [];
        mapLibreStub.tooltip = null;
        mapLibreStub.tooltipSwatch = null;
        mapLibreStub.touchMark = null;
        mapLibreStub.resize = NO_RESIZE;
    },
};

export const mapLibreModule = {
    __esModule: true,
    MapContainer: 'div',
    STAGE_BACKGROUND_COLOR: '#ffffff',
    createStageMap: (_container: HTMLElement, options: { controls: string; maxZoom?: number }): StubMap | null => {
        if (!mapLibreStub.webgl) return null;
        const map = new StubMap();
        mapLibreStub.maps.push(map);
        mapLibreStub.creations.push(options);
        return map;
    },
    prepareStageMap: (tilesUrl: string | null): void => {
        mapLibreStub.prepared.push(tilesUrl);
    },
    useTilesAvailability: (url: string | null): boolean | null => {
        mapLibreStub.tilesUrls.push(url);
        return url ? mapLibreStub.tilesAvailable : null;
    },
    useTilesAvailabilities: (urls: string[]): Record<string, boolean> =>
        Object.fromEntries(urls.map((url) => [url, !mapLibreStub.missingFiles.some((file) => url.endsWith(file))])),
    fitStageMap: (map: StubMap, bounds: unknown, { padding, durationMs = 0 }: { padding?: unknown; durationMs?: number } = {}): void => {
        mapLibreStub.fits.push({ map, bounds, padding, durationMs });
    },
    // Sur la carte d'essai, tout « moveend » émis par un test est un geste de l'utilisateur : les
    // cadrages de la page n'y déplacent rien
    followUserMoves: (map: StubMap, onMoved: () => void): (() => void) => {
        map.on('moveend', onMoved);
        return () => map.off('moveend', onMoved);
    },
    followContainerSize: (_container: HTMLElement, _map: StubMap, onResized: () => void): (() => void) => {
        mapLibreStub.resize = onResized;
        return () => {
            mapLibreStub.resize = NO_RESIZE;
        };
    },
    createTooltip: () => ({
        show: (_lngLat: unknown, { name, valueText, swatch = null }: { name: string; valueText: string; swatch?: string | null }) => {
            mapLibreStub.tooltip = { name, value: valueText };
            mapLibreStub.tooltipSwatch = swatch;
        },
        hide: () => {
            mapLibreStub.tooltip = null;
            mapLibreStub.tooltipSwatch = null;
        },
    }),
    createTouchMark: () => ({
        show: (lngLat: unknown) => {
            mapLibreStub.touchMark = lngLat;
        },
        hide: () => {
            mapLibreStub.touchMark = null;
        },
    }),
    addLabels: (_map: StubMap, labels: MapLabel[]): (() => void) => {
        mapLibreStub.labels = labels;
        return () => {
            mapLibreStub.labels = [];
        };
    },
};
