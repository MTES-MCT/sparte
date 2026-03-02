import React from "react";
import { LandDetailResultType } from "@services/types/land";
import { UserLandPreferenceResultType } from "@services/types/project";
import Triptych from "@components/ui/Triptych";
import Notice from "@components/ui/Notice";
import {
  TrajectoiresProvider,
  useTrajectoiresContext,
} from "./context/TrajectoiresContext";
import {
  TrajectoiresHierarchy,
  TrajectoiresObjectifs,
  TrajectoiresProjection,
  TrajectoiresChildrenStats,
  TrajectoiresCustomTargetModal,
} from "./components";

interface TrajectoiresProps {
  landData: LandDetailResultType;
  preference?: UserLandPreferenceResultType;
}

const TrajectoiresContent: React.FC = () => {
  const { landData, landId, landType, name, hasTerritorialisation, isFromParent } =
    useTrajectoiresContext();

  const { territorialisation } = landData;

  return (
    <div className="fr-p-3w">
      <Triptych
        className="fr-mb-5w"
        definition={{
          preview: "La trajectoire de sobriété foncière décrit la réduction progressive de la consommation d'espaces naturels, agricoles et forestiers (NAF) sur un territoire.",
          content: (
            <>
              <p className="fr-mb-2w">
                La trajectoire de sobriété foncière décrit la{" "}
                <strong>
                  réduction progressive de la consommation d'espaces naturels,
                  agricoles et forestiers (NAF)
                </strong>{" "}
                sur un territoire.
              </p>
              <p className="fr-mb-2w">
                Elle montre la répartition dans le temps de la{" "}
                <strong>consommation maximale d'espaces NAF autorisée</strong>,
                en cohérence avec les objectifs de sobriété foncière fixés à
                l'échelle nationale ou territorialisés.
              </p>
              <p>
                Elle constitue un <strong>outil d'aide à la décision</strong>{" "}
                permettant de suivre, d'ajuster et de justifier les choix
                d'aménagement, sans préjuger des projets à venir, mais en fixant
                un <strong>cadre quantitatif et temporel</strong> pour en
                maîtriser les impacts fonciers.
              </p>
            </>
          ),
        }}
        donnees={{
          preview: "Les données affichées sur cette plateforme proviennent du Portail national de l'artificialisation et sont produites par le CEREMA à partir des Fichiers Fonciers.",
          content: (
            <>
              <p>
                Les données affichées sur cette plateforme proviennent du
                Portail national de l'artificialisation et sont produites par le
                CEREMA à partir des Fichiers Fonciers. Elles constituent une{" "}
                <strong>donnée de référence</strong> pour la mesure de la
                consommation d'Espaces NAF.
              </p>
              <p>
                Ces données peuvent être complétées par des données locales (ex.
                MOS, bases communales, etc.) dès lors que celles-ci sont
                cohérentes avec les définitions légales et justifiées
                méthodologiquement.
              </p>
            </>
          ),
        }}
        cadreReglementaire={{
          preview: "La loi n° 2021-1104 du 22 août 2021 dite 'Climat et Résilience' fixe pour la France l'objectif de parvenir au Zéro Artificialisation Nette (ZAN) à l'horizon 2050 (article L.101-2-1 du Code de l'urbanisme).",
          content: (
            <>
              <p>
                La loi n° 2021-1104 du 22 août 2021 dite "Climat et Résilience"
                fixe pour la France l'objectif de parvenir au Zéro
                Artificialisation Nette (ZAN) à l'horizon 2050 (article
                L.101-2-1 du Code de l'urbanisme).
              </p>
              <p>
                À titre intermédiaire, les collectivités doivent inscrire leurs
                documents d'urbanisme dans{" "}
                <strong>
                  une trajectoire visant nationalement à réduire de moitié la
                  consommation d'Espaces NAF (naturels, agricoles et forestiers)
                  sur la période 2021-2031, par rapport à la décennie 2011-2020.
                </strong>
              </p>
            </>
          ),
        }}
      />

      {!hasTerritorialisation && (
        <Notice
          type="warning"
          title="Objectif national par défaut"
          className="fr-mb-5w"
          message={
            <>
              <p>
                L'équipe travaille à l'intégration des objectifs déjà
                territorialisés de réduction de la consommation d'espaces NAF.
                Dans l'attente de cette mise à jour, <strong>vous pouvez simuler différents scénarios d'objectifs de réduction ci-dessous</strong>. Par défaut,
                en attendant cette territorialisation, l'outil affiche l'objectif
                national de réduction de 50%.
              </p>
              <p>
                <strong>Cet objectif est fourni à titre indicatif et n'a pas de valeur réglementaire.</strong>
              </p>
            </>
          }
        />
      )}

      {hasTerritorialisation && territorialisation?.hierarchy?.length > 0 && (
        <TrajectoiresHierarchy
          hierarchy={territorialisation.hierarchy}
          land_id={landId}
          land_type={landType}
          land_name={name}
          has_children={territorialisation?.has_children ?? false}
          is_from_parent={isFromParent}
          parent_land_name={territorialisation?.parent_land_name ?? null}
          objectif={territorialisation?.objectif ?? null}
          child_land_types={territorialisation?.children_land_types ?? []}
        />
      )}

      <TrajectoiresObjectifs />
      <TrajectoiresProjection />
      <TrajectoiresChildrenStats />
      <TrajectoiresCustomTargetModal />
    </div>
  );
};

const Trajectoires: React.FC<TrajectoiresProps> = ({ landData, preference }) => {
  if (!landData) {
    return (
      <div role="status" aria-live="polite">
        Données non disponibles
      </div>
    );
  }

  return (
    <TrajectoiresProvider landData={landData} preference={preference}>
      <TrajectoiresContent />
    </TrajectoiresProvider>
  );
};

export default Trajectoires;
