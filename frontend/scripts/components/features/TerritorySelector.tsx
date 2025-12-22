import React from 'react';
import styled from 'styled-components';
import SearchBar, { Territory } from '@components/ui/SearchBar';
import { TerritoryBadge } from '@components/pages/Consommation/components/ConsoComparison/TerritoryBadge';

interface TerritorySelectorProps {
    territories: Territory[];
    excludedTerritories: Territory[];
    isDefaultSelection: boolean;
    onAddTerritory: (territory: Territory) => void;
    onRemoveTerritory: (territory: Territory) => void;
    onReset: () => void;
    searchLabel?: string;
    emptyText?: string;
    infoText?: string;
    showCount?: boolean;
    compact?: boolean;
}

const TerritoryList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1rem 0;
`;

const InfoText = styled.p`
    font-size: 0.8rem;
    color: #666;
    margin: 1rem 0 0 0;
    line-height: 1.4;
`;

const TerritorySelector: React.FC<TerritorySelectorProps> = ({
    territories,
    excludedTerritories,
    isDefaultSelection,
    onAddTerritory,
    onRemoveTerritory,
    onReset,
    searchLabel = "Ajouter un territoire",
    emptyText = "Aucun territoire sélectionné",
    infoText,
    showCount = false,
    compact = false,
}) => {
    return (
        <>
            {showCount && (
                <h5 className="fr-mb-1w">
                    Territoires de comparaison sélectionnés ({territories.length})
                </h5>
            )}

            <TerritoryList>
                {territories.length === 0 ? (
                    <p className="fr-text--sm fr-text--alt">{emptyText}</p>
                ) : (
                    territories.map((territory) => (
                        <TerritoryBadge
                            key={`${territory.land_type}_${territory.source_id}`}
                            territory={territory}
                            onRemove={onRemoveTerritory}
                        />
                    ))
                )}
            </TerritoryList>

            {!isDefaultSelection && (
                <div className={compact ? "fr-mb-2w" : "fr-my-3w"}>
                    <button
                        className="fr-btn fr-btn--sm fr-btn--secondary"
                        onClick={onReset}
                    >
                        Remettre la sélection par défaut
                    </button>
                </div>
            )}

            <SearchBar
                label={searchLabel}
                onTerritorySelect={onAddTerritory}
                excludeTerritories={excludedTerritories}
                disableOverlay={true}
            />

            {infoText && <InfoText>{infoText}</InfoText>}
        </>
    );
};

export default TerritorySelector;
