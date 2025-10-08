import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

    const isMatomoEnabled = () => {
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
        _paq.push(['setCustomUrl', location.pathname]);
        _paq.push(['setDocumentTitle', document.title]);
        _paq.push(['trackPageView']);
    }, [location]);
};

export default useMatomoTracking;
