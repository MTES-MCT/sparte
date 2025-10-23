import React from "react";
import { LogementVacantProps } from "./types";
import { LogementVacantProgression } from "./components/LogementVacantProgression";
import { LogementVacantRatio } from "./components/LogementVacantRatio";
import { LogementVacantConso } from "./components/LogementVacantConso";
import { LogementVacantAutorisation } from "./components/LogementVacantAutorisation";
import Guide from "@components/ui/Guide";
import { LogementVacantOverview, LogementVacantAbstract } from "@components/features/logementVacant";

export const LogementVacant: React.FC<LogementVacantProps> = ({ landData }) => {
  const { land_id, land_type, name, logements_vacants_status, logements_vacants_status_details } = landData;
  const startYear = 2019;
  const endYear = 2023;

  // Always try to load autorisation data - the component will handle gracefully if not available
  const hasAutorisationLogement = true;

  return (
    <div className="fr-container--fluid fr-p-3w">
      <div className="fr-grid-row">
        <div className="fr-col-12">
          <Guide title="A propos de la vacance des logements">
            On distingue deux formes principales de vacance des logements : la vacance conjoncturelle, qui est de
            courte durée et nécessaire à la fluidité du marché du logement, et la vacance structurelle, qui pourrait
            se substituer à la construction neuve de logements, souvent génératrice d'artificialisation des sols et
            contre laquelle il est légitime de lutter. Dans cette perpective, l'analyse proposée s'appuie sur une
            définition différenciée selon le type de parc : sont ainsi pris en compte les logements vacants depuis
            plus de deux ans dans le parc privé et ceux inoccupés depuis plus de 3 mois dans le parc des bailleurs
            sociaux.
          </Guide>

          <div className="fr-mt-7w">
            <LogementVacantOverview logements_vacants_status_details={logements_vacants_status_details} className="fr-mb-3w" />
            <LogementVacantAbstract
              logements_vacants_status={logements_vacants_status}
              logements_vacants_status_details={logements_vacants_status_details}
              name={name}
              className="fr-mt-2w"
            />
          </div>

          {/* Section 1: Évolution de la vacance des logements */}
          <LogementVacantProgression landId={land_id} landType={land_type} startYear={startYear} endYear={endYear} />

          <LogementVacantRatio landId={land_id} landType={land_type} startYear={startYear} endYear={endYear} />

          {/* Section 2: Logements vacants et consommation d'espaces NAF */}
          <LogementVacantConso landId={land_id} landType={land_type} startYear={startYear} endYear={endYear} />

          {/* Section 3: Logements vacants et autorisations de construction (conditionnel) */}
          <LogementVacantAutorisation
            landId={land_id}
            landType={land_type}
            startYear={startYear}
            endYear={endYear}
            hasAutorisationLogement={hasAutorisationLogement}
            territoryName={name}
          />

          <div className="fr-callout fr-icon-information-line fr-mt-7w">
            <h3 className="fr-callout__title fr-text--md">
              Réduisez votre consommation d'espaces NAF en mobilisant le parc de logements vacants
            </h3>
            <p className="fr-callout__text fr-text--sm">
              Zéro Logement Vacant est un outil gratuit qui accompagne les territoires dans leur démarche de remise
              sur le marché des logements vacants.
            </p>
            <br />
            <a
              target="_blank"
              rel="noopener noreferrer external"
              title=""
              href="https://zerologementvacant.beta.gouv.fr/zero-logement-vacant/la-plateforme/?src=mda"
              className="fr-notice__link fr-link fr-text--sm"
            >
              Accèder à Zéro Logement Vacant
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogementVacant;
