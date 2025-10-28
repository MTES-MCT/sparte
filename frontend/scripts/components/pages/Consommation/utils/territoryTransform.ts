import { Territory } from "@components/ui/SearchBar";

/**
 * Generic interface for territory data with nearest/similar territory information
 */
export interface TerritoryData {
  nearest_land_id?: string;
  similar_land_id?: string;
  nearest_land_name?: string;
  similar_land_name?: string;
}

/**
 * Transform raw territory data to Territory format
 * Works with both nearest territories and similar territories
 *
 * @param rawData - Array of territory data from API
 * @param landId - Current land ID to filter out
 * @param landType - Current land type
 * @returns Array of Territory objects
 */
export function transformToTerritories(
  rawData: TerritoryData[] | undefined,
  landId: string,
  landType: string
): Territory[] {
  if (!rawData) return [];

  return rawData
    .filter((item: TerritoryData) => {
      // Support both nearest_land_id and similar_land_id
      const territoryId = item.nearest_land_id || item.similar_land_id;
      return territoryId !== landId;
    })
    .map((item: TerritoryData): Territory => {
      // Support both nearest_land_name and similar_land_name
      const name = item.nearest_land_name || item.similar_land_name || "";
      const sourceId = item.nearest_land_id || item.similar_land_id || "";

      return {
        id: 0,
        source_id: sourceId,
        land_type: landType,
        name: name,
        public_key: "",
        area: 0,
        land_type_label: "",
      };
    });
}
