import { useEffect, useRef } from 'react';
import htmx from 'htmx.org';

const useHtmx = (dependencies: React.DependencyList = []) => {
    const ref = useRef<HTMLDivElement | null>(null); 

    useEffect(() => {        
        if (ref.current) {            
            htmx.process(ref.current);
        }
    }, dependencies);

    return ref;
};

export default useHtmx;
