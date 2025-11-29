import React, { useEffect, useRef } from "react";
import { Territory } from "@components/ui/SearchBar";

interface TerritoryBadgeProps {
  territory: Territory;
  onRemove: (territory: Territory) => void;
}

export const TerritoryBadge: React.FC<TerritoryBadgeProps> = ({ territory, onRemove }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    // Empêcher le comportement par défaut du DSFR qui essaie de supprimer le nœud
    const handleDismiss = (e: Event) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      onRemove(territory);
    };

    button.addEventListener("click", handleDismiss, true);

    return () => {
      button.removeEventListener("click", handleDismiss, true);
    };
  }, [territory, onRemove]);

  return (
    <div>
      <button
        ref={buttonRef}
        type="button"
        className="fr-tag fr-tag--sm fr-tag--dismiss"
        aria-label={`Retirer ${territory.name}`}
      >
        {territory.name}
      </button>
    </div>
  );
};
