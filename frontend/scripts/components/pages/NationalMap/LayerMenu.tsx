import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@theme';
import Drawer from '@components/ui/Drawer';
import IndicatorList from './IndicatorList';
import StandInNotice from './components/StandInNotice';
import { mapNameOf } from './domain/mapName';
import type { View } from './domain/viewProfile';
import { Indicator, INDICATOR_TYPE_LABELS } from './indicators';
import { MENU_ACTIVE_BORDER, MENU_ACTIVE_COLOR, MENU_COLOR, MENU_LINE_COLOR } from './layoutStyles';
import { LAYERS } from './domain/viewState';

// Rubriques de la carte, dans le style du menu latéral des diagnostics. Une seule rubrique
// est dépliée à la fois ; son sous-menu liste les indicateurs. L'icône d'information ouvre
// un volet qui décrit les indicateurs de la rubrique.
const Menu = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0.5rem 0 1rem;
`;

const LayerItem = styled.li`
    margin-bottom: 0.5rem;
`;

const LayerRow = styled.div<{ $active: boolean }>`
    display: flex;
    align-items: center;
    border-right: 4px solid ${({ $active }) => ($active ? MENU_ACTIVE_BORDER : 'transparent')};
    transition: border-color 0.3s ease;
`;

const LayerButton = styled.button<{ $active: boolean }>`
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 0.7em;
    padding: 0.6rem 0.5rem 0.6rem 1rem;
    font-family: inherit;
    font-size: 0.85rem;
    font-weight: ${theme.fontWeight.medium};
    text-align: left;
    color: ${({ $active }) => ($active ? MENU_ACTIVE_COLOR : MENU_COLOR)};
    background: transparent;
    border: none;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
        color: ${MENU_ACTIVE_COLOR};
    }
`;

const LayerText = styled.span`
    flex: 1;
`;

const Chevron = styled.i<{ $open: boolean }>`
    font-size: 0.7rem;
    color: ${theme.colors.textMuted};
    transition: transform 0.2s ease;
    transform: rotate(${({ $open }) => ($open ? '180deg' : '0deg')});
`;

const InfoButton = styled.button`
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    margin-right: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: ${theme.radius.default};
    color: ${theme.colors.textMuted};
    cursor: pointer;

    &:hover {
        color: ${MENU_ACTIVE_COLOR};
        background: ${theme.colors.backgroundAlt};
    }
`;

const Placeholder = styled.p`
    margin: 0 0 0.5rem 1.4rem;
    padding: 0.5rem 1rem 0.5rem 0.9rem;
    border-left: 1px solid ${MENU_LINE_COLOR};
    font-size: 0.82rem;
    color: ${theme.colors.textMuted};
`;

const DrawerIntro = styled.p`
    margin: 0 0 ${theme.spacing.md};
    font-size: ${theme.fontSize.sm};
    line-height: 1.6;
    color: ${theme.colors.textLight};
`;

const Definitions = styled.dl`
    margin: 0;

    dt {
        margin-top: ${theme.spacing.md};
        font-size: ${theme.fontSize.sm};
        font-weight: ${theme.fontWeight.semibold};
        color: ${theme.colors.text};
    }

    dd {
        margin: 0.2rem 0 0;
        font-size: ${theme.fontSize.sm};
        line-height: 1.6;
        color: ${theme.colors.textLight};
    }
`;

const DefinitionType = styled.span`
    margin-left: 0.4rem;
    font-size: ${theme.fontSize.xs};
    font-weight: ${theme.fontWeight.normal};
    color: ${theme.colors.textMuted};
`;

interface LayerMenuProps {
    openLayer: string | null;
    onToggleLayer: (label: string) => void;
    // Indicateurs de la rubrique consommation, libellés déjà résolus
    indicators: Indicator[];
    selected: string;
    // Zone et maille demandées : le menu et le volet disent ce que chaque carte y dessine
    view: View;
    // Une ligne du menu est choisie : sa carte s'affiche, ou la dernière carte choisie de sa famille
    onSelectLine: (id: string) => void;
    // Une carte est choisie parmi celles de la ligne sélectionnée (destination du carroyage)
    onSelect: (id: string) => void;
    activeCharts: string[];
    onToggleChart: (id: string) => void;
    // Indicateurs des autres rubriques, par libellé de rubrique ; sans entrée, la rubrique est annoncée « à venir »
    layerIndicators?: Record<string, Indicator[]>;
}

const LayerMenu: React.FC<LayerMenuProps> = ({
    openLayer,
    onToggleLayer,
    indicators,
    selected,
    view,
    onSelectLine,
    onSelect,
    activeCharts,
    onToggleChart,
    layerIndicators,
}) => {
    const [infoLayer, setInfoLayer] = useState<string | null>(null);
    const indicatorsOf = (label: string): Indicator[] | undefined => (label === LAYERS[0] ? indicators : layerIndicators?.[label]);
    const infoIndicators = infoLayer === null ? undefined : indicatorsOf(infoLayer);

    return (
        <>
            <Menu aria-label="Rubriques de la carte">
                {LAYERS.map((label, index) => {
                    const isOpen = openLayer === label;
                    const layerList = indicatorsOf(label);
                    const contentId = `national-map-layer-${index}`;
                    return (
                        <LayerItem key={label}>
                            <LayerRow $active={isOpen}>
                                <LayerButton type="button" $active={isOpen} aria-expanded={isOpen} aria-controls={contentId} onClick={() => onToggleLayer(label)}>
                                    <i className="bi bi-layers" aria-hidden="true" />
                                    <LayerText>{label}</LayerText>
                                    <Chevron className="bi bi-chevron-down" aria-hidden="true" $open={isOpen} />
                                </LayerButton>
                                <InfoButton type="button" onClick={() => setInfoLayer(label)} aria-label={`Détails des données : ${label}`}>
                                    <i className="bi bi-info-circle" aria-hidden="true" />
                                </InfoButton>
                            </LayerRow>
                            {isOpen &&
                                (layerList ? (
                                    <IndicatorList
                                        id={contentId}
                                        name={`layer-${index}-indicator`}
                                        indicators={layerList}
                                        selected={selected}
                                        view={view}
                                        onLineChange={onSelectLine}
                                        onChange={onSelect}
                                        activeCharts={activeCharts}
                                        onToggleChart={onToggleChart}
                                    />
                                ) : (
                                    <Placeholder id={contentId}>Chiffres clés et légende à venir.</Placeholder>
                                ))}
                        </LayerItem>
                    );
                })}
            </Menu>
            <Drawer isOpen={infoLayer !== null} title={infoLayer ?? ''} onClose={() => setInfoLayer(null)}>
                {infoIndicators ? (
                    <>
                        {infoLayer === LAYERS[0] ? (
                            <DrawerIntro>
                                Les cartes s'excluent l'une l'autre ; les graphiques complémentaires s'affichent en plus de la carte
                                choisie, dans la colonne à droite de celle-ci.
                            </DrawerIntro>
                        ) : (
                            <DrawerIntro>
                                L'artificialisation est mesurée à partir de l'OCS GE (occupation du sol à grande échelle, IGN), produite
                                département par département à des dates différentes : chaque production est un millésime, désigné
                                par son numéro (millésime n°1, n°2…) et suivi de son année. Chaque territoire est représenté à son dernier
                                millésime, et son artificialisation nette est mesurée entre ses deux derniers millésimes : les valeurs
                                ne sont pas strictement comparables d'un territoire à l'autre. À la place de la période, qui ne s'applique
                                pas, la page indique les millésimes représentés et les explique.
                                Les graphiques complémentaires décrivent la zone affichée, à ses propres millésimes.
                            </DrawerIntro>
                        )}
                        <Definitions>
                            {infoIndicators.map((indicator) => {
                                // La définition d'une carte que la vue demandée ne dessine pas telle quelle le dit aussi
                                const drawn = indicator.type === 'chart' ? null : mapNameOf(view, indicator);
                                return (
                                    <React.Fragment key={indicator.id}>
                                        <dt>
                                            {indicator.label}
                                            <DefinitionType>{INDICATOR_TYPE_LABELS[indicator.type]}</DefinitionType>
                                        </dt>
                                        <dd>{indicator.description}</dd>
                                        {drawn?.standIn && (
                                            <dd>
                                                <StandInNotice name={drawn} />
                                            </dd>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </Definitions>
                    </>
                ) : (
                    <DrawerIntro>Les indicateurs de cette rubrique seront décrits ici.</DrawerIntro>
                )}
            </Drawer>
        </>
    );
};

export default LayerMenu;
