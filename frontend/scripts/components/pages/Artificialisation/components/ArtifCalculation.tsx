import React from "react";
import BaseCard from "@components/ui/BaseCard";
import { SeuilsSchemas } from "@components/features/ocsge/SeuilsSchemas";
import OcsgeMatricePNG from "@images/ocsge_matrice_passage.png";

export const ArtifCalculation: React.FC = () => {
  return (
    <div className="fr-mb-7w">
      <h2>Calcul de l'artificialisation des sols</h2>
      <BaseCard className="fr-p-3w fr-mb-7w">
        <p className="fr-text--sm">
          La mesure de l'artificialisation est obtenue à partir de la donnée OCS
          GE, en s'appuyant en particulier sur un tableau de croisement
          couverture / usage. Par exemple, les couvertures de zones bâties à usage résidentiel
          ou les couvertures de formations herbacées à usage tertiaire sont considérées comme
          des surfaces artificialisées. L'ensemble des croisements d'usage et de
          couverture du sol définissant les espaces artificialisés est
          consultable dans la matrice OCS GE ci-dessous.
        </p>
        <section className="fr-accordion fr-mb-3w">
          <h3 className="fr-accordion__title">
            <button
              className="fr-accordion__btn"
              aria-expanded="false"
              aria-controls="accordion-106"
            >
              Croisements d'usage et de couverture correspondant à l'artificialisation
            </button>
          </h3>
          <div className="fr-collapse" id="accordion-106">
            <img
              width="100%"
              src={OcsgeMatricePNG}
              alt="Matrice de croisements d'usage et de couverture d'après la nomenclature OCS GE qui détermine la composition de l'artificialisation"
            />
          </div>
        </section>
        <h3 id="seuils-interpretation" className="fr-mt-5w">Les seuils d'interprétation</h3>
        <p className="fr-text--sm">
          Une fois les espaces qualifiés en artificiels ou non-artificiels à
          partir du tableau de croisement,{" "}
          <strong>des seuils d'interprétation sont appliqués</strong>, comme
          défini dans le{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048465959#:~:text=Enfin%2C%20sont%20int%C3%A9gr%C3%A9s,agronomique%20du%20sol."
          >
            décret du 27 novembre 2023
          </a>
          . Ces seuils indiquent que des surfaces de moins de 2500 m² ne peuvent
          pas être comptabilisées comme artificialisées ou désartificialisées, à
          l'exception des espaces bâtis.
        </p>
        <p className="fr-text--sm">
          De fait, l'application de ces seuils{" "}
          <strong>
            permet de densifier en zone construite sans augmenter la mesure de
            l'artificialisation du territoire
          </strong>
          .<br /><br />
          Ci-dessous les trois cas de figure possibles&nbsp;:
        </p>
        <SeuilsSchemas />
        <p className="fr-text--sm">
          Le détail de la méthode de calcul de l'artificialisation avec les seuils
          d'interprétation est disponible sur le portail de l'artificialisation
          :&nbsp;{" "}
          <a
            className="fr-link fr-text--sm"
            target="_blank"
            rel="noopener noreferrer"
            href="https://artificialisation.developpement-durable.gouv.fr/calcul-lartificialisation-des-sols"
          >
            https://artificialisation.developpement-durable.gouv.fr/calcul-lartificialisation-des-sols
          </a>
        </p>
        <h3 className="fr-mt-5w">Les exemptions facultatives</h3>
        <p className="fr-text--sm">
          Le décret du 27 novembre 2023 introduit deux cas d'exemption facultative du calcul de l'artificialisation des sols. Les collectivités peuvent ainsi, si elles le souhaitent, exclure du décompte des surfaces artificialisées :
        </p>
        <ul>
          <li className="fr-text--sm">
            Les installations photovoltaïques au sol implantées sur des espaces agricoles ou naturels, à condition qu'elles n'affectent pas durablement les fonctions écologiques ou agronomiques du sol. En revanche, celles situées en forêt restent systématiquement comptabilisées.
            <a
              className="fr-link fr-text--sm fr-ml-1w"
              target="_blank"
              rel="noopener noreferrer"
              href="https://artificialisation.developpement-durable.gouv.fr/mesurer-lartificialisation-avec-locsge/photovoltaique"
            >
              En savoir plus
            </a>
          </li>
          <li className="fr-text--sm">
            Les surfaces végétalisées à usage de parc ou jardin public, qu'elles soient boisées ou herbacées, dès lors qu'elles couvrent une superficie supérieure à 2 500 m², valorisant ainsi ces espaces de nature en ville.
            <a
              className="fr-link fr-text--sm fr-ml-1w"
              target="_blank"
              rel="noopener noreferrer"
              href="https://artificialisation.developpement-durable.gouv.fr/exemption-des-parcs-et-jardins-publics"
            >
              En savoir plus
            </a>
          </li>
        </ul>
        <div className="fr-notice fr-notice--info">
          <div className="fr-px-2w">
            <div className="fr-notice__body">
              <p>
                <span className="fr-notice__title fr-text--sm">
                  L'IGN est actuellement en cours de production d'une base de données nationale intégrant les exemptions prévues pour les installations photovoltaïques au sol et les parcs ou jardins publics. Les données affichées sur la plateforme ne prennent pas encore en compte ces exemptions.
                </span>
                <a className="fr-notice__desc fr-text--sm" target="_blank" href="/newsletter/inscription">
                  {" "}
                  Inscrivez-vous à notre lettre d'infos pour être prévenu(e) de la
                  disponibilité de ces données
                </a>
              </p>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  );
};
