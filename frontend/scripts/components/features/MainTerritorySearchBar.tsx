import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SearchBar from '@components/ui/SearchBar';
import { LandDetailResultType } from '@services/types/land';
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

interface SelectedTerritory {
    name: string;
    landId: string;
    landType: string;
    landTypeLabel: string;
}

const MainTerritorySearchBar: React.FC = () => {
    const [selected, setSelected] = useState<SelectedTerritory | null>(null);
    const [initialLandType, setInitialLandType] = useState<string | null>(null);
    const [initialLandId, setInitialLandId] = useState<string | null>(null);
    const { data: landData } = useGetLandQuery({
        land_type: initialLandType,
        land_id: initialLandId,
    }, { skip: !initialLandType || !initialLandId || !!selected });

    useEffect(() => {
        const inputId = document.querySelector<HTMLInputElement>('input[name="main_land_id"]');
        const inputType = document.querySelector<HTMLInputElement>('input[name="main_land_type"]');
        if (inputId?.value && inputType?.value) {
            setInitialLandType(inputType.value);
            setInitialLandId(inputId.value);
        }
    }, []);

    useEffect(() => {
        if (landData && !selected) {
            setSelected({
                name: landData.name,
                landId: landData.land_id,
                landType: landData.land_type,
                landTypeLabel: landData.land_type_label || landData.land_type,
            });
        }
    }, [landData, selected]);

    const handleTerritorySelect = (territory: LandDetailResultType) => {
        setSelected({
            name: territory.name,
            landId: territory.land_id,
            landType: territory.land_type,
            landTypeLabel: territory.land_type_label,
        });
        const inputId = document.querySelector<HTMLInputElement>('input[name="main_land_id"]');
        const inputType = document.querySelector<HTMLInputElement>('input[name="main_land_type"]');
        if (inputId) inputId.value = territory.land_id;
        if (inputType) inputType.value = territory.land_type;
    };

    return (
        <Container>
            <SearchBar onTerritorySelect={handleTerritorySelect} />
            {selected && (
                <SelectedTerritoryCard>
                    <TerritoryHeader>
                        <TerritoryName>{selected.name}</TerritoryName>
                        <Badge className="fr-badge">{selected.landTypeLabel}</Badge>
                    </TerritoryHeader>
                    <TerritoryInfo>Code : {selected.landId}</TerritoryInfo>
                </SelectedTerritoryCard>
            )}
        </Container>
    );
};

export default MainTerritorySearchBar;