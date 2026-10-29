import React from "react";
import { ExternalServiceTile } from "@components/ui/ExternalServiceTile";
import urbansimulImage from "@images/logo-urbansimul.png";

export const URBANSIMUL_CONSO_URL = "https://urbansimul-app.cerema.fr/map/#/map/conso_espace?cercle=none";

export const ConsoExternalServices: React.FC = () => {
  return (
    <div id="conso-urbansimul" className="fr-mt-5w">
      <h3>Pour aller plus loin : la consommation d'ENAF à la parcelle</h3>
      <div className="fr-grid-row fr-grid-row--gutters fr-mt-2w">
        <div className="fr-col-12 fr-col-lg-6">
          <ExternalServiceTile
            imageUrl={urbansimulImage}
            imageAlt="Logo du Cerema et d'UrbanSimul"
            title="Consultez la consommation d'ENAF à l'échelle infra-communale sur UrbanSimul"
            description="Vous êtes ayant droit des fichiers fonciers (collectivité, EPF, agence d'urbanisme, service de l'État…) ? L'application UrbanSimul du Cerema présente la consommation d'ENAF à la parcelle. L'accès nécessite une authentification."
            href={URBANSIMUL_CONSO_URL}
          />
        </div>
      </div>
    </div>
  );
};
