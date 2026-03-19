import React from "react";
import { ExternalServiceTile } from "@components/ui/ExternalServiceTile";
import benefrichesImage from "@images/logo-benefriches.png";
import urbanvitalizImage from "@images/logo-urbanvitaliz.png";

export const FrichesExternalServices: React.FC = () => {
  return (
    <>
      <h2>
        Pour aller plus loin dans votre démarche de réhabilitation de friches
      </h2>
      <div className="fr-grid-row fr-grid-row--gutters fr-mt-3w">
        <div className="fr-col-12 fr-col-lg-6">
          <ExternalServiceTile
            imageUrl={benefrichesImage}
            imageAlt="Logo de l'ADEME et de Bénéfriches"
            title="Estimez les impacts environnementaux, sociaux et économiques de votre projet de réhabilitation grâce à Bénéfriches"
            description="Vous avez un projet d'aménagement urbain ou un projet photovoltaïque sur une friche ? Calculez les impacts de votre projet grâce à la plateforme Bénéfriches !"
            href="https://benefriches.ademe.fr/"
          />
        </div>
        <div className="fr-col-12 fr-col-lg-6">
          <ExternalServiceTile
            imageUrl={urbanvitalizImage}
            imageAlt="Logo de UrbanVitaliz"
            title="Faites-vous accompagner gratuitement dans la réhabilitation des friches de votre territoire grâce à UrbanVitaliz"
            description="UrbanVitaliz est un service public gratuit d'appui aux collectivités pour la reconversion des friches, assuré par des urbanistes ainsi que les conseillers publics (selon les territoires : DDT, DREAL, EPF...)"
            href="https://urbanvitaliz.fr/"
          />
        </div>
      </div>
    </>
  );
};
