import React from "react";
import { ExternalServiceTile } from "@components/ui/ExternalServiceTile";
import zeroLogementVacantImage from "@images/logo_ZLV.png";

export const LogementVacantExternalServices: React.FC = () => {
  return (
    <div className="fr-mb-7w">
      <h2 className="fr-h4 fr-mb-3w">
        Pour aller plus loin dans votre démarche de remobilisation des logements
        vacants
      </h2>
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
  );
};
