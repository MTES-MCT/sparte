// Caméra d'une carte MapLibre de la scène. La carte montre la vue d'ensemble de sa zone au premier
// affichage et à chaque changement de zone. Ensuite, elle n'y est ramenée (nouvelle taille de la
// scène, marges ou contour changés) que si l'utilisateur ne l'a pas déplacée : l'endroit qu'il
// explore n'est jamais perdu sans qu'il le demande. Un bouton « Vue d'ensemble » l'y ramène.
import { RefObject, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type * as maplibregl from 'maplibre-gl';
import type { Bounds } from '../../gridded';
import { fitStageMap, followContainerSize, followUserMoves } from './mapLibre';

// Durée du retour à la vue d'ensemble demandé par l'utilisateur
const OVERVIEW_ANIMATION_MS = 300;

type Overview = {
    bounds: Bounds;
    // Marges laissées autour de l'emprise ; sans elles, celles du socle
    padding?: number | maplibregl.PaddingOptions;
};

type Options = {
    // Zone dessinée : la carte est recadrée quand elle change
    zone: string;
    // Vue d'ensemble de la zone ; null tant qu'elle n'est pas connue
    overview: Overview | null;
    // Durée du recadrage quand la zone change ; sans elle, la carte est cadrée d'un coup
    zoneChangeMs?: number;
};

type OverviewCamera = {
    // L'utilisateur a déplacé la carte depuis son dernier cadrage
    moved: boolean;
    showOverview: () => void;
};

// À appeler après l'effet qui crée la carte : celui de ce hook la lit dans `mapRef` au montage
export const useOverviewCamera = (
    mapRef: RefObject<maplibregl.Map | null>,
    containerRef: RefObject<HTMLElement | null>,
    { zone, overview, zoneChangeMs = 0 }: Options,
): OverviewCamera => {
    const [moved, setMoved] = useState(false);
    // Le déplacement est noté dès la fin du geste, pour les gestionnaires de la carte appelés
    // avant le rendu qui suit
    const movedNow = useRef(false);
    const markMoved = useCallback((value: boolean) => {
        movedNow.current = value;
        setMoved(value);
    }, []);
    // Vue d'ensemble du dernier rendu, lue par les gestionnaires au moment où ils sont appelés
    const shownOverview = useRef(overview);
    useLayoutEffect(() => {
        shownOverview.current = overview;
    });

    useEffect(() => {
        const map = mapRef.current;
        const container = containerRef.current;
        if (!map || !container) return undefined;
        const stopFollowingMoves = followUserMoves(map, () => markMoved(true));
        const stopFollowingSize = followContainerSize(container, map, () => {
            const current = shownOverview.current;
            if (current && !movedNow.current) fitStageMap(map, current.bounds, { padding: current.padding });
        });
        return () => {
            stopFollowingMoves();
            stopFollowingSize();
        };
    }, [mapRef, containerRef, markMoved]);

    const framedZone = useRef<string | null>(null);
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !overview) return;
        const firstFraming = framedZone.current === null;
        const zoneChanged = framedZone.current !== zone;
        if (!zoneChanged && movedNow.current) return;
        fitStageMap(map, overview.bounds, { padding: overview.padding, durationMs: zoneChanged && !firstFraming ? zoneChangeMs : 0 });
        framedZone.current = zone;
        if (zoneChanged) markMoved(false);
    }, [mapRef, overview, zone, zoneChangeMs, markMoved]);

    const showOverview = useCallback(() => {
        const current = shownOverview.current;
        if (!mapRef.current || !current) return;
        fitStageMap(mapRef.current, current.bounds, { padding: current.padding, durationMs: OVERVIEW_ANIMATION_MS });
        markMoved(false);
    }, [mapRef, markMoved]);

    return { moved, showOverview };
};
