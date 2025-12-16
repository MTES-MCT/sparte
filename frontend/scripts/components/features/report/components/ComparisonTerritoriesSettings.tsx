import React from 'react';
import { Territory } from '@components/ui/SearchBar';
import TerritorySelector from '@components/features/TerritorySelector';

interface ComparisonTerritoriesSettingsProps {
    territories: Territory[];
    excludedTerritories: Territory[];
    isDefaultSelection: boolean;
    onAddTerritory: (territory: Territory) => void;
    onRemoveTerritory: (territory: Territory) => void;
    onReset: () => void;
}

const ComparisonTerritoriesSettings: React.FC<ComparisonTerritoriesSettingsProps> = ({
    territories,
    excludedTerritories,
    isDefaultSelection,
    onAddTerritory,
    onRemoveTerritory,
    onReset,
}) => {
    return (
        <>
            <h3 className="fr-text--lg fr-mb-2w">Territoires de comparaison</h3>
            <TerritorySelector
                territories={territories}
                excludedTerritories={excludedTerritories}
                isDefaultSelection={isDefaultSelection}
                onAddTerritory={onAddTerritory}
                onRemoveTerritory={onRemoveTerritory}
                onReset={onReset}
                emptyText="Aucun territoire de comparaison sélectionné"
                infoText="Les territoires de comparaison apparaissent dans les graphiques comparatifs. Par défaut, les territoires les plus proches géographiquement sont sélectionnés."
            />
        </>
    );
};

export default ComparisonTerritoriesSettings;
