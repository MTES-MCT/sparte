import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SearchBar, { Territory } from '@components/ui/SearchBar';
import { useGetLandQuery } from '@services/api';


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
    const [selectedLandId, setSelectedLandId] = useState<string | null>(null);
    const [selectedLandType, setSelectedLandType] = useState<string | null>(null);
    const { data : landData } = useGetLandQuery({
        land_type: selectedLandType,
        land_id: selectedLandId,
    }, { skip: !selectedLandId || !selectedLandType })

    useEffect(() => {
        const inputId = document.querySelector<HTMLInputElement>('input[name="main_land_id"]');
        const inputType = document.querySelector<HTMLInputElement>('input[name="main_land_type"]');
        if (inputId.value && inputType.value) {
            setSelectedLandId(inputId.value);
            setSelectedLandType(inputType.value);
        }
    }, [])

    const handleTerritorySelect = (territory: Territory) => {
        setSelectedLandId(territory.source_id);
        setSelectedLandType(territory.land_type);
        const inputId = document.querySelector<HTMLInputElement>('input[name="main_land_id"]');
        const inputType = document.querySelector<HTMLInputElement>('input[name="main_land_type"]');
        const { source_id, land_type } = territory;
        if (inputId) inputId.value = source_id;
        if (inputType) inputType.value = land_type;
    };

    return (
        <Container>
            <SearchBar onTerritorySelect={handleTerritorySelect} />
            {landData && (
                <SelectedTerritoryCard>
                    <TerritoryHeader>
                        <TerritoryName>{landData.name}</TerritoryName>
                        <Badge className="fr-badge">{landData.land_type}</Badge>
                    </TerritoryHeader>
                    <TerritoryInfo>Code : {landData.land_id}</TerritoryInfo>
                </SelectedTerritoryCard>
            )}
        </Container>
    );
};

export default MainTerritorySearchBar;