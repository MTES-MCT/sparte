import React from "react";
import { Territory } from "@components/ui/SearchBar";
import { ComparisonLand } from "@services/types/project";
import { useUpdateProjectComparisonLandsMutation } from "@services/api";

interface UseComparisonTerritoriesOptions {
  projectId?: number;
  comparisonLands?: ComparisonLand[];
  defaultTerritories?: ComparisonLand[];
  onComparisonLandsChange?: (lands: ComparisonLand[]) => void;
}

const toTerritory = (land: ComparisonLand): Territory => ({
  id: 0,
  name: land.name,
  source_id: land.land_id,
  land_type: land.land_type,
  land_type_label: "",
  area: 0,
  public_key: `${land.land_type}_${land.land_id}`,
});

const toComparisonLand = (territory: Territory): ComparisonLand => ({
  land_type: territory.land_type,
  land_id: territory.source_id,
  name: territory.name,
});

export const useComparisonTerritories = (
  landId: string,
  landType: string,
  landName: string,
  options: UseComparisonTerritoriesOptions = {}
) => {
  const {
    projectId,
    comparisonLands = [],
    defaultTerritories = [],
    onComparisonLandsChange,
  } = options;

  const [updateComparisonLands] = useUpdateProjectComparisonLandsMutation();

  const isDefaultSelection = comparisonLands.length === 0;
  const effectiveLands = isDefaultSelection ? defaultTerritories : comparisonLands;

  const territories = React.useMemo(
    () => effectiveLands.map(toTerritory),
    [effectiveLands]
  );

  const comparisonLandIds = React.useMemo(() => {
    if (effectiveLands.length === 0) return "";
    return effectiveLands.map((t) => `${t.land_type}_${t.land_id}`).join(",");
  }, [effectiveLands]);

  const mainTerritory: Territory = React.useMemo(() => ({
    id: 0,
    name: landName,
    source_id: landId,
    land_type: landType,
    land_type_label: "",
    area: 0,
    public_key: "",
  }), [landId, landType, landName]);

  const excludedTerritories = React.useMemo(
    () => [mainTerritory, ...territories],
    [mainTerritory, territories]
  );

  const save = React.useCallback(
    (newLands: ComparisonLand[]) => {
      if (onComparisonLandsChange) {
        onComparisonLandsChange(newLands);
      } else if (projectId) {
        updateComparisonLands({ projectId, comparison_lands: newLands });
      }
    },
    [projectId, onComparisonLandsChange, updateComparisonLands]
  );

  const handleAddTerritory = React.useCallback(
    (territory: Territory) => {
      const isDuplicate = effectiveLands.some(
        (t) => t.land_id === territory.source_id && t.land_type === territory.land_type
      );
      const isSelf = territory.source_id === landId && territory.land_type === landType;

      if (!isDuplicate && !isSelf) {
        save([...effectiveLands, toComparisonLand(territory)]);
      }
    },
    [effectiveLands, landId, landType, save]
  );

  const handleRemoveTerritory = React.useCallback(
    (territory: Territory) => {
      const newLands = effectiveLands.filter(
        (t) => !(t.land_id === territory.source_id && t.land_type === territory.land_type)
      );
      save(newLands);
    },
    [effectiveLands, save]
  );

  const handleResetTerritories = React.useCallback(() => {
    save([]);
  }, [save]);

  return {
    territories,
    comparisonLandIds,
    isDefaultSelection,
    excludedTerritories,
    handleAddTerritory,
    handleRemoveTerritory,
    handleResetTerritories,
  };
};
