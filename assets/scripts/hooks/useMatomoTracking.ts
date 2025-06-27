import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useMatomoTracking = (): void => {
    const location = useLocation();

    useEffect(() => {
        window._mtm.push({'event': 'mtm.PageView'});
    }, [location]);
};

export default useMatomoTracking;
