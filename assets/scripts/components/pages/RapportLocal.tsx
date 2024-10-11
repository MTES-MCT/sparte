import React from 'react';
import { useHtmlLoader } from '@hooks/useHtmlLoader';
import useHtmx from '@hooks/useHtmx';
import useUrls from '@hooks/useUrls';
import Loader from '@components/ui/Loader';
import Button from '@components/ui/Button';
import CallToAction from '@components/ui/CallToAction';

/*
Ce composant est un composant hybride qui permet de récupérer du contenu côté serveur via Django et de l'intégrer directement dans l'interface React.
Cette approche progressive facilite la migration des éléments de contenu existants vers React, tout en permettant de conserver certaines fonctionnalités serveur le temps de la transition.

### Injection HTML contrôlée :
Le contenu récupéré du serveur est inséré directement dans le DOM à l'aide de `dangerouslySetInnerHTML`.
Cela est nécessaire pour rendre du contenu HTML généré côté serveur, mais il est important de prendre des précautions contre les injections de code malveillant (XSS).
Dans ce cas, les données provenant de Django sont considérées comme fiables.
*/

const RapportLocal: React.FC<{ endpoint: string }> = ({ endpoint }) => {
    const { content, isLoading, error } = useHtmlLoader(endpoint);
    const urls = useUrls();
    const htmxRef = useHtmx([isLoading]);

    // Temporaire => Il faudrait utiliser la modal de react dsfr
    const resetModalContent = () => {
        const modalContent = document.getElementById('diag_word_form');
        if (modalContent) {
            modalContent.innerHTML = '<div class="fr-custom-loader"></div>';
        }
    };

    if (isLoading) return <Loader />;
    if (error) return <div>Erreur : {error}</div>;

    return (
       <div className="fr-container--fluid fr-p-3w" ref={htmxRef}>
           <div className="fr-grid-row">
               <div className="fr-col-12">
                    { urls && (
                        <CallToAction
                            title="Besoin d'aide ?"
                            text="Notre équipe travaille en partenariat avec la DGALN à la production automatique d'une trame pré-remplie du rapport triennal local de suivi de l’artificialisation des sols de votre territoire."
                        >
                            <div>
                                <Button
                                    type="htmx"
                                    icon="bi bi-file-earmark-word"
                                    label="Télécharger le rapport triennal local"
                                    htmxAttrs={{
                                        'data-hx-get': urls.dowloadLocalReport,
                                        'data-hx-target': '#diag_word_form',
                                        'data-fr-opened': 'false',
                                        'aria-controls': 'fr-modal-download-word',
                                    }}
                                    onClick={resetModalContent}
                                />
                            </div>
                        </CallToAction>
                    )}
                   <div dangerouslySetInnerHTML={{ __html: content }} className="fr-mt-5w" />
               </div>
           </div>
       </div>
    );
};

export default RapportLocal;
