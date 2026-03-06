import React, { useState } from "react";
import GenericChart from "@components/charts/GenericChart";
import Button from "@components/ui/Button";

interface RSMapProps {
  landId: string;
  landType: string;
  childLandType: string;
}

const AVAILABLE_YEARS = ["2011", "2016", "2022"];

export const RSMap: React.FC<RSMapProps> = ({ landId, landType, childLandType }) => {
  const [rsYear, setRsYear] = useState("2022");

  return (
    <>
      <h3>Carte des résidences secondaires</h3>
      <div className="fr-mb-2w">
        {AVAILABLE_YEARS.map((year) => (
          <Button
            key={year}
            variant={rsYear === year ? "primary" : "tertiary"}
            size="sm"
            onClick={() => setRsYear(year)}
            className="fr-mr-1w"
          >
            {year}
          </Button>
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
    </>
  );
};
