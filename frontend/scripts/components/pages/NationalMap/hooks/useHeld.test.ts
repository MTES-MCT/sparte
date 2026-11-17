import { renderHook } from '@testing-library/react';
import { useHeld } from './useHeld';

type Props = { value: string | null; hold: boolean };

const follow = (initialProps: Props) => renderHook(({ value, hold }: Props) => useHeld(value, hold), { initialProps });

describe('useHeld', () => {
    it('rend la valeur reçue tant que rien ne la retient', () => {
        const { result, rerender } = follow({ value: 'a', hold: false });
        rerender({ value: 'b', hold: false });

        expect(result.current).toBe('b');
    });

    it('garde la dernière valeur d’avant la retenue, quelles que soient les suivantes', () => {
        const { result, rerender } = follow({ value: 'a', hold: false });
        rerender({ value: 'b', hold: true });
        rerender({ value: 'c', hold: true });

        expect(result.current).toBe('a');
    });

    it('rend la valeur courante dès le rendu où la retenue cesse', () => {
        const seen: (string | null)[] = [];
        const { rerender } = renderHook(
            ({ value, hold }: Props) => {
                const held = useHeld(value, hold);
                seen.push(held);
                return held;
            },
            { initialProps: { value: 'a', hold: true } },
        );
        rerender({ value: 'c', hold: true });
        seen.length = 0;
        rerender({ value: 'c', hold: false });

        expect(seen).toEqual(['c', 'c']);
    });

    it('retient aussi une valeur nulle, et rend une valeur redevenue nulle', () => {
        const { result, rerender } = follow({ value: null, hold: false });
        rerender({ value: 'a', hold: true });

        expect(result.current).toBeNull();

        rerender({ value: 'a', hold: false });
        rerender({ value: null, hold: false });

        expect(result.current).toBeNull();
    });

    it('rend la valeur du premier rendu si elle est retenue d’emblée', () => {
        const { result } = follow({ value: 'a', hold: true });

        expect(result.current).toBe('a');
    });
});
