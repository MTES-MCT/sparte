import React from "react";
import { useGetSimilarTerritoriesQuery } from "@services/api";
import { SimilarTerritory } from "../types";
import { transformToTerritories } from "../utils/territoryTransform";

/**
 * Hook to fetch and transform nearest territories (distance-based)
 * Filters out the current territory from suggestions
 */
export const useNearestTerritories = (landId: string, landType: string) => {
  const { data: rawData, isLoading } = useGetSimilarTerritoriesQuery({
    land_id: landId,
    land_type: landType,
  });

  const territories = React.useMemo(() => {
    return transformToTerritories(rawData, landId, landType);
  }, [rawData, landId, landType]);

  const rawTerritories = React.useMemo(() => {
    if (!rawData) return [];
    return rawData.filter((st: SimilarTerritory) => st.nearest_land_id !== landId);
  }, [rawData, landId]);

  return {
    territories,
    rawTerritories,
    isLoading,
  };
};
