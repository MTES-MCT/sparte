import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@theme';
import Drawer from '@components/ui/Drawer';
import IndicatorList from './IndicatorList';
import { Indicator, INDICATOR_TYPE_LABELS } from './indicators';
import { MENU_ACTIVE_BORDER, MENU_ACTIVE_COLOR, MENU_COLOR, MENU_LINE_COLOR } from './layoutStyles';

// Rubriques de la carte, dans le style du menu latéral des diagnostics. Une seule rubrique
// est dépliée à la fois ; son sous-menu liste les indicateurs. L'icône d'information ouvre
// un volet qui décrit les indicateurs de la rubrique.
export const LAYERS = [
    "Visualiser la consommation d'ENAF",
    'Visualiser les espaces artificialisés',
    "Visualiser l'artificialisation",
];

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
    onSelect: (id: string) => void;
    activeCharts: string[];
    onToggleChart: (id: string) => void;
}

const LayerMenu: React.FC<LayerMenuProps> = ({ openLayer, onToggleLayer, indicators, selected, onSelect, activeCharts, onToggleChart }) => {
    const [infoLayer, setInfoLayer] = useState<string | null>(null);

    return (
        <>
            <Menu aria-label="Rubriques de la carte">
                {LAYERS.map((label) => {
                    const isOpen = openLayer === label;
                    const isConso = label === LAYERS[0];
                    return (
                        <LayerItem key={label}>
                            <LayerRow $active={isOpen}>
                                <LayerButton type="button" $active={isOpen} aria-expanded={isOpen} onClick={() => onToggleLayer(label)}>
                                    <i className="bi bi-layers" aria-hidden="true" />
                                    <LayerText>{label}</LayerText>
                                    <Chevron className="bi bi-chevron-down" aria-hidden="true" $open={isOpen} />
                                </LayerButton>
                                <InfoButton type="button" onClick={() => setInfoLayer(label)} aria-label={`Détails des données : ${label}`}>
                                    <i className="bi bi-info-circle" aria-hidden="true" />
                                </InfoButton>
                            </LayerRow>
                            {isOpen &&
                                (isConso ? (
                                    <IndicatorList
                                        name="conso-indicator"
                                        indicators={indicators}
                                        selected={selected}
                                        onChange={onSelect}
                                        activeCharts={activeCharts}
                                        onToggleChart={onToggleChart}
                                    />
                                ) : (
                                    <Placeholder>Chiffres clés et légende à venir.</Placeholder>
                                ))}
                        </LayerItem>
                    );
                })}
            </Menu>
            <Drawer isOpen={infoLayer !== null} title={infoLayer ?? ''} onClose={() => setInfoLayer(null)}>
                {infoLayer === LAYERS[0] ? (
                    <>
                        <DrawerIntro>
                            Les cartes s'excluent l'une l'autre ; les graphiques complémentaires s'affichent en plus de la carte
                            choisie, dans la colonne à droite de celle-ci.
                        </DrawerIntro>
                        <Definitions>
                            {indicators.map((indicator) => (
                                <React.Fragment key={indicator.id}>
                                    <dt>
                                        {indicator.label}
                                        <DefinitionType>{INDICATOR_TYPE_LABELS[indicator.type]}</DefinitionType>
                                    </dt>
                                    <dd>{indicator.description}</dd>
                                </React.Fragment>
                            ))}
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
