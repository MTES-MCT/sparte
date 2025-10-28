import React from "react";
import { useGetSimilarTerritoriesByPopulationQuery } from "@services/api";
import { transformToTerritories } from "../utils/territoryTransform";

interface SimilarTerritoryByPopulation {
  land_id: string;
  land_name: string;
  land_type: string;
  similar_land_id: string;
  similar_land_name: string;
  population_source: number;
  population_similar: number;
  population_difference: number;
  distance_km: number;
  similarity_rank: number;
}

/**
 * Hook to fetch and transform similar territories by population
 * Filters out the current territory from suggestions
 */
export const useSimilarTerritoriesByPopulation = (landId: string, landType: string) => {
  const { data: rawData, isLoading } = useGetSimilarTerritoriesByPopulationQuery({
    land_id: landId,
    land_type: landType,
  });

  const territories = React.useMemo(() => {
    return transformToTerritories(rawData, landId, landType);
  }, [rawData, landId, landType]);

  const rawTerritories = React.useMemo(() => {
    if (!rawData) return [];
    return rawData.filter((st: SimilarTerritoryByPopulation) => st.similar_land_id !== landId);
  }, [rawData, landId]);

  return {
    territories,
    rawTerritories,
    isLoading,
  };
};
