import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const isMatomoEnabled = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    const metaTag = document.querySelector('meta[name="matomo-enabled"]');
    return metaTag?.getAttribute('content') === 'true';
};

const useMatomoTracking = (): void => {
    const location = useLocation();

    useEffect(() => {
        if (!isMatomoEnabled()) {
            return;
        }

        window._mtm!.push({'event': 'mtm.PageView'});
    }, [location]);
};

export default useMatomoTracking;
