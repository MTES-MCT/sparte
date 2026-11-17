import { act, renderHook } from '@testing-library/react';
import type { NationalMapArtifIndicators, NationalMapBaseMap, NationalMapIndicators, NationalMapValues } from '@services/api';
import { COMMUNES_CONSO_HA, COMMUNES_CONSO_SHARE } from '../__fixtures__/communesFixtures';
import {
    ARTIF_FRANCE_BY_REGION,
    CONSO_FRANCE_BY_DEPARTEMENT,
    CONSO_FRANCE_BY_REGION,
    FRANCE_BY_DEPARTEMENT,
    FRANCE_BY_REGION,
} from '../__fixtures__/nationalMapFixtures';
import { indicatorOf } from '../__fixtures__/frames';
import type { MapFrame } from '../domain/frame/types';
import type { ViewRequest } from '../domain/viewState';
import type { Indicator } from '../indicators';
import { DisplayedFrame, useDisplayedFrame } from './useDisplayedFrame';
import type { MapSources, SourceState } from './useMapSources';

const BY_REGION: ViewRequest = { zone: 'FRANCE', scale: 'REGION', startYear: 2011, endYear: 2024, indicatorId: 'conso_ha' };
const BY_DEPARTEMENT: ViewRequest = { ...BY_REGION, scale: 'DEPART' };
const CONSO = indicatorOf('conso_ha');
const ARTIF = indicatorOf('artif_pct');
const GRID = indicatorOf('conso_ha_gridded');

// --- Sources pilotées ---------------------------------------------------------------------

type Outcome<T> = T | 'error' | undefined;
type Responses = {
    base?: Outcome<NationalMapBaseMap>;
    conso?: Outcome<NationalMapIndicators>;
    artif?: Outcome<NationalMapArtifIndicators>;
    values?: Outcome<NationalMapValues>;
};

// Une source telle que RTK Query la rend : `latest` garde la dernière réponse pendant que la suivante charge
const sourceOf = <T,>(outcome: Outcome<T>, latest?: T): SourceState<T> => {
    const current = outcome === 'error' ? undefined : outcome;
    return { current, latest: current ?? latest, isError: outcome === 'error' };
};

const sourcesOf = (responses: Responses, previous?: MapSources): MapSources => ({
    base: sourceOf(responses.base, previous?.base.latest),
    conso: sourceOf(responses.conso, previous?.conso.latest),
    artif: sourceOf(responses.artif, previous?.artif.latest),
    values: sourceOf(responses.values, previous?.values.latest),
});

type Step = { request: ViewRequest; indicator: Indicator; responses: Responses };

// Ce que le hook dit de l'écran, sans la fonction par laquelle la carte carroyée confirme son dessin
type Displayed = Omit<DisplayedFrame, 'confirmPainted'>;

// Suit le hook d'étape en étape et consigne ce qu'il rend à CHAQUE rendu
const follow = (first: Step) => {
    const renders: Displayed[] = [];
    let sources = sourcesOf(first.responses);
    const hook = renderHook(
        (props: { request: ViewRequest; indicator: Indicator; sources: MapSources }) => {
            const { confirmPainted, ...displayed } = useDisplayedFrame(props.request, props.indicator, props.sources);
            renders.push(displayed);
            return { displayed, confirmPainted };
        },
        { initialProps: { request: first.request, indicator: first.indicator, sources } },
    );
    return {
        renders,
        current: (): Displayed => hook.result.current.displayed,
        next: ({ request, indicator, responses }: Step): Displayed => {
            sources = sourcesOf(responses, sources);
            hook.rerender({ request, indicator, sources });
            return hook.result.current.displayed;
        },
        // La carte carroyée annonce que le fond d'un cadre est dessiné
        confirmPainted: (frame: MapFrame): Displayed => {
            act(() => hook.result.current.confirmPainted(frame.key));
            return hook.result.current.displayed;
        },
    };
};

const regions = (responses: Responses): Step => ({ request: BY_REGION, indicator: CONSO, responses });
const departements = (responses: Responses): Step => ({ request: BY_DEPARTEMENT, indicator: CONSO, responses });
const LOADED_REGIONS = regions({ base: FRANCE_BY_REGION, conso: CONSO_FRANCE_BY_REGION });
const LOADED_DEPARTEMENTS = departements({ base: FRANCE_BY_DEPARTEMENT, conso: CONSO_FRANCE_BY_DEPARTEMENT });

// Cadres distincts rendus au fil des rendus, dans l'ordre
const framesOf = (renders: Displayed[]): MapFrame[] =>
    renders.map((displayed) => displayed.frame).filter((frame, index, frames) => frame !== null && frame !== frames[index - 1]);

// Un cadre ne mêle jamais deux vues : son fond et ses données ont la même maille
const expectCoherent = (renders: Displayed[]): void =>
    framesOf(renders).forEach((frame) => {
        expect(frame.base.baseMap.scale).toBe(frame.base.scale);
        expect(frame.data.response.scale).toBe(frame.base.scale);
    });

describe('useDisplayedFrame', () => {
    it('n’affiche rien, en attente, tant que la première vue est incomplète', () => {
        const view = follow(regions({}));

        expect(view.current()).toEqual({ frame: null, staged: null, pending: true, error: null });
        expect(view.next(regions({ base: FRANCE_BY_REGION }))).toEqual({ frame: null, staged: null, pending: true, error: null });
        expect(view.next(LOADED_REGIONS)).toMatchObject({ frame: { key: 'FRANCE|REGION|conso_ha|2011-2024' }, pending: false, error: null });
    });

    it('affiche sans attente une vue dont les réponses sont déjà là', () => {
        const view = follow(LOADED_REGIONS);
        view.next(LOADED_DEPARTEMENTS);

        expect(view.renders.every((displayed) => !displayed.pending)).toBe(true);
        expect(framesOf(view.renders).map((frame) => frame.key)).toEqual(['FRANCE|REGION|conso_ha|2011-2024', 'FRANCE|DEPART|conso_ha|2011-2024']);
    });

    describe('d’une maille à l’autre', () => {
        const orders: [string, Responses[]][] = [
            ['le fond puis les données', [{ base: FRANCE_BY_DEPARTEMENT }, { base: FRANCE_BY_DEPARTEMENT, conso: CONSO_FRANCE_BY_DEPARTEMENT }]],
            ['les données puis le fond', [{ conso: CONSO_FRANCE_BY_DEPARTEMENT }, { base: FRANCE_BY_DEPARTEMENT, conso: CONSO_FRANCE_BY_DEPARTEMENT }]],
            ['le fond et les données ensemble', [{ base: FRANCE_BY_DEPARTEMENT, conso: CONSO_FRANCE_BY_DEPARTEMENT }]],
        ];

        it.each(orders)('garde le cadre des régions jusqu’à la dernière réponse (%s), sans jamais mêler deux vues', (_order, arrivals) => {
            const view = follow(LOADED_REGIONS);
            const shown = view.current().frame;

            expect(view.next(departements({}))).toEqual({ frame: shown, staged: null, pending: true, error: null });
            arrivals.slice(0, -1).forEach((responses) => expect(view.next(departements(responses))).toEqual({ frame: shown, staged: null, pending: true, error: null }));
            const arrived = view.next(departements(arrivals[arrivals.length - 1]));

            expect(arrived).toMatchObject({ frame: { key: 'FRANCE|DEPART|conso_ha|2011-2024' }, pending: false });
            expectCoherent(view.renders);
        });

        it.each(orders)('ne change de cadre qu’une fois par navigation (%s)', (_order, arrivals) => {
            const view = follow(LOADED_REGIONS);
            view.next(departements({}));
            arrivals.forEach((responses) => view.next(departements(responses)));
            view.next(LOADED_DEPARTEMENTS);

            expect(framesOf(view.renders)).toHaveLength(2);
        });
    });

    it('garde le cadre affiché et signale l’échec du fond de carte', () => {
        const view = follow(LOADED_REGIONS);
        const shown = view.current().frame;

        expect(view.next(departements({ base: 'error', conso: CONSO_FRANCE_BY_DEPARTEMENT }))).toEqual({ frame: shown, staged: null, pending: true, error: 'base-map' });
    });

    it('garde le cadre affiché et signale l’échec des données', () => {
        const view = follow(LOADED_REGIONS);
        const shown = view.current().frame;

        expect(view.next(departements({ base: FRANCE_BY_DEPARTEMENT, conso: 'error' }))).toEqual({ frame: shown, staged: null, pending: true, error: 'data' });
    });

    describe('réponse que l’indicateur ne lit pas', () => {
        const artif = (responses: Responses): Step => ({ request: { ...BY_REGION, indicatorId: 'artif_pct' }, indicator: ARTIF, responses });

        it('n’est pas attendue pour afficher une carte OCS GE', () => {
            const view = follow(artif({ base: FRANCE_BY_REGION, artif: ARTIF_FRANCE_BY_REGION }));

            expect(view.current()).toMatchObject({ frame: { key: 'FRANCE|REGION|artif_pct' }, pending: false, error: null });
        });

        it('ne change pas le cadre affiché quand elle arrive, ni quand elle échoue', () => {
            const view = follow(artif({ base: FRANCE_BY_REGION, artif: ARTIF_FRANCE_BY_REGION }));
            const shown = view.current().frame;

            expect(view.next(artif({ base: FRANCE_BY_REGION, artif: ARTIF_FRANCE_BY_REGION, conso: CONSO_FRANCE_BY_REGION })).frame).toBe(shown);
            expect(view.next(artif({ base: FRANCE_BY_REGION, artif: ARTIF_FRANCE_BY_REGION, conso: 'error' }))).toEqual({ frame: shown, staged: null, pending: false, error: null });
        });

        it('garde le cadre d’une carte OCS GE quand seule la période demandée change', () => {
            const view = follow(artif({ base: FRANCE_BY_REGION, artif: ARTIF_FRANCE_BY_REGION }));
            const shown = view.current().frame;
            const clamped: Step = { request: { ...BY_REGION, indicatorId: 'artif_pct', endYear: 2023 }, indicator: ARTIF, responses: { base: FRANCE_BY_REGION, artif: ARTIF_FRANCE_BY_REGION } };

            expect(view.next(clamped)).toEqual({ frame: shown, staged: null, pending: false, error: null });
        });
    });

    describe('vers une carte carroyée', () => {
        const gridded = (responses: Responses, request: ViewRequest = BY_REGION): Step => ({
            request: { ...request, indicatorId: 'conso_ha_gridded' },
            indicator: GRID,
            responses,
        });
        const GRID_VIEW = gridded(LOADED_REGIONS.responses);

        beforeEach(() => jest.useFakeTimers());

        afterEach(() => jest.useRealTimers());

        it('garde la carte par territoire affichée, en attente, pendant que la carte carroyée complète se prépare', () => {
            const view = follow(LOADED_REGIONS);
            const shown = view.current().frame;

            expect(view.next(GRID_VIEW)).toMatchObject({ frame: shown, staged: { key: 'FRANCE|REGION|conso_ha_gridded|2011-2024' }, pending: true, error: null });
        });

        it('affiche la carte carroyée quand son fond est dessiné', () => {
            const view = follow(LOADED_REGIONS);
            const { staged } = view.next(GRID_VIEW);

            expect(view.confirmPainted(staged)).toEqual({ frame: staged, staged: null, pending: false, error: null });
        });

        it('affiche la carte carroyée au bout de trois secondes si son fond n’a pas été annoncé dessiné', () => {
            const view = follow(LOADED_REGIONS);
            const { staged } = view.next(GRID_VIEW);
            act(() => jest.advanceTimersByTime(2999));

            expect(view.current().staged).toBe(staged);

            act(() => jest.advanceTimersByTime(1));

            expect(view.current()).toEqual({ frame: staged, staged: null, pending: false, error: null });
        });

        it('prépare la carte carroyée ouverte par son adresse sans rien afficher d’autre', () => {
            const view = follow(GRID_VIEW);
            const { staged } = view.current();

            expect(view.current()).toMatchObject({ frame: null, staged: { key: 'FRANCE|REGION|conso_ha_gridded|2011-2024' }, pending: true });
            expect(view.confirmPainted(staged)).toEqual({ frame: staged, staged: null, pending: false, error: null });
        });

        it('affiche sans préparation la carte carroyée suivante : MapLibre est déjà à l’écran', () => {
            const view = follow(LOADED_REGIONS);
            view.confirmPainted(view.next(GRID_VIEW).staged);
            const byDepartement = view.next(gridded(LOADED_DEPARTEMENTS.responses, BY_DEPARTEMENT));

            expect(byDepartement).toMatchObject({ frame: { key: 'FRANCE|DEPART|conso_ha_gridded|2011-2024' }, staged: null, pending: false });
        });

        it('abandonne la carte carroyée en préparation quand une carte par territoire est demandée, et ignore son dessin tardif', () => {
            const view = follow(LOADED_REGIONS);
            const { staged } = view.next(GRID_VIEW);
            const departements = view.next(LOADED_DEPARTEMENTS);

            expect(departements).toMatchObject({ frame: { key: 'FRANCE|DEPART|conso_ha|2011-2024' }, staged: null, pending: false });
            expect(view.confirmPainted(staged)).toEqual(departements);

            act(() => jest.advanceTimersByTime(3000));

            expect(view.current()).toEqual(departements);
        });

        it('garde la carte carroyée en préparation, puis l’affiche, pendant le chargement de la vue demandée ensuite', () => {
            const view = follow(LOADED_REGIONS);
            const { staged } = view.next(GRID_VIEW);
            view.next(gridded({}, BY_DEPARTEMENT));

            expect(view.confirmPainted(staged)).toEqual({ frame: staged, staged: null, pending: true, error: null });
        });

        it('revient tout de suite à une carte par territoire depuis la carte carroyée', () => {
            const view = follow(LOADED_REGIONS);
            view.confirmPainted(view.next(GRID_VIEW).staged);

            expect(view.next(LOADED_REGIONS)).toMatchObject({ frame: { key: 'FRANCE|REGION|conso_ha|2011-2024' }, staged: null, pending: false });
        });

        it('ne laisse jamais l’écran sans cadre affiché', () => {
            const view = follow(LOADED_REGIONS);
            view.confirmPainted(view.next(GRID_VIEW).staged);
            view.next(LOADED_REGIONS);

            expect(view.renders.every((displayed) => displayed.frame !== null)).toBe(true);
        });
    });

    describe('toutes les communes d’une zone nationale', () => {
        const BY_COMMUNE: ViewRequest = { ...BY_REGION, scale: 'COMM' };
        const communes = (responses: Responses): Step => ({ request: BY_COMMUNE, indicator: CONSO, responses });
        const LOADED_COMMUNES = communes({ ...LOADED_DEPARTEMENTS.responses, values: COMMUNES_CONSO_HA });

        it('garde la carte affichée tant que la colonne de valeurs des communes n’est pas là, puis prépare la vue sous elle', () => {
            const view = follow(LOADED_DEPARTEMENTS);
            const shown = view.current().frame;

            // Le fond et les données des départements, déjà en cache, ne suffisent pas
            expect(view.next(communes(LOADED_DEPARTEMENTS.responses))).toEqual({ frame: shown, staged: null, pending: true, error: null });
            // La vue est complète, mais MapLibre n'a encore rien dessiné : la carte affichée reste
            expect(view.next(LOADED_COMMUNES)).toMatchObject({
                frame: shown,
                staged: { key: 'FRANCE|COMM|conso_ha|2011-2024', communes: COMMUNES_CONSO_HA, render: { renderer: 'communes' } },
                pending: true,
                error: null,
            });
        });

        it('affiche la vue d’un bloc quand ses communes sont dessinées, ou qu’elles ont trop tardé', () => {
            const painted = follow(LOADED_DEPARTEMENTS);
            const { staged } = painted.next(LOADED_COMMUNES);

            expect(painted.confirmPainted(staged)).toEqual({ frame: staged, staged: null, pending: false, error: null });

            jest.useFakeTimers();
            const late = follow(LOADED_DEPARTEMENTS);
            const waiting = late.next(LOADED_COMMUNES).staged;
            act(() => jest.advanceTimersByTime(3000));

            expect(late.current()).toEqual({ frame: waiting, staged: null, pending: false, error: null });
            jest.useRealTimers();
        });

        it('change de carte sans préparation une fois la vue affichée : MapLibre est déjà à l’écran', () => {
            const view = follow(LOADED_DEPARTEMENTS);
            view.confirmPainted(view.next(LOADED_COMMUNES).staged);
            const shareRequest = { ...BY_COMMUNE, indicatorId: 'conso_pct_surface' };

            const next = view.next({ request: shareRequest, indicator: indicatorOf('conso_pct_surface'), responses: { ...LOADED_DEPARTEMENTS.responses, values: COMMUNES_CONSO_SHARE } });

            expect(next).toMatchObject({ frame: { key: 'FRANCE|COMM|conso_pct_surface|2011-2024' }, staged: null, pending: false });
        });

        it('revient tout de suite à une carte par territoire', () => {
            const view = follow(LOADED_DEPARTEMENTS);
            view.confirmPainted(view.next(LOADED_COMMUNES).staged);

            expect(view.next(LOADED_DEPARTEMENTS)).toMatchObject({ frame: { key: 'FRANCE|DEPART|conso_ha|2011-2024' }, staged: null, pending: false });
            expect(view.renders.every((displayed) => displayed.frame !== null)).toBe(true);
        });

        it('ne redessine rien quand la même vue est rendue de nouveau sur les mêmes réponses', () => {
            const view = follow(LOADED_COMMUNES);
            const shown = view.confirmPainted(view.current().staged).frame;

            expect(view.next(communes({ ...LOADED_COMMUNES.responses })).frame).toBe(shown);
        });

        it('signale l’échec de la colonne de valeurs, la carte précédente restant affichée', () => {
            const view = follow(LOADED_DEPARTEMENTS);
            const shown = view.current().frame;

            expect(view.next(communes({ ...LOADED_DEPARTEMENTS.responses, values: 'error' }))).toEqual({ frame: shown, staged: null, pending: true, error: 'data' });
        });
    });

    it('garde la carte de consommation jusqu’à l’arrivée des données de la première carte OCS GE', () => {
        const view = follow(LOADED_REGIONS);
        const shown = view.current().frame;
        const request = { ...BY_REGION, indicatorId: 'artif_pct' };

        expect(view.next({ request, indicator: ARTIF, responses: LOADED_REGIONS.responses })).toEqual({ frame: shown, staged: null, pending: true, error: null });
        expect(view.next({ request, indicator: ARTIF, responses: { ...LOADED_REGIONS.responses, artif: ARTIF_FRANCE_BY_REGION } })).toMatchObject({
            frame: { key: 'FRANCE|REGION|artif_pct', indicator: ARTIF },
            pending: false,
        });
    });
});
