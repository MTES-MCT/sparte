import { renderHook } from '@testing-library/react';
import { mapLibreStub } from '../__fixtures__/mapLibreStub';
import type { ViewRequest } from '../domain/viewState';
import { useEngineWarmup } from './useEngineWarmup';

// Adresse des fichiers de tuiles ; indéfinie tant que la réponse n'est pas arrivée
const environment: { data?: { vector_tiles_location: string } } = {};

jest.mock('../components/stage/mapLibre', () => jest.requireActual('../__fixtures__/mapLibreStub').mapLibreModule);
jest.mock('@services/api', () => ({ __esModule: true, useGetEnvironmentQuery: () => environment }));

const view = (changes: Partial<ViewRequest>): ViewRequest => ({ zone: 'FRANCE', scale: 'EPCI', startYear: 2011, endYear: 2024, indicatorId: 'conso_pct_surface', ...changes });

beforeEach(() => {
    mapLibreStub.reset();
    environment.data = { vector_tiles_location: 'https://tuiles.test/vector_tiles' };
});

describe('useEngineWarmup', () => {
    it('ne prépare rien de MapLibre pour une carte par territoire', () => {
        renderHook(() => useEngineWarmup(view({})));
        renderHook(() => useEngineWarmup(view({ zone: 'REGION_53', scale: 'COMM' })));

        expect(mapLibreStub.prepared).toEqual([]);
    });

    it('prépare, dès que toutes les communes du pays sont demandées, MapLibre et l’en-tête de leur fichier de tuiles', () => {
        renderHook(() => useEngineWarmup(view({ scale: 'COMM' })));

        expect(mapLibreStub.prepared).toEqual(['https://tuiles.test/vector_tiles/communes_national.pmtiles']);
    });

    it('prépare MapLibre seul pour une carte de mailles, dont le fichier dépend de la vue', () => {
        renderHook(() => useEngineWarmup(view({ indicatorId: 'conso_ha_gridded' })));
        renderHook(() => useEngineWarmup(view({ zone: 'REGION_53', scale: 'DEPART', indicatorId: 'artif_soils' })));

        expect(mapLibreStub.prepared).toEqual([null, null]);
    });

    it('n’attend pas l’adresse des tuiles pour préparer MapLibre, et lit l’en-tête à son arrivée', () => {
        environment.data = undefined;
        const { rerender } = renderHook(() => useEngineWarmup(view({ scale: 'COMM' })));

        expect(mapLibreStub.prepared).toEqual([null]);

        environment.data = { vector_tiles_location: 'https://tuiles.test/vector_tiles' };
        rerender();

        expect(mapLibreStub.prepared).toEqual([null, 'https://tuiles.test/vector_tiles/communes_national.pmtiles']);
    });

    it('ne prépare pas de nouveau la carte quand seules la période ou la carte demandée changent', () => {
        const { rerender } = renderHook(({ request }) => useEngineWarmup(request), { initialProps: { request: view({ scale: 'COMM' }) } });
        rerender({ request: view({ scale: 'COMM', startYear: 2015, indicatorId: 'conso_ha' }) });

        expect(mapLibreStub.prepared).toHaveLength(1);
    });
});
