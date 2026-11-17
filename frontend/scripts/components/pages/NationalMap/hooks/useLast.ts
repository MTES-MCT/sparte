import { useState } from 'react';

// Dernière valeur non nulle : pendant qu'une valeur manque, la précédente reste. Une valeur
// équivalente à la précédente (`isSame`) rend la précédente, sans changer d'identité.
export const useLast = <T,>(value: T | null, isSame: (previous: T, next: T) => boolean = Object.is): T | null => {
    const [last, setLast] = useState(value);
    if (value === null) return last;
    if (last !== null && isSame(last, value)) return last;
    // État ajusté pendant le rendu : React rend de nouveau aussitôt, sans image intermédiaire
    setLast(value);
    return value;
};
