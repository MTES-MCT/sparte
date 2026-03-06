import React from "react";
import { useGetSimilarTerritoriesQuery } from "@services/api";
import { LandDetailResultType } from "@services/types/land";

interface SimilarTerritory {
  land_id: string;
  land_name: string;
  land_type: string;
  nearest_land_id: string;
  nearest_land_name: string;
  distance_km: number;
  distance_rank: number;
}

interface TerritoryData {
  nearest_land_id?: string;
  similar_land_id?: string;
  nearest_land_name?: string;
  similar_land_name?: string;
}

function transformToTerritories(
  rawData: TerritoryData[] | undefined,
  landId: string,
  landType: string
): LandDetailResultType[] {
  if (!rawData) return [];

  return rawData
    .filter((item: TerritoryData) => {
      const territoryId = item.nearest_land_id || item.similar_land_id;
      return territoryId !== landId;
    })
    .map((item: TerritoryData) => {
      const name = item.nearest_land_name || item.similar_land_name || "";
      const land_id = item.nearest_land_id || item.similar_land_id || "";

      return {
        land_id,
        land_type: landType,
        name,
        key: "",
        surface: 0,
        land_type_label: "",
      } as unknown as LandDetailResultType;
    });
}

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
