import React, { useState } from "react";
import GenericChart from "@components/charts/GenericChart";

interface RSMapProps {
  landId: string;
  landType: string;
  childLandType: string;
}

const AVAILABLE_YEARS = ["2011", "2016", "2022"];

export const RSMap: React.FC<RSMapProps> = ({ landId, landType, childLandType }) => {
  const [rsYear, setRsYear] = useState("2022");

  return (
    <div className="fr-mb-5w">
      <h3>Carte des résidences secondaires</h3>
      <div className="bg-white fr-p-2w rounded">
        <div className="fr-mb-2w">
          {AVAILABLE_YEARS.map((year) => (
            <button
              key={year}
              className={`fr-btn ${rsYear === year ? "fr-btn--primary" : "fr-btn--tertiary"} fr-btn--sm fr-mr-1w`}
              onClick={() => setRsYear(year)}
            >
              {year}
            </button>
          ))}
        </div>
        <GenericChart
          key={`dc_residences_secondaires_map-${childLandType}-${rsYear}`}
          id="dc_residences_secondaires_map"
          land_id={landId}
          land_type={landType}
          params={{ child_land_type: childLandType, year: rsYear }}
          sources={["insee"]}
          showDataTable={true}
          isMap={true}
        />
      </div>
    </div>
  );
};
