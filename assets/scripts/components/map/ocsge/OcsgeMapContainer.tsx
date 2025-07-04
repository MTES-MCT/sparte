import React, { useEffect, useState } from "react";
import { DEFAULT_SELECTION } from "./constants/selections";
import { OcsgeMap } from "./OcsgeMap";
import { useGetEnvironmentQuery } from "@services/api";
import { LandDetailResultType } from "@services/types/land";
import { FilterSpecification } from "maplibre-gl";

type OcsgeMapContainerProps = {
  landData: LandDetailResultType,
  globalFilter?: FilterSpecification
}

export const OcsgeMapContainer = ({ landData, globalFilter }: OcsgeMapContainerProps) => {
    const { data: envVariables } = useGetEnvironmentQuery(null);
    let vectorTileLocation: string = null

    if (envVariables) {
        const { vector_tiles_location } = envVariables;
        vectorTileLocation = vector_tiles_location;
    }

  const [selection, setSelection] = useState(DEFAULT_SELECTION);
  const [userFilters, setUserFilters] = useState([]);
  const {
    simple_geom: emprise,
    bounds,
    max_bounds,
    departements,
  } = landData;

  const { millesimes, millesimes_by_index } = landData || {};

  const [index, setIndex] = React.useState(Math.max(...millesimes?.map((millesime) => millesime.index)));

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
    <div>
      <OcsgeMap
        vectorTilesLocation={vectorTileLocation}
        selection={selection}
        setSelection={setSelection}
        setUserFilters={setUserFilters}
        userFilters={userFilters}
        globalFilter={globalFilter}
        index={index}
        setIndex={setIndex}
        availableMillesimes={millesimes}
        availableMillesimesByIndex={millesimes_by_index}
        emprise={emprise}
        bounds={bounds}
        maxBounds={max_bounds}
        departements={departements}
      />
    </div>
  );
};
