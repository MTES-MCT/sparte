import { MutableRefObject, useLayoutEffect, useRef } from 'react';

// Valeur du dernier rendu, pour ce qui la lit plus tard. Un gestionnaire qui la lit au moment où il
// est appelé n'a pas à changer d'identité quand elle change.
export const useLive = <T,>(value: T): MutableRefObject<T> => {
    const live = useRef(value);
    useLayoutEffect(() => {
        live.current = value;
    });
    return live;
};
