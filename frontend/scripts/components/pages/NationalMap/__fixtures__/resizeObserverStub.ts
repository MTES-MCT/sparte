// Observateur de taille d'essai : jsdom n'a pas de ResizeObserver et ne calcule aucune mise en
// page. Il consigne ce qu'on lui fait observer et transmet les changements de taille que le test annonce.
type ResizeListener = (entries: { contentRect: { width: number; height: number } }[]) => void;

type ObserverRecord = { listener: ResizeListener; observed: Element[]; disconnected: boolean };

class ResizeObserverStub {
    private readonly record: ObserverRecord;

    constructor(listener: ResizeListener) {
        this.record = { listener, observed: [], disconnected: false };
        resizeObserverStub.observers.push(this.record);
    }

    observe(element: Element): void {
        this.record.observed.push(element);
    }

    disconnect(): void {
        this.record.disconnected = true;
    }
}

export const resizeObserverStub = {
    // Observateurs créés depuis l'installation, dans l'ordre
    observers: [] as ObserverRecord[],
    // À appeler avant chaque test qui observe une taille
    install: (): void => {
        resizeObserverStub.observers = [];
        Object.defineProperty(globalThis, 'ResizeObserver', { configurable: true, writable: true, value: ResizeObserverStub });
    },
    // Rend à jsdom son absence d'observateur
    remove: (): void => {
        Reflect.deleteProperty(globalThis, 'ResizeObserver');
    },
    // Annonce une nouvelle taille à tous les observateurs en service, comme le fait un changement
    // de taille de la fenêtre ; à appeler dans act()
    resize: (width: number, height: number): void =>
        resizeObserverStub.observers.filter((observer) => !observer.disconnected).forEach((observer) => observer.listener([{ contentRect: { width, height } }])),
};
