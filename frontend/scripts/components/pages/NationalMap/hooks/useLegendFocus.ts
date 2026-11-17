import { useCallback, useState } from 'react';

type Focus = {
    // Légende à laquelle ces lignes appartiennent
    scope: string | null;
    hovered: number | null;
    pinned: number | null;
};

type LegendFocus = {
    // Ligne survolée dans la légende, ou qui y a le focus
    hovered: number | null;
    // Ligne épinglée par un clic ou un appui : elle reste en avant sans survol
    pinned: number | null;
    // Ligne dont les territoires restent nets sur la carte, les autres étant estompés
    dimKey: number | null;
    hoverLegend: (key: number | null) => void;
    togglePin: (key: number) => void;
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

    const hoverLegend = useCallback((key: number | null) => setStored((current) => ({ ...current, hovered: key })), []);
    const togglePin = useCallback(
        (key: number) => setStored((current) => ({ ...current, pinned: current.pinned === key ? null : key })),
        [],
    );

    const { hovered, pinned } = focus;
    return { hovered, pinned, dimKey: hovered ?? pinned, hoverLegend, togglePin };
};
