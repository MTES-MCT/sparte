import React from "react";
import { Territory } from "@components/ui/SearchBar";

interface TerritoryBadgeProps {
  territory: Territory;
  onRemove: (territory: Territory) => void;
}

const BADGE_STYLES = {
  container: {
    background: "#e3e3fd",
    color: "#4318FF",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.25rem 0.5rem",
  },
  removeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    color: "#4318FF",
    fontSize: "1rem",
    lineHeight: 1,
  },
} as const;

export const TerritoryBadge: React.FC<TerritoryBadgeProps> = ({ territory, onRemove }) => {
  return (
    <div
      className="fr-badge fr-badge--sm"
      style={BADGE_STYLES.container}
    >
      <span>{territory.name}</span>
      <button
        onClick={() => onRemove(territory)}
        style={BADGE_STYLES.removeButton}
        aria-label={`Retirer ${territory.name}`}
      >
        ×
      </button>
    </div>
  );
};
