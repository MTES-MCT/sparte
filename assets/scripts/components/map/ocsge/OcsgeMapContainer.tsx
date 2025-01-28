import React, { useEffect, useState } from "react";
import { DEFAULT_SELECTION } from "./constants/selections";
import { OcsgeMap } from "./OcsgeMap";
import styled from "styled-components";

type OcsgeMapContainerProps = {
  projectData: any;
};

const MapContainerWrapper = styled.div`
  margin-bottom: 50px;
`;

export const OcsgeMapContainer = ({ projectData }: OcsgeMapContainerProps) => {
  const [selection, setSelection] = useState(DEFAULT_SELECTION);
  const [userFilters, setUserFilters] = useState([]);
  const {
    emprise,
    bounds,
    max_bounds,
    ocsge_millesimes,
    land_type,
    departements,
  } = projectData;

  const [year, setYear] = React.useState(ocsge_millesimes[0]);

  useEffect(() => {
    setUserFilters(
      selection.matrix.map(({ couverture, usage }) => ({
        couverture,
        usage,
      }))
    );
  }, [selection]);

  if (land_type === "REGION") {
    return null;
  }
  const firstDepartement = departements[0];

  return (
    <MapContainerWrapper>
      <h2>Carte de l'OCS GE</h2>
      <OcsgeMap
        selection={selection}
        setSelection={setSelection}
        setUserFilters={setUserFilters}
        userFilters={userFilters}
        year={year}
        setYear={setYear}
        availableMillesimes={ocsge_millesimes}
        emprise={emprise}
        bounds={bounds}
        maxBounds={max_bounds}
        departement={firstDepartement}
      />
    </MapContainerWrapper>
  );
};
