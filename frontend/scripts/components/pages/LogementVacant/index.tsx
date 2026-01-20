import React from "react";
import { LogementVacantProps } from "./types";
import { LogementVacantProgression } from "./components/LogementVacantProgression";
import { LogementVacantRatio } from "./components/LogementVacantRatio";
import { LogementVacantConso } from "./components/LogementVacantConso";
import { LogementVacantAutorisation } from "./components/LogementVacantAutorisation";
import Guide from "@components/ui/Guide";
import { LogementVacantOverview, LogementVacantAbstract } from "@components/features/logementVacant";
import { ExternalServiceTile } from "@components/ui/ExternalServiceTile";
import zeroLogementVacantImage from "@images/logo_ZLV.png";

export const LogementVacant: React.FC<LogementVacantProps> = ({ landData }) => {
  const { land_id, land_type, name, logements_vacants_status, logements_vacants_status_details } = landData;
  const startYear = 2019;
  const endYear = 2023;
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
        </div>

        <div className="fr-col-12 fr-mb-7w">
          <LogementVacantOverview logements_vacants_status_details={logements_vacants_status_details} className="fr-mb-3w" />
          <LogementVacantAbstract
            logements_vacants_status={logements_vacants_status}
            logements_vacants_status_details={logements_vacants_status_details}
            name={name}
          />
        </div>

        <div className="fr-col-12 fr-mb-7w">
          <h2 className="fr-h4 fr-mb-3w">Évolution de la vacance des logements</h2>
          <LogementVacantProgression landId={land_id} landType={land_type} startYear={startYear} endYear={endYear} />
          <LogementVacantRatio landId={land_id} landType={land_type} startYear={startYear} endYear={endYear} />
        </div>

        <div className="fr-col-12 fr-mb-7w">
          <h2 className="fr-h4 fr-mb-3w">Logements vacants et consommation d'espaces NAF</h2>
          <LogementVacantConso landId={land_id} landType={land_type} startYear={startYear} endYear={endYear} />
        </div>

        <div className="fr-col-12 fr-mb-7w">
          <h2 className="fr-h4 fr-mb-3w">Logements vacants et autorisations de construction de logements</h2>
          <LogementVacantAutorisation
            landId={land_id}
            landType={land_type}
            startYear={startYear}
            endYear={endYear}
            hasAutorisationLogement={hasAutorisationLogement}
            territoryName={name}
          />
        </div>

        <div className="fr-col-12">
          <h2 className="fr-h4 fr-mb-3w">Pour aller plus loin dans votre démarche de remobilisation des logements vacants</h2>
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12 fr-col-lg-6">
              <ExternalServiceTile
                imageUrl={zeroLogementVacantImage}
                imageAlt="Logo de Zéro Logement Vacant"
                title="Réduisez votre consommation d'espaces NAF en mobilisant le parc de logements vacants grâce à Zéro Logement Vacant"
                description="Zéro Logement Vacant est un outil gratuit qui accompagne les territoires dans leur démarche de remise sur le marché des logements vacants."
                href="https://zerologementvacant.beta.gouv.fr/zero-logement-vacant/la-plateforme/?src=mda"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogementVacant;
