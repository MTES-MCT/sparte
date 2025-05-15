import { useMemo, useState } from 'react';
import { MillesimeByIndex } from '@services/types/land';

interface UseMillesimeProps {
    millesimes_by_index: MillesimeByIndex[];
    defaultIndex?: number;
}

interface UseMillesimeReturn {
    stockIndex: number;
    setStockIndex: (index: number) => void;
    defaultStockIndex: number;
    currentMillesime: MillesimeByIndex | undefined;
    millesimes: MillesimeByIndex[];
}

export const useMillesime = ({ 
    millesimes_by_index, 
    defaultIndex 
}: UseMillesimeProps): UseMillesimeReturn => {
    // Définition du millésime par défaut
    const defaultStockIndex = useMemo(() => {
        if (millesimes_by_index.length === 0) return defaultIndex ?? 2;
        return Math.max(...millesimes_by_index.map(e => e.index));
    }, [millesimes_by_index, defaultIndex]);

    // État du millésime sélectionné
    const [stockIndex, setStockIndex] = useState(defaultStockIndex);

    // Récupération du millésime sélectionné
    const currentMillesime = useMemo(() => 
        millesimes_by_index.find((e) => e.index === stockIndex),
        [millesimes_by_index, stockIndex]
    );

    return {
        stockIndex,
        setStockIndex,
        defaultStockIndex,
        currentMillesime,
        millesimes: millesimes_by_index
    };
}; 