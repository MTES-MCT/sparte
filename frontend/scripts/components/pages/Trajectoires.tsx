import React from 'react';
import Guide from '@components/ui/Guide';
import ObjectiveChart from '@components/charts/ObjectiveChart';
import { LandDetailResultType } from '@services/types/land';
import { formatNumber } from '@utils/formatUtils';

interface TrajectoiresProps {
  landData: LandDetailResultType;
  defaultTarget2031?: number;
}

const Trajectoires: React.FC<TrajectoiresProps> = ({ landData, defaultTarget2031 = 50 }) => {
  const { land_id, land_type, conso_details } = landData || {};

  if (!landData) return <div>Données non disponibles</div>;

  // Utiliser les données de conso_details
  const total_2020 = conso_details?.conso_2011_2020 || 0;
  const annual_2020 = total_2020 / 10;

  // Calculer la projection 2031 basée sur l'objectif de réduction
  const annual_objective_2031 = annual_2020 - (annual_2020 * defaultTarget2031 / 100);
  const conso_2031 = annual_objective_2031 * 10;

  return (
    <div className="fr-container--fluid fr-p-3w">
      <div className="fr-grid-row">
        <div className="fr-col-12">
          <Guide
            title="Cadre réglementaire"
            DrawerTitle="Cadre Réglementaire"
            drawerChildren={
              <>
                <p className="fr-text--sm mb-3">
                  La loi Climat & Résilience fixe
                  <strong>
                    {' '}
                    l'objectif d'atteindre le « zéro artificialisation nette des sols » en 2050, avec un
                    objectif intermédiaire de réduction de moitié de la consommation d'espaces
                  </strong>{' '}
                  naturels, agricoles et forestiers dans les dix prochaines années 2021-2031 (en se basant
                  sur les données allant du 01/01/2021 au 31/12/2030) par rapport à la décennie précédente
                  2011-2021 (en se basant sur les données allant du 01/01/2011 au 31/12/2020).
                </p>
                <p className="fr-text--sm mb-3">
                  Cette <strong>trajectoire nationale progressive</strong> est à décliner dans les documents
                  de planification et d'urbanisme (avant le 22 novembre 2024 pour les SRADDET, avant le 22
                  février 2027 pour les SCoT et avant le 22 février 2028 pour les PLU(i) et cartes
                  communales).
                </p>
                <p className="fr-text--sm mb-3">
                  Elle doit être conciliée avec{' '}
                  <strong>l'objectif de soutien de la construction durable</strong>, en particulier dans les
                  territoires où l'offre de logements et de surfaces économiques est insuffisante au regard
                  de la demande.
                </p>
                <p className="fr-text--sm mb-3">
                  La loi prévoit également que{' '}
                  <strong>
                    la consommation foncière des projets d'envergure nationale ou européenne et d'intérêt
                    général majeur sera comptabilisée au niveau national
                  </strong>
                  , et non au niveau régional ou local. Ces projets seront énumérés par arrêté du ministre
                  chargé de l'urbanisme, en fonction de catégories définies dans la loi, après consultation
                  des régions, de la conférence régionale et du public. Un forfait de 12 500 hectares est
                  déterminé pour la période 2021-2031, dont 10 000 hectares font l'objet d'une péréquation
                  entre les régions couvertes par un SRADDET.
                </p>
                <p className="fr-text--sm mb-3">
                  Cette loi précise également l'exercice de territorialisation de la trajectoire. Afin de
                  tenir compte des besoins de l'ensemble des territoires,{' '}
                  <strong>
                    une surface minimale d'un hectare de consommation est garantie à toutes les communes
                    couvertes par un document d'urbanisme prescrit
                  </strong>
                  , arrêté ou approuvé avant le 22 août 2026, pour la période 2021-2031. Cette « garantie
                  communale » peut être mutualisée au niveau intercommunal à la demande des communes.
                </p>
                <p className="fr-text--sm mb-3">
                  Dès aujourd'hui, <strong>Mon Diagnostic Artificialisation</strong> vous permet de vous
                  projeter dans cet objectif de réduction de la consommation d'espaces NAF (Naturels,
                  Agricoles et Forestiers) d'ici à 2031 et de simuler divers scénarios.
                </p>
                <p className="fr-text--sm mb-3">
                  La consommation d'espaces NAF (Naturels, Agricoles et Forestiers) est mesurée avec les
                  données d'évolution des fichiers fonciers produits et diffusés par le Cerema depuis 2009 à
                  partir des fichiers MAJIC de la DGFIP.
                </p>
              </>
            }
          >
            La loi Climat & Résilience fixe
            <strong>
              {' '}
              l'objectif d'atteindre le « zéro artificialisation nette des sols » en 2050, avec un objectif
              intermédiaire de réduction de moitié de la consommation d'espaces
            </strong>{' '}
            naturels, agricoles et forestiers dans les dix prochaines années 2021-2031 par rapport à la
            décennie précédente 2011-2021.
          </Guide>

          <div className="fr-notice fr-notice--warning fr-my-3w">
            <div className="fr-px-2w">
              <div className="fr-notice__body">
                <p>
                  <span className="fr-notice__title fr-text--sm">
                    L'équipe travaille à l'intégration des objectifs déjà territorialisés de réduction de la
                    consommation d'espaces NAF.{' '}
                  </span>
                  <span className="fr-notice__desc fr-text--sm">
                    Dans l'attente de cette mise à jour, vous pouvez modifier l'objectif du territoire dans
                    le graphique ci-dessous. Par défaut, en attendant cette territorialisation, l'outil
                    affiche l'objectif national de réduction de 50%.
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Cards avec les indicateurs */}
          <div className="fr-grid-row fr-grid-row--gutters fr-mt-5w">
            <div className="fr-col-12 fr-col-md-6">
              <div className="fr-callout bg-white w-100 fr-p-5w">
                <h4>Période de référence</h4>
                <div className="d-flex fr-mb-1w align-items-center">
                  <p className="fr-callout__title mb-0">
                    +{formatNumber({ number: total_2020 })} ha
                  </p>
                  <p className="fr-tag fr-tag--sm fr-tag--blue fr-ml-2w mb-0">
                    <strong>
                      +{formatNumber({ number: annual_2020 })} ha/an
                    </strong>
                  </p>
                </div>
                <p className="fr-text--sm mb-0">
                  Consommation cumulée de la période du 1er jan. 2011 au 31 déc. 2020 (10 ans)
                </p>
              </div>
            </div>

            <div className="fr-col-12 fr-col-md-6">
              <div className="fr-callout bg-white w-100 fr-p-5w">
                <h4>Projection 2031</h4>
                <div className="d-flex fr-mb-1w align-items-center">
                  <p className="fr-callout__title mb-0">
                    +{formatNumber({ number: conso_2031 })} ha
                  </p>
                  <p className="fr-tag fr-tag--sm fr-tag--blue fr-ml-2w mb-0">
                    <strong>
                      +{formatNumber({ number: annual_objective_2031 })} ha/an
                    </strong>
                  </p>
                </div>
                <p className="fr-text--sm mb-0">
                  Consommation cumulée de la période du 1er jan. 2021 au 31 déc. 2030 (10 ans) avec un
                  objectif non-réglementaire de réduction de <strong>{defaultTarget2031}%</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Graphique */}
          <div className="fr-mt-3w">
            <div className="bg-white fr-p-2w">
              <ObjectiveChart
                land_id={land_id}
                land_type={land_type}
                target2031={defaultTarget2031}
                sources={['majic']}
                showDataTable={true}
              >
                <div>
                  <h6 className="fr-mt-2w">Calcul</h6>
                  <p className="mb-3 fr-text--sm">
                    La consommation réelle annuelle et cumulée provient des données du Cerema. Elles donnent
                    la consommation d'espaces NAF (Naturels, Agricoles et Forestiers) par année, pour le
                    territoire choisi.
                  </p>
                  <p className="mb-3 fr-text--sm">
                    Cette consommation est calculée avec le dernier millésime disponible des fichiers fonciers.
                    A l'occasion de la mise à jour annuelle des données par le CEREMA, des modifications
                    peuvent apparaître sur les années précédentes.
                  </p>
                </div>
              </ObjectiveChart>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Trajectoires;
