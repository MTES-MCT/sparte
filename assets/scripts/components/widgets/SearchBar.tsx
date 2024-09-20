import React, { useEffect, ChangeEvent, useState } from 'react';
import styled from 'styled-components';
import { useSearchTerritoryQuery } from '@services/api';
import useDebounce from '@hooks/useDebounce';
import getCsrfToken from '@utils/csrf';
import Loader from '@components/ui/Loader';

interface SearchBarProps {
    createUrl: string;
}

export interface Territory {
    id: number;
    name: string;
    source_id: string;
    public_key: string;
    area: number;
    land_type: string;
}

const territoryLabels: Record<string, string> = {
    COMM: 'Commune',
    EPCI: 'EPCI',
    SCOT: 'SCOT',
    DEPART: 'Département',
    REGION: 'Région',
};

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

const ResultItem = styled.div`
    padding: 0.5rem;
    font-size: 0.9em;
    cursor: pointer;
    transition: background 0.3s ease, color 0.3s ease;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    &:not(:last-child) {
        border-bottom: 1px solid #EBEBEC;
    }

    &:hover {
        background: #f4f7fe;
        color: ${activeColor};
    }
`;

const TerritoryDetails = styled.div`
    font-size:  0.8em;
    color: ${secondaryColor};
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

const HighlightedText = styled.span`
    font-weight: bold;
    color: ${activeColor};
`;

const SearchBar: React.FC<SearchBarProps> = ({ createUrl }) => {
    const [query, setQuery] = useState<string>('');
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [data, setData] = useState<Territory[] | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const debouncedQuery = useDebounce(query, 300);
    const { data: queryData, isLoading } = useSearchTerritoryQuery(debouncedQuery, {
        skip: debouncedQuery.length < 2,
    });

    useEffect(() => {
        if (debouncedQuery.length >= 2) {
            setData(queryData);
        } else {
            setData(undefined);
        }
    }, [queryData, debouncedQuery]);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newQuery = event.target.value;
        setQuery(newQuery);
    };

    const handleBlur = () => {
        // setTimeout(() => {
        //     setQuery('');
        //     setIsFocused(false);
        //     setData(undefined);
        // }, 150);
    };

    const highlightMatch = (text: string, query: string) => {
        if (!query) return text;

        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, index) => {
            const key = `${part}-${index}`;
    
            return part.toLowerCase() === query.toLowerCase() ? (
                <HighlightedText key={key}>{part}</HighlightedText>
            ) : (
                part
            );
        });
    };

    // Solution temporaire
    const createDiagnostic = (publicKey: string) => {
        if (isSubmitting) return;
    
        setIsSubmitting(true);
    
        const form = document.createElement('form');
        form.action = createUrl;
        form.method = 'POST';
    
        // CSRF Token
        const csrfToken = document.createElement('input');
        csrfToken.type = 'hidden';
        csrfToken.name = 'csrfmiddlewaretoken';
        csrfToken.value = getCsrfToken();
        form.appendChild(csrfToken);
    
        // Public Key
        const selection = document.createElement('input');
        selection.type = 'hidden';
        selection.name = 'selection';
        selection.value = publicKey;
        form.appendChild(selection);
    
        // Keyword
        const keywordInput = document.createElement('input');
        keywordInput.type = 'hidden';
        keywordInput.name = 'keyword';
        keywordInput.value = query;
        form.appendChild(keywordInput);
    
        document.body.appendChild(form);
        form.submit();
    };

    return (
        <>
            <Overlay $visible={isFocused} />
            <SearchContainer>
                <Icon className="bi bi-search" />
                <Input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={handleBlur}
                    placeholder="Rechercher un territoire (Commune, EPCI, Département, Région...)"
                    aria-label="Rechercher un territoire"
                />
                {isLoading && <Loader size={25} wrap={false} />}
                {data && (
                    <ResultsContainer>
                        {data.length > 0 ? (
                            data.map((territory: Territory) => (
                                <ResultItem
                                    key={territory.id}
                                    onClick={() => createDiagnostic(territory.public_key)}
                                >
                                    <div>
                                        <div>{highlightMatch(territory.name, query)}</div>
                                        <TerritoryDetails>Code INSEE: {territory.source_id}</TerritoryDetails>
                                    </div>
                                    <Badge className="fr-badge">{territoryLabels[territory.land_type]}</Badge>
                                </ResultItem>
                            ))
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
