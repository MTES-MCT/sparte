import { act, renderHook } from '@testing-library/react';
import { useViewState } from './useViewState';

let replaceState: jest.SpyInstance;
let pushState: jest.SpyInstance;

// Adresses écrites par le hook depuis son montage, dans l'ordre
const writtenUrls = (): string[] => replaceState.mock.calls.map(([, , url]) => url);

const openAt = (search: string) => {
    window.history.replaceState(null, '', `/carte${search}`);
    replaceState = jest.spyOn(window.history, 'replaceState');
    pushState = jest.spyOn(window.history, 'pushState');
    return renderHook(() => useViewState());
};

afterEach(() => {
    jest.restoreAllMocks();
});

describe('useViewState', () => {
    it("lit la vue dans l'adresse à l'ouverture de la page", () => {
        const { result } = openAt('?zone=REGION_53&scale=EPCI&start=2015&end=2020&indicator=artif_pct');

        expect(result.current.state.request).toEqual({ zone: 'REGION_53', scale: 'EPCI', startYear: 2015, endYear: 2020, indicatorId: 'artif_pct' });
        expect(result.current.state.openRubrique).toBe('Visualiser les espaces artificialisés');
    });

    it("complète l'adresse dès le montage, sans ajouter d'entrée à l'historique", () => {
        openAt('');

        expect(writtenUrls()).toEqual(['/carte?zone=FRANCE&scale=EPCI&start=2011&end=2024&indicator=conso_pct_surface']);
        expect(window.location.search).toBe('?zone=FRANCE&scale=EPCI&start=2011&end=2024&indicator=conso_pct_surface');
        expect(pushState).not.toHaveBeenCalled();
    });

    it("remplace les paramètres invalides de l'adresse par les valeurs retenues", () => {
        openAt('?zone=XX&scale=SCOT&start=abc&end=1999&indicator=inconnu');

        expect(window.location.search).toBe('?zone=FRANCE&scale=EPCI&start=2011&end=2011&indicator=conso_pct_surface');
    });

    it("récrit l'adresse à chaque action qui change la vue", () => {
        const { result } = openAt('?zone=FRANCE&scale=REGION&start=2011&end=2024&indicator=conso_ha');

        act(() => result.current.actions.changeZone('REGION_53', 'Bretagne'));
        act(() => result.current.actions.changeScale('COMM'));
        act(() => result.current.actions.setStartYear(2014));
        act(() => result.current.actions.setEndYear(2019));
        act(() => result.current.actions.selectIndicator('conso_pct_surface'));
        act(() => result.current.actions.toggleRubrique("Visualiser l'artificialisation"));
        act(() => result.current.actions.clampPeriod({ min: 2015, max: 2018 }));

        expect(writtenUrls().slice(1)).toEqual([
            '/carte?zone=REGION_53&scale=DEPART&start=2011&end=2024&indicator=conso_ha',
            '/carte?zone=REGION_53&scale=COMM&start=2011&end=2024&indicator=conso_ha',
            '/carte?zone=REGION_53&scale=COMM&start=2014&end=2024&indicator=conso_ha',
            '/carte?zone=REGION_53&scale=COMM&start=2014&end=2019&indicator=conso_ha',
            '/carte?zone=REGION_53&scale=COMM&start=2014&end=2019&indicator=conso_pct_surface',
            '/carte?zone=REGION_53&scale=COMM&start=2014&end=2019&indicator=artif_net_annual_pct_surface',
            '/carte?zone=REGION_53&scale=COMM&start=2015&end=2018&indicator=artif_net_annual_pct_surface',
        ]);
        expect(pushState).not.toHaveBeenCalled();
    });

    it("n'écrit qu'une adresse pour une période choisie d'un coup, et aucune si c'est déjà la période en cours", () => {
        const { result } = openAt('?zone=FRANCE&scale=REGION&start=2015&end=2022&indicator=conso_ha');

        act(() => result.current.actions.setPeriod(2011, 2020));
        act(() => result.current.actions.setPeriod(2011, 2020));

        expect(writtenUrls().slice(1)).toEqual(['/carte?zone=FRANCE&scale=REGION&start=2011&end=2020&indicator=conso_ha']);
    });

    it("ne récrit pas l'adresse quand la vue ne change pas", () => {
        const { result } = openAt('');

        act(() => result.current.actions.changeZone('FRANCE'));
        act(() => result.current.actions.toggleChart('destination_share'));
        act(() => result.current.actions.rememberNames({ REGION_53: 'Bretagne' }));
        act(() => result.current.actions.toggleRubrique("Visualiser la consommation d'ENAF"));

        expect(writtenUrls()).toHaveLength(1);
        expect(result.current.state).toMatchObject({ names: { REGION_53: 'Bretagne' }, openRubrique: null });
        expect(result.current.state.activeCharts).not.toContain('destination_share');
    });

    it("conserve les paramètres de l'adresse qui ne décrivent pas la vue", () => {
        const { result } = openAt('?showinfo');

        act(() => result.current.actions.changeZone('HEXAGONE'));

        expect(window.location.search).toBe('?showinfo=&zone=HEXAGONE&scale=EPCI&start=2011&end=2024&indicator=conso_pct_surface');
    });

    it("garde l'identité de chaque action d'un rendu à l'autre", () => {
        const { result, rerender } = openAt('');
        const { actions } = result.current;

        act(() => actions.changeZone('REGION_53'));
        rerender();

        expect(result.current.state.request.zone).toBe('REGION_53');
        expect(result.current.actions).toBe(actions);
        expect(result.current.actions.changeZone).toBe(actions.changeZone);
    });
});
