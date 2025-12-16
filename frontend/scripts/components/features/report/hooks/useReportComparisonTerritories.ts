import React from "react";
import { ComparisonLand } from "@services/types/project";
import { useNearestTerritories, useComparisonTerritories } from "@components/pages/Consommation/hooks";

interface UseReportComparisonTerritoriesOptions {
  landId: string;
  landType: string;
  landName: string;
  contentComparisonTerritories?: string;
  projectComparisonLands?: ComparisonLand[];
  onContentChange: (value: string) => void;
}

export const useReportComparisonTerritories = ({
  landId,
  landType,
  landName,
  contentComparisonTerritories,
  projectComparisonLands,
  onContentChange,
}: UseReportComparisonTerritoriesOptions) => {
  const { territories: nearestTerritories } = useNearestTerritories(landId, landType);

  const defaultTerritories: ComparisonLand[] = React.useMemo(
    () => nearestTerritories.map((t) => ({
      land_type: t.land_type,
      land_id: t.source_id,
      name: t.name,
    })),
    [nearestTerritories]
  );

  const draftComparisonLands: ComparisonLand[] = React.useMemo(() => {
    if (contentComparisonTerritories) {
      try {
        return JSON.parse(contentComparisonTerritories);
      } catch {
        return [];
      }
    }
    return [];
  }, [contentComparisonTerritories]);

  const projectEffectiveLands = React.useMemo(() => {
    const lands = projectComparisonLands || [];
    return lands.length > 0 ? lands : defaultTerritories;
  }, [projectComparisonLands, defaultTerritories]);

  return useComparisonTerritories(landId, landType, landName, {
    comparisonLands: draftComparisonLands,
    defaultTerritories: projectEffectiveLands,
    onComparisonLandsChange: (lands) => onContentChange(JSON.stringify(lands)),
  });
};
