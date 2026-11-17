import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { ViewError, buildFrame, dataSourceOf, viewErrorOf } from '../domain/frame/buildFrame';
import type { MapFrame } from '../domain/frame/types';
import { NOTHING_SHOWN, handoffReducer } from '../domain/handoff';
import type { ViewRequest } from '../domain/viewState';
import type { Indicator } from '../indicators';
import type { MapSources } from './useMapSources';
import { useLast } from './useLast';

// Délai de garde : une carte MapLibre qui tarde à être dessinée (onglet masqué, carte sans taille,
// tuiles lentes) prend quand même la place de la carte affichée
const HANDOFF_TIMEOUT_MS = 3000;

// Deux cadres de la même vue, construits sur les mêmes réponses, affichent la même chose
const showsSameView = (shown: MapFrame, next: MapFrame): boolean =>
    shown.key === next.key && shown.base.baseMap === next.base.baseMap && shown.data.response === next.data.response && shown.communes === next.communes;

export type DisplayedFrame = {
    // Ce que tout l'écran affiche ; null tant qu'aucune vue n'a été complète
    frame: MapFrame | null;
    // Cadre MapLibre complet qui se prépare sous la carte affichée (voir domain/handoff.ts)
    staged: MapFrame | null;
    // La vue demandée n'est pas la vue affichée : elle charge, se prépare, ou son chargement a échoué
    pending: boolean;
    error: ViewError | null;
    // À appeler quand le cadre en préparation est dessiné : il devient le cadre affiché
    confirmPainted: (frameKey: string) => void;
};

// Vue affichée : le cadre de la vue demandée dès que toutes ses réponses sont là, le dernier
// cadre complet en attendant. L'écran passe ainsi d'une vue à la suivante en un seul rendu.
export const useDisplayedFrame = (request: ViewRequest, indicator: Indicator, sources: MapSources): DisplayedFrame => {
    // Seules les réponses de la demande comptent, et seule celle que l'indicateur lit : l'arrivée
    // de l'autre ne doit pas produire un nouveau cadre
    const source = dataSourceOf(indicator);
    const base = sources.base.current;
    const conso = source === 'conso' ? sources.conso.current : undefined;
    const artif = source === 'artif' ? sources.artif.current : undefined;
    // Valeurs par commune : la requête n'est faite que pour la vue qui les dessine
    const values = sources.values.current;
    const candidate = useMemo(() => buildFrame({ request, indicator, base, conso, artif, values }), [request, indicator, base, conso, artif, values]);
    const complete = useLast(candidate, showsSameView);

    // Le dernier cadre complet entre dans le relais pendant le rendu : une carte par territoire
    // est affichée dans le rendu même où elle arrive. État ajusté pendant le rendu : React rend
    // de nouveau aussitôt, sans image intermédiaire.
    const [stored, dispatch] = useReducer(handoffReducer, NOTHING_SHOWN);
    const handoff = complete ? handoffReducer(stored, { type: 'ready', frame: complete }) : stored;
    if (handoff !== stored) dispatch({ type: 'ready', frame: complete });

    const stagedKey = handoff.staged?.key ?? null;
    useEffect(() => {
        if (stagedKey === null) return undefined;
        const timer = setTimeout(() => dispatch({ type: 'timeout', frameKey: stagedKey }), HANDOFF_TIMEOUT_MS);
        return () => clearTimeout(timer);
    }, [stagedKey]);
    const confirmPainted = useCallback((frameKey: string) => dispatch({ type: 'painted', frameKey }), []);

    return {
        frame: handoff.shown,
        staged: handoff.staged,
        pending: candidate === null || handoff.staged !== null,
        error: viewErrorOf(indicator, sources),
        confirmPainted,
    };
};
