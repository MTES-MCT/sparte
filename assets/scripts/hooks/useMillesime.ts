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
    const defaultStockIndex = useMemo(() => 
        millesimes_by_index.length > 0
            ? Math.max(...millesimes_by_index.map((e) => e.index))
            : defaultIndex || 2,
        [millesimes_by_index, defaultIndex]
    );

    const [stockIndex, setStockIndex] = useState(defaultStockIndex);

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