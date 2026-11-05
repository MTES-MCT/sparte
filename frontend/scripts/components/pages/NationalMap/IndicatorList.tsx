import React from 'react';
import styled from 'styled-components';
import { theme } from '@theme';
import Badge from '@components/ui/Badge';
import { Indicator, INDICATOR_TYPE_LABELS } from './indicators';
import { MENU_ACTIVE_BORDER, MENU_ACTIVE_COLOR, MENU_COLOR, MENU_LINE_COLOR } from './layoutStyles';

// Sous-menu d'une rubrique, dans le style des sous-menus du menu latéral des diagnostics :
// filet à gauche, entrée active en violet avec un filet à droite

const SubList = styled.ul`
    list-style: none;
    margin: 0 0 0.5rem 1.4rem;
    padding: 0 0 0 0.1rem;
    border-left: 1px solid ${MENU_LINE_COLOR};
`;

const GroupTitle = styled.li`
    padding: 0.6rem 1rem 0.2rem 0.9rem;
    font-size: 0.7rem;
    font-weight: ${theme.fontWeight.semibold};
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${theme.colors.textMuted};
`;

const Item = styled.label<{ $active: boolean }>`
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.5rem 1rem 0.5rem 0.9rem;
    font-size: 0.82rem;
    font-weight: ${theme.fontWeight.medium};
    line-height: 1.35;
    color: ${({ $active }) => ($active ? MENU_ACTIVE_COLOR : MENU_COLOR)};
    border-right: 4px solid ${({ $active }) => ($active ? MENU_ACTIVE_BORDER : 'transparent')};
    cursor: pointer;
    transition: color 0.2s ease, border-color 0.3s ease;

    &:hover {
        color: ${MENU_ACTIVE_COLOR};
    }

    input {
        flex-shrink: 0;
        margin: 0.15rem 0 0;
        accent-color: ${MENU_ACTIVE_COLOR};
    }
`;

const Text = styled.span`
    flex: 1;
    min-width: 0;
`;

const TypeBadge = styled(Badge)`
    margin-left: 0.4rem;
    vertical-align: middle;
`;

// Description de l'entrée active seulement, pour garder le menu lisible
const Description = styled.span`
    display: block;
    margin-top: 0.2rem;
    font-size: ${theme.fontSize.xs};
    font-weight: ${theme.fontWeight.normal};
    line-height: 1.45;
    color: ${theme.colors.textLight};
`;

interface RowProps {
    indicator: Indicator;
    active: boolean;
    type: 'radio' | 'checkbox';
    name: string;
    onChange: () => void;
}

const Row: React.FC<RowProps> = ({ indicator, active, type, name, onChange }) => (
    <li>
        <Item $active={active}>
            <input type={type} name={name} value={indicator.id} checked={active} onChange={onChange} />
            <Text>
                {indicator.label}
                {indicator.type === 'bivariate_map' && (
                    <TypeBadge variant="highlight" size="sm">
                        {INDICATOR_TYPE_LABELS[indicator.type]}
                    </TypeBadge>
                )}
                {active && <Description>{indicator.description}</Description>}
            </Text>
        </Item>
    </li>
);

interface IndicatorListProps {
    name: string;
    indicators: Indicator[];
    // Indicateur cartographique affiché (choix unique)
    selected: string;
    onChange: (id: string) => void;
    // Graphiques affichés en complément de la carte (choix multiple)
    activeCharts: string[];
    onToggleChart: (id: string) => void;
}

// Les cartes (simples ou bivariées) sont exclusives ; les graphiques s'affichent en plus de la carte
const IndicatorList: React.FC<IndicatorListProps> = ({ name, indicators, selected, onChange, activeCharts, onToggleChart }) => {
    const maps = indicators.filter((i) => i.type !== 'chart');
    // Seuls les graphiques compatibles avec la carte sélectionnée sont proposés
    const compatible = maps.find((i) => i.id === selected)?.charts ?? [];
    const charts = indicators.filter((i) => i.type === 'chart' && compatible.includes(i.id));

    return (
        <SubList>
            <GroupTitle role="heading" aria-level={3}>
                Carte
            </GroupTitle>
            {maps.map((indicator) => (
                <Row
                    key={indicator.id}
                    indicator={indicator}
                    active={indicator.id === selected}
                    type="radio"
                    name={`${name}-map`}
                    onChange={() => onChange(indicator.id)}
                />
            ))}
            {charts.length > 0 && (
                <>
                    <GroupTitle role="heading" aria-level={3}>
                        Graphiques complémentaires
                    </GroupTitle>
                    {charts.map((indicator) => (
                        <Row
                            key={indicator.id}
                            indicator={indicator}
                            active={activeCharts.includes(indicator.id)}
                            type="checkbox"
                            name={`${name}-chart`}
                            onChange={() => onToggleChart(indicator.id)}
                        />
                    ))}
                </>
            )}
        </SubList>
    );
};

export default IndicatorList;
