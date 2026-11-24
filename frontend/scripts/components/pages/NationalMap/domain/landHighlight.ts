// Territoire mis en avant d'une vue à l'autre : celui que le pointeur survole sur la carte est
// désigné dans le nuage de points, et inversement. Les deux vues se parlent par ce canal, sans
// état React : un survol ne rend aucun composant de nouveau, chaque vue retouche son graphique.

// Vues qui désignent un territoire
export type HighlightView = 'map' | 'scatter';

// Appelé avec l'identifiant du territoire qu'une autre vue désigne ; null quand elle n'en désigne plus
type HighlightListener = (landId: string | null) => void;

export type LandHighlight = {
    // `view` désigne un territoire, ou n'en désigne plus (null)
    publish: (view: HighlightView, landId: string | null) => void;
    // `view` écoute ce que les autres vues désignent ; rend de quoi cesser d'écouter
    subscribe: (view: HighlightView, listener: HighlightListener) => () => void;
};

export const createLandHighlight = (): LandHighlight => {
    const listeners = new Set<{ view: HighlightView; notify: HighlightListener }>();
    return {
        publish: (view, landId) =>
            listeners.forEach((listener) => {
                // Une vue n'est pas prévenue de ce qu'elle désigne elle-même : son graphique le montre déjà
                if (listener.view !== view) listener.notify(landId);
            }),
        subscribe: (view, notify) => {
            const listener = { view, notify };
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
    };
};
