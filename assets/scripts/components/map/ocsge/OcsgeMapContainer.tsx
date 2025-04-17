import React, { useEffect, useState } from "react";
import { DEFAULT_SELECTION } from "./constants/selections";
import { OcsgeMap } from "./OcsgeMap";
import styled from "styled-components";
import { useGetEnvironmentQuery } from "@services/api";
import { ProjectDetailResultType } from "@services/types/project";
import { LandDetailResultType } from "@services/types/land";
import { FilterSpecification } from "maplibre-gl";

type OcsgeMapContainerProps = {
  projectData: ProjectDetailResultType,
  landData: LandDetailResultType,
  globalFilter?: FilterSpecification
}

const MapContainerWrapper = styled.div`
  margin-bottom: 50px;
`;

export const OcsgeMapContainer = ({ projectData, landData, globalFilter }: OcsgeMapContainerProps) => {
    const { data: envVariables } = useGetEnvironmentQuery(null);
    let vectorTileLocation: string = null

    if (envVariables) {
        const { vector_tiles_location } = envVariables;
        vectorTileLocation = vector_tiles_location;
    }

  const [selection, setSelection] = useState(DEFAULT_SELECTION);
  const [userFilters, setUserFilters] = useState([]);
  const {
    emprise,
    bounds,
    max_bounds,
    departements,
  } = projectData;

  const { millesimes_by_index } = landData || {};

  const [index, setIndex] = React.useState(Math.max(...millesimes_by_index?.map((millesime) => millesime.index)));

  useEffect(() => {
    setUserFilters(
      selection.matrix.map(({ couverture, usage }) => ({
        couverture,
        usage,
      }))
    );
  }, [selection]);


  if (!index) { return null}

  return (
    <MapContainerWrapper>
      <OcsgeMap
        vectorTilesLocation={vectorTileLocation}
        selection={selection}
        setSelection={setSelection}
        setUserFilters={setUserFilters}
        userFilters={userFilters}
        globalFilter={globalFilter}
        index={index}
        setIndex={setIndex}
        availableMillesimes={millesimes_by_index}
        emprise={emprise}
        bounds={bounds}
        maxBounds={max_bounds}
        departements={departements}
      />
    </MapContainerWrapper>
  );
};
