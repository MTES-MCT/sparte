// Relais entre les moteurs de rendu. Une carte par territoire (Highcharts) est dessinée dans le
// rendu même où son cadre arrive ; une carte MapLibre (carreaux, ou toutes les communes du pays)
// met plusieurs images à se dessiner, le temps de charger ses tuiles. Pour que l'écran ne reste
// jamais vide entre deux moteurs, un cadre MapLibre qui succède à la carte d'un autre moteur se
// prépare d'abord sous elle (`staged`) et ne devient le cadre affiché (`shown`) qu'une fois dessiné.
import type { FrameRender, MapFrame } from './frame/types';

export type HandoffState = {
    // Ce que tout l'écran affiche ; null tant qu'aucune vue n'a été complète
    shown: MapFrame | null;
    // Cadre MapLibre en préparation sous la carte affichée
    staged: MapFrame | null;
};

export type HandoffEvent =
    // Un cadre est complet : toutes ses réponses sont là
    | { type: 'ready'; frame: MapFrame }
    // Le cadre en préparation est dessiné, ou a trop tardé à l'être
    | { type: 'painted' | 'timeout'; frameKey: string };

export const NOTHING_SHOWN: HandoffState = { shown: null, staged: null };

// Moteur MapLibre d'un cadre ; null pour une carte par territoire, ou sans cadre
const mapLibreEngineOf = (frame: MapFrame | null): FrameRender['renderer'] | null =>
    frame && frame.render.renderer !== 'territory' ? frame.render.renderer : null;

// Rend le même objet quand rien ne change : un événement répété ou périmé ne redessine rien
export const handoffReducer = (state: HandoffState, event: HandoffEvent): HandoffState => {
    if (event.type === 'ready') {
        const { frame } = event;
        const engine = mapLibreEngineOf(frame);
        // Ce moteur MapLibre n'a encore rien dessiné : la carte affichée reste, le cadre se prépare
        if (engine !== null && engine !== mapLibreEngineOf(state.shown)) return state.staged === frame ? state : { shown: state.shown, staged: frame };
        // Même moteur, ou retour à une carte par territoire : le cadre s'affiche tout de suite,
        // et ce qui se préparait est abandonné
        return state.shown === frame && state.staged === null ? state : { shown: frame, staged: null };
    }
    // Un cadre qui ne se prépare plus (remplacé, abandonné ou déjà affiché) n'a rien à confirmer
    return state.staged?.key === event.frameKey ? { shown: state.staged, staged: null } : state;
};
