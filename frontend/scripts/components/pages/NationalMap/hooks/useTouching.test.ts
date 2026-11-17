import { renderHook } from '@testing-library/react';
import { useTouching } from './useTouching';

// jsdom n'a pas d'événements de pointeur : un événement ordinaire en porte le type
const point = (type: string, pointerType: string, target: EventTarget = document.body): void => {
    target.dispatchEvent(Object.assign(new Event(type, { bubbles: true }), { pointerType }));
};

describe('useTouching', () => {
    it('ne tient pas pour un toucher une page où rien n’a encore été pointé', () => {
        const { result } = renderHook(() => useTouching());

        expect(result.current()).toBe(false);
    });

    it('suit le dernier geste : un appui du doigt, puis le retour de la souris', () => {
        const { result } = renderHook(() => useTouching());

        point('pointerdown', 'touch');
        expect(result.current()).toBe(true);
        point('pointermove', 'mouse');
        expect(result.current()).toBe(false);
    });

    it('connaît le geste même si l’élément visé en arrête la propagation', () => {
        const { result } = renderHook(() => useTouching());
        const map = document.body.appendChild(document.createElement('div'));
        map.addEventListener('pointerdown', (event) => event.stopPropagation());

        point('pointerdown', 'touch', map);

        expect(result.current()).toBe(true);
        map.remove();
    });

    it('garde la même fonction d’un rendu à l’autre, et n’écoute plus une fois démonté', () => {
        const { result, rerender, unmount } = renderHook(() => useTouching());
        const touching = result.current;
        rerender();
        expect(result.current).toBe(touching);

        unmount();
        point('pointerdown', 'touch');

        expect(touching()).toBe(false);
    });
});
