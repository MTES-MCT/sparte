import { useEffect, useRef } from 'react';
import htmx from 'htmx.org';

const useHtmx = (dependencies: React.DependencyList = []) => {
    const ref = useRef<HTMLDivElement | null>(null); 

    useEffect(() => {
        // Configurer HTMX et définir l'extension disable-element
        htmx.config.includeIndicatorStyles = false;

        // Désactive temporairement le bouton sur lequel l'utilisateur vient de cliquer pendant les requêtes HTMX
        htmx.defineExtension('disable-element', {
            onEvent(name, evt) {
                if (name === 'htmx:beforeRequest' || name === 'htmx:afterRequest') {
                    const { elt } = evt.detail;
                    const target = elt.getAttribute('hx-disable-element');
                    const targetElement = (target === 'self') ? elt : document.querySelector(target);

                    if (name === 'htmx:beforeRequest' && targetElement) {
                        targetElement.disabled = true;
                    } else if (name === 'htmx:afterRequest' && targetElement) {
                        targetElement.disabled = false;
                    }
                }
            },
        });

        if (ref.current) {            
            htmx.process(ref.current);
        }

        // Nettoyer l'extension et la configuration à la désinstallation du composant
        return () => {
            delete window.htmx; // Supprimer HTMX si nécessaire
        };
    }, dependencies);

    return ref;
};

export default useHtmx;
