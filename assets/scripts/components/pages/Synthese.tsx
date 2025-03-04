import React from 'react';
import { useHtmlLoader } from '@hooks/useHtmlLoader';
import Loader from '@components/ui/Loader';
import Guide from '@components/widgets/Guide';

/*
Ce composant est un composant hybride qui permet de récupérer du contenu côté serveur via Django et de l'intégrer directement dans l'interface React.
Cette approche progressive facilite la migration des éléments de contenu existants vers React, tout en permettant de conserver certaines fonctionnalités serveur le temps de la transition.

### Injection HTML contrôlée :
Le contenu récupéré du serveur est inséré directement dans le DOM à l'aide de `dangerouslySetInnerHTML`.
Cela est nécessaire pour rendre du contenu HTML généré côté serveur, mais il est important de prendre des précautions contre les injections de code malveillant (XSS).
Dans ce cas, les données provenant de Django sont considérées comme fiables.
*/

const Synthese: React.FC<{ endpoint: string }> = ({ endpoint }) => {
    const { content, isLoading, error } = useHtmlLoader(endpoint);

    if (isLoading) return <Loader />;
    if (error) return <div>Erreur : {error}</div>;

    return (
        <div className="fr-container fr-p-3w">
            <div className="fr-grid-row">
                <div className="fr-col-12">
                    <Guide
                        title="Que contient ce diagnostic"
                        contentHtml={`
                            Ce diagnostic présente une série d'indicateurs pour <b>mesurer la consommation d'espaces et l'artificialisation sur le territoire</b>,
                            ainsi qu'une série de <b>leviers de sobriété foncière pour agir sur ces phénomènes</b>.
                        `}
                    />
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            </div>
        </div>
    );
};

export default Synthese;
