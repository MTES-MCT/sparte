import React from "react";
import { Link } from "react-router-dom";
import { ProjectDetailResultType } from "@services/types/project";
import CallToAction from "@components/ui/CallToAction";

// Images statiques
import ecoleIcon from "@images/ecole_icon.png";
import mairieIcon from "@images/mairie_icon.png";
import appartementIcon from "@images/appartement_icon.png";
import successIcon from "@images/success_icon.png";
import successIconDisabled from "@images/success_icon_disabled.png";

interface RapportLocalProps {
  projectData: ProjectDetailResultType;
}

const ExternalLink: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
}) => (
  <a rel="noopener noreferrer" target="_blank" href={href}>
    {children}
  </a>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="fr-mt-7w">
    <h4>{title}</h4>
    <div className="bg-white fr-p-4w rounded">{children}</div>
  </div>
);

const EntityTile: React.FC<{
  title: string;
  description: string;
  icon: string;
}> = ({ title, description, icon }) => (
  <div className="fr-col-12 fr-col-md-4">
    <div className="fr-tile fr-tile--sm">
      <div className="fr-tile__body">
        <div className="fr-tile__content">
          <h3 className="fr-tile__title">{title}</h3>
          <p className="fr-tile__desc">{description}</p>
        </div>
      </div>
      <div className="fr-tile__header">
        <div className="fr-tile__pictogram">
          <img src={icon} className="w-100" alt="" />
        </div>
      </div>
    </div>
  </div>
);

interface IndicatorTileProps {
  title: string;
  description: React.ReactNode;
  isRequired: boolean;
  isAvailable: boolean;
  availabilityText: string;
}

const IndicatorTile: React.FC<IndicatorTileProps> = ({
  title,
  description,
  isRequired,
  isAvailable,
  availabilityText,
}) => (
  <div className="fr-tile fr-tile--sm fr-tile--horizontal fr-mt-3w">
    <div className="fr-tile__body d-flex justify-content-between">
      <div className="fr-tile__content">
        <h3 className="fr-tile__title">{title}</h3>
        <p className="fr-tile__desc">{description}</p>
        <p className="fr-tile__detail d-flex flex-column">
          <span className="fw-bold fr-text--sm">
            Indicateur {isRequired ? "obligatoire" : "non obligatoire"}.
          </span>
          <span className={isAvailable ? "text-default-success" : "text-muted"}>
            {availabilityText}
          </span>
        </p>
      </div>
      <div className="d-flex align-items-center fr-tile__icon fr-ml-7w">
        <img
          src={isAvailable ? successIcon : successIconDisabled}
          className="w-100"
          alt=""
        />
      </div>
    </div>
  </div>
);

const RapportLocal: React.FC<RapportLocalProps> = ({ projectData }) => {
  return (
    <div className="fr-container--fluid fr-p-3w">
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

          {/* Section: Objet du rapport */}
          <div className="fr-mt-3w">
            <h4>
              Objet du rapport triennal local de suivi de l'artificialisation
              des sols
            </h4>
            <div className="bg-white fr-p-4w rounded">
              <div className="fr-highlight fr-highlight--no-margin">
                <p className="fr-text--sm">
                  Sur la décennie 2011-2021, 24 000 ha d'espaces naturels,
                  agricoles et forestiers ont été consommés chaque année en
                  moyenne en France, soit près de 5 terrains de football par
                  heure. Les conséquences sont écologiques mais aussi
                  socio-économiques.
                </p>
              </div>
              <div className="fr-mt-3w">
                <p className="fr-text--sm mb-3">
                  La France s'est donc fixé, dans le cadre de la{" "}
                  <ExternalLink href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043956924">
                    loi n° 2021-1104 du 22 août 2021
                  </ExternalLink>{" "}
                  dite « Climat et résilience » complétée par la{" "}
                  <ExternalLink href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000047866733">
                    loi n° 2023-630 du 20 juillet 2023
                  </ExternalLink>
                  , l'objectif d'atteindre le « zéro artificialisation nette des
                  sols » en 2050, avec un objectif intermédiaire de réduction de
                  moitié de la consommation d'espaces NAF (Naturels, Agricoles
                  et Forestiers) sur 2021-2031 par rapport à la décennie
                  précédente.
                </p>
                <p className="fr-text--sm mb-3">
                  Cette trajectoire progressive est à décliner territorialement
                  dans les documents de planification et d'urbanisme.
                </p>
                <p className="fr-text--sm mb-3">
                  Cette trajectoire est mesurée, pour la période 2021-2031, en
                  consommation d'espaces NAF (Naturels, Agricoles et Forestiers),
                  définie comme « la création ou l'extension effective d'espaces
                  urbanisés sur le territoire concerné » (
                  <ExternalLink href="https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000043957223">
                    article 194, III, 5° de la loi Climat et résilience
                  </ExternalLink>
                  ). Le bilan de consommation d'espaces NAF (Naturels, Agricoles
                  et Forestiers) s'effectue à l'échelle d'un document de
                  planification ou d'urbanisme.
                </p>
                <p className="fr-text--sm mb-0">
                  A partir de 2031, cette trajectoire est également mesurée en
                  artificialisation nette des sols, définie comme « le solde de
                  l'artificialisation et de la désartificialisation des sols
                  constatées sur un périmètre et sur une période donnés » (
                  <ExternalLink href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043967077/2023-09-04">
                    article L.101-2-1 du code de l'urbanisme
                  </ExternalLink>
                  ). L'artificialisation nette des sols se calcule à l'échelle
                  d'un document de planification ou d'urbanisme.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Qui doit établir ce rapport */}
          <Section title="Qui doit établir ce rapport ?">
            <div className="fr-container--fluid">
              <div className="fr-grid-row fr-grid-row--gutters">
                <EntityTile
                  title="Les communes"
                  description="dotées d'un document d'urbanisme"
                  icon={ecoleIcon}
                />
                <EntityTile
                  title="Les établissements publics de coopération intercommunale"
                  description="dotés d'un document d'urbanisme"
                  icon={mairieIcon}
                />
                <EntityTile
                  title="Les services déconcentrés de l'Etat (DDT)"
                  description="Pour les territoires soumis au règlement national d'urbanisme (RNU)"
                  icon={appartementIcon}
                />
              </div>
            </div>
            <p className="fr-text--sm mt-3 mb-0">
              L'enjeu est de mesurer et de communiquer régulièrement au sujet du
              rythme de l'artificialisation des sols, afin d'anticiper et de
              suivre la trajectoire et sa réduction. Ce rapport doit être
              présenté à l'organe délibérant, faire l'objet d'un débat et d'une
              délibération du conseil municipal ou communautaire, et de mesures
              de publicité. Le rapport est transmis dans un délai de quinze
              jours suivant sa publication aux préfets de région et de
              département, au président du conseil régional, au président de
              l'EPCI dont la commune est membre ou aux maires des communes
              membres de l'EPCI compétent ainsi qu'aux observatoires locaux de
              l'habitat et du foncier.
            </p>
          </Section>

          {/* Section: Quand doit être établi ce rapport */}
          <Section title="Quand doit être établi ce rapport et sur quelle période ?">
            <p className="fr-text--sm mb-3">
              Le premier rapport doit être réalisé 3 ans après l'entrée en
              vigueur de la loi, soit en 2024.
            </p>
            <p className="fr-text--sm mb-3">
              A noter que c'est le rapport qui est triennal, et non la période à
              couvrir par le rapport :
            </p>
            <ul className="fr-text--sm mb-0">
              <li>
                Il faut que le rapport soit produit a minima tous les 3 ans. Il
                est donc possible pour une collectivité qui le souhaite, de
                produire un rapport, par exemple tous les ans ou tous les 2 ans.
              </li>
              <li>
                La période à couvrir n'est pas précisée dans les textes. Étant
                donné que l'État met à disposition les données des fichiers
                fonciers depuis le 1er janvier 2011 (le début de la période de
                référence de la loi CR), il serait intéressant que le rapport
                présente la chronique des données du 1er janvier 2011 et
                jusqu'au dernier millésime disponible, pour apprécier la
                trajectoire du territoire concerné avec le recul nécessaire (les
                variations annuelles étant toujours à prendre avec prudence car
                pouvant refléter de simples biais méthodologiques dans les
                données sources).
              </li>
            </ul>
          </Section>

          {/* Section: Que doit contenir ce rapport */}
          <Section title="Que doit contenir ce rapport ?">
            <p className="fr-text--sm mb-3">
              Le contenu minimal obligatoire est détaillé à l'
              <ExternalLink href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000048470630">
                article R. 2231-1 du code général des collectivités
                territoriales
              </ExternalLink>
              :
            </p>

            <IndicatorTile
              title="1° La consommation des espaces naturels, agricoles et forestiers, exprimée en nombre d'hectares, le cas échéant en la différenciant entre ces types d'espaces, et en pourcentage au regard de la superficie du territoire couvert."
              description="Sur le même territoire, le rapport peut préciser également la transformation effective d'espaces urbanisés ou construits en espaces naturels, agricoles et forestiers du fait d'une désartificialisation."
              isRequired={true}
              isAvailable={true}
              availabilityText="Disponible sur Mon Diag Artif, France Métropolitaine, Corse et DROM (sauf Mayotte)."
            />

            <IndicatorTile
              title="2° Le solde entre les surfaces artificialisées et les surfaces désartificialisées,"
              description={
                <>
                  telles que définies dans la nomenclature annexée à l'
                  <ExternalLink href="https://www.legifrance.gouv.fr/affichCodeArticle.do?cidTexte=LEGITEXT000006074075&idArticle=LEGIARTI000045729062&dateTexte=&categorieLien=cid">
                    article R. 101-1 du code de l'urbanisme
                  </ExternalLink>
                  .
                </>
              }
              isRequired={false}
              isAvailable={true}
              availabilityText="Disponible sur Mon Diag Artif, pour les territoires avec l'OCS GE."
            />

            <IndicatorTile
              title="3° Les surfaces dont les sols ont été rendus imperméables,"
              description={
                <>
                  au sens des 1° et 2° de la nomenclature annexée à{" "}
                  <ExternalLink href="https://www.legifrance.gouv.fr/affichCodeArticle.do?cidTexte=LEGITEXT000006074075&idArticle=LEGIARTI000045729062&dateTexte=&categorieLien=cid">
                    l'article R. 101-1 du code de l'urbanisme
                  </ExternalLink>
                  .
                </>
              }
              isRequired={false}
              isAvailable={true}
              availabilityText="Disponible sur Mon Diag Artif, pour les territoires avec l'OCS GE."
            />

            <IndicatorTile
              title="4° L'évaluation du respect des objectifs de réduction de la consommation d'espaces naturels, agricoles et forestiers et de lutte contre l'artificialisation des sols fixés dans les documents de planification et d'urbanisme."
              description={
                <>
                  Les documents de planification sont ceux énumérés au{" "}
                  <ExternalLink href="https://www.legifrance.gouv.fr/affichCodeArticle.do?cidTexte=LEGITEXT000006074075&idArticle=LEGIARTI000045729062&dateTexte=&categorieLien=cid">
                    III de l'article R. 101-1 du code de l'urbanisme
                  </ExternalLink>
                  .
                </>
              }
              isRequired={false}
              isAvailable={false}
              availabilityText="Non prévu dans Mon Diag Artif."
            />

            <div className="fr-highlight fr-highlight--no-margin fr-mt-3w">
              <p className="fr-text--sm mb-0">
                Avant 2031, il n'est pas obligatoire de renseigner les
                indicateurs 2°, 3° et 4° tant que les documents d'urbanisme
                n'ont pas intégré cet objectif.
              </p>
            </div>
          </Section>

          {/* Section: Sources d'informations */}
          <Section title="Quelles sont les sources d'informations disponibles pour ce rapport ?">
            <p className="fr-text--sm mb-3">
              Les données produites par l'
              <ExternalLink href="https://artificialisation.developpement-durable.gouv.fr/">
                observatoire national de l'artificialisation
              </ExternalLink>{" "}
              sont disponibles gratuitement.
            </p>
            <p className="fr-text--sm mb-3">
              MonDiagnosticArtificialisation vous propose une première trame de
              ce rapport triennal local, en s'appuyant sur les données de
              l'observatoire national disponibles à date, soit:
            </p>
            <ul className="fr-text--sm">
              <li>
                concernant la consommation d'espaces naturels, agricoles et
                forestiers, les données issues des fichiers fonciers produites
                annuellement par le Cerema ;
              </li>
              <li>
                concernant l'artificialisation nette des sols, les données
                issues de l'occupation des sols à grande échelle (OCS GE) en
                cours de production par l'IGN, qui seront disponibles sur
                l'ensemble du territoire national d'ici fin 2025.
              </li>
            </ul>
            <p className="fr-text--sm mb-3">
              Il n'est, bien évidemment, pas demandé d'inventer des données non
              encore disponibles : pour le premier rapport triennal à produire
              d'ici août 2024 il est possible d'utiliser les fichiers fonciers
              au 1er janvier 2024, couvrant la consommation d'espaces NAF
              (Naturels, Agricoles et Forestiers) de l'année 2023.
            </p>
            <p className="fr-text--sm mb-3">
              Il est également possible d'utiliser les données locales,
              notamment celles des observatoires de l'habitat et du foncier{" "}
              <ExternalLink href="https://www.legifrance.gouv.fr/affichCodeArticle.do?cidTexte=LEGITEXT000006074096&idArticle=LEGIARTI000006824763&dateTexte=&categorieLien=cid">
                (art. L. 302-1 du code de la construction et de l'habitation)
              </ExternalLink>{" "}
              et de s'appuyer sur les analyses réalisées dans le cadre de
              l'évaluation du schéma de cohérence territoriale (ScoT –{" "}
              <ExternalLink href="https://www.legifrance.gouv.fr/affichCodeArticle.do?cidTexte=LEGITEXT000006074075&idArticle=LEGIARTI000031211077&dateTexte=&categorieLien=cid">
                art. L. 143-28 du code de l'urbanisme
              </ExternalLink>
              ) et de celle du plan local d'urbanisme (
              <ExternalLink href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043977819">
                art. L. 153-27 du code de l'urbanisme
              </ExternalLink>
              ).
            </p>
            <p className="fr-text--sm mb-0">
              Ces données locales doivent être conformes aux définitions légales
              de la consommation d'espaces (et le cas échéant de
              l'artificialisation nette des sols), homogènes et cohérentes sur
              la décennie de référence de la loi (1er janvier 2011-1er janvier
              2021) et sur la décennie en cours (1er janvier 2021-1er janvier
              2031).
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default RapportLocal;
