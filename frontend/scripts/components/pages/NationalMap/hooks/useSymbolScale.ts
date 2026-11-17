import { useMemo } from 'react';
import type { SymbolReference } from '../SymbolLegend';
import type { LegendModel } from '../domain/frame/types';
import { symbolMaxSize, symbolRadius } from '../values';

type SymbolScale = {
    // Diamètre du plus grand symbole, en pixels ; null : la carte n'est pas en symboles proportionnels
    size: number | null;
    // Symboles de référence de la légende, à l'échelle de ceux de la carte
    references: SymbolReference[];
};

// Échelle des symboles proportionnels, cercles ou anneaux : le diamètre du plus grand dépend du
// nombre de territoires et de la taille de la carte à l'écran (`symbolFactor`) ; les symboles de
// référence de la légende le suivent
export const useSymbolScale = (legend: LegendModel | undefined, symbolFactor: number): SymbolScale => {
    const symbolLegend = legend?.kind === 'symbols' ? legend : null;
    const size = symbolLegend ? symbolMaxSize(symbolLegend.landCount, symbolFactor) : null;
    const references = useMemo(
        () => (symbolLegend && size !== null ? symbolLegend.references.map(({ value, label }) => ({ radius: symbolRadius(value, symbolLegend.maxValue, size), label })) : []),
        [symbolLegend, size],
    );
    return { size, references };
};
