import React from "react";
import { Territory } from "@components/ui/SearchBar";

interface SuggestedTerritoriesProps {
  title: string;
  territories: Territory[];
  additionalTerritories: Territory[];
  onTerritoryAdd: (territory: Territory) => void;
  onReset?: () => void;
  showResetButton?: boolean;
}

/**
 * Displays suggested territories with add buttons
 */
export const SuggestedTerritories: React.FC<SuggestedTerritoriesProps> = ({
  title,
  territories,
  additionalTerritories,
  onTerritoryAdd,
  onReset,
  showResetButton = false,
}) => {
  if (territories.length === 0) {
    return null;
  }

  return (
    <div className="fr-mt-3w">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <p className="fr-text--sm fr-mb-0" style={{ fontWeight: 500, color: "#666" }}>
          {title}
        </p>
        {showResetButton && (
          <button
            onClick={onReset}
            className="fr-btn fr-btn--sm fr-btn--secondary"
            style={{
              padding: "0.25rem 0.75rem",
              fontSize: "0.75rem",
            }}
          >
            Réinitialiser les territoires de comparaison
          </button>
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {territories.map((territory) => {
          const isAlreadyAdded = additionalTerritories.some(
            (t) => t.source_id === territory.source_id && t.land_type === territory.land_type
          );

          return (
            <button
              key={territory.source_id}
              onClick={() => onTerritoryAdd(territory)}
              disabled={isAlreadyAdded}
              className="fr-badge fr-badge--sm"
              style={{
                background: isAlreadyAdded ? "#e5e5e5" : "#f5f5fe",
                color: isAlreadyAdded ? "#929292" : "#6a6af4",
                border: isAlreadyAdded ? "1px solid #e5e5e5" : "1px solid #e3e3fd",
                cursor: isAlreadyAdded ? "not-allowed" : "pointer",
                padding: "0.25rem 0.5rem",
                fontSize: "0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
              aria-label={`Ajouter ${territory.name} à la comparaison`}
            >
              {!isAlreadyAdded && <span style={{ fontSize: "0.875rem" }}>+</span>}
              <span>{territory.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
