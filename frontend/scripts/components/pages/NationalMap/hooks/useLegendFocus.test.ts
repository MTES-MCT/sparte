import { act, renderHook } from '@testing-library/react';
import { ZONE_FRANCE } from '../zones';
import { consoFrame } from '../__fixtures__/frames';
import {
    BRETAGNE_BY_DEPARTEMENT,
    CONSO_BRETAGNE_BY_DEPARTEMENT,
    CONSO_FRANCE_BY_REGION,
    CONSO_FRANCE_BY_REGION_IN_2024,
    FRANCE_BY_REGION,
} from '../__fixtures__/nationalMapFixtures';
import { useLegendFocus } from './useLegendFocus';

const follow = (scope: string | null) => renderHook(({ current }: { current: string | null }) => useLegendFocus(current), { initialProps: { current: scope } });

// Ce que la légende et la carte lisent
const shown = ({ hovered, pinned, dimKey }: ReturnType<typeof useLegendFocus>) => ({ hovered, pinned, dimKey });

const NOTHING = { hovered: null as number | null, pinned: null as number | null, dimKey: null as number | null };

describe('useLegendFocus', () => {
    it('ne met rien en avant au départ', () => {
        expect(shown(follow('a').result.current)).toEqual(NOTHING);
    });

    it('estompe la carte autour de la ligne survolée dans la légende', () => {
        const { result } = follow('a');
        act(() => result.current.hoverLegend(2));

        expect(shown(result.current)).toEqual({ hovered: 2, pinned: null, dimKey: 2 });

        act(() => result.current.hoverLegend(null));

        expect(shown(result.current)).toEqual(NOTHING);
    });

    it('épingle la ligne cliquée et la libère au second clic', () => {
        const { result } = follow('a');
        act(() => result.current.togglePin(1));

        expect(shown(result.current)).toEqual({ hovered: null, pinned: 1, dimKey: 1 });

        act(() => result.current.togglePin(1));

        expect(shown(result.current)).toEqual(NOTHING);
    });

    it('remplace la ligne épinglée par une autre ligne cliquée', () => {
        const { result } = follow('a');
        act(() => result.current.togglePin(1));
        act(() => result.current.togglePin(3));

        expect(result.current.pinned).toBe(3);
    });

    it('donne la priorité à la ligne survolée sur la ligne épinglée, puis revient à celle-ci', () => {
        const { result } = follow('a');
        act(() => result.current.togglePin(1));
        act(() => result.current.hoverLegend(3));

        expect(shown(result.current)).toEqual({ hovered: 3, pinned: 1, dimKey: 3 });

        act(() => result.current.hoverLegend(null));

        expect(shown(result.current)).toEqual({ hovered: null, pinned: 1, dimKey: 1 });
    });

    it('garde ce qui est en avant tant que la légende reste la même', () => {
        const { result, rerender } = follow('a');
        act(() => result.current.togglePin(1));
        rerender({ current: 'a' });

        expect(result.current.pinned).toBe(1);
    });

    it('ne met plus rien en avant dès le rendu où la légende change', () => {
        const rendered: ReturnType<typeof shown>[] = [];
        const { result, rerender } = renderHook(
            ({ current }: { current: string }) => {
                const focus = useLegendFocus(current);
                rendered.push(shown(focus));
                return focus;
            },
            { initialProps: { current: 'a' } },
        );
        act(() => result.current.togglePin(1));
        act(() => result.current.hoverLegend(2));
        rendered.length = 0;
        rerender({ current: 'b' });

        expect(rendered).not.toHaveLength(0);
        rendered.forEach((focus) => expect(focus).toEqual(NOTHING));
    });

    it('n’hérite pas d’une ligne épinglée dans une autre légende quand on en survole ou épingle une', () => {
        const { result, rerender } = follow('a');
        act(() => result.current.togglePin(1));
        rerender({ current: 'b' });
        act(() => result.current.hoverLegend(2));

        expect(shown(result.current)).toEqual({ hovered: 2, pinned: null, dimKey: 2 });

        rerender({ current: 'c' });
        act(() => result.current.togglePin(1));

        expect(shown(result.current)).toEqual({ hovered: null, pinned: 1, dimKey: 1 });
    });

    it('ne rend pas en avant, au retour sur une légende, ce qui y était avant d’en changer', () => {
        const { result, rerender } = follow('a');
        act(() => result.current.togglePin(1));
        act(() => result.current.hoverLegend(2));
        rerender({ current: 'b' });
        rerender({ current: 'a' });

        expect(shown(result.current)).toEqual(NOTHING);
    });

    describe('avec les légendes des cartes', () => {
        const signature = (indicatorId: string, conso = CONSO_FRANCE_BY_REGION): string =>
            consoFrame(ZONE_FRANCE, FRANCE_BY_REGION, indicatorId, conso).legend.signature;

        it('garde la classe de carreaux épinglée d’une période à l’autre : les classes du carroyage sont fixes', () => {
            const { result, rerender } = follow(signature('conso_ha_gridded'));
            act(() => result.current.togglePin(2));
            rerender({ current: signature('conso_ha_gridded', CONSO_FRANCE_BY_REGION_IN_2024) });

            expect(result.current.pinned).toBe(2);
        });

        it('garde la classe de carreaux épinglée d’une destination à l’autre : leurs classes sont les mêmes', () => {
            const { result, rerender } = follow(signature('conso_ha_gridded'));
            act(() => result.current.togglePin(3));
            rerender({ current: signature('conso_habitat_ha_gridded') });
            rerender({ current: signature('conso_route_ha_gridded', CONSO_FRANCE_BY_REGION_IN_2024) });

            expect(result.current.pinned).toBe(3);
        });

        it('perd la classe de carreaux épinglée au changement de zone', () => {
            const { result, rerender } = follow(signature('conso_ha_gridded'));
            act(() => result.current.togglePin(2));
            rerender({ current: consoFrame('REGION_53', BRETAGNE_BY_DEPARTEMENT, 'conso_ha_gridded', CONSO_BRETAGNE_BY_DEPARTEMENT).legend.signature });

            expect(result.current.pinned).toBeNull();
        });

        it('perd la classe épinglée d’un aplat quand la période change ses bornes', () => {
            const { result, rerender } = follow(signature('conso_pct_surface'));
            act(() => result.current.togglePin(1));
            rerender({ current: signature('conso_pct_surface', CONSO_FRANCE_BY_REGION_IN_2024) });

            expect(result.current.pinned).toBeNull();
        });

        it('perd la classe épinglée au changement d’indicateur', () => {
            const { result, rerender } = follow(signature('conso_pct_surface'));
            act(() => result.current.togglePin(1));
            rerender({ current: signature('conso_evolution_between_periods') });

            expect(result.current.pinned).toBeNull();
        });
    });
});
