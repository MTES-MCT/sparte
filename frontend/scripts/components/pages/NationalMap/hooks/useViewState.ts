import { useEffect, useMemo, useReducer } from 'react';
import { initialViewState, serializeView, viewReducer } from '../domain/viewState';
import { ZoneNames } from '../zones';

// Vue demandée de la carte : lue dans l'URL à l'ouverture de la page, puis modifiée par des
// actions dont l'identité ne change jamais, pour ne pas redessiner les composants qui les reçoivent
export const useViewState = () => {
    const [state, dispatch] = useReducer(viewReducer, window.location.search, initialViewState);
    const { request } = state;

    // L'URL reflète la vue pour pouvoir la rouvrir ou la partager à l'identique
    useEffect(() => {
        window.history.replaceState(null, '', `${window.location.pathname}${serializeView(window.location.search, request)}`);
    }, [request]);

    const actions = useMemo(
        () => ({
            changeZone: (zone: string, name?: string) => dispatch({ type: 'zoneChanged', zone, name }),
            changeScale: (scale: string) => dispatch({ type: 'scaleChanged', scale }),
            setStartYear: (year: number) => dispatch({ type: 'startYearChanged', year }),
            setEndYear: (year: number) => dispatch({ type: 'endYearChanged', year }),
            setPeriod: (startYear: number, endYear: number) => dispatch({ type: 'periodChanged', startYear, endYear }),
            clampPeriod: (years: { min: number; max: number }) => dispatch({ type: 'periodClamped', years }),
            selectIndicator: (id: string) => dispatch({ type: 'indicatorSelected', id }),
            selectLine: (id: string) => dispatch({ type: 'lineSelected', id }),
            toggleRubrique: (id: string) => dispatch({ type: 'rubriqueToggled', id }),
            toggleChart: (id: string) => dispatch({ type: 'chartToggled', id }),
            rememberNames: (names: ZoneNames) => dispatch({ type: 'namesLearned', names }),
        }),
        [],
    );

    return { state, actions };
};
