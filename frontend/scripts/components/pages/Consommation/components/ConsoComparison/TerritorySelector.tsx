import React from "react";
import SearchBar from "@components/ui/SearchBar";
import { LandDetailResultType } from "@services/types/land";

interface TerritorySelectorProps {
  landId: string;
  landType: string;
  additionalTerritories: LandDetailResultType[];
  onTerritorySelect: (territory: LandDetailResultType) => void;
}

/**
 * Territory search bar for adding custom comparison territories
 */
export const TerritorySelector: React.FC<TerritorySelectorProps> = ({
  landId,
  landType,
  additionalTerritories,
  onTerritorySelect,
}) => {
  const mainTerritory = {
    name: "",
    land_id: landId,
    land_type: landType,
    land_type_label: "",
    surface: 0,
    key: "",
  } as unknown as LandDetailResultType;

  const excludedTerritories = [mainTerritory, ...additionalTerritories];

  return (
    <div className="fr-mb-3w">
      <h5 className="fr-mb-2w">Rechercher d'autres territoires</h5>
      <p className="fr-text--sm fr-mb-2w" style={{ color: "#666" }}>
        Recherchez et ajoutez d'autres territoires pour personnaliser la comparaison
      </p>
      <SearchBar
        onTerritorySelect={onTerritorySelect}
        excludeTerritories={excludedTerritories}
      />
    </div>
  );
};
