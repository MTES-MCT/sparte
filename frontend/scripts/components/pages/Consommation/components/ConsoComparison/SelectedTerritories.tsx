import React from "react";
import { Territory } from "@components/ui/SearchBar";

interface SelectedTerritoriesProps {
  territories: Territory[];
  onRemove: (territory: Territory) => void;
}

/**
 * Displays selected additional territories with remove buttons
 */
export const SelectedTerritories: React.FC<SelectedTerritoriesProps> = ({ territories, onRemove }) => {
  if (territories.length === 0) {
    return null;
  }

  return (
    <div className="fr-mt-3w">
      <p className="fr-text--sm fr-mb-1w" style={{ fontWeight: 500 }}>
        Territoires additionnels ({territories.length}) :
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {territories.map((territory) => (
          <div
            key={`${territory.land_type}_${territory.source_id}`}
            className="fr-badge fr-badge--sm"
            style={{
              background: "#e3e3fd",
              color: "#4318FF",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.25rem 0.5rem",
            }}
          >
            <span>{territory.name}</span>
            <button
              onClick={() => onRemove(territory)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                color: "#4318FF",
                fontSize: "1rem",
                lineHeight: 1,
              }}
              aria-label={`Retirer ${territory.name}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
