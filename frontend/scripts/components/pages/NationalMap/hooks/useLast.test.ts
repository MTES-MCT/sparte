import { renderHook } from '@testing-library/react';
import { useLast } from './useLast';

type Value = { id: number } | null;

const follow = (initial: Value, isSame?: (previous: { id: number }, next: { id: number }) => boolean) =>
    renderHook(({ value }: { value: Value }) => useLast(value, isSame), { initialProps: { value: initial } });

describe('useLast', () => {
    it('ne rend rien tant qu’aucune valeur n’a été donnée', () => {
        expect(follow(null).result.current).toBeNull();
    });

    it('rend la valeur courante quand il y en a une', () => {
        const first = { id: 1 };
        const second = { id: 2 };
        const { result, rerender } = follow(first);

        expect(result.current).toBe(first);

        rerender({ value: second });

        expect(result.current).toBe(second);
    });

    it('garde la dernière valeur quand elle vient à manquer', () => {
        const first = { id: 1 };
        const { result, rerender } = follow(first);
        rerender({ value: null });

        expect(result.current).toBe(first);
    });

    it('garde l’identité d’une valeur rendue plusieurs fois', () => {
        const first = { id: 1 };
        const { result, rerender } = follow(first);
        rerender({ value: first });
        rerender({ value: null });
        rerender({ value: first });

        expect(result.current).toBe(first);
    });

    it('rend la valeur précédente à la place d’une valeur équivalente', () => {
        const first = { id: 1 };
        const sameId = (previous: { id: number }, next: { id: number }) => previous.id === next.id;
        const { result, rerender } = follow(first, sameId);
        rerender({ value: { id: 1 } });

        expect(result.current).toBe(first);

        const second = { id: 2 };
        rerender({ value: second });

        expect(result.current).toBe(second);
    });
});
