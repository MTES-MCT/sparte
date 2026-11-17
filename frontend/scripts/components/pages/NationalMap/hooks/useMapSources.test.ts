import { renderHook } from '@testing-library/react';
import * as api from '@services/api';
import { COMMUNES_CONSO_HA } from '../__fixtures__/communesFixtures';
import type { ViewRequest } from '../domain/viewState';
import { useMapSources } from './useMapSources';

// Les quatre requêtes de la carte, réduites à leurs arguments
jest.mock('@services/api', () => ({
    __esModule: true,
    useGetNationalMapBaseMapQuery: jest.fn(() => ({ isError: false })),
    useGetNationalMapIndicatorsQuery: jest.fn(() => ({ isError: false })),
    useGetNationalMapArtifIndicatorsQuery: jest.fn(() => ({ isError: false })),
    useGetNationalMapValuesQuery: jest.fn(() => ({ isError: false })),
}));

const baseMap = api.useGetNationalMapBaseMapQuery as unknown as jest.Mock;
const indicators = api.useGetNationalMapIndicatorsQuery as unknown as jest.Mock;
const artifIndicators = api.useGetNationalMapArtifIndicatorsQuery as unknown as jest.Mock;
const values = api.useGetNationalMapValuesQuery as unknown as jest.Mock;

const view = (changes: Partial<ViewRequest>): ViewRequest => ({ zone: 'FRANCE', scale: 'EPCI', startYear: 2013, endYear: 2020, indicatorId: 'conso_ha', ...changes });

// Requêtes faites pour une vue : les arguments de chaque appel, null pour une requête non envoyée
const queriesOf = (request: ViewRequest) => {
    [baseMap, indicators, artifIndicators, values].forEach((hook) => hook.mockClear());
    renderHook(() => useMapSources(request));
    const sent = (hook: jest.Mock): unknown => {
        const [query, options] = hook.mock.calls[0] as [unknown, { skip?: boolean } | undefined];
        return options?.skip ? null : query;
    };
    return { base: sent(baseMap), conso: sent(indicators), artif: sent(artifIndicators), values: sent(values) };
};

describe('useMapSources', () => {
    it('demande le fond et la consommation à la maille de la vue, sans artificialisation ni colonne', () => {
        expect(queriesOf(view({}))).toEqual({
            base: { scale: 'EPCI' },
            conso: { scale: 'EPCI', start_year: 2013, end_year: 2020 },
            artif: null,
            values: null,
        });
    });

    it('limite le fond et les données au territoire d’une zone', () => {
        const parent = { parent_type: 'REGION', parent_id: '53' };

        expect(queriesOf(view({ zone: 'REGION_53', scale: 'COMM' }))).toEqual({
            base: { scale: 'COMM', ...parent },
            conso: { scale: 'COMM', ...parent, start_year: 2013, end_year: 2020 },
            artif: null,
            values: null,
        });
    });

    it('charge l’artificialisation quand une de ses cartes est demandée', () => {
        expect(queriesOf(view({ indicatorId: 'artif_pct' }))).toMatchObject({ artif: { scale: 'EPCI' }, values: null });
    });

    it('demande, pour toutes les communes du pays, le fond et les données des départements et la colonne des communes', () => {
        expect(queriesOf(view({ scale: 'COMM' }))).toEqual({
            base: { scale: 'DEPART' },
            conso: { scale: 'DEPART', start_year: 2013, end_year: 2020 },
            artif: null,
            values: { scale: 'COMM', key: 'conso_pct_surface', amount: 'conso_ha', start_year: 2013, end_year: 2020 },
        });
    });

    it('fait les mêmes requêtes pour l’Hexagone que pour la France entière', () => {
        expect(queriesOf(view({ zone: 'HEXAGONE', scale: 'COMM' }))).toEqual(queriesOf(view({ scale: 'COMM' })));
    });

    it('demande l’artificialisation des départements et la colonne des communes pour une carte OCS GE', () => {
        expect(queriesOf(view({ scale: 'COMM', indicatorId: 'artif_net_ha' }))).toMatchObject({
            base: { scale: 'DEPART' },
            artif: { scale: 'DEPART' },
            values: { scale: 'COMM', key: 'artif_net_pct_surface', amount: 'artif_net_ha' },
        });
    });

    it('ne demande pas de colonne pour les carreaux, dessinés sur le fond des départements', () => {
        expect(queriesOf(view({ scale: 'COMM', indicatorId: 'conso_ha_gridded' }))).toMatchObject({ base: { scale: 'DEPART' }, values: null });
    });

    it('ne demande jamais le fond des communes sans parent', () => {
        ['FRANCE', 'HEXAGONE'].forEach((zone) => {
            ['conso_pct_surface', 'conso_ha', 'conso_ha_gridded', 'bivariate_habitat_menages', 'artif_pct'].forEach((indicatorId) => {
                expect(queriesOf(view({ zone, scale: 'COMM', indicatorId })).base).toEqual({ scale: 'DEPART' });
            });
        });
    });

    it('rend la réponse de la demande en cours et la dernière reçue, pour chaque requête', () => {
        values.mockReturnValueOnce({ currentData: undefined, data: COMMUNES_CONSO_HA, isError: false });

        const { result } = renderHook(() => useMapSources(view({ scale: 'COMM' })));

        expect(result.current.values).toEqual({ current: undefined, latest: COMMUNES_CONSO_HA, isError: false });
        expect(result.current.base).toEqual({ current: undefined, latest: undefined, isError: false });
    });
});
