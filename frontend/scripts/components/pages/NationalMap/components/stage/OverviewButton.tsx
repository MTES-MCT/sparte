import React from 'react';
import styled, { css } from 'styled-components';
import { theme } from '@theme';

// Place des boutons de zoom de MapLibre dans le coin bas gauche de la carte : leur marge, et la
// hauteur de leurs deux boutons de 29 px séparés d'un filet
const ZOOM_CONTROL_MARGIN_PX = 10;
const ZOOM_CONTROL_HEIGHT_PX = 59;
const GAP_PX = 8;

const BESIDE_ZOOM_PX = ZOOM_CONTROL_MARGIN_PX + ZOOM_CONTROL_HEIGHT_PX + GAP_PX;

// Coin de la carte où sont ses boutons de zoom (voir createStageMap)
export type ZoomControlsCorner = 'bottom-left' | 'top-right';

// Le bouton prolonge la pile des boutons de zoom vers l'intérieur de la carte : au-dessus d'elle en
// bas à gauche, au-dessous en haut à droite
const PLACES: Record<ZoomControlsCorner, ReturnType<typeof css>> = {
    'bottom-left': css`
        bottom: ${BESIDE_ZOOM_PX}px;
        left: ${ZOOM_CONTROL_MARGIN_PX}px;
    `,
    'top-right': css`
        top: ${BESIDE_ZOOM_PX}px;
        right: ${ZOOM_CONTROL_MARGIN_PX}px;
    `,
};

// Bouton d'une carte MapLibre que l'utilisateur a déplacée : il la ramène à la vue d'ensemble de sa
// zone. Il est posé contre les boutons de zoom, avec lesquels il forme les commandes de
// navigation : cet endroit ne dépend pas de la place de la légende (en bande, en colonne ou
// repliée), alors qu'en haut à gauche il se retrouvait sous la bande ou à côté de la colonne, à
// un endroit différent d'un écran à l'autre.
const Button = styled.button<{ $zoomControls: ZoomControlsCorner }>`
    position: absolute;
    ${({ $zoomControls }) => PLACES[$zoomControls]}
    z-index: 1;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.7rem;
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radius.default};
    background: ${theme.colors.background};
    color: ${theme.colors.text};
    font-family: inherit;
    font-size: ${theme.fontSize.xs};
    font-weight: ${theme.fontWeight.semibold};
    cursor: pointer;

    &:hover {
        background: ${theme.colors.backgroundAlt};
    }
`;

const OverviewButton: React.FC<{ onClick: () => void; zoomControls: ZoomControlsCorner }> = ({ onClick, zoomControls }) => (
    <Button type="button" onClick={onClick} $zoomControls={zoomControls}>
        <i className="bi bi-arrows-angle-contract" aria-hidden="true" />
        {"Vue d'ensemble"}
    </Button>
);

export default OverviewButton;
