import React from "react";
import { Link } from "react-router-dom";
import { useHtmlLoader } from "@hooks/useHtmlLoader";
import useHtmx from "@hooks/useHtmx";
import Loader from "@components/ui/Loader";
import CallToAction from "@components/ui/CallToAction";

/*
Ce composant est un composant hybride qui permet de récupérer du contenu côté serveur via Django et de l'intégrer directement dans l'interface React.
Cette approche progressive facilite la migration des éléments de contenu existants vers React, tout en permettant de conserver certaines fonctionnalités serveur le temps de la transition.

### Injection HTML contrôlée :
Le contenu récupéré du serveur est inséré directement dans le DOM à l'aide de `dangerouslySetInnerHTML`.
Cela est nécessaire pour rendre du contenu HTML généré côté serveur, mais il est important de prendre des précautions contre les injections de code malveillant (XSS).
Dans ce cas, les données provenant de Django sont considérées comme fiables.
*/

const RapportLocal: React.FC<{ endpoint: string; projectData: any }> = ({
  endpoint,
  projectData,
}) => {
  const { content, isLoading } = useHtmlLoader(endpoint);
  const htmxRef = useHtmx([isLoading]);

  if (isLoading) return <Loader />;

  return (
    <div className="fr-container--fluid fr-p-3w" ref={htmxRef}>
      <div className="fr-grid-row">
        <div className="fr-col-12">
          {projectData?.urls?.downloads && (
            <CallToAction
              title="Besoin d'aide ?"
              text="Notre équipe travaille en partenariat avec la DGALN à la production automatique d'une trame pré-remplie du rapport triennal local de suivi de l'artificialisation des sols de votre territoire."
            >
              <Link
                to={projectData.urls.downloads}
                className="fr-btn fr-icon-arrow-right-line fr-btn--icon-right fr-text--sm"
              >
                Accéder aux téléchargements
              </Link>
            </CallToAction>
          )}
          <div
            dangerouslySetInnerHTML={{ __html: content }}
            className="fr-mt-3w"
          />
        </div>
      </div>
    </div>
  );
};

export default RapportLocal;
