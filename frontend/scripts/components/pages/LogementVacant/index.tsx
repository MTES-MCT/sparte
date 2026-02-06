import React from 'react'
import Guide from '@components/ui/Guide'
import GenericChart from '@components/charts/GenericChart'
import { LogementVacantOverview, LogementVacantAbstract } from '@components/features/logementVacant'
import { ExternalServiceTile } from '@components/ui/ExternalServiceTile'
import zeroLogementVacantImage from '@images/logo_ZLV.png'
import { LogementVacantTaux } from './components/LogementVacantTaux'
import { LogementVacantConso } from './components/LogementVacantConso'
import { LogementVacantAutorisation } from './components/LogementVacantAutorisation'
import { LogementVacantProps } from './types'
import React from "react";
import { LogementVacantProps } from "./types";
import { LogementVacantProgression } from "./components/LogementVacantProgression";
import { LogementVacantRatio } from "./components/LogementVacantRatio";
import { LogementVacantConso } from "./components/LogementVacantConso";
import { LogementVacantAutorisation } from "./components/LogementVacantAutorisation";
import Triptych from "@components/ui/Triptych";
import { LogementVacantOverview, LogementVacantAbstract } from "@components/features/logementVacant";
import { ExternalServiceTile } from "@components/ui/ExternalServiceTile";
import zeroLogementVacantImage from "@images/logo_ZLV.png";

const LAND_TYPE_LABELS: Record<string, string> = {
  COMM: 'Commune',
  EPCI: 'EPCI',
  DEPART: 'Département',
  SCOT: 'SCoT',
  REGION: 'Région',
}

export const LogementVacant: React.FC<LogementVacantProps> = ({ landData }) =>
{
  const {
    land_id, land_type, name, child_land_types, logements_vacants_status, logements_vacants_status_details,
  } = landData
  const startYear = 2020
  const endYear = 2024
  const hasAutorisationLogement = true
  const defaultChildType = land_type === 'REGION' && child_land_types?.includes('DEPART')
    ? 'DEPART'
    : child_land_types?.[0] || ''
  const [childType, setChildType] = React.useState<string>(defaultChildType)

  return (
    <div className="fr-container--fluid fr-p-3w">
      <div className="fr-grid-row">
        <div className="fr-col-12">
          <Guide title="Qu'est-ce que la vacance structurelle des logements ?">
            <p>La vacance des logements se décline en deux formes :</p>
            <ul>
              <li><strong>Vacance frictionnelle</strong> : de courte durée, elle est normale et nécessaire à la fluidité du marché immobilier.</li>
              <li><strong>Vacance structurelle</strong> : de longue durée, elle représente un gisement de logements mobilisables pouvant se substituer à la construction neuve, souvent génératrice d'artificialisation des sols.</li>
            </ul>
            <p>
              C'est cette vacance structurelle qui constitue un levier de sobriété foncière.
              L'analyse porte sur les logements vacants depuis plus de 2 ans dans le parc privé (source : LOVAC)
              et ceux inoccupés depuis plus de 3 mois dans le parc social (source : RPLS).
            </p>
          </Guide>
          <Triptych
            className="fr-mb-5w"
            definition={{
              summary: "On distingue vacance conjoncturelle (courte durée) et structurelle, qui pourrait se substituer à la construction neuve.",
              content: (
                <>
                  <p>On distingue deux formes principales de vacance des logements : <strong>la vacance conjoncturelle</strong>, qui est de courte durée et nécessaire à la fluidité du marché du logement, et <strong>la vacance structurelle</strong>, qui pourrait se substituer à la construction neuve de logements, souvent génératrice d'artificialisation des sols et contre laquelle il est légitime de lutter.</p>
                  <p>Dans cette perspective, l'analyse proposée s'appuie sur une définition différenciée selon le type de parc : sont ainsi pris en compte les logements vacants depuis plus de deux ans dans le parc privé et ceux inoccupés depuis plus de 3 mois dans le parc des bailleurs sociaux.</p>
                </>
              ),
            }}
            donnees={{
              summary: "Base LOVAC (CEREMA) pour le parc privé et base RPLS (MTE) pour le parc des bailleurs sociaux.",
              content: (
                <>
                  <p>Les données sur la vacance des logements affichées sur cette page proviennent de la <strong>base LOVAC</strong> produite par le CEREMA pour le parc privé, ainsi que de la <strong>base RPLS</strong> produite par le Ministère de la Transition Écologique (MTE), pour ce qui concerne le parc des bailleurs sociaux.</p>
                  <p>Ces données sont disponibles à l'échelle de la commune.</p>
                  <p>Les données de consommation d'espaces NAF (CEREMA) et de la base SITADEL (MTE) sont également utilisées pour certains indicateurs.</p>
                </>
              ),
            }}
          />
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
          <h2 className="fr-h4 fr-mb-3w">Évolution du taux de vacance des logements sur le territoire</h2>
          <LogementVacantTaux landId={land_id} landType={land_type} startYear={startYear} endYear={endYear} />
        </div>

        <div className="fr-col-12 fr-mb-7w">
          <h2 className="fr-h4 fr-mb-3w">Logements vacants et consommation d'espaces NAF</h2>
          <LogementVacantConso landId={land_id} landType={land_type} startYear={startYear} endYear={endYear} />
        </div>

        <div className="fr-col-12 fr-mb-7w">
          <h2 className="fr-h4 fr-mb-3w">Logements vacants et autorisations d'urbanisme</h2>
          <LogementVacantAutorisation
            landId={land_id}
            landType={land_type}
            startYear={startYear}
            endYear={endYear}
            hasAutorisationLogement={hasAutorisationLogement}
            territoryName={name}
          />
        </div>

        {child_land_types && child_land_types.length > 0 && (
          <div className="fr-col-12 fr-mb-7w">
            <h2 className="fr-h4 fr-mb-3w">Cartes de la vacance structurelle des logements</h2>

            {child_land_types.length > 1 && (
              <div className="fr-mb-3w">
                {child_land_types.map((clt) => (
                  <button
                    key={clt}
                    className={`fr-btn ${
                      childType === clt ? 'fr-btn--primary' : 'fr-btn--tertiary'
                    } fr-btn--sm fr-mr-1w`}
                    onClick={() => setChildType(clt)}
                  >
                    {LAND_TYPE_LABELS[clt] || clt}
                  </button>
                ))}
              </div>
            )}

            <div className="fr-grid-row fr-grid-row--gutters">
              <div className="fr-col-12 fr-col-lg-6">
                <div className="bg-white fr-p-2w rounded h-100">
                  <GenericChart
                    key={`logement_vacant_map_percent-${childType}-${endYear}`}
                    id="logement_vacant_map_percent"
                    land_id={land_id}
                    land_type={land_type}
                    params={{
                      end_date: String(endYear),
                      child_land_type: childType,
                    }}
                    showDataTable={true}
                    isMap={true}
                    sources={['lovac', 'rpls']}
                  />
                </div>
              </div>
              <div className="fr-col-12 fr-col-lg-6">
                <div className="bg-white fr-p-2w rounded h-100">
                  <GenericChart
                    key={`logement_vacant_map_absolute-${childType}-${endYear}`}
                    id="logement_vacant_map_absolute"
                    land_id={land_id}
                    land_type={land_type}
                    params={{
                      end_date: String(endYear),
                      child_land_type: childType,
                    }}
                    showDataTable={true}
                    isMap={true}
                    sources={['lovac', 'rpls']}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

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
  )
}

export default LogementVacant
