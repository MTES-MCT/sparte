import React from 'react';
import { useParams } from 'react-router-dom';
import { useHtmlLoader } from '@hooks/useHtmlLoader';
import Loader from '@components/ui/Loader';
import PageTitle from '@components/widgets/PageTitle';

/*
Ce composant est un composant hybride qui permet de récupérer du contenu côté serveur via Django et de l'intégrer directement dans l'interface React.
Cette approche progressive facilite la migration des éléments de contenu existants vers React, tout en permettant de conserver certaines fonctionnalités serveur le temps de la transition.

### Injection HTML contrôlée :
Le contenu récupéré du serveur est inséré directement dans le DOM à l'aide de `dangerouslySetInnerHTML`.
Cela est nécessaire pour rendre du contenu HTML généré côté serveur, mais il est important de prendre des précautions contre les injections de code malveillant (XSS).
Dans ce cas, les données provenant de Django sont considérées comme fiables.
*/

const Gpu: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const endpoint = `/project/${projectId}/tableau-de-bord/zonages-d-urbanisme`;
    const { content, isLoading, error } = useHtmlLoader(endpoint);

    if (isLoading) return <Loader />;
    if (error) return <div>Erreur : {error}</div>;

    return (
        <div className="fr-container--fluid fr-p-3w w-100">
            <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12">
                    <PageTitle title="Artificialisation des zonages d'urbanisme" />
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            </div>
        </div>
    );
};

export default Gpu;
