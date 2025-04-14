import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SearchBar, { Territory } from '@components/ui/SearchBar';

const fetchTerritoryDetails = async (id: string, type: string): Promise<Territory> => {
    return {
        id: parseInt(id, 10),
        public_key: `${type}_${id}`,
        name: 'Lorient',
        land_type_label: 'Commune',
        source_id: id,
        area: 0,
    };
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
`;

const SelectedTerritoryCard = styled.div`
    background-color: #f4f7fe;
    border-radius: 8px;
    padding: 1rem;
    border: 1px solid #d5d9de;
`;

const TerritoryHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const TerritoryName = styled.h3`
    margin: 0;
    font-size: 1.1rem;
    color: #4318FF;
`;

const Badge = styled.p`
    font-size:  0.8em;
    font-weight: 400;
    background: #e3e3fd;
    color: var(--text-title-blue-france);
    text-transform: none;
`;


const TerritoryInfo = styled.div`
    font-size: 0.8rem;
    color: #a1a1f8;
`;

const MainTerritorySearchBar: React.FC = () => {
    const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);

    useEffect(() => {
        const container = document.getElementById('react-search-bar-profile');
        if (!container) return;

        const landId = container.getAttribute('data-land-id');
        const landType = container.getAttribute('data-land-type');

        if (!landId || !landType) return;

        fetchTerritoryDetails(landId, landType)
            .then(setSelectedTerritory)
            .catch((error) =>
                console.error('Erreur lors du chargement du territoire initial :', error)
            );
    }, []);

    const handleTerritorySelect = (territory: Territory) => {
        setSelectedTerritory(territory);
    
        // Remplir les champs cachés du formulaire Django
        const inputId = document.querySelector<HTMLInputElement>('input[name="main_land_id"]');
        const inputType = document.querySelector<HTMLInputElement>('input[name="main_land_type"]');
        const [landType, landId] = territory.public_key.split('_');

        if (inputId) inputId.value = landId;
        if (inputType) inputType.value = landType;
    };

    return (
        <Container>
            <SearchBar onTerritorySelect={handleTerritorySelect} />
            {selectedTerritory && (
                <SelectedTerritoryCard>
                    <TerritoryHeader>
                        <TerritoryName>{selectedTerritory.name}</TerritoryName>
                        <Badge className="fr-badge">{selectedTerritory.land_type_label}</Badge>
                    </TerritoryHeader>
                    <TerritoryInfo>Code INSEE: {selectedTerritory.source_id}</TerritoryInfo>
                </SelectedTerritoryCard>
            )}
        </Container>
    );
};

export default MainTerritorySearchBar;