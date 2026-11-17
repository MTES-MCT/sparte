import { COMMUNES_CONSO_EVOLUTION, COMMUNES_CONSO_SHARE } from '../__fixtures__/communesFixtures';
import {
    ARTIF_FRANCE_BY_REGION,
    CONSO_FRANCE_BY_DEPARTEMENT,
    CONSO_FRANCE_BY_REGION,
    CONSO_FRANCE_BY_REGION_IN_2024,
    FRANCE_BY_DEPARTEMENT,
    FRANCE_BY_REGION,
} from '../__fixtures__/nationalMapFixtures';
import { artifFrame, communesFrame, consoFrame } from '../__fixtures__/frames';
import { ZONE_FRANCE } from '../zones';
import type { MapFrame } from './frame/types';
import { HandoffEvent, HandoffState, NOTHING_SHOWN, handoffReducer } from './handoff';

// Deux cartes par territoire (Highcharts) et deux cartes carroyées (MapLibre) de la même zone
const SYMBOLS = consoFrame(ZONE_FRANCE, FRANCE_BY_REGION, 'conso_ha', CONSO_FRANCE_BY_REGION);
const CHOROPLETH = artifFrame(ZONE_FRANCE, FRANCE_BY_REGION, 'artif_pct', ARTIF_FRANCE_BY_REGION);
const GRID = consoFrame(ZONE_FRANCE, FRANCE_BY_REGION, 'conso_ha_gridded', CONSO_FRANCE_BY_REGION);
const GRID_IN_2024 = consoFrame(ZONE_FRANCE, FRANCE_BY_REGION, 'conso_ha_gridded', CONSO_FRANCE_BY_REGION_IN_2024);
// Deux cartes de toutes les communes du pays (MapLibre aussi, mais un autre moteur que les carreaux)
const BY_DEPARTEMENT = { base: FRANCE_BY_DEPARTEMENT, conso: CONSO_FRANCE_BY_DEPARTEMENT };
const COMMUNES = communesFrame(ZONE_FRANCE, 'conso_pct_surface', COMMUNES_CONSO_SHARE, BY_DEPARTEMENT);
const COMMUNES_EVOLUTION = communesFrame(ZONE_FRANCE, 'conso_evolution_between_periods', COMMUNES_CONSO_EVOLUTION, BY_DEPARTEMENT);

const ready = (frame: MapFrame): HandoffEvent => ({ type: 'ready', frame });
const painted = (frame: MapFrame): HandoffEvent => ({ type: 'painted', frameKey: frame.key });
const timeout = (frame: MapFrame): HandoffEvent => ({ type: 'timeout', frameKey: frame.key });

const after = (...events: HandoffEvent[]): HandoffState => events.reduce(handoffReducer, NOTHING_SHOWN);

describe('handoffReducer', () => {
    describe('carte par territoire', () => {
        it('s’affiche dès que son cadre est complet', () => {
            expect(after(ready(SYMBOLS))).toEqual({ shown: SYMBOLS, staged: null });
        });

        it('remplace tout de suite une autre carte par territoire', () => {
            expect(after(ready(SYMBOLS), ready(CHOROPLETH))).toEqual({ shown: CHOROPLETH, staged: null });
        });

        it('remplace tout de suite une carte carroyée', () => {
            expect(after(ready(SYMBOLS), ready(GRID), painted(GRID), ready(CHOROPLETH))).toEqual({ shown: CHOROPLETH, staged: null });
        });
    });

    describe('carte carroyée après une carte par territoire', () => {
        it('se prépare sous la carte affichée, qui reste', () => {
            expect(after(ready(SYMBOLS), ready(GRID))).toEqual({ shown: SYMBOLS, staged: GRID });
        });

        it.each([
            ['son fond est dessiné', painted],
            ['son fond a trop tardé', timeout],
        ])('prend la place de la carte affichée quand %s', (_reason, release) => {
            expect(after(ready(SYMBOLS), ready(GRID), release(GRID))).toEqual({ shown: GRID, staged: null });
        });

        it('est remplacée, encore en préparation, par la carte carroyée d’une autre période', () => {
            expect(after(ready(SYMBOLS), ready(GRID), ready(GRID_IN_2024))).toEqual({ shown: SYMBOLS, staged: GRID_IN_2024 });
        });

        it('ignore la confirmation d’un cadre qui ne se prépare plus', () => {
            const state = after(ready(SYMBOLS), ready(GRID), ready(GRID_IN_2024));

            expect(handoffReducer(state, painted(GRID))).toBe(state);
            expect(handoffReducer(state, timeout(GRID))).toBe(state);
        });

        it('est abandonnée si une carte par territoire est demandée avant qu’elle soit prête', () => {
            const state = after(ready(SYMBOLS), ready(GRID), ready(CHOROPLETH));

            expect(state).toEqual({ shown: CHOROPLETH, staged: null });
            expect(handoffReducer(state, painted(GRID))).toBe(state);
        });

        it('est abandonnée au retour à la carte encore affichée', () => {
            expect(after(ready(SYMBOLS), ready(GRID), ready(SYMBOLS))).toEqual({ shown: SYMBOLS, staged: null });
        });
    });

    describe('carte carroyée sans carte affichée', () => {
        it('se prépare, sans rien afficher, puis s’affiche une fois son fond dessiné', () => {
            expect(after(ready(GRID))).toEqual({ shown: null, staged: GRID });
            expect(after(ready(GRID), painted(GRID))).toEqual({ shown: GRID, staged: null });
        });
    });

    describe('carte carroyée après une carte carroyée', () => {
        it('s’affiche tout de suite : MapLibre est déjà à l’écran', () => {
            expect(after(ready(GRID), painted(GRID), ready(GRID_IN_2024))).toEqual({ shown: GRID_IN_2024, staged: null });
        });
    });

    describe('carte de toutes les communes du pays', () => {
        it('se prépare sous la carte par territoire affichée, puis prend sa place une fois dessinée', () => {
            expect(after(ready(SYMBOLS), ready(COMMUNES))).toEqual({ shown: SYMBOLS, staged: COMMUNES });
            expect(after(ready(SYMBOLS), ready(COMMUNES), painted(COMMUNES))).toEqual({ shown: COMMUNES, staged: null });
            expect(after(ready(SYMBOLS), ready(COMMUNES), timeout(COMMUNES))).toEqual({ shown: COMMUNES, staged: null });
        });

        it('est remplacée tout de suite par une autre carte des communes : la même carte MapLibre change de couleurs', () => {
            expect(after(ready(COMMUNES), painted(COMMUNES), ready(COMMUNES_EVOLUTION))).toEqual({ shown: COMMUNES_EVOLUTION, staged: null });
        });

        it('est remplacée tout de suite par une carte par territoire', () => {
            expect(after(ready(COMMUNES), painted(COMMUNES), ready(SYMBOLS))).toEqual({ shown: SYMBOLS, staged: null });
        });

        it('se prépare aussi sous une carte carroyée, et réciproquement : ce sont deux cartes MapLibre distinctes', () => {
            expect(after(ready(GRID), painted(GRID), ready(COMMUNES))).toEqual({ shown: GRID, staged: COMMUNES });
            expect(after(ready(COMMUNES), painted(COMMUNES), ready(GRID))).toEqual({ shown: COMMUNES, staged: GRID });
            expect(after(ready(COMMUNES), painted(COMMUNES), ready(GRID), painted(GRID))).toEqual({ shown: GRID, staged: null });
        });

        it('se prépare, sans rien afficher, quand aucune carte n’est affichée', () => {
            expect(after(ready(COMMUNES))).toEqual({ shown: null, staged: COMMUNES });
        });
    });

    it('rend le même état pour un événement qui ne change rien', () => {
        const shown = after(ready(SYMBOLS));
        const staged = after(ready(SYMBOLS), ready(GRID));
        const gridShown = after(ready(GRID), painted(GRID));

        expect(handoffReducer(shown, ready(SYMBOLS))).toBe(shown);
        expect(handoffReducer(staged, ready(GRID))).toBe(staged);
        expect(handoffReducer(gridShown, ready(GRID))).toBe(gridShown);
        expect(handoffReducer(gridShown, painted(GRID))).toBe(gridShown);
        expect(handoffReducer(NOTHING_SHOWN, timeout(GRID))).toBe(NOTHING_SHOWN);
    });

    it('ne laisse plus jamais l’écran sans cadre affiché après le premier', () => {
        const events = [ready(SYMBOLS), ready(GRID), timeout(SYMBOLS), ready(GRID_IN_2024), painted(GRID), painted(GRID_IN_2024), ready(CHOROPLETH), ready(GRID), timeout(GRID)];
        const states = events.map((_, index) => after(...events.slice(0, index + 1)));

        expect(states.every((state) => state.shown !== null)).toBe(true);
        expect(states[states.length - 1]).toEqual({ shown: GRID, staged: null });
    });
});
