import React from "react";
import { LandDetailResultType } from "@services/types/land";
import { ComparisonLand } from "@services/types/project";
import { useUpdatePreferenceComparisonLandsMutation } from "@services/api";

interface UseComparisonTerritoriesOptions {
  landId?: string;
  landType?: string;
  comparisonLands?: ComparisonLand[];
  defaultTerritories?: ComparisonLand[];
  onComparisonLandsChange?: (lands: ComparisonLand[]) => void;
}

const toTerritory = (land: ComparisonLand) => ({
  name: land.name,
  land_id: land.land_id,
  land_type: land.land_type,
  land_type_label: "",
  surface: 0,
  key: `${land.land_type}_${land.land_id}`,
} as unknown as LandDetailResultType);

const toComparisonLand = (territory: LandDetailResultType): ComparisonLand => ({
  land_type: territory.land_type,
  land_id: territory.land_id,
  name: territory.name,
});

export const useComparisonTerritories = (
  landId: string,
  landType: string,
  landName: string,
  options: UseComparisonTerritoriesOptions = {}
) => {
  const {
    landId: optLandId,
    landType: optLandType,
    comparisonLands = [],
    defaultTerritories = [],
    onComparisonLandsChange,
  } = options;

  const [updateComparisonLands] = useUpdatePreferenceComparisonLandsMutation();

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

  const mainTerritory = React.useMemo(() => ({
    name: landName,
    land_id: landId,
    land_type: landType,
    land_type_label: "",
    surface: 0,
    key: "",
  } as unknown as LandDetailResultType), [landId, landType, landName]);

  const excludedTerritories = React.useMemo(
    () => [mainTerritory, ...territories],
    [mainTerritory, territories]
  );

  const save = React.useCallback(
    (newLands: ComparisonLand[]) => {
      if (onComparisonLandsChange) {
        onComparisonLandsChange(newLands);
      } else if (optLandId && optLandType) {
        updateComparisonLands({ land_type: optLandType, land_id: optLandId, comparison_lands: newLands });
      }
    },
    [optLandId, optLandType, onComparisonLandsChange, updateComparisonLands]
  );

  const handleAddTerritory = React.useCallback(
    (territory: LandDetailResultType) => {
      const isDuplicate = effectiveLands.some(
        (t) => t.land_id === territory.land_id && t.land_type === territory.land_type
      );
      const isSelf = territory.land_id === landId && territory.land_type === landType;

      if (!isDuplicate && !isSelf) {
        save([...effectiveLands, toComparisonLand(territory)]);
      }
    },
    [effectiveLands, landId, landType, save]
  );

  const handleRemoveTerritory = React.useCallback(
    (territory: LandDetailResultType) => {
      const newLands = effectiveLands.filter(
        (t) => !(t.land_id === territory.land_id && t.land_type === territory.land_type)
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
