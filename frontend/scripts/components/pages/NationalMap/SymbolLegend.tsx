import React from 'react';
import styled from 'styled-components';
import { theme } from '@theme';
import { CompactCard, CompactHeader, IN_LEGEND_COLUMN, MethodDetails, Title, hexToRgba } from './ClassLegend';
import { ringArcPath, ringArcs } from './domain/rings';
import { NO_DATA_CSS_BACKGROUND } from './domain/noData';

// Légende des cartes en symboles proportionnels, cercles ou anneaux : symboles de référence
// emboîtés, posés sur la même base, chacun relié à sa valeur. Pour des anneaux, un anneau témoin
// nomme les deux couleurs de leurs arcs. Posée sur la carte, comme la légende des classes : en
// colonne, ce qui suit les symboles de référence passe sous eux.

const Body = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${theme.spacing.sm} ${theme.spacing.md};
    padding: 0 0.75rem 0.4rem;

    ${IN_LEGEND_COLUMN} {
        flex-direction: column;
        flex-wrap: nowrap;
        align-items: flex-start;
        padding: 0 0.55rem 0.4rem;
    }
`;

const Circles = styled.svg`
    display: block;
    overflow: visible;

    text {
        font-size: ${theme.fontSize.xs};
        fill: ${theme.colors.text};
    }

    /* La largeur du dessin est estimée d'après ses libellés : elle ne doit pas faire défiler la colonne */
    ${IN_LEGEND_COLUMN} {
        max-width: 100%;
    }
`;

// Ce que la légende d'une carte en anneaux dit des couleurs : celles des deux arcs, puis celle des
// territoires sans donnée
const Keys = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
`;

// Couleurs nommées des arcs d'un anneau, à côté d'un anneau témoin
const ColorKey = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
        flex-shrink: 0;
    }

    ul {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    li {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        font-size: ${theme.fontSize.xs};
        line-height: 1.5;
        color: ${theme.colors.text};
    }
`;

const ColorSwatch = styled.span`
    width: 0.65rem;
    height: 0.65rem;
    flex-shrink: 0;
    border-radius: 50%;
`;

// Ce qu'il faut savoir pour lire les symboles. En bandeau, la note reste à côté des couleurs, sur
// la largeur qu'il lui reste : passée à la ligne, elle ferait dépasser la légende de sa bande.
const Note = styled.p`
    flex: 1 1 8rem;
    max-width: 13rem;
    margin: 0;
    font-size: 0.72rem;
    line-height: 1.35;
    color: ${theme.colors.textMuted};

    ${IN_LEGEND_COLUMN} {
        flex: none;
        max-width: none;
    }
`;

const NoData = styled.p`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin: 0;
    font-size: ${theme.fontSize.xs};
    line-height: 1.35;
    color: ${theme.colors.text};
`;

const NoDataSwatch = styled.span`
    width: 1.1rem;
    height: 0.9rem;
    flex-shrink: 0;
    border-radius: 3px;
    background: ${NO_DATA_CSS_BACKGROUND};
`;

const NoDataCount = styled.span`
    color: ${theme.colors.textMuted};
`;

export interface SymbolReference {
    // Rayon du symbole en pixels, identique à celui tracé sur la carte
    radius: number;
    label: string;
}

type SymbolColor = { color: string; label: string | null };

interface SymbolLegendProps {
    indicatorLabel: string;
    // Forme des symboles de la carte : cercles pleins, ou anneaux partagés entre deux flux
    shape: 'circle' | 'ring';
    // Symboles de référence, du plus grand au plus petit
    references: SymbolReference[];
    // Couleur des cercles ; pour des anneaux, celles du flux à la hausse puis du flux à la baisse, nommées
    colors: SymbolColor[];
    // Ce qu'il faut savoir pour lire les symboles ; null : rien à ajouter
    note: string | null;
    noDataCount: number;
    // Ce que représente la surface d'un symbole, donné dans le volet « Méthode »
    method: string;
}

// Les symboles de référence d'une carte en anneaux ne disent que la taille : ils sont neutres
const RING_REFERENCE_COLOR = '#666666';
// Anneau témoin : son rayon, et la part du flux à la baisse qu'il montre
const SAMPLE_RADIUS = 13;
const SAMPLE_DECREASE_SHARE = 0.25;

// Anneau témoin d'une carte en anneaux, et nom des deux couleurs de ses arcs
const RingColorKey: React.FC<{ colors: SymbolColor[] }> = ({ colors }) => {
    const [increase, decrease] = colors;
    return (
        <ColorKey>
            <svg width={SAMPLE_RADIUS * 2} height={SAMPLE_RADIUS * 2} aria-hidden="true">
                {ringArcs(SAMPLE_DECREASE_SHARE).map((arc) => (
                    <path
                        key={arc.flow}
                        d={ringArcPath(SAMPLE_RADIUS, SAMPLE_RADIUS, SAMPLE_RADIUS, arc)}
                        fill={(arc.flow === 'increase' ? increase : decrease).color}
                        stroke="#ffffff"
                        strokeWidth={0.75}
                    />
                ))}
            </svg>
            <ul aria-label="Couleurs des anneaux">
                {colors.map(({ color, label }) => (
                    <li key={color}>
                        <ColorSwatch aria-hidden="true" style={{ background: color }} />
                        {label}
                    </li>
                ))}
            </ul>
        </ColorKey>
    );
};

// Espace vertical minimal entre deux libellés, pour qu'ils ne se chevauchent pas
const LABEL_GAP = 16;
// Marge autour du dessin : demi-hauteur d'un libellé
const PADDING = 8;
// Largeur estimée d'un caractère de libellé, pour donner au dessin sa largeur
const LABEL_CHAR_WIDTH = 7;

const SymbolLegend: React.FC<SymbolLegendProps> = ({ indicatorLabel, shape, references, colors, note, noDataCount, method }) => {
    const ringed = shape === 'ring';
    const referenceColor = ringed ? RING_REFERENCE_COLOR : colors[0].color;
    const maxRadius = Math.max(...references.map((r) => r.radius), 0);
    // Hauteur : le plus grand symbole, ou la pile des libellés si les symboles sont petits
    const drawingHeight = Math.max(maxRadius * 2, (references.length - 1) * LABEL_GAP);
    const height = drawingHeight + PADDING * 2;
    const base = height - PADDING;
    const centerX = maxRadius + PADDING;
    const labelX = centerX + maxRadius + 14;
    const width = labelX + Math.max(...references.map((r) => r.label.length), 0) * LABEL_CHAR_WIDTH;
    // Libellé à la hauteur du sommet de son symbole, repoussé vers le bas s'il touche le précédent
    let previousY = PADDING - LABEL_GAP;
    const stacked = references.map((reference) => {
        const top = base - reference.radius * 2;
        const labelY = Math.max(Math.min(top, base), previousY + LABEL_GAP);
        previousY = labelY;
        return { ...reference, top, labelY };
    });
    // De petits symboles repoussent la pile sous le dessin : elle remonte d'autant
    const overflow = Math.max(0, previousY - base);
    const rows = stacked.map((row) => ({ ...row, labelY: row.labelY - overflow }));

    const noData = noDataCount > 0 && (
        <NoData>
            <NoDataSwatch aria-hidden="true" />
            Donnée non disponible
            <NoDataCount>({noDataCount})</NoDataCount>
        </NoData>
    );

    const body = (
        <Body>
            {references.length > 0 && (
                <Circles
                    width={width}
                    height={height}
                    role="img"
                    aria-label={`${ringed ? 'Anneaux' : 'Cercles'} de référence : ${references.map((r) => r.label).join(', ')}`}
                >
                    {rows.map((row) => (
                        <g key={row.label}>
                            <circle
                                cx={centerX}
                                cy={base - row.radius}
                                r={row.radius}
                                fill={hexToRgba(referenceColor, 0.12)}
                                stroke={referenceColor}
                                strokeWidth={1}
                            />
                            <polyline
                                points={`${centerX},${row.top} ${labelX - 10},${row.labelY} ${labelX - 4},${row.labelY}`}
                                fill="none"
                                stroke={theme.colors.textMuted}
                                strokeWidth={0.75}
                            />
                            <text x={labelX} y={row.labelY} dominantBaseline="middle">
                                {row.label}
                            </text>
                        </g>
                    ))}
                </Circles>
            )}
            {ringed ? (
                <Keys>
                    <RingColorKey colors={colors} />
                    {noData}
                </Keys>
            ) : (
                noData
            )}
            {note && <Note>{note}</Note>}
        </Body>
    );

    return (
        <CompactCard>
            <CompactHeader>
                <Title>{indicatorLabel}</Title>
                <MethodDetails>
                    <summary>Méthode</summary>
                    <p>{method}</p>
                </MethodDetails>
            </CompactHeader>
            {body}
        </CompactCard>
    );
};

export default SymbolLegend;
