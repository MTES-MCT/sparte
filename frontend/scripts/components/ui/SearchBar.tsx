import React, { useEffect, ChangeEvent, FocusEvent, KeyboardEvent, useState, useRef, useMemo, useId } from 'react';
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

const GPU_URL = 'https://www.geoportail-urbanisme.gouv.fr/';

interface SearchBarProps {
    onTerritorySelect?: (territory: LandDetailResultType) => void;
    excludeTerritories?: LandDetailResultType[];
    disableOverlay?: boolean;
    label?: string;
    dropdownPosition?: "below" | "above";
    animatedPlaceholder?: boolean;
    inputId?: string;
}

const defaultBehavior = (territory: LandDetailResultType) => {
    window.location.href = `/diagnostic/${territory.land_type_slug}/${territory.slug}`
}


const primaryColor = '#313178';
const activeColor = '#4318FF';
const secondaryColor = '#a1a1f8';
const focusColor = '#0a76f6';

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

    &:focus-within {
        outline: 2px solid ${focusColor};
        outline-offset: 2px;
    }
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

const ResultItem = styled.div<{ $disabled: boolean; $active: boolean }>`
    padding: 0.5rem;
    font-size: 0.9em;
    cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
    transition: background 0.3s ease, color 0.3s ease;
    color: ${({ $active }) => ($active ? activeColor : primaryColor)};
    background: ${({ $active }) => ($active ? '#f4f7fe' : 'transparent')};

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

const ScotHint = styled.p`
    margin: 0;
    padding: 0.5rem;
    font-size: 0.8em;
    line-height: 1.4;
    color: #666;
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
    inputId,
}) => {
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const listboxRef = useRef<HTMLDivElement>(null);
    // Identifiants propres à chaque instance : plusieurs barres peuvent coexister sur une page
    const reactId = useId();
    const resolvedInputId = inputId ?? `${reactId}search-bar`;
    const listboxId = `${reactId}search-bar-results`;
    const getOptionId = (index: number) => `${reactId}search-bar-option-${index}`;
    const [query, setQuery] = useState<string>('');
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [data, setData] = useState<LandDetailResultType[] | undefined>(undefined);
    // Liste refermée par Échap : elle se rouvre à la prochaine saisie ou avec les flèches
    const [isListOpen, setIsListOpen] = useState<boolean>(false);
    const [activeIndex, setActiveIndex] = useState<number>(-1);
    const minimumCharCountForSearch = 2;
    // Le message SCoT/GPU n'a de sens que pour une vraie recherche, pas pour 2 lettres
    const minimumCharCountForScotHint = 3;
    // La requête est différée pour ne pas dépasser le throttle de l'API (429) pendant la frappe
    const debouncedQuery = useDebounce(query, 200);
    const isQueryTooShort = query.length < minimumCharCountForSearch;
    const shouldQueryBeSkipped = debouncedQuery.length < minimumCharCountForSearch;
    const { data: queryData, isFetching } = useSearchTerritoryQuery(debouncedQuery, {
        skip: shouldQueryBeSkipped,
    });
    // Recherche en cours : requête en vol ou saisie en attente du debounce
    const isSearching = isFetching || (!isQueryTooShort && query !== debouncedQuery);
    const shouldShowScotHint = query.trim().length >= minimumCharCountForScotHint;

    const results = isListOpen ? data : undefined;
    const hasResults = results !== undefined && results.length > 0;
    const activeOptionId = hasResults && activeIndex >= 0 ? getOptionId(activeIndex) : undefined;

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
        if (isQueryTooShort || shouldQueryBeSkipped || isSearching) {
            setData(undefined);
        } else {
            const filteredData = queryData
                ? queryData.filter((territory: LandDetailResultType) => !shouldExcludeTerritoryFromResults(territory))
                : undefined;
            setData(filteredData);
            setIsListOpen(true);
        }
        setActiveIndex(-1);
    }, [isSearching, queryData, query, isQueryTooShort, shouldQueryBeSkipped, stableExcludeTerritories]);

    // Garde le résultat actif visible dans la liste (qui peut défiler)
    useEffect(() => {
        if (activeIndex < 0) {
            return;
        }
        const activeOption = listboxRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
        activeOption?.scrollIntoView?.({ block: 'nearest' });
    }, [activeIndex]);

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

    const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
        // Le focus passe au lien du message SCoT (Tab) : la liste reste ouverte
        if (searchContainerRef.current?.contains(event.relatedTarget)) {
            return;
        }
        setTimeout(handleReset, 150);
    };

    const handleReset = () => {
        setQuery('');
        setIsFocused(false);
        setData(undefined);
        setIsListOpen(false);
        setActiveIndex(-1);
    };

    const handleTerritoryClick = (territory: LandDetailResultType) => {
        onTerritorySelect ? onTerritorySelect(territory) : defaultBehavior(territory);
        handleReset();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        const options = data ?? [];
        switch (event.key) {
            case 'ArrowDown':
                if (options.length === 0) {
                    return;
                }
                event.preventDefault();
                setIsListOpen(true);
                setActiveIndex((index) => (index + 1) % options.length);
                break;
            case 'ArrowUp':
                if (options.length === 0) {
                    return;
                }
                event.preventDefault();
                setIsListOpen(true);
                setActiveIndex((index) => (index <= 0 ? options.length - 1 : index - 1));
                break;
            case 'Enter':
                if (hasResults && activeIndex >= 0) {
                    event.preventDefault();
                    handleTerritoryClick(options[activeIndex]);
                }
                break;
            case 'Escape':
                if (results !== undefined) {
                    event.preventDefault();
                    setIsListOpen(false);
                    setActiveIndex(-1);
                } else if (query !== '') {
                    event.preventDefault();
                    setQuery('');
                }
                break;
            default:
                break;
        }
    };

    return (
        <>
            {!disableOverlay && <Overlay $visible={isFocused} />}
            {label && <Label htmlFor={resolvedInputId}>{label}</Label>}
            <SearchContainer ref={searchContainerRef} $useHighZIndex={!disableOverlay} onBlur={handleBlur}>
                <Icon className="bi bi-search" aria-hidden="true" />
                <InputWrapper>
                    <Input
                        id={resolvedInputId}
                        type="text"
                        role="combobox"
                        autoComplete="off"
                        aria-autocomplete="list"
                        aria-expanded={hasResults}
                        aria-controls={hasResults ? listboxId : undefined}
                        aria-activedescendant={activeOptionId}
                        value={query}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        placeholder={shouldShowAnimatedPlaceholder ? '' : 'Rechercher un territoire (Commune, EPCI, Département, Région...)'}
                        aria-label="Rechercher un territoire"
                    />
                    <AnimatedPlaceholder $visible={shouldShowAnimatedPlaceholder}>
                        {displayText}
                        <Cursor $blinking={!isTyping} />
                    </AnimatedPlaceholder>
                </InputWrapper>
                {isSearching && <Loader size={25} wrap={false} />}
                {results && (
                    <ResultsContainer $useHighZIndex={!disableOverlay} $position={dropdownPosition}>
                        {results.length > 0 ? (
                            <div ref={listboxRef} role="listbox" id={listboxId} aria-label="Résultats de la recherche">
                                {results.map((territory: LandDetailResultType, index: number) => {
                                    const isDisabled = territory.surface === 0;
                                    const isActive = index === activeIndex;
                                    return (
                                        <ResultItem
                                            key={territory.land_id}
                                            id={getOptionId(index)}
                                            role="option"
                                            aria-selected={isActive}
                                            $disabled={isDisabled}
                                            $active={isActive}
                                            onMouseDown={(e) => e.preventDefault()}
                                            onMouseMove={() => setActiveIndex(index)}
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
                                                        <div><i className="bi bi-info-circle fr-mr-1w" aria-hidden="true"></i>Données indisponibles: Territoire supprimé en 2024</div>
                                                    }
                                                </TerritoryDetails>
                                            </div>
                                        </ResultItem>
                                    );
                                })}
                            </div>
                        ) : (
                            <NoResultsMessage role="status">
                                Aucun résultat trouvé pour votre recherche.
                            </NoResultsMessage>
                        )}
                        {shouldShowScotHint && (
                            <ScotHint onMouseDown={(e) => e.preventDefault()}>
                                Vous ne trouvez pas votre SCoT ? Les SCoT sont intégrés automatiquement à partir des documents
                                publiés sur le{' '}
                                <a href={GPU_URL} target="_blank" rel="noopener noreferrer">Géoportail de l’urbanisme</a>.
                                Si votre SCoT n’y est pas encore publié, rapprochez-vous de sa structure porteuse : il sera ajouté
                                à Mon Diag Artif lors de la prochaine mise à jour des données.
                            </ScotHint>
                        )}
                    </ResultsContainer>
                )}
            </SearchContainer>
        </>
    );
};

export default SearchBar;
