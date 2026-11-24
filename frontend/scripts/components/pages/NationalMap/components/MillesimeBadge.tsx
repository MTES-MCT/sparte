import React from 'react';
import styled from 'styled-components';
import { theme } from '@theme';
import { useOcsgeDrawer } from '@components/features/ocsge/OcsgeDrawerContext';
import { EXPLAIN_LABEL, MillesimeReading, NO_MILLESIME_LABEL } from '../domain/millesimes';

// Millésimes que la carte représente, à la place du sélecteur de période : l'OCS GE n'a pas de
// période à choisir. Même habillage que les boutons d'année du sélecteur, parce que c'est la même
// information (de quand datent les chiffres) ; un clic ouvre l'explication des millésimes.
const Badge = styled.button<{ $inBar: boolean }>`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    max-width: 100%;
    padding: 0.2rem 0.6rem;
    font-family: inherit;
    text-align: left;
    color: ${theme.colors.text};
    background: transparent;
    border: 1px solid ${theme.button.secondary.border};
    border-radius: ${theme.radius.default};
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease;

    &:hover {
        background-color: ${theme.button.secondary.backgroundHover};
        border-color: ${theme.button.secondary.borderHover};
    }

    > i {
        flex-shrink: 0;
        font-size: 0.85rem;
        color: ${theme.colors.primary};
    }

    ${({ $inBar }) => !$inBar && 'padding: 0.4rem 0.75rem;'}
`;

const Lines = styled.span`
    display: flex;
    flex-direction: column;
    min-width: 0;
`;

// Dans la barre de titre, dont la hauteur est fixe, chaque ligne tient sur une ligne
const Title = styled.span<{ $inBar: boolean }>`
    font-size: ${theme.fontSize.xs};
    font-weight: ${theme.fontWeight.semibold};
    line-height: 1.25;
    ${({ $inBar }) => $inBar && 'white-space: nowrap;'}
`;

const Detail = styled.span<{ $inBar: boolean }>`
    font-size: 0.7rem;
    line-height: 1.25;
    color: ${theme.colors.textMuted};
    ${({ $inBar }) => $inBar && 'white-space: nowrap;'}
`;

const Explain = styled.button`
    padding: 0;
    border: none;
    background: none;
    font-family: inherit;
    font-size: ${theme.fontSize.xs};
    font-weight: ${theme.fontWeight.medium};
    color: ${theme.colors.primary};
    text-decoration: underline;
    cursor: pointer;
`;

const Wrap = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.35rem;
    min-width: 0;
`;

interface MillesimeBadgeProps {
    layout: 'bar' | 'stack';
    // Lecture de la carte affichée ; null pendant un chargement ou sans millésime
    reading: MillesimeReading | null;
}

const MillesimeBadge: React.FC<MillesimeBadgeProps> = ({ layout, reading }) => {
    const drawer = useOcsgeDrawer();
    const inBar = layout === 'bar';
    const spoken = `${reading?.short ?? NO_MILLESIME_LABEL}. ${EXPLAIN_LABEL}`;

    return (
        <Wrap>
            <Badge type="button" $inBar={inBar} title={EXPLAIN_LABEL} aria-label={spoken} onClick={drawer?.openDrawer}>
                <Lines>
                    <Title $inBar={inBar}>{reading?.title ?? NO_MILLESIME_LABEL}</Title>
                    {reading && <Detail $inBar={inBar}>{reading.detail}</Detail>}
                </Lines>
                <i className="bi bi-info-circle" aria-hidden="true" />
            </Badge>
            {/* Empilé (téléphone), la place ne manque pas : le renvoi est écrit en toutes lettres */}
            {!inBar && (
                <Explain type="button" onClick={drawer?.openDrawer}>
                    {EXPLAIN_LABEL}
                </Explain>
            )}
        </Wrap>
    );
};

export default MillesimeBadge;
