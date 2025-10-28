import React from "react";
import { useGetSimilarTerritoriesQuery } from "@services/api";
import { Territory } from "@components/ui/SearchBar";
import { SimilarTerritory } from "../types";

/**
 * Hook to fetch and transform nearest territories
 * Filters out the current territory from suggestions
 */
export const useSimilarTerritories = (landId: string, landType: string) => {
  const { data: rawData, isLoading } = useGetSimilarTerritoriesQuery({
    land_id: landId,
    land_type: landType,
  });

  const territories = React.useMemo(() => {
    if (!rawData) return [];

    return rawData
      .filter((st: SimilarTerritory) => st.nearest_land_id !== landId)
      .map((st: SimilarTerritory): Territory => ({
        id: 0,
        source_id: st.nearest_land_id,
        land_type: landType,
        name: st.nearest_land_name,
        public_key: "",
        area: 0,
        land_type_label: "",
      }));
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
