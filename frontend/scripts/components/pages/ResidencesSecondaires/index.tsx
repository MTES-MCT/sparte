import React from "react";
import GenericChart from "@components/charts/GenericChart";
import Card from "@components/ui/Card";
import Guide from "@components/ui/Guide";
import { LandDetailResultType } from "@services/types/land";
import { formatNumber } from "@utils/formatUtils";

interface ResidencesSecondairesProps {
  landData: LandDetailResultType;
}

export const ResidencesSecondaires: React.FC<ResidencesSecondairesProps> = ({ landData }) => {
  const { land_id, land_type, child_land_types } = landData || {};
  const hasChildren = child_land_types && child_land_types.length > 0;
  const [childType, setChildType] = React.useState(child_land_types?.[0] || "");
  const mapChildType = childType || (child_land_types && child_land_types[0]);
  const [rsYear, setRsYear] = React.useState("2022");

  const {
    residences_secondaires_22,
    evolution_residences_secondaires_percent,
    evolution_residences_secondaires_absolute,
    densite_residences_secondaires,
  } = landData || {};

  return (
    <div className="fr-container--fluid fr-p-3w">
      <div className="fr-grid-row fr-grid-row--gutters fr-mb-5w">
        <div className="fr-col-12 fr-col-lg-4">
          <Card
            icon="bi-graph-up-arrow"
            badgeClass="fr-badge--info"
            badgeLabel="Évolution des résidences secondaires"
            value={evolution_residences_secondaires_absolute != null
              ? `${evolution_residences_secondaires_absolute > 0 ? "+" : ""}${formatNumber({ number: evolution_residences_secondaires_absolute })}`
              : "n.d."}
            label={evolution_residences_secondaires_percent != null
              ? `Entre 2011 et 2022 (${evolution_residences_secondaires_percent > 0 ? "+" : ""}${evolution_residences_secondaires_percent} %)`
              : "Entre 2011 et 2022"}
            isHighlighted={true}
            highlightBadge="Donnée clé"
          />
        </div>
        <div className="fr-col-12 fr-col-lg-4">
          <Card
            icon="bi-house"
            badgeClass="fr-badge--info"
            badgeLabel="Nombre de résidences secondaires"
            value={residences_secondaires_22 != null ? formatNumber({ number: residences_secondaires_22 }) : "n.d."}
            label="En 2022"
          />
        </div>
        <div className="fr-col-12 fr-col-lg-4">
          <Card
            icon="bi-grid-3x3-gap"
            badgeClass="fr-badge--info"
            badgeLabel="Densité de résidences secondaires"
            value={densite_residences_secondaires != null ? `${formatNumber({ number: densite_residences_secondaires })} / ha` : "n.d."}
            label="En 2022"
          />
        </div>
      </div>

      <Guide
        title="Qu'est-ce qu'une résidence secondaire ?"
        className="fr-mb-5w"
      >
        <p className="fr-text--sm">
          Une résidence secondaire est un logement utilisé pour les week-ends, les loisirs ou les vacances.
          Les logements meublés loués (ou à louer) pour des séjours touristiques sont également classés en résidences secondaires.
        </p>
        <p className="fr-text--sm">
          La présence de résidences secondaires sur un territoire constitue un levier potentiel de sobriété foncière :
          leur transformation en résidences principales permettrait de répondre à la demande de logements sans consommer de nouveaux espaces naturels, agricoles ou forestiers.
        </p>
      </Guide>

      <h3>Évolution des résidences secondaires</h3>

      <div className="fr-mb-3w">
        <div className="bg-white fr-p-2w rounded">
          <GenericChart
            id="dc_residences_secondaires"
            land_id={land_id}
            land_type={land_type}
            sources={["insee"]}
            showDataTable={true}
          />
        </div>
      </div>

      {hasChildren && mapChildType && (
        <div className="fr-mb-5w">
          <h3>Carte des résidences secondaires</h3>
          <div className="bg-white fr-p-2w rounded">
            <div className="fr-mb-2w">
              {["2011", "2016", "2022"].map((y) => (
                <button
                  key={y}
                  className={`fr-btn ${rsYear === y ? "fr-btn--primary" : "fr-btn--tertiary"} fr-btn--sm fr-mr-1w`}
                  onClick={() => setRsYear(y)}
                >
                  {y}
                </button>
              ))}
            </div>
            <GenericChart
              key={`dc_residences_secondaires_map-${mapChildType}-${rsYear}`}
              id="dc_residences_secondaires_map"
              land_id={land_id}
              land_type={land_type}
              params={{ child_land_type: mapChildType, year: rsYear }}
              sources={["insee"]}
              showDataTable={true}
              isMap={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};
