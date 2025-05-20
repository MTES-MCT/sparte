import React, { useEffect, ChangeEvent, useState, useRef } from 'react';
import styled from 'styled-components';
import { useSearchTerritoryQuery } from '@services/api';
import useDebounce from '@hooks/useDebounce';
import Loader from '@components/ui/Loader';
import getCsrfToken from '@utils/csrf';

interface SearchBarProps {
    onTerritorySelect?: (territory: Territory) => void;
}

export interface Territory {
    id: number;
    name: string;
    source_id: string;
    public_key: string;
    area: number;
    land_type_label: string;
    land_type: string;
}

const defaultBehavior = async (territory: Territory) => {
    const response = await fetch("/project/nouveau", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrfToken(),
        },
        body: JSON.stringify({
            land_id: territory.source_id,
            land_type: territory.land_type,
        }),
    })
    const { id } = await response.json()
    window.location.href = `/project/${id}/tableau-de-bord/synthesis`
}


const primaryColor = '#313178';
const activeColor = '#4318FF';
const secondaryColor = '#a1a1f8';

const SearchContainer = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    border: 1px solid #d5d9de;
    border-radius: 6px;
    padding: 0.5rem;
    background: #fff;
    position: relative;
    z-index: 1001;
`;

const Icon = styled.i`
    color: ${primaryColor};
    margin: 0 0.5rem;
`;

const Input = styled.input`
    flex-grow: 1;
    border: none;
    font-size: 0.9em;
    color: ${primaryColor};

    &:focus {
        outline: none;
    }
`;

const ResultsContainer = styled.div`
    position: absolute;
    top: 120%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #d5d9de;
    border-radius: 6px;
    max-height: 30vh;
    overflow-y: auto;
    z-index: 1002;
`;

const Overlay = styled.div<{ $visible: boolean }>`
    display: ${({ $visible }) => ($visible ? 'block' : 'none')};
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.2);
    z-index: 1000;
`;

const ResultItem = styled.div<{ $disabled: boolean }>`
    padding: 0.5rem;
    font-size: 0.9em;
    cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
    transition: background 0.3s ease, color 0.3s ease;
    color: ${primaryColor};

    &:not(:last-child) {
        border-bottom: 1px solid #EBEBEC;
    }

    &:hover {
        background: #f4f7fe;
        color: ${activeColor};
    }
`;

const TerritoryTitle = styled.div`
    display: flex;
    align-otems: center;
    justify-content: space-between;
    font-weight: 500;
`;

const TerritoryDetails = styled.div`
    font-size: 0.8em;
    color: ${secondaryColor};
    display: flex;
    justify-content: space-between;
    width: 100%;
`;

const Badge = styled.p`
    font-size:  0.8em;
    font-weight: 400;
    background: #e3e3fd;
    color: ${primaryColor};
    text-transform: none;
`;

const NoResultsMessage = styled.div`
    padding: 0.5rem;
    font-size: 0.9em;
    color: ${secondaryColor};
    text-align: center;
`;

const SearchBar: React.FC<SearchBarProps> = ({ onTerritorySelect }) => {
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const [query, setQuery] = useState<string>('');
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [data, setData] = useState<Territory[] | undefined>(undefined);
    const debouncedQuery = useDebounce(query, 500);
    const minimumCharCountForSearch = 2;
    const shouldQueryBeSkipped = debouncedQuery.length < minimumCharCountForSearch;
    const { data: queryData, isFetching } = useSearchTerritoryQuery(debouncedQuery, {
        skip: shouldQueryBeSkipped,
    });

    useEffect(() => {
        if (shouldQueryBeSkipped || isFetching) {
            setData(undefined);
        } else {
            setData(queryData);
        }
    }, [isFetching, queryData, debouncedQuery, shouldQueryBeSkipped]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsFocused(false);
                setData(undefined);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newQuery = event.target.value;
        setQuery(newQuery);
    };

    const handleBlur = () => {
        setTimeout(handleReset, 150);
    };

    const handleReset = () => {
        setQuery('');
        setIsFocused(false);
        setData(undefined);
    };

    const handleTerritoryClick = (territory: Territory) => {
        onTerritorySelect ? onTerritorySelect(territory) : defaultBehavior(territory);
        handleReset();
    };

    return (
        <>
            <Overlay $visible={isFocused} />
            <SearchContainer ref={searchContainerRef}>
                <Icon className="bi bi-search" />
                <Input
                    id="search-bar-territory"
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={handleBlur}
                    placeholder="Rechercher un territoire (Commune, EPCI, Département, Région...)"
                    aria-label="Rechercher un territoire"
                />
                {isFetching && <Loader size={25} wrap={false} />}
                {data && (
                    <ResultsContainer>
                        {data.length > 0 ? (
                            data.map((territory: Territory) => {
                                const isDisabled = territory.area === 0;
                                return (
                                    <ResultItem
                                        key={territory.source_id}
                                        $disabled={isDisabled}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => handleTerritoryClick(territory)}
                                    >
                                        <div>
                                            <TerritoryTitle>
                                                <div>{territory.name}</div>
                                                <Badge className="fr-badge">{territory.land_type_label}</Badge>
                                            </TerritoryTitle>
                                            <TerritoryDetails>
                                                <div>Code INSEE: {territory.source_id}</div>
                                                {isDisabled && 
                                                    <div><i className="bi bi-info-circle fr-mr-1w"></i>Données indisponibles: Territoire supprimé en 2024</div>
                                                }
                                            </TerritoryDetails>
                                        </div>
                                    </ResultItem>
                                );
                            })
                        ) : (
                            <NoResultsMessage>
                                Aucun résultat trouvé pour votre recherche.
                            </NoResultsMessage>
                        )}
                    </ResultsContainer>
                )}
            </SearchContainer>
        </>
    );
};

export default SearchBar;
