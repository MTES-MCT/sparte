import { useMemo, useState } from 'react';
import { MillesimeByIndex } from '@services/types/land';

interface UseMillesimeProps {
    millesimes_by_index: MillesimeByIndex[];
    defaultIndex?: number;
}

interface UseMillesimeReturn {
    selectedIndex: number;
    setSelectedIndex: (index: number) => void;
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
    const [selectedIndex, setSelectedIndex] = useState(defaultStockIndex);

    // Récupération du millésime sélectionné
    const currentMillesime = useMemo(() => 
        millesimes_by_index.find((e) => e.index === selectedIndex),
        [millesimes_by_index, selectedIndex]
    );

    return {
        selectedIndex,
        setSelectedIndex,
        defaultStockIndex,
        currentMillesime,
        millesimes: millesimes_by_index
    };
}; 