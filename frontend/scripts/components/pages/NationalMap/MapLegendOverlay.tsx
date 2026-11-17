import React, { ReactNode, useId } from 'react';
import styled, { css } from 'styled-components';
import { theme } from '@theme';
import { LEGEND_SIDE_PX, LegendPlacement } from './domain/stage';

// Légende posée sur la scène de la carte, pour laisser la colonne de droite aux chiffres clés et
// aux graphiques. Emplacement unique : il reçoit n'importe quelle légende et ne connaît pas le
// rendu de la carte. Sa place est décidée par la scène (voir legendReservation), d'après la seule
// taille de la carte : une bande en haut, où la légende s'ancre à droite, ou une colonne à gauche,
// qu'elle occupe en largeur. Rien n'est mesuré ici : une légende plus haute que sa bande recouvre
// la carte sans la déplacer, une légende plus haute que sa colonne y défile. Sur une scène trop
// petite pour l'une comme pour l'autre, elle s'ouvre par-dessus la carte et défile dans sa hauteur.
// Repliable par un bouton « Légende », toujours en haut à droite de la scène, où il ne recouvre pas
// les noms des territoires d'outre-mer. Le choix est tenu par le parent : il vaut pour toutes les
// légendes qui se succèdent dans l'emplacement.

// Pendant un chargement, la légende reste celle de la carte affichée, atténuée comme elle
const Wrapper = styled.div<{ $stale: boolean; $inColumn: boolean }>`
    position: absolute;
    top: ${theme.spacing.sm};
    right: ${theme.spacing.sm};
    /* Sous les messages de chargement de la carte (z-index 2) */
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    max-width: calc(100% - 2 * ${theme.spacing.sm});
    max-height: calc(100% - 2 * ${theme.spacing.sm});
    /* La carte reste survolable autour de la légende */
    pointer-events: none;
    opacity: ${({ $stale }) => ($stale ? 0.6 : 1)};
    transition: opacity 0.2s;

    > * {
        pointer-events: auto;
    }

    ${({ $inColumn }) =>
        $inColumn &&
        css`
            right: auto;
            left: ${theme.spacing.sm};
            width: calc(${LEGEND_SIDE_PX}px - 2 * ${theme.spacing.sm});
            align-items: stretch;
        `}
`;

const Panel = styled.div<{ $placement: LegendPlacement }>`
    position: relative;
    width: max-content;
    max-width: 100%;
    background: rgba(255, 255, 255, 0.94);
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radius.default};
    font-size: ${theme.fontSize.xs};
    color: ${theme.colors.text};

    /* La légende reçue apporte sa propre carte blanche : ici, c'est le panneau qui fait le fond */
    > :not(button) {
        background: transparent;
        box-shadow: none;
        border-radius: 0;
    }

    /* En colonne : toute la largeur réservée */
    ${({ $placement }) => $placement === 'side' && 'width: auto;'}

    /* Hors de la bande, la méthode se déplie dans le panneau : ce qui dépasse la hauteur de la scène y défile */
    ${({ $placement }) =>
        $placement !== 'band' &&
        css`
            min-height: 0;
            overflow-y: auto;
        `}
`;

const buttonStyle = `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radius.default};
    background: ${theme.colors.background};
    color: ${theme.colors.text};
    font-family: inherit;
    font-size: ${theme.fontSize.xs};
    cursor: pointer;

    &:hover {
        background: ${theme.colors.backgroundAlt};
    }
`;

const OpenButton = styled.button`
    ${buttonStyle}
    padding: 0.4rem 0.7rem;
    font-weight: ${theme.fontWeight.semibold};
`;

const CloseButton = styled.button`
    ${buttonStyle}
    position: absolute;
    top: 0.2rem;
    right: 0.3rem;
    z-index: 1;
    width: 1.75rem;
    height: 1.75rem;
    padding: 0;
    border-color: transparent;
    background: transparent;
`;

interface MapLegendOverlayProps {
    // Place que la scène donne à la légende ouverte
    placement: LegendPlacement;
    // Légende ouverte, ou repliée derrière son bouton
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // La légende décrit encore la carte précédente : la suivante charge, ou n'a pas pu être chargée
    stale: boolean;
    // La carte suivante charge
    busy: boolean;
    children: ReactNode;
}

const MapLegendOverlay: React.FC<MapLegendOverlayProps> = ({ placement, open, onOpenChange, stale, busy, children }) => {
    const panelId = useId();
    const inColumn = open && placement === 'side';

    return (
        <Wrapper $stale={stale} $inColumn={inColumn} aria-busy={busy}>
            {open ? (
                // Le placement est lu par les styles des légendes, qui ont une variante en colonne
                <Panel id={panelId} role="region" aria-label="Légende de la carte" $placement={placement} data-legend-placement={placement}>
                    <CloseButton type="button" aria-expanded aria-controls={panelId} title="Replier la légende" onClick={() => onOpenChange(false)}>
                        <i className="bi bi-chevron-up" aria-hidden="true" />
                        <span className="fr-sr-only">Replier la légende</span>
                    </CloseButton>
                    {children}
                </Panel>
            ) : (
                <OpenButton type="button" aria-expanded={false} onClick={() => onOpenChange(true)}>
                    <i className="bi bi-list-ul" aria-hidden="true" />
                    {'Légende'}
                </OpenButton>
            )}
        </Wrapper>
    );
};

export default MapLegendOverlay;
