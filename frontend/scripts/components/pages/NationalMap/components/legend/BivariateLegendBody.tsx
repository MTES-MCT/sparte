import React from 'react';
import styled from 'styled-components';
import { theme } from '@theme';
import { CompactCard, CompactHeader, IN_LEGEND_COLUMN, MethodDetails, Title } from '../../ClassLegend';
import type { LegendModel } from '../../domain/frame/types';

// Légende des cartes bivariées, posée sur la carte : la grille des neuf couleurs et le sens de ses
// deux axes, à côté d'elle en bandeau, sous elle en colonne. Les intervalles de chaque niveau sont
// donnés dans le volet « Méthode ».
// Chaque case est un bouton, comme une classe de la légende des aplats : le survol, le doigt et
// le clavier mettent tous ses territoires en avant.

const Body = styled.div`
    display: flex;
    align-items: center;
    gap: ${theme.spacing.md};
    padding: 0.1rem 0.75rem 0.45rem;

    ${IN_LEGEND_COLUMN} {
        flex-direction: column;
        align-items: flex-start;
        gap: ${theme.spacing.sm};
    }
`;

const Cells = styled.div`
    flex-shrink: 0;
    display: grid;
    grid-template-columns: repeat(3, 1.5rem);
    grid-auto-rows: 1.5rem;
    gap: 2px;
`;

const Cell = styled.button<{ $color: string; $active: boolean; $pinned: boolean }>`
    padding: 0;
    border: none;
    border-radius: 3px;
    background: ${({ $color }) => $color};
    outline: ${({ $pinned }) => ($pinned ? `2px solid ${theme.colors.purple}` : 'none')};
    outline-offset: 1px;
    transform: ${({ $active }) => ($active ? 'scale(1.12)' : 'scale(1)')};
    transition: transform 0.15s ease;
    cursor: pointer;
`;

const Axes = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    max-width: 19rem;
    font-size: ${theme.fontSize.xs};
    line-height: 1.3;
    color: ${theme.colors.text};
`;

const Axis = styled.p`
    display: flex;
    gap: 0.35rem;
    margin: 0;
    font-size: inherit;
    line-height: inherit;
`;

const Direction = styled.p`
    margin: 0;
    font-size: inherit;
    line-height: inherit;
    color: ${theme.colors.textMuted};
`;

const Level = styled.span`
    display: block;
`;

type BivariateDescription = Extract<LegendModel, { kind: 'bivariate' }>['props'];

// Niveaux du rythme de consommation, du plus faible au plus élevé ; ceux de l'indicateur croisé
// viennent tout rédigés de la description de la carte
const CONSO_LEVELS = ['parmi les plus faibles', 'intermédiaire', 'parmi les plus élevées'];

const lowerFirst = (text: string): string => text.charAt(0).toLowerCase() + text.slice(1);

// Les trois niveaux d'un axe, chacun suivi de son intervalle quand la période a des seuils
const withRanges = (levels: string[], ranges: string[] | null, unit: string): string[] => {
    if (!ranges) return levels;
    const suffix = unit ? ` ${unit}` : '';
    return levels.map((level, index) => `${level} : ${ranges[index]}${suffix}`);
};

interface BivariateLegendBodyProps {
    indicatorLabel: string;
    // Grille de couleurs, axes et intervalles ; null si la réponse ne décrit pas la carte
    description: BivariateDescription;
    // Case mise en avant (0 à 8, ligne par ligne) : celle survolée ici, celle du territoire survolé
    // sur la carte ou la case épinglée
    activeCell: number | null;
    // Case épinglée par un appui ou un clic : elle reste en avant sans survol
    pinnedCell: number | null;
    // Appelé avec la case survolée ou qui reçoit le focus (null : aucune)
    onHover: (cell: number | null) => void;
    onTogglePin: (cell: number) => void;
}

// Composant contrôlé : la case mise en avant est tenue par le parent, qui estompe la carte avec elle
const BivariateLegendBody: React.FC<BivariateLegendBodyProps> = ({ indicatorLabel, description, activeCell, pinnedCell, onHover, onTogglePin }) => {
    if (!description) {
        return (
            <CompactCard>
                <CompactHeader>
                    <Title>{indicatorLabel}</Title>
                </CompactHeader>
            </CompactCard>
        );
    }

    const { colorGrid, consoLabel, consoRanges, indicName, indicUnit, indicRanges, indicQualif } = description;
    // Lignes de la grille : niveaux de consommation ; colonnes : niveaux de l'indicateur croisé
    const consoLevels = CONSO_LEVELS.map((level) => `${consoLabel} ${level}`);
    const leave = () => onHover(null);

    return (
        <CompactCard>
            <CompactHeader>
                <Title>{indicatorLabel}</Title>
                <MethodDetails>
                    <summary>Méthode</summary>
                    <p>
                        {[...withRanges(consoLevels, consoRanges, '%'), ...withRanges(indicQualif, indicRanges, indicUnit)].map((level) => (
                            <Level key={level}>{level}</Level>
                        ))}
                    </p>
                </MethodDetails>
            </CompactHeader>
            <Body>
                <Cells role="group" aria-label="Classes croisées">
                    {colorGrid.flatMap((colors, row) =>
                        colors.map((color, col) => {
                            const cell = row * 3 + col;
                            const label = `${consoLevels[row]}, ${lowerFirst(indicQualif[col])}`;
                            return (
                                <Cell
                                    key={cell}
                                    type="button"
                                    $color={color}
                                    $active={activeCell === cell}
                                    $pinned={pinnedCell === cell}
                                    aria-pressed={pinnedCell === cell}
                                    aria-label={label}
                                    title={label}
                                    onMouseEnter={() => onHover(cell)}
                                    onMouseLeave={leave}
                                    onFocus={() => onHover(cell)}
                                    onBlur={leave}
                                    onClick={() => onTogglePin(cell)}
                                />
                            );
                        }),
                    )}
                </Cells>
                <Axes>
                    <Axis>
                        <i className="bi bi-arrow-down" aria-hidden="true" />
                        {consoLabel} (%)
                    </Axis>
                    <Axis>
                        <i className="bi bi-arrow-right" aria-hidden="true" />
                        {indicName}
                        {indicUnit ? ` (${indicUnit})` : ''}
                    </Axis>
                    <Direction>Les flèches vont des valeurs les plus faibles aux plus élevées.</Direction>
                </Axes>
            </Body>
        </CompactCard>
    );
};

export default BivariateLegendBody;
