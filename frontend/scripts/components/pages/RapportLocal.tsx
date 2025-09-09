import React, { ReactNode } from "react";
import { useHtmlLoader } from "@hooks/useHtmlLoader";
import useHtmx from "@hooks/useHtmx";
import Loader from "@components/ui/Loader";
import Button from "@components/ui/Button";
import CallToAction from "@components/ui/CallToAction";
import { useDownloadDiagnosticMutation } from "@services/api";
import { Notice } from "./Downloads";

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
  const { urls } = projectData;
  const htmxRef = useHtmx([isLoading]);

  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<ReactNode | null>(null);
  const [downloadDiagnostic] = useDownloadDiagnosticMutation();

  const handleDownload = async () => {
    setMessage(null);
    try {
      const response = await downloadDiagnostic({
        projectId: projectData.id,
        documentType: "rapport-local",
      }).unwrap();
      setMessage(response.message);
    } catch (error: any) {
      setError(error.data?.error ?? "Une erreur est survenue");
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="fr-container--fluid fr-p-3w" ref={htmxRef}>
      <div className="fr-grid-row">
        <div className="fr-col-12">
          {urls && (
            <CallToAction
              title="Besoin d'aide ?"
              text="Notre équipe travaille en partenariat avec la DGALN à la production automatique d'une trame pré-remplie du rapport triennal local de suivi de l’artificialisation des sols de votre territoire."
            >
              <div>
                {message && (
                  <Notice
                    type="success"
                    message={message}
                    reportTitle="Rapport local"
                  />
                )}
                {error && (
                  <Notice
                    type="warning"
                    message={
                      <span dangerouslySetInnerHTML={{ __html: error }} />
                    }
                    reportTitle="Rapport local"
                  />
                )}
                {!message && !error && (
                  <Button
                    type="htmx"
                    icon="bi bi-file-earmark-word"
                    label="Télécharger le rapport triennal local"
                    onClick={handleDownload}
                  />
                )}
              </div>
            </CallToAction>
          )}
          <div
            dangerouslySetInnerHTML={{ __html: content }}
            className="fr-mt-5w"
          />
        </div>
      </div>
    </div>
  );
};

export default RapportLocal;
