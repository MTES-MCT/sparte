import React from "react";
import { Territory } from "@components/ui/SearchBar";

/**
 * Hook to manage comparison territories state and actions
 */
export const useComparisonTerritories = (
  landId: string,
  landType: string,
  suggestedTerritories: Territory[] = []
) => {
  const [additionalTerritories, setAdditionalTerritories] = React.useState<Territory[]>([]);
  const [excludedTerritories, setExcludedTerritories] = React.useState<Territory[]>([]);

  const handleAddTerritory = React.useCallback(
    (territory: Territory) => {
      // Check if territory is not already in the list and is not the current territory
      const isAlreadyAdded = additionalTerritories.find(
        (t) => t.source_id === territory.source_id && t.land_type === territory.land_type
      );
      const isCurrentTerritory = territory.source_id === landId && territory.land_type === landType;
      const isExcluded = excludedTerritories.find(
        (t) => t.source_id === territory.source_id && t.land_type === territory.land_type
      );

      if (!isAlreadyAdded && !isCurrentTerritory) {
        setAdditionalTerritories([...additionalTerritories, territory]);
        // Remove from excluded list if it was there
        if (isExcluded) {
          setExcludedTerritories(
            excludedTerritories.filter(
              (t) => !(t.source_id === territory.source_id && t.land_type === territory.land_type)
            )
          );
        }
      }
    },
    [additionalTerritories, excludedTerritories, landId, landType]
  );

  const handleRemoveTerritory = React.useCallback(
    (territory: Territory) => {
      // Check if it's in additional territories
      const isInAdditional = additionalTerritories.find(
        (t) => t.source_id === territory.source_id && t.land_type === territory.land_type
      );

      if (isInAdditional) {
        // Remove from additional territories
        setAdditionalTerritories(
          additionalTerritories.filter(
            (t) => !(t.source_id === territory.source_id && t.land_type === territory.land_type)
          )
        );
      } else {
        // It's a suggested territory, add to excluded list
        setExcludedTerritories([...excludedTerritories, territory]);
      }
    },
    [additionalTerritories, excludedTerritories]
  );

  const handleResetTerritories = React.useCallback(() => {
    setAdditionalTerritories([]);
    setExcludedTerritories([]);
  }, []);

  // Get the effective list of territories used in comparison
  // Start with suggested territories minus excluded ones, then add additional territories
  const effectiveComparisonTerritories = React.useMemo(() => {
    // Start with suggested territories, filter out excluded ones
    const baseTerritories = suggestedTerritories.filter(
      (st) => !excludedTerritories.find(
        (et) => et.source_id === st.source_id && et.land_type === st.land_type
      )
    );

    // Add additional territories (avoiding duplicates)
    const allTerritories = [...baseTerritories];
    additionalTerritories.forEach((at) => {
      const alreadyExists = allTerritories.find(
        (t) => t.source_id === at.source_id && t.land_type === at.land_type
      );
      if (!alreadyExists) {
        allTerritories.push(at);
      }
    });

    return allTerritories;
  }, [additionalTerritories, suggestedTerritories, excludedTerritories]);

  // Build comma-separated list of territory IDs for API
  // Empty string means explicitly no comparison territories (backend will return only main territory)
  // null means use default nearest territories
  const comparisonLandIds = React.useMemo(() => {
    if (effectiveComparisonTerritories.length === 0) {
      // If user has explicitly removed all territories, send empty string
      // Otherwise (default state), send null to use default territories
      if (additionalTerritories.length === 0 && excludedTerritories.length === 0) {
        return null; // Default state: use nearest territories
      }
      return ""; // User explicitly removed all: no comparison territories
    }
    return effectiveComparisonTerritories.map((t) => `${t.land_type}_${t.source_id}`).join(",");
  }, [effectiveComparisonTerritories, additionalTerritories, excludedTerritories]);

  // When no territories selected, backend uses default nearest territories
  const isDefaultSelection = additionalTerritories.length === 0 && excludedTerritories.length === 0;

  return {
    effectiveComparisonTerritories,
    comparisonLandIds,
    isDefaultSelection,
    handleAddTerritory,
    handleRemoveTerritory,
    handleResetTerritories,
  };
};
