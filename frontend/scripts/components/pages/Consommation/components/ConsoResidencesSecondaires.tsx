import React from "react";
import GenericChart from "@components/charts/GenericChart";

interface ConsoResidencesSecondairesProps {
  landId: string;
  landType: string;
  childLandTypes?: string[];
  childType?: string;
}

export const ConsoResidencesSecondaires: React.FC<ConsoResidencesSecondairesProps> = ({
  landId,
  landType,
  childLandTypes,
  childType,
}) => {
  const hasChildren = childLandTypes && childLandTypes.length > 0;
  const mapChildType = childType || (childLandTypes && childLandTypes[0]);
  const [rsYear, setRsYear] = React.useState("2022");

  return (
    <div className="fr-mt-7w">
      <h3>Résidences secondaires</h3>

      <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
        <div className="fr-col-12 fr-col-lg-8">
          <div className="bg-white fr-p-2w rounded h-100">
            <GenericChart
              id="dc_residences_secondaires"
              land_id={landId}
              land_type={landType}
              sources={["insee"]}
              showDataTable={true}
            />
          </div>
        </div>
        <div className="fr-col-12 fr-col-lg-4">
          <div className="fr-alert fr-alert--info fr-alert--sm h-100">
            <p className="fr-text--sm fr-mb-0">
              TODO : comment mettre donn&eacute;e en valeur
            </p>
          </div>
        </div>
      </div>

      {hasChildren && mapChildType && (
        <div className="fr-mb-5w">
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
              land_id={landId}
              land_type={landType}
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
