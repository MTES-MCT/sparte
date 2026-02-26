import React from "react";
import GuideContent from "@components/ui/GuideContent";
import { LandDetailResultType } from "@services/types/land";
import { RSKpis, RSEvolution, RSMap } from "./components";

interface ResidencesSecondairesProps {
  landData: LandDetailResultType;
}

export const ResidencesSecondaires: React.FC<ResidencesSecondairesProps> = ({ landData }) => {
  const { land_id, land_type, child_land_types } = landData || {};
  const hasChildren = child_land_types && child_land_types.length > 0;
  const mapChildType = child_land_types?.[0] || "";

  const {
    residences_secondaires_22,
    evolution_residences_secondaires_percent,
    evolution_residences_secondaires_absolute,
    densite_residences_secondaires,
  } = landData || {};

  return (
    <div className="fr-container--fluid fr-p-3w">
      <div className="fr-mb-5w">
        <GuideContent title="Qu'est-ce qu'une résidence secondaire ?">
          <p className="fr-text--sm">
            Une résidence secondaire est un logement utilisé pour les week-ends, les loisirs ou les vacances.
            Les logements meublés loués (ou à louer) pour des séjours touristiques sont également classés en résidences secondaires.
          </p>
          <p className="fr-text--sm">
            La présence de résidences secondaires sur un territoire constitue un levier potentiel de sobriété foncière :
            leur transformation en résidences principales permettrait de répondre à la demande de logements sans consommer de nouveaux espaces naturels, agricoles ou forestiers.
          </p>
        </GuideContent>
      </div>

      <RSKpis
        residencesSecondaires={residences_secondaires_22}
        evolutionPercent={evolution_residences_secondaires_percent}
        evolutionAbsolute={evolution_residences_secondaires_absolute}
        densite={densite_residences_secondaires}
      />

      <RSEvolution landId={land_id} landType={land_type} />

      {hasChildren && mapChildType && (
        <RSMap landId={land_id} landType={land_type} childLandType={mapChildType} />
      )}
    </div>
  );
};
