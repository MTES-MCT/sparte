import { RefObject, useLayoutEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { StageSize, UNMEASURED_STAGE, resizedStage } from '../domain/stage';

// Taille de la scène, mesurée sur le cadre entier de la carte. La première mesure est prise
// avant la première peinture, pour que la carte soit dessinée d'emblée à sa taille. `onResize`
// (d'identité stable) est appelé à chaque changement de taille du cadre.
export const useStageSize = (frameRef: RefObject<HTMLElement>, onResize: () => void): StageSize => {
    const [stage, setStage] = useState(UNMEASURED_STAGE);

    useLayoutEffect(() => {
        const element = frameRef.current;
        if (!element) return undefined;
        const follow = (width: number, height: number) => setStage((current) => resizedStage(current, width, height));
        const box = element.getBoundingClientRect();
        // Un cadre sans largeur à son montage n'a pas encore de mise en page : il n'est pas tenu pour masqué
        if (box.width > 0) follow(box.width, box.height);
        if (typeof ResizeObserver === 'undefined') return undefined;
        let hidden = false;
        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            // Retour d'une carte masquée : la scène est rendue dans ce rappel même, avant la peinture,
            // pour que la carte qui a changé entre-temps soit dessinée dès la première image du retour
            if (hidden && width > 0) flushSync(() => follow(width, height));
            else follow(width, height);
            hidden = width === 0;
            onResize();
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, [frameRef, onResize]);

    return stage;
};
