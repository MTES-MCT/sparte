import React, { useEffect, useState } from "react";
import { useHtmlLoader } from "@hooks/useHtmlLoader";
import useHtmx from "@hooks/useHtmx";
import useHighcharts from "@hooks/useHighcharts";
import Loader from "@components/ui/Loader";
import Guide from "@components/widgets/Guide";

/*
Ce composant est un composant hybride qui permet de récupérer du contenu côté serveur via Django et de l'intégrer directement dans l'interface React.
Cette approche progressive facilite la migration des éléments de contenu existants vers React, tout en permettant de conserver certaines fonctionnalités serveur le temps de la transition.

### Rafraîchissement via une clé dynamique :
Le composant utilise une clé de rafraîchissement (`refreshKey`) qui permet de forcer un nouveau rendu lorsqu'un formulaire ou une action utilisateur modifie les paramètres, via la bibliothèque HTMX.
Le hook `useHtmx` s'assure que les interactions HTMX continuent de fonctionner même après le rendu côté React. Chaque fois que l'événement personnalisé `force-refresh` est déclenché, le composant réinitialise son contenu avec les nouveaux paramètres.

### Graphiques interactifs :
Le hook `useHighcharts` récupère les options des graphiques transmises par le contexte Django et les rend dynamiquement dans le contenu.

### Injection HTML contrôlée :
Le contenu récupéré du serveur est inséré directement dans le DOM à l'aide de `dangerouslySetInnerHTML`.
Cela est nécessaire pour rendre du contenu HTML généré côté serveur, mais il est important de prendre des précautions contre les injections de code malveillant (XSS).
Dans ce cas, les données provenant de Django sont considérées comme fiables.
*/

const Trajectoires: React.FC<{ endpoint: string }> = ({ endpoint }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { content, isLoading, error } = useHtmlLoader(
    endpoint + `?refreshKey=${refreshKey}`,
  );
  const htmxRef = useHtmx([isLoading]);

  useHighcharts(["target_2031_chart"], isLoading);

  useEffect(() => {
    const handleLoadGraphic = () => {
      setTimeout(handleModalClose, 1800);
    };

    const handleModalClose = () => {
      // Ferme la modal Bootstrap
      const modalElement = document.getElementById("setTarget");
      if (modalElement) {
        const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
          modalInstance.hide();
        }
      }

      // Rafraîchit la clé après avoir fermé la modal pour recharger le contenu
      setRefreshKey((prevKey) => prevKey + 1);
    };

    document.addEventListener("load-graphic", handleLoadGraphic);

    return () => {
      document.removeEventListener("load-graphic", handleLoadGraphic);
    };
  }, []);

  if (isLoading) return <Loader />;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div className="fr-container--fluid fr-p-3w" ref={htmxRef}>
      <div className="fr-grid-row">
        <div className="fr-col-12">
          <Guide
            title="Cadre réglementaire"
            contentHtml={`La loi Climat & Résilience fixe<strong> l’objectif d’atteindre le « zéro artificialisation nette des sols » en 2050, avec un objectif intermédiaire
                            de réduction de moitié de la consommation d’espaces</strong> naturels, agricoles et forestiers dans les dix prochaines années 2021-2031
                            par rapport à la décennie précédente 2011-2021.
                        `}
            DrawerTitle="Cadre Réglementaire"
            DrawerContentHtml={`
                            <p class="fr-text--sm mb-3">
                                La loi Climat & Résilience fixe<strong> l’objectif d’atteindre le « zéro artificialisation nette des sols » en 2050, avec un objectif intermédiaire
                                de réduction de moitié de la consommation d’espaces</strong>
                                naturels, agricoles et forestiers dans les dix prochaines années 2021-2031 (en se basant sur les données allant du 01/01/2021 au 31/12/2030)
                                par rapport à la décennie précédente 2011-2021 (en se basant sur les données allant du 01/01/2011 au 31/12/2020).
                            </p>
                            <p class="fr-text--sm mb-3">
                                Cette <strong>trajectoire nationale progressive</strong> est à décliner dans les documents de planification et d'urbanisme (avant le 22 novembre 2024 pour les SRADDET,
                                avant le 22 février 2027 pour les SCoT et avant le 22 février 2028 pour les PLU(i) et cartes communales).
                            </p>
                            <p class="fr-text--sm mb-3">
                                Elle doit être conciliée avec <strong>l'objectif de soutien de la construction durable</strong>, en particulier dans les territoires où l'offre de logements et de surfaces économiques
                                est insuffisante au regard de la demande.
                            </p>
                            <p class="fr-text--sm mb-3">
                                La loi prévoit également que <strong>la consommation foncière des projets d'envergure nationale ou européenne et d'intérêt général majeur sera comptabilisée au niveau national</strong>, et
                                non au niveau régional ou local. Ces projets seront énumérés par arrêté du ministre chargé de l'urbanisme, en fonction de catégories définies dans la loi,
                                après consultation des régions, de la conférence régionale et du public. Un forfait de 12 500 hectares est déterminé pour la période 2021-2031, dont 10 000
                                hectares font l'objet d'une péréquation entre les régions couvertes par un SRADDET.
                            </p>
                            <p class="fr-text--sm mb-3">
                                Cette loi précise également l’exercice de territorialisation de la trajectoire. Afin de tenir compte des besoins de l’ensemble des territoires,
                                <strong>une surface minimale d’un hectare de consommation est garantie à toutes les communes couvertes par un document d'urbanisme prescrit</strong>, arrêté ou approuvé avant le 22 août 2026,
                                pour la période 2021-2031. Cette « garantie communale » peut être mutualisée au niveau intercommunal à la demande des communes. Quant aux communes littorales soumises au recul
                                du trait de côte, qui sont listées par décret et qui ont mis en place un projet de recomposition spatiale, elles peuvent considérer, avant même que la désartificialisation soit
                                effective, comme « désartificialisées » les surfaces situées dans la zone menacée à horizon 30 ans et qui seront ensuite désartificialisées.
                            </p>
                            <p class="fr-text--sm mb-3">
                                Dès aujourd’hui, <strong>Mon Diagnostic Artificialisation</strong> vous permet de vous projeter dans cet objectif de réduction de la consommation d’espaces NAF (Naturels, Agricoles et Forestiers) d’ici à 2031 et de simuler divers scénarios.
                            </p>
                            <p class="fr-text--sm mb-3">
                                La consommation d'espaces NAF (Naturels, Agricoles et Forestiers) est mesurée avec les données d’évolution des fichiers fonciers produits et diffusés par le Cerema depuis 2009 à partir des fichiers MAJIC de la DGFIP.
                                Le dernier millésime de 2023 est la photographie du territoire au 1er janvier 2023, intégrant les évolutions réalisées au cours de l'année 2022.
                            </p>
                        `}
          />
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    </div>
  );
};

export default Trajectoires;
