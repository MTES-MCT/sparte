import { useState, useLayoutEffect, useCallback } from 'react';

interface WindowSize {
    width: number;
    isMobile: boolean;
}

const useWindowSize = (breakpoint: number = 768): WindowSize => {
    const [windowSize, setWindowSize] = useState<WindowSize>({
        width: window.innerWidth,
        isMobile: window.innerWidth < breakpoint
    });

    const handleResize = useCallback(() => {
        setWindowSize({
            width: window.innerWidth,
            isMobile: window.innerWidth < breakpoint
        });
    }, [breakpoint]);

    useLayoutEffect(() => {
        // Debounce pour optimiser les performances
        let timeoutId: NodeJS.Timeout;
        const debouncedHandleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handleResize, 150);
        };

        window.addEventListener('resize', debouncedHandleResize);

        // Nettoyage initial pour éviter les fuites de mémoire
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', debouncedHandleResize);
        };
    }, [handleResize]);

    return windowSize;
};

export default useWindowSize;
