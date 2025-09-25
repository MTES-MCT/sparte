import { useGetEnvironmentQuery } from '@services/api';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const isMatomoEnabled = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    const metaTag = document.querySelector('meta[name="matomo-enabled"]');
    return metaTag?.getAttribute('content') === 'true';
};

const useMatomoTracking = (): void => {
    const location = useLocation();
    const { data: env } = useGetEnvironmentQuery(null)

    useEffect(() => {
        if (!isMatomoEnabled()) {
            return;
        }
    
    const d = document
    const g = d.createElement('script')
    const s = d.getElementsByTagName('script')[0]
    g.async = true
    g.src = env.matomo_container_src;
    s.parentNode.insertBefore(g,s)

    window._mtm!.push({'event': 'mtm.PageView'});

    }, [location]);
};

export default useMatomoTracking;
