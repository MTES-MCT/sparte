import React, { useEffect, ChangeEvent, useState, useRef, useMemo } from 'react';
import styled from 'styled-components';
import { useSearchTerritoryQuery } from '@services/api';

import useDebounce from '@hooks/useDebounce';
import useTypewriterAnimation from '@hooks/useTypewriterAnimation';
import Loader from '@components/ui/Loader';
import { LandDetailResultType } from '@services/types/land';

const ANIMATED_PLACEHOLDER_TEXTS = [
    'SCOT de l\'Artois',
    'SCOT du Pays d\'Apt',
    'CA du Grand Angoulême',
    'CC Coeur de Savoie',
    'Blanquefort',
    'Ajaccio',
    'Normandie',
    'Occitanie',
    'Aveyron',
    'Gironde',
];

interface SearchBarProps {
    onTerritorySelect?: (territory: LandDetailResultType) => void;
    excludeTerritories?: LandDetailResultType[];
    disableOverlay?: boolean;
    label?: string;
    dropdownPosition?: "below" | "above";
    animatedPlaceholder?: boolean;
}

const defaultBehavior = (territory: LandDetailResultType) => {
    window.location.href = `/diagnostic/${territory.land_type_slug}/${territory.slug}`
}


const primaryColor = '#313178';
const activeColor = '#4318FF';
const secondaryColor = '#a1a1f8';

const SearchContainer = styled.div<{ $useHighZIndex: boolean }>`
    display: flex;
    align-items: center;
    width: 100%;
    border: 1px solid #d5d9de;
    border-radius: 6px;
    padding: 0.5rem;
    background: #fff;
    position: relative;
    z-index: ${({ $useHighZIndex }) => ($useHighZIndex ? '1001' : '10')};
`;

const Icon = styled.i`
    color: ${primaryColor};
    margin: 0 0.5rem;
`;

const InputWrapper = styled.div`
    position: relative;
    flex-grow: 1;
    display: flex;
    align-items: center;
`;

const Input = styled.input`
    flex-grow: 1;
    border: none;
    font-size: 0.9em;
    color: ${primaryColor};
    background: transparent;
    width: 100%;

    &:focus {
        outline: none;
    }

    &::placeholder {
        color: #9ca3af;
    }
`;

const AnimatedPlaceholder = styled.span<{ $visible: boolean }>`
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.9em;
    color: #9ca3af;
    pointer-events: none;
    white-space: nowrap;
    overflow: hidden;
    display: ${({ $visible }) => ($visible ? 'block' : 'none')};
`;

const Cursor = styled.span<{ $blinking: boolean }>`
    display: inline-block;
    width: 2px;
    height: 1em;
    background-color: ${primaryColor};
    margin-left: 1px;
    vertical-align: middle;
    animation: ${({ $blinking }) => ($blinking ? 'blink 1s step-end infinite' : 'none')};

    @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
    }
`;

const ResultsContainer = styled.div<{ $useHighZIndex: boolean; $position: "below" | "above" }>`
    position: absolute;
    ${({ $position }) => $position === "above" ? "bottom: 120%;" : "top: 120%;"}
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #d5d9de;
    border-radius: 6px;
    max-height: 30vh;
    overflow-y: auto;
    z-index: ${({ $useHighZIndex }) => ($useHighZIndex ? '1002' : '11')};
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

const Label = styled.label`
    font-size: 0.85em;
    margin-bottom: 0.5rem;
`;

const SearchBar: React.FC<SearchBarProps> = ({
    onTerritorySelect,
    excludeTerritories = [],
    disableOverlay = false,
    label = "",
    dropdownPosition = "below",
    animatedPlaceholder = false,
}) => {
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const [query, setQuery] = useState<string>('');
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [data, setData] = useState<LandDetailResultType[] | undefined>(undefined);
    const minimumCharCountForSearch = 2;
    const shouldQueryBeSkipped = query.length < minimumCharCountForSearch;
    const { data: queryData, isFetching } = useSearchTerritoryQuery(query, {
        skip: shouldQueryBeSkipped,
    });

    const shouldShowAnimatedPlaceholder = animatedPlaceholder && !isFocused && query === '';
    const { displayText, isTyping } = useTypewriterAnimation({
        texts: ANIMATED_PLACEHOLDER_TEXTS,
        enabled: shouldShowAnimatedPlaceholder,
        typingSpeed: 70,
        deletingSpeed: 35,
        pauseBeforeDelete: 1800,
        pauseBeforeNext: 400,
    });

    const stableExcludeTerritories = useMemo(() => excludeTerritories, 
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [JSON.stringify(excludeTerritories)]
    );

    const shouldExcludeTerritoryFromResults = (territory: LandDetailResultType): boolean => {
        if (stableExcludeTerritories.length === 0) {
            return false;
        }
        return stableExcludeTerritories.some(
            (excludedTerritory: LandDetailResultType) =>
                territory.land_id === excludedTerritory.land_id &&
                territory.land_type === excludedTerritory.land_type
        );
    };

    useEffect(() => {
        if (shouldQueryBeSkipped || isFetching) {
            setData(undefined);
        } else {
            const filteredData = queryData
                ? queryData.filter((territory: LandDetailResultType) => !shouldExcludeTerritoryFromResults(territory))
                : undefined;
            setData(filteredData);
        }
    }, [isFetching, queryData, query, shouldQueryBeSkipped, stableExcludeTerritories]);

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

    const handleTerritoryClick = (territory: LandDetailResultType) => {
        onTerritorySelect ? onTerritorySelect(territory) : defaultBehavior(territory);
        handleReset();
    };

    return (
        <>
            {!disableOverlay && <Overlay $visible={isFocused} />}
            {label && <Label htmlFor="search-bar-territory">{label}</Label>}
            <SearchContainer ref={searchContainerRef} $useHighZIndex={!disableOverlay}>
                <Icon className="bi bi-search" />
                <InputWrapper>
                    <Input
                        id="search-bar-territory"
                        type="text"
                        value={query}
                        onChange={handleInputChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={handleBlur}
                        placeholder={shouldShowAnimatedPlaceholder ? '' : 'Rechercher un territoire (Commune, EPCI, Département, Région...)'}
                        aria-label="Rechercher un territoire"
                    />
                    <AnimatedPlaceholder $visible={shouldShowAnimatedPlaceholder}>
                        {displayText}
                        <Cursor $blinking={!isTyping} />
                    </AnimatedPlaceholder>
                </InputWrapper>
                {isFetching && <Loader size={25} wrap={false} />}
                {data && (
                    <ResultsContainer $useHighZIndex={!disableOverlay} $position={dropdownPosition}>
                        {data.length > 0 ? (
                            data.map((territory: LandDetailResultType) => {
                                const isDisabled = territory.surface === 0;
                                return (
                                    <ResultItem
                                        key={territory.land_id}
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
                                                <div>Code INSEE: {territory.land_id}</div>
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
