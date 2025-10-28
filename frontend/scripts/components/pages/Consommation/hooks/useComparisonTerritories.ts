import React from "react";
import { Territory } from "@components/ui/SearchBar";

/**
 * Hook to manage comparison territories state and actions
 */
export const useComparisonTerritories = (landId: string, landType: string, suggestedTerritories: Territory[] = []) => {
  const [additionalTerritories, setAdditionalTerritories] = React.useState<Territory[]>([]);

  const handleAddTerritory = React.useCallback(
    (territory: Territory) => {
      // Check if territory is not already in the list and is not the current territory
      if (
        !additionalTerritories.find(
          (t) => t.source_id === territory.source_id && t.land_type === territory.land_type
        ) &&
        !(territory.source_id === landId && territory.land_type === landType)
      ) {
        setAdditionalTerritories([...additionalTerritories, territory]);
      }
    },
    [additionalTerritories, landId, landType]
  );

  const handleRemoveTerritory = React.useCallback(
    (territory: Territory) => {
      setAdditionalTerritories(
        additionalTerritories.filter(
          (t) => !(t.source_id === territory.source_id && t.land_type === territory.land_type)
        )
      );
    },
    [additionalTerritories]
  );

  const handleResetTerritories = React.useCallback(() => {
    setAdditionalTerritories([]);
  }, []);

  // Build comma-separated list of territory IDs for API
  // When empty, backend will use default nearest territories
  const comparisonLandIds = React.useMemo(() => {
    return additionalTerritories.length > 0
      ? additionalTerritories.map((t) => `${t.land_type}_${t.source_id}`).join(",")
      : null;
  }, [additionalTerritories]);

  // When no territories selected, backend uses default nearest territories
  const isDefaultSelection = additionalTerritories.length === 0;

  return {
    additionalTerritories,
    comparisonLandIds,
    isDefaultSelection,
    handleAddTerritory,
    handleRemoveTerritory,
    handleResetTerritories,
  };
};
