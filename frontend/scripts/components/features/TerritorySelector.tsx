import React from 'react';
import styled from 'styled-components';
import SearchBar from '@components/ui/SearchBar';
import Button from '@components/ui/Button';
import { LandDetailResultType } from '@services/types/land';
import Tag from '@components/ui/Tag';


interface TerritorySelectorProps {
    territories: LandDetailResultType[];
    excludedTerritories: LandDetailResultType[];
    isDefaultSelection: boolean;
    onAddTerritory: (territory: LandDetailResultType) => void;
    onRemoveTerritory: (territory: LandDetailResultType) => void;
    onReset: () => void;
    searchLabel?: string;
    emptyText?: string;
    infoText?: string;
    showCount?: boolean;
    compact?: boolean;
    dropdownPosition?: "below" | "above";
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
    dropdownPosition = "below",
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
                        <Tag
                            key={`${territory.land_type}_${territory.land_id}`}
                            variant="primary"
                            onDismiss={() => onRemoveTerritory(territory)}
                        >
                            {territory.name}
                        </Tag>
                    ))
                )}
            </TerritoryList>

            {!isDefaultSelection && (
                <div className={compact ? "fr-mb-2w" : "fr-my-3w"}>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={onReset}
                    >
                        Remettre la sélection par défaut
                    </Button>
                </div>
            )}

            <SearchBar
                label={searchLabel}
                onTerritorySelect={onAddTerritory}
                excludeTerritories={excludedTerritories}
                disableOverlay={true}
                dropdownPosition={dropdownPosition}
            />

            {infoText && <InfoText>{infoText}</InfoText>}
        </>
    );
};

export default TerritorySelector;
