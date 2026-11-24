import { useState } from 'react';

// Valeur retenue : tant que `hold` est vrai, la valeur du dernier rendu où il ne l'était pas ;
// sinon la valeur reçue.
export const useHeld = <T,>(value: T, hold: boolean): T => {
    const [held, setHeld] = useState(value);
    if (hold || Object.is(held, value)) return held;
    // État ajusté pendant le rendu : React rend de nouveau aussitôt, sans image intermédiaire
    setHeld(value);
    return value;
};
