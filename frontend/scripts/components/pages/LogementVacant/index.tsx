import React from "react";
import { LandDetailResultType } from "@services/types/land";
import Triptych from "@components/ui/Triptych";
import {
  LogementVacantProvider,
  useLogementVacantContext,
} from "./context/LogementVacantContext";
import {
  LogementVacantKpiCards,
  LogementVacantTaux,
  LogementVacantConso,
  LogementVacantAutorisation,
  LogementVacantMaps,
  LogementVacantExternalServices,
} from "./components";

interface LogementVacantProps {
  landData: LandDetailResultType;
}

const LogementVacantContent: React.FC = () => {
  const { childLandTypes } = useLogementVacantContext();

  return (
    <div className="fr-container--fluid fr-p-3w">
      <div className="fr-grid-row">
        <div className="fr-col-12">
          <Triptych
            className="fr-mb-5w"
            definition={{
              preview: "On distingue deux formes principales de vacance des logements : la vacance conjoncturelle, qui est de courte durée et nécessaire à la fluidité du marché du logement, et la vacance structurelle, qui pourrait se substituer à la construction neuve de logements, souvent génératrice d'artificialisation des sols et contre laquelle il est légitime de lutter.",
              content: (
                <>
                  <p>
                    On distingue deux formes principales de vacance des logements :{" "}
                    <strong>la vacance conjoncturelle</strong>, qui est de courte
                    durée et nécessaire à la fluidité du marché du logement, et{" "}
                    <strong>la vacance structurelle</strong>, qui pourrait se
                    substituer à la construction neuve de logements, souvent
                    génératrice d'artificialisation des sols et contre laquelle il
                    est légitime de lutter.
                  </p>
                  <p>
                    Dans cette perspective, l'analyse proposée s'appuie sur une
                    définition différenciée selon le type de parc : sont ainsi pris
                    en compte les logements vacants depuis plus de deux ans dans le
                    parc privé et ceux inoccupés depuis plus de 3 mois dans le parc
                    des bailleurs sociaux.
                  </p>
                </>
              ),
            }}
            donnees={{
              preview: "Les données sur la vacance des logements affichées sur cette page proviennent de la base LOVAC produite par le CEREMA pour le parc privé, ainsi que de la base RPLS produite par le Ministère de la Transition Écologique (MTE), pour ce qui concerne le parc des bailleurs sociaux.",
              content: (
                <>
                  <p>
                    Les données sur la vacance des logements affichées sur cette
                    page proviennent de la <strong>base LOVAC</strong> produite par
                    le CEREMA pour le parc privé, ainsi que de la{" "}
                    <strong>base RPLS</strong> produite par le Ministère de la
                    Transition Écologique (MTE), pour ce qui concerne le parc des
                    bailleurs sociaux.
                  </p>
                  <p>Ces données sont disponibles à l'échelle de la commune.</p>
                  <p>
                    Les données de consommation d'espaces NAF (CEREMA) et de la base
                    SITADEL (MTE) sont également utilisées pour certains
                    indicateurs.
                  </p>
                </>
              ),
            }}
          />
          <LogementVacantKpiCards />
        </div>

        <div className="fr-col-12 fr-mb-7w">
          <h2 className="fr-h4 fr-mb-3w">
            Évolution du taux de vacance des logements sur le territoire
          </h2>
          <LogementVacantTaux />
        </div>

        <div className="fr-col-12 fr-mb-7w">
          <h2 className="fr-h4 fr-mb-3w">
            Logements vacants et consommation d'espaces NAF
          </h2>
          <LogementVacantConso />
        </div>

        <div className="fr-col-12 fr-mb-7w">
          <h2 className="fr-h4 fr-mb-3w">
            Logements vacants et autorisations d'urbanisme
          </h2>
          <LogementVacantAutorisation />
        </div>

        {childLandTypes.length > 0 && (
          <div className="fr-col-12">
            <LogementVacantMaps />
          </div>
        )}

        <div className="fr-col-12">
          <LogementVacantExternalServices />
        </div>
      </div>
    </div>
  );
};

export const LogementVacant: React.FC<LogementVacantProps> = ({ landData }) => {
  if (!landData) {
    return (
      <div role="status" aria-live="polite">
        Données non disponibles
      </div>
    );
  }

  return (
    <LogementVacantProvider landData={landData}>
      <LogementVacantContent />
    </LogementVacantProvider>
  );
};

export default LogementVacant;
