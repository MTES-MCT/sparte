import React, { useId, useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@theme';
import { useOcsgeDrawer } from '@components/features/ocsge/OcsgeDrawerContext';
import { EXPLAIN_LABEL } from '../domain/millesimes';

// Au-delà de ce nombre de lignes, la note est repliée : dans la colonne, elle ne doit pas
// chasser les graphiques hors de l'écran
const MAX_LINES = 3;

const Block = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
`;

const Text = styled.p<{ $clamped: boolean }>`
    margin: 0;
    font-size: ${theme.fontSize.xs};
    line-height: 1.5;
    color: ${theme.colors.textMuted};

    ${({ $clamped }) =>
        $clamped &&
        `
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: ${MAX_LINES};
        overflow: hidden;
    `}
`;

// Bouton de dépliage, à la taille de la note : il ne doit pas peser plus que le texte qu'il déplie
const Toggle = styled.button`
    padding: 0;
    border: none;
    background: none;
    font-family: inherit;
    font-size: ${theme.fontSize.xs};
    line-height: 1.5;
    font-weight: ${theme.fontWeight.medium};
    color: ${theme.colors.primary};
    text-decoration: underline;
    cursor: pointer;

    &:hover {
        color: ${theme.colors.primaryHover};
    }
`;

// Les boutons de la note, sur une ligne : déplier la note, ouvrir l'explication des millésimes
const Actions = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 0.75rem;
`;

interface NationalMapFootnoteProps {
    text: string;
    // Note d'une carte de l'OCS GE : elle cite des millésimes, un renvoi ouvre leur explication
    explainsMillesimes?: boolean;
}

// Note de la carte affichée : ce qu'elle ne montre pas, ou ce qu'il faut savoir pour la lire.
// Trois lignes au plus ; une note plus longue se déplie par un bouton. Le texte entier reste dans
// le document : un lecteur d'écran le lit sans avoir à le déplier.
const NationalMapFootnote: React.FC<NationalMapFootnoteProps> = ({ text, explainsMillesimes = false }) => {
    // null hors de la page de la carte (tests de la note seule) : le renvoi n'est alors pas proposé
    const drawer = useOcsgeDrawer();
    const textRef = useRef<HTMLParagraphElement>(null);
    const textId = useId();
    // Note que l'utilisateur a dépliée : une autre note arrive repliée
    const [expandedText, setExpandedText] = useState<string | null>(null);
    const expanded = expandedText === text;
    // La note repliée est-elle coupée ? Mesuré avant la peinture, puis à chaque changement de
    // largeur de la colonne ; une note dépliée ne se mesure pas, elle garde son bouton
    const [truncated, setTruncated] = useState(false);

    useLayoutEffect(() => {
        const element = textRef.current;
        if (!element || expanded) return undefined;
        // Un pixel de marge : les deux hauteurs sont arrondies
        const measure = () => setTruncated(element.scrollHeight > element.clientHeight + 1);
        measure();
        if (typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, [text, expanded]);

    return (
        <Block>
            <Text ref={textRef} id={textId} $clamped={!expanded}>
                {text}
            </Text>
            <Actions>
                {truncated && (
                    <Toggle type="button" aria-expanded={expanded} aria-controls={textId} onClick={() => setExpandedText(expanded ? null : text)}>
                        {expanded ? 'Réduire la note' : 'Lire la suite'}
                    </Toggle>
                )}
                {explainsMillesimes && drawer && (
                    <Toggle type="button" onClick={drawer.openDrawer}>
                        {EXPLAIN_LABEL}
                    </Toggle>
                )}
            </Actions>
        </Block>
    );
};

export default NationalMapFootnote;
