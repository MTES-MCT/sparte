import { useCallback, useEffect, useRef } from 'react';

const FOLLOWED = ['pointerdown', 'pointermove'] as const;

// Le dernier geste fait sur la page l'a-t-il été au doigt ? La réponse se lit au moment d'un clic
// ou d'un survol (fonction d'identité stable, sans rendu) : elle dit si l'appui doit lire ou
// ouvrir (voir pressOutcome). Elle suit le geste et non l'appareil : sur un ordinateur à écran
// tactile, la souris retrouve ses infobulles dès qu'elle bouge. Écoutée sur le document en phase
// de capture : elle est connue avant le clic que le navigateur émet après un appui, que le moteur
// de la carte l'ait arrêté ou non.
export const useTouching = (): (() => boolean) => {
    const touch = useRef(false);
    useEffect(() => {
        const follow = (event: Event) => {
            touch.current = (event as PointerEvent).pointerType === 'touch';
        };
        FOLLOWED.forEach((type) => document.addEventListener(type, follow, { capture: true, passive: true }));
        return () => FOLLOWED.forEach((type) => document.removeEventListener(type, follow, { capture: true }));
    }, []);
    return useCallback(() => touch.current, []);
};
