import React from "react";
import SearchBar, { Territory } from "@components/ui/SearchBar";

interface TerritorySelectorProps {
  landId: string;
  landType: string;
  additionalTerritories: Territory[];
  onTerritorySelect: (territory: Territory) => void;
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
  return (
    <div className="bg-white fr-p-3w rounded fr-mb-3w">
      <h5 className="fr-mb-2w">Ajouter des territoires à la comparaison</h5>
      <p className="fr-text--sm fr-mb-2w" style={{ color: "#666" }}>
        Recherchez et ajoutez d'autres territoires pour enrichir la comparaison
      </p>
      <SearchBar
        onTerritorySelect={onTerritorySelect}
        excludeTerritoryId={landId}
        excludeLandType={landType}
        excludeTerritories={additionalTerritories}
      />
    </div>
  );
};
