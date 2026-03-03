import React from "react";
import { LandDetailResultType } from "@services/types/land";
import Triptych from "@components/ui/Triptych";
import { FrichesProvider } from "./context/FrichesContext";
import {
  FrichesKpiCards,
  FrichesCharts,
  FrichesDataTable,
  FrichesMaps,
  FrichesExternalServices,
} from "./components";

interface FrichesProps {
  landData: LandDetailResultType;
}

const FrichesContent: React.FC = () => {
  return (
    <div className="fr-p-3w">
      <Triptych
        className="fr-mb-5w"
        definition={{
          preview: "La loi Climat et Résilience du 22 août 2021 définit ce qu'est une friche au sens du code de l'urbanisme : «tout bien ou droit immobilier, bâti ou non bâti, inutilisé et dont l'état, la configuration ou l'occupation totale ou partielle ne permet pas un réemploi sans un aménagement ou des travaux préalables».",
          content: (
            <>
              <p>
                La loi Climat et Résilience du 22 août 2021 définit ce qu'est
                une friche au sens du code de l'urbanisme : "
                <strong>
                  tout bien ou droit immobilier, bâti ou non bâti, inutilisé et
                  dont l'état, la configuration ou l'occupation totale ou
                  partielle ne permet pas un réemploi sans un aménagement ou des
                  travaux préalables
                </strong>
                ".
              </p>
              <p>
                Une friche est donc une zone désaffectée après avoir connu une
                activité économique (industrielle ou commerciale), des usages
                résidentiels ou des équipements. On estime que ces sites
                pourraient représenter en France entre 90 000 et 150 000
                hectares d'espaces inemployés.
              </p>
            </>
          ),
        }}
        donnees={{
          preview: "Les données utilisées proviennent du recensement des friches réalisé par le CEREMA dans le cadre du dispositif Cartofriches.",
          content: (
            <>
              <p>
                Les données utilisées proviennent du recensement des friches
                réalisé par le <strong>CEREMA</strong> dans le cadre du
                dispositif <strong>Cartofriches</strong>.
              </p>
              <p>
                On distingue deux sources de données : les friches
                pré-identifiées au niveau national par le Cerema, et les friches
                consolidées par des acteurs des territoires qui possèdent un
                observatoire ou réalisent des études.
              </p>
              <p>
                Ces contributeurs locaux à Cartofriches sont listés ici :{" "}
                <a
                  href="https://artificialisation.biodiversitetousvivants.fr/cartofriches/observatoires-locaux"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  observatoires locaux
                </a>
                .{" "}
                <a
                  href="https://cartofriches.cerema.fr/cartofriches/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contribuer à la donnée sur les friches
                </a>
              </p>
              <p>
                <strong>
                  Il est important de noter que ces données ne sont ni
                  exhaustives ni homogènes
                </strong>{" "}
                sur l'ensemble du territoire national, et dépendent notamment de
                la présence ou non d'un observatoire local.
              </p>
              <p>
                Les données relatives à l'artificialisation et
                l'imperméabilisation des friches sont issues des données OCS GE.
              </p>
            </>
          ),
        }}
      />
      <FrichesKpiCards />
      <FrichesCharts />
      <FrichesDataTable />
      <FrichesMaps />
      <FrichesExternalServices />
    </div>
  );
};

export const Friches: React.FC<FrichesProps> = ({ landData }) => {
  if (!landData) {
    return (
      <div role="status" aria-live="polite">
        Données non disponibles
      </div>
    );
  }

  return (
    <FrichesProvider landData={landData}>
      <FrichesContent />
    </FrichesProvider>
  );
};
