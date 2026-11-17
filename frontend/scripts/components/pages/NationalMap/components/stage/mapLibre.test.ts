import { createStageMap, fitStageMap, followContainerSize, followUserMoves, prepareStageMap } from './mapLibre';

// Le socle des cartes MapLibre, sur une fausse bibliothèque : maplibre-gl n'est pas résoluble par
// Jest, et jsdom n'a pas de WebGL. La fausse carte consigne ce que le socle lui demande et émet
// les événements de déplacement comme MapLibre : avec les données jointes à l'appel, et sans
// donnée quand un plancher de zoom relevé la déplace.

type Listener = (event: Record<string, unknown>) => void;
type Camera = { zoom: number; center?: [number, number] };

jest.mock(
    'maplibre-gl',
    () => {
        class FakeMap {
            static instances: FakeMap[] = [];
            static webgl = true;
            calls: string[] = [];
            zoom = 5;
            // Zoom du cadrage que la carte calcule pour une emprise ; NaN sans taille
            fitZoom = 4;
            gestures = { enabled: false };
            cooperativeGestures = {
                enable: () => {
                    this.gestures.enabled = true;
                },
                disable: () => {
                    this.gestures.enabled = false;
                },
            };
            touchZoomRotate = { disableRotation: (): void => undefined };
            keyboard = { disableRotation: (): void => undefined };
            controls: string[] = [];
            private readonly listeners = new Map<string, Listener[]>();

            constructor(readonly options: Record<string, unknown>) {
                if (!FakeMap.webgl) throw new Error('WebGL indisponible');
                this.gestures.enabled = options.cooperativeGestures === true;
                FakeMap.instances.push(this);
            }

            on(type: string, listener: Listener): void {
                this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
            }

            once(type: string, listener: Listener): void {
                this.on(type, listener);
            }

            off(type: string, listener: Listener): void {
                this.listeners.set(
                    type,
                    (this.listeners.get(type) ?? []).filter((registered) => registered !== listener),
                );
            }

            fire(type: string, data: Record<string, unknown> = {}): void {
                (this.listeners.get(type) ?? []).forEach((listener) => listener({ type, ...data }));
            }

            addControl(_control: unknown, position: string): void {
                this.controls.push(position);
            }

            cameraForBounds(): Camera {
                return { zoom: this.fitZoom, center: [2, 46] };
            }

            getZoom(): number {
                return this.zoom;
            }

            setMinZoom(zoom: number): void {
                this.calls.push(`setMinZoom ${zoom}`);
                if (this.zoom >= zoom) return;
                this.zoom = zoom;
                this.fire('moveend');
            }

            jumpTo(camera: Camera, data?: Record<string, unknown>): void {
                this.calls.push(`jumpTo ${camera.zoom}`);
                this.zoom = camera.zoom;
                this.fire('moveend', data);
            }

            easeTo(camera: Camera & { duration: number }, data?: Record<string, unknown>): void {
                this.calls.push(`easeTo ${camera.zoom} en ${camera.duration} ms`);
                this.zoom = camera.zoom;
                this.fire('moveend', data);
            }

            resize(data?: Record<string, unknown>): void {
                this.calls.push('resize');
                this.fire('moveend', data);
            }
        }
        const library = {
            __esModule: true,
            Map: FakeMap,
            NavigationControl: class {},
            Popup: class {},
            Marker: class {},
            addProtocol: (): void => undefined,
            prewarms: 0,
            prewarm: (): void => {
                library.prewarms += 1;
            },
        };
        return library;
    },
    { virtual: true },
);
jest.mock(
    'pmtiles',
    () => {
        // Fichier de tuiles dont seul l'en-tête se lit : les lectures sont consignées par adresse
        class FakeArchive {
            static headersRead: string[] = [];

            constructor(readonly url: string) {}

            getHeader(): Promise<object> {
                FakeArchive.headersRead.push(this.url);
                return Promise.resolve({});
            }
        }
        class FakeProtocol {
            tile = (): void => undefined;

            add(): void {}
        }
        return { __esModule: true, PMTiles: FakeArchive, Protocol: FakeProtocol };
    },
    { virtual: true },
);

type FakeMap = {
    options: Record<string, unknown>;
    calls: string[];
    zoom: number;
    fitZoom: number;
    gestures: { enabled: boolean };
    controls: string[];
    fire: (type: string, data?: Record<string, unknown>) => void;
};
const fakeLibrary = (): { Map: { instances: FakeMap[]; webgl: boolean }; prewarms: number } => jest.requireMock('maplibre-gl');
const headersRead = (): string[] => jest.requireMock('pmtiles').PMTiles.headersRead;

// Largeur de fenêtre annoncée aux requêtes de média, et écouteurs de leurs changements
const media = { scrollingPage: false, listeners: [] as ((event: { matches: boolean }) => void)[] };
beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        value: () => ({
            get matches() {
                return media.scrollingPage;
            },
            addEventListener: (_type: string, listener: (event: { matches: boolean }) => void) => media.listeners.push(listener),
            removeEventListener: (): void => undefined,
        }),
    });
});

beforeEach(() => {
    fakeLibrary().Map.instances = [];
    fakeLibrary().Map.webgl = true;
    media.scrollingPage = false;
    media.listeners = [];
});

const BOUNDS: [[number, number], [number, number]] = [
    [-5, 42],
    [8, 51],
];

const create = (): FakeMap => {
    const map = createStageMap(document.createElement('div'), { controls: 'bottom-left' });
    return map as unknown as FakeMap;
};
// La carte telle que le socle la reçoit
const asMap = (map: FakeMap) => map as unknown as Parameters<typeof fitStageMap>[0];

describe('création', () => {
    it('zoome directement à la molette quand la carte tient dans la fenêtre, et suit elle-même sa taille', () => {
        const map = create();

        expect(map.options).toMatchObject({ cooperativeGestures: false, trackResize: false, dragRotate: false });
        expect(map.controls).toEqual(['bottom-left']);
    });

    it('rend les gestes coopératifs quand la page défile sous la carte, et suit le passage d’une largeur à l’autre', () => {
        media.scrollingPage = true;
        const map = create();

        expect(map.options).toMatchObject({ cooperativeGestures: true });

        media.listeners.forEach((listener) => listener({ matches: false }));
        expect(map.gestures.enabled).toBe(false);

        media.listeners.forEach((listener) => listener({ matches: true }));
        expect(map.gestures.enabled).toBe(true);
    });

    it('ne rend pas de carte quand le navigateur ne peut pas la créer', () => {
        fakeLibrary().Map.webgl = false;

        expect(createStageMap(document.createElement('div'), { controls: 'top-right' })).toBeNull();
    });
});

describe('préparation avant la création', () => {
    it('démarre les fils d’exécution de MapLibre, et lit une seule fois l’en-tête du fichier de tuiles', () => {
        const prewarms = fakeLibrary().prewarms;
        prepareStageMap(null);

        expect(fakeLibrary().prewarms).toBe(prewarms + 1);
        expect(headersRead()).toEqual([]);

        prepareStageMap('https://tuiles.test/communes.pmtiles');
        prepareStageMap('https://tuiles.test/communes.pmtiles');

        expect(headersRead()).toEqual(['https://tuiles.test/communes.pmtiles']);
    });
});

describe('cadrage', () => {
    it('pose le plancher de zoom avant de déplacer la carte, d’un coup', () => {
        const map = create();
        fitStageMap(asMap(map), BOUNDS);

        expect(map.calls).toEqual(['setMinZoom 4', 'jumpTo 4']);
    });

    it('n’anime qu’un cadrage qui s’éloigne', () => {
        const away = create();
        away.zoom = 6;
        fitStageMap(asMap(away), BOUNDS, { durationMs: 300 });
        expect(away.calls).toEqual(['setMinZoom 4', 'easeTo 4 en 300 ms']);

        const closer = create();
        closer.zoom = 3;
        fitStageMap(asMap(closer), BOUNDS, { durationMs: 300 });
        expect(closer.calls).toEqual(['setMinZoom 4', 'jumpTo 4']);
    });

    it('ne touche pas à une carte sans taille, dont le cadrage ne se calcule pas', () => {
        const map = create();
        map.fitZoom = Number.NaN;
        fitStageMap(asMap(map), BOUNDS);

        expect(map.calls).toEqual([]);
    });
});

describe('déplacements de l’utilisateur', () => {
    const followed = () => {
        const map = create();
        const onMoved = jest.fn();
        const stop = followUserMoves(asMap(map), onMoved);
        return { map, onMoved, stop };
    };

    it('tient pour un geste tout déplacement que la page n’a pas fait, même sans événement du navigateur', () => {
        const { map, onMoved } = followed();

        // Un cran de molette isolé : MapLibre termine le zoom sans y joindre l'événement d'origine
        map.fire('moveend');
        map.fire('moveend', { originalEvent: {} });

        expect(onMoved).toHaveBeenCalledTimes(2);
    });

    it('cesse de suivre la carte quand on le lui demande', () => {
        const { map, onMoved, stop } = followed();
        stop();
        map.fire('moveend');

        expect(onMoved).not.toHaveBeenCalled();
    });

    it('ne tient pas pour un geste un cadrage de la page, plancher de zoom relevé compris', () => {
        const { map, onMoved } = followed();
        map.zoom = 3;

        fitStageMap(asMap(map), BOUNDS);
        fitStageMap(asMap(map), BOUNDS, { durationMs: 300 });

        expect(map.zoom).toBe(4);
        expect(onMoved).not.toHaveBeenCalled();
    });

    describe('à une nouvelle taille du conteneur', () => {
        type Observed = (entries: { contentRect: { width: number; height: number } }[]) => void;
        let announce: Observed;
        const realObserver = global.ResizeObserver;
        beforeEach(() => {
            global.ResizeObserver = class {
                constructor(callback: Observed) {
                    announce = callback;
                }

                observe(): void {}

                disconnect(): void {}

                unobserve(): void {}
            } as unknown as typeof ResizeObserver;
        });
        afterEach(() => {
            global.ResizeObserver = realObserver;
        });

        it('donne sa taille à la carte sans y voir un geste, puis prévient', () => {
            const { map, onMoved } = followed();
            const onResized = jest.fn();
            followContainerSize(document.createElement('div'), asMap(map), onResized);

            announce([{ contentRect: { width: 800, height: 600 } }]);

            expect(map.calls).toEqual(['resize']);
            expect(onResized).toHaveBeenCalledTimes(1);
            expect(onMoved).not.toHaveBeenCalled();
        });

        it('ignore un conteneur masqué, sans largeur ou sans hauteur', () => {
            const { map } = followed();
            const onResized = jest.fn();
            followContainerSize(document.createElement('div'), asMap(map), onResized);

            announce([{ contentRect: { width: 0, height: 600 } }]);
            announce([{ contentRect: { width: 800, height: 0 } }]);

            expect(map.calls).toEqual([]);
            expect(onResized).not.toHaveBeenCalled();
        });
    });
});
