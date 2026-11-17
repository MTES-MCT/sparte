import { useCallback, useState } from 'react';
import type { LegendKey } from '../domain/frame/types';

type Focus = {
    // Légende à laquelle ces lignes appartiennent
    scope: string | null;
    hovered: LegendKey | null;
    pinned: LegendKey | null;
};

type LegendFocus = {
    // Ligne survolée dans la légende, ou qui y a le focus
    hovered: LegendKey | null;
    // Ligne épinglée par un clic ou un appui : elle reste en avant sans survol
    pinned: LegendKey | null;
    // Ligne dont les territoires restent nets sur la carte, les autres étant estompés
    dimKey: LegendKey | null;
    hoverLegend: (key: LegendKey | null) => void;
    togglePin: (key: LegendKey) => void;
};

// Ligne de légende mise en avant, par survol ou par épinglage : la seule source de ce que la
// légende et la carte montrent en avant. Elle ne vaut que pour une légende (`scope`, sa signature) :
// dès que la légende affichée en est une autre, plus rien n'est en avant, dans le rendu même où
// elle change, et rien ne revient si la première légende est affichée de nouveau.
export const useLegendFocus = (scope: string | null): LegendFocus => {
    const [stored, setStored] = useState<Focus>({ scope, hovered: null, pinned: null });
    let focus = stored;
    if (stored.scope !== scope) {
        // État ajusté pendant le rendu : React rend de nouveau aussitôt, sans image intermédiaire
        focus = { scope, hovered: null, pinned: null };
        setStored(focus);
    }

    const hoverLegend = useCallback((key: LegendKey | null) => setStored((current) => ({ ...current, hovered: key })), []);
    const togglePin = useCallback(
        (key: LegendKey) => setStored((current) => ({ ...current, pinned: current.pinned === key ? null : key })),
        [],
    );

    const { hovered, pinned } = focus;
    return { hovered, pinned, dimKey: hovered ?? pinned, hoverLegend, togglePin };
};
