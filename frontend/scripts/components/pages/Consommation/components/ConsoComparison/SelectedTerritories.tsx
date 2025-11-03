import React from "react";
import styled from "styled-components";
import { Territory } from "@components/ui/SearchBar";

interface SelectedTerritoriesProps {
  territories: Territory[];
  onRemove: (territory: Territory) => void;
  onReset: () => void;
  onClearAll: () => void;
  isDefaultSelection: boolean;
}

const EmptyText = styled.p`
  color: #666;
`;

const ActionButton = styled.button`
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
`;

const TerritoriesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const TerritoryBadge = styled.div`
  background: #e3e3fd;
  color: #4318FF;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: #4318FF;
  font-size: 1rem;
  line-height: 1;
`;

export const SelectedTerritories: React.FC<SelectedTerritoriesProps> = ({
  territories,
  onRemove,
  onReset,
  onClearAll,
  isDefaultSelection,
}) => {
  if (territories.length === 0) {
    return (
      <div>
        <h5 className="fr-mb-2w">Territoires de comparaison sélectionnés</h5>
        <EmptyText className="fr-text--sm">
          Aucun territoire sélectionné. Les territoires voisins suggérés ci-dessous sont sélectionnés par défaut.
        </EmptyText>
      </div>
    );
  }

  return (
    <div>
      <h5 className="fr-mb-2w">Territoires de comparaison sélectionnés ({territories.length})</h5>
      <ActionButton
        onClick={isDefaultSelection ? onClearAll : onReset}
        className="fr-btn fr-btn--sm fr-btn--secondary"
      >
        {isDefaultSelection ? "Tout retirer" : "Réinitialiser la sélection"}
      </ActionButton>
      <TerritoriesList>
        {territories.map((territory) => (
          <TerritoryBadge
            key={`${territory.land_type}_${territory.source_id}`}
            className="fr-badge fr-badge--sm"
          >
            <span>{territory.name}</span>
            <RemoveButton
              onClick={() => onRemove(territory)}
              aria-label={`Retirer ${territory.name}`}
            >
              ×
            </RemoveButton>
          </TerritoryBadge>
        ))}
      </TerritoriesList>
    </div>
  );
};

