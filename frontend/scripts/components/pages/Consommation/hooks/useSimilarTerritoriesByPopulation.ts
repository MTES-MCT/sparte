import React from "react";
import { useGetSimilarTerritoriesByPopulationQuery } from "@services/api";
import { Territory } from "@components/ui/SearchBar";

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
    if (!rawData) return [];

    return rawData
      .filter((st: SimilarTerritoryByPopulation) => st.similar_land_id !== landId)
      .map((st: SimilarTerritoryByPopulation): Territory => ({
        id: 0,
        source_id: st.similar_land_id,
        land_type: landType,
        name: st.similar_land_name,
        public_key: "",
        area: 0,
        land_type_label: "",
      }));
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
