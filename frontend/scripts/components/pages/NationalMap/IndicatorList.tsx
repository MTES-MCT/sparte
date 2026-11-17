import React, { Ref, createContext, useContext, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { theme } from '@theme';
import Button from '@components/ui/Button';
import StandInNotice from './components/StandInNotice';
import { mapNameOf } from './domain/mapName';
import type { View } from './domain/viewProfile';
import { Indicator, menuLinesOf } from './indicators';
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

// Pied du menu où se rangent les graphiques complémentaires de la carte choisie. Ils y restent à
// portée de main quelle que soit la position de la longue liste des cartes, qui défile au-dessus.
// Le menu fournit l'élément ; sans lui (liste rendue seule), les graphiques suivent les cartes.
export const ChartsDockContext = createContext<HTMLElement | null>(null);

const ChartsList = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0 0 0.25rem 1.4rem;
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

// Description de l'entrée active seulement, pour garder le menu lisible
const Description = styled.span`
    display: block;
    margin-top: 0.2rem;
    font-size: ${theme.fontSize.xs};
    font-weight: ${theme.fontWeight.normal};
    line-height: 1.45;
    color: ${theme.colors.textLight};
`;

// Choix posé sous la ligne d'une famille de cartes, à l'aplomb de son libellé
const Choice = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0 1rem 0.6rem 2.35rem;
`;

const ChoiceTitle = styled.span`
    font-size: ${theme.fontSize.xs};
    font-weight: ${theme.fontWeight.semibold};
    color: ${theme.colors.textMuted};
`;

const ChoiceButtons = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
`;

interface RowProps {
    indicator: Indicator;
    // Libellé de la ligne quand ce n'est pas celui de l'indicateur
    label?: string;
    // Ce que la ligne active dit sous son libellé quand ce n'est pas la description de l'indicateur
    description?: React.ReactNode;
    active: boolean;
    type: 'radio' | 'checkbox';
    name: string;
    onChange: () => void;
    // Sans la description de l'entrée active : dans le pied du menu, dont la hauteur est comptée
    compact?: boolean;
    // Ce qui suit la ligne, hors de son libellé cliquable
    children?: React.ReactNode;
    lineRef?: Ref<HTMLLIElement>;
}

const Row: React.FC<RowProps> = ({
    indicator,
    label = indicator.label,
    description = indicator.description,
    active,
    type,
    name,
    onChange,
    compact = false,
    children,
    lineRef,
}) => (
    <li ref={lineRef}>
        <Item $active={active}>
            <input type={type} name={name} value={indicator.id} checked={active} onChange={onChange} />
            <Text>
                {label}
                {active && !compact && <Description>{description}</Description>}
            </Text>
        </Item>
        {children}
    </li>
);

// Pastille de la couleur d'une carte dans son bouton, comme sur les boutons de destination de la
// page Consommation ; son liseré la détache du fond du bouton, clair ou sombre quand il est choisi
const ChoiceDot = styled.span<{ $color: string; $onDark: boolean }>`
    flex: none;
    width: 0.625rem;
    height: 0.625rem;
    border: 1px solid ${({ $onDark }) => ($onDark ? '#ffffff' : theme.colors.border)};
    border-radius: 50%;
    background: ${({ $color }) => $color};
`;

interface LineChoiceProps {
    // Cartes entre lesquelles choisir, et celle qui est affichée
    choices: Indicator[];
    selected: string;
    onChange: (id: string) => void;
}

// Boutons à choix unique des cartes d'une même ligne, comme ceux de la maille
const LineChoice: React.FC<LineChoiceProps> = ({ choices, selected, onChange }) => {
    const { title } = choices[0].menuChoice;
    return (
        <Choice role="group" aria-label={title}>
            <ChoiceTitle aria-hidden="true">{title}</ChoiceTitle>
            <ChoiceButtons>
                {choices.map(({ id, menuChoice }) => (
                    <Button key={id} type="button" size="sm" variant={id === selected ? 'primary' : 'secondary'} aria-pressed={id === selected} onClick={() => onChange(id)}>
                        {menuChoice.color && <ChoiceDot $color={menuChoice.color} $onDark={id === selected} aria-hidden="true" />}
                        {menuChoice.option}
                    </Button>
                ))}
            </ChoiceButtons>
        </Choice>
    );
};

interface IndicatorListProps {
    // Identifiant du sous-menu, référencé par le bouton de la rubrique (aria-controls)
    id?: string;
    name: string;
    indicators: Indicator[];
    // Indicateur cartographique affiché (choix unique)
    selected: string;
    // Zone et maille demandées : la ligne choisie dit ce que la carte y dessine
    view: View;
    // Une ligne est choisie : appelé avec l'identifiant de sa carte, ou de la première de sa famille
    onLineChange: (id: string) => void;
    // Une carte est choisie parmi celles de la ligne sélectionnée
    onChange: (id: string) => void;
    // Graphiques affichés en complément de la carte (choix multiple)
    activeCharts: string[];
    onToggleChart: (id: string) => void;
}

// Les cartes (simples ou bivariées) sont exclusives ; les graphiques s'affichent en plus de la carte.
// Les cartes d'une même famille (les destinations du carroyage) tiennent sur une ligne : le choix
// entre elles n'apparaît que sous la ligne sélectionnée, pour ne pas allonger la liste.
const IndicatorList: React.FC<IndicatorListProps> = ({ id, name, indicators, selected, view, onLineChange, onChange, activeCharts, onToggleChart }) => {
    const chartsDock = useContext(ChartsDockContext);
    const maps = indicators.filter((i) => i.type !== 'chart');
    // Seuls les graphiques compatibles avec la carte sélectionnée sont proposés
    const compatible = maps.find((i) => i.id === selected)?.charts ?? [];
    const charts = indicators.filter((i) => i.type === 'chart' && compatible.includes(i.id));

    // La ligne qui vient d'être choisie reste entière dans la fenêtre du menu : sa description, son
    // choix de destination ou le pied des graphiques, qui grandit avec elle, peuvent la pousser
    // dessous. Pas à l'ouverture, où le menu se lit depuis le haut.
    const selectedLine = useRef<HTMLLIElement>(null);
    const opened = useRef(false);
    useEffect(() => {
        if (opened.current) selectedLine.current?.scrollIntoView?.({ block: 'nearest' });
        opened.current = true;
    }, [selected]);

    const chartChoices = charts.length > 0 && (
        <ChartsList>
            <GroupTitle role="heading" aria-level={2}>
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
                    compact={chartsDock !== null}
                />
            ))}
        </ChartsList>
    );

    return (
        <SubList id={id}>
            <GroupTitle role="heading" aria-level={2}>
                Carte
            </GroupTitle>
            {menuLinesOf(maps).map(({ head, choices }) => {
                // La ligne décrit la carte affichée de sa famille, sous le libellé de la première
                const shown = choices.find((choice) => choice.id === selected) ?? head;
                const active = shown.id === selected;
                // Sur une vue qui dessine autre chose que la carte de la ligne (toutes les communes du
                // pays pour une carte en hectares), la ligne le dit à la place de sa description
                const drawn = mapNameOf(view, shown);
                return (
                    <Row
                        key={head.id}
                        indicator={shown}
                        label={head.label}
                        description={drawn.standIn ? <StandInNotice name={drawn} /> : undefined}
                        active={active}
                        type="radio"
                        name={`${name}-map`}
                        onChange={() => onLineChange(head.id)}
                        lineRef={active ? selectedLine : undefined}
                    >
                        {active && choices.length > 0 && <LineChoice choices={choices} selected={selected} onChange={onChange} />}
                    </Row>
                );
            })}
            {chartChoices && (chartsDock ? createPortal(chartChoices, chartsDock) : <li>{chartChoices}</li>)}
        </SubList>
    );
};

export default IndicatorList;
