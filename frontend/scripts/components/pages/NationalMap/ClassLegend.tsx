import React from 'react';
import styled from 'styled-components';
import { theme } from '@theme';
import { NO_DATA_COLOR, ValueClass } from './values';

// Légende des aplats de couleurs, posée sur la carte (voir MapLegendOverlay). Les styles exportés
// sont ceux que partagent les légendes posées sur la carte. Chacun a deux mises en forme, selon la
// place que la scène donne à la légende : en bandeau, tout en largeur, ou dans une colonne étroite.

// Sélecteur de la mise en forme en colonne : l'emplacement de la légende porte son placement en attribut
export const IN_LEGEND_COLUMN = "[data-legend-placement='side'] &";
// Sélecteur des placements où la méthode se déplie dans le panneau, à la suite de la légende : la
// colonne, et la légende ouverte par-dessus la carte, dont rien ne doit sortir de la scène
const METHOD_IN_PANEL = `${IN_LEGEND_COLUMN}, [data-legend-placement='over'] &`;

// Marge intérieure du titre : à droite, la place du bouton qui replie la légende
const TITLE_PADDING = '0.45rem 2.4rem 0.2rem 0.75rem';

// Titre de niveau 2 par son rôle : la feuille de style globale impose sa taille aux balises h2
export const Title = styled.div.attrs({ role: 'heading', 'aria-level': 2 })`
    margin: 0;
    font-size: ${theme.fontSize.sm};
    font-weight: ${theme.fontWeight.semibold};
    color: ${theme.colors.text};

    ${METHOD_IN_PANEL} {
        padding: ${TITLE_PADDING};
        line-height: 1.35;
    }
`;

// Légende posée sur la carte. En bandeau : titre, classes sur une ligne (qui passe à la ligne si
// besoin), méthode dans un volet à droite du titre. En colonne : titre sur plusieurs lignes, une
// classe par ligne, méthode en dernier. Par-dessus la carte : les classes du bandeau, la méthode en
// dernier. Le territoire survolé est donné par l'infobulle de la carte.
export const CompactCard = styled.div`
    display: flex;
    flex-direction: column;
`;

export const CompactHeader = styled.div`
    display: flex;
    align-items: baseline;
    gap: ${theme.spacing.md};
    padding: ${TITLE_PADDING};
    line-height: 1.35;

    > :first-child {
        flex: 1;
    }

    /* Hors du bandeau, l'en-tête s'efface : le titre reste en tête, la méthode passe sous la légende */
    ${METHOD_IN_PANEL} {
        display: contents;
    }
`;

// Méthode de calcul. En bandeau, elle s'ouvre sous lui sans en changer la hauteur, dans sa largeur
// au plus ; en colonne et par-dessus la carte, elle se déplie à la suite de la légende, dans son
// panneau, qui défile s'il le faut.
export const MethodDetails = styled.details`
    flex-shrink: 0;
    font-size: 0.72rem;
    color: ${theme.colors.textMuted};

    summary {
        cursor: pointer;
        white-space: nowrap;
    }

    p {
        position: absolute;
        top: calc(100% + 4px);
        right: 0;
        box-sizing: border-box;
        width: min(24rem, 100%);
        margin: 0;
        padding: 0.5rem 0.75rem;
        background: ${theme.colors.background};
        border: 1px solid ${theme.colors.border};
        border-radius: ${theme.radius.default};
        font-size: inherit;
        line-height: 1.4;
    }

    ${METHOD_IN_PANEL} {
        order: 1;
        padding: 0 0.75rem 0.45rem;

        p {
            position: static;
            /* Le texte prend la largeur du panneau sans l'élargir */
            width: 0;
            min-width: 100%;
            padding: 0.3rem 0 0;
            background: none;
            border: none;
        }
    }
`;

export const Classes = styled.ul`
    display: flex;
    flex-wrap: wrap;
    gap: 0 0.15rem;
    margin: 0;
    padding: 0 0.4rem 0.35rem;
    list-style: none;

    li {
        padding: 0;
    }

    /* Marges resserrées : « Donnée non disponible » et son effectif tiennent sur une ligne */
    ${IN_LEGEND_COLUMN} {
        flex-direction: column;
        flex-wrap: nowrap;
        padding: 0 0.15rem 0.35rem;
    }
`;

// Ligne d'une classe : un bouton, pour que le survol, le doigt et le clavier mettent tous la classe en avant
export const ClassRow = styled.button<{ $active: boolean; $pinned?: boolean }>`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.2rem 0.4rem;
    border: none;
    border-radius: 4px;
    font-family: inherit;
    font-size: ${theme.fontSize.xs};
    line-height: 1.35;
    text-align: left;
    white-space: nowrap;
    color: ${theme.colors.text};
    background: ${({ $active }) => ($active ? theme.colors.backgroundAlt : 'transparent')};
    box-shadow: ${({ $pinned }) => ($pinned ? `inset 0 0 0 1px ${theme.colors.purple}` : 'none')};
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover {
        background: ${theme.colors.backgroundAlt};
    }

    /* Un libellé plus long que la colonne passe à la ligne plutôt que de déborder sur la carte */
    ${IN_LEGEND_COLUMN} {
        width: 100%;
        white-space: normal;
    }
`;

export const Swatch = styled.span<{ $color: string; $active: boolean }>`
    width: 1.1rem;
    height: 0.9rem;
    flex-shrink: 0;
    border-radius: 3px;
    background: ${({ $color }) => $color};
    transform: ${({ $active }) => ($active ? 'scale(1.08)' : 'scale(1)')};
    transition: transform 0.15s ease;
`;

// Nombre de territoires de la classe
const Count = styled.span`
    color: ${theme.colors.textMuted};

    &::before {
        content: '(';
    }

    &::after {
        content: ')';
    }
`;

export const hexToRgba = (hex: string, alpha: number): string => {
    const r = Number.parseInt(hex.slice(1, 3), 16);
    const g = Number.parseInt(hex.slice(3, 5), 16);
    const b = Number.parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export interface HoveredLand {
    name: string;
    valueText: string;
    // Indice de classe du territoire, null sans donnée
    classIndex: number | null;
}

interface ClassLegendProps {
    indicatorLabel: string;
    classes: ValueClass[];
    // Nombre de territoires affichés dans chaque classe, puis sans donnée
    counts: number[];
    noDataCount: number;
    // Nom au pluriel des territoires affichés, pour l'infobulle des effectifs
    landTypeLabel: string;
    // Méthode de découpage en classes, donnée dans le volet « Méthode »
    method: string;
    // Classe mise en avant : celle survolée ici, celle du territoire survolé sur la carte ou la classe épinglée
    activeClass: number | null;
    // Classe épinglée par un appui ou un clic : elle reste en avant sans survol (écrans tactiles, clavier)
    pinnedClass: number | null;
    // Appelé avec la classe survolée ou qui reçoit le focus (null : aucune)
    onHover: (classIndex: number | null) => void;
    onTogglePin: (classIndex: number) => void;
}

// Composant contrôlé : la classe mise en avant est tenue par le parent, qui estompe la carte avec elle
const ClassLegend: React.FC<ClassLegendProps> = ({
    indicatorLabel,
    classes,
    counts,
    noDataCount,
    landTypeLabel,
    method,
    activeClass,
    pinnedClass,
    onHover,
    onTogglePin,
}) => {
    const leave = () => onHover(null);

    const classList = (
        <Classes aria-label="Classes de valeurs">
            {classes.map((valueClass, index) => (
                <li key={valueClass.name}>
                    <ClassRow
                        type="button"
                        $active={activeClass === index}
                        $pinned={pinnedClass === index}
                        aria-pressed={pinnedClass === index}
                        title="Mettre en avant les territoires de cette classe"
                        onMouseEnter={() => onHover(index)}
                        onMouseLeave={leave}
                        onFocus={() => onHover(index)}
                        onBlur={leave}
                        onClick={() => onTogglePin(index)}
                    >
                        <Swatch $color={valueClass.color} $active={activeClass === index} aria-hidden="true" />
                        {valueClass.name}
                        <Count title={`${landTypeLabel} dans cette classe`}>{counts[index] ?? 0}</Count>
                    </ClassRow>
                </li>
            ))}
            {noDataCount > 0 && (
                <li>
                    <ClassRow as="div" $active={false}>
                        <Swatch $color={NO_DATA_COLOR} $active={false} aria-hidden="true" />
                        Donnée non disponible
                        <Count>{noDataCount}</Count>
                    </ClassRow>
                </li>
            )}
        </Classes>
    );

    return (
        <CompactCard>
            <CompactHeader>
                <Title>{indicatorLabel}</Title>
                <MethodDetails>
                    <summary>Méthode</summary>
                    <p>{method}.</p>
                </MethodDetails>
            </CompactHeader>
            {classList}
        </CompactCard>
    );
};

export default ClassLegend;
