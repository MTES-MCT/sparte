import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { theme } from '@theme';
import Button from '@components/ui/Button';
import type { MapTip } from '../../domain/tip';
import { tipMarkup, tipStyles } from './tipView';

// Fiche de l'élément touché sur la carte : ce que l'infobulle dit au survol, pour un écran où l'on
// ne survole pas. Elle n'est pas posée sous le doigt, qui la masquerait et qu'elle masquerait :
// elle prend sa place dans l'emplacement que la page lui réserve (voir SheetSlot dans
// NationalMapChart), sous la carte quand la page défile. Elle porte la seule action qui ouvre un
// territoire au doigt : l'appui sur la carte lit, le bouton ouvre.

// Côté d'une cible tactile
const TOUCH_TARGET = '2.75rem';

const Sheet = styled.section`
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    /* À droite, la place du bouton de fermeture */
    padding: 0.6rem ${TOUCH_TARGET} 0.7rem 0.75rem;
    background: ${theme.colors.background};

    ${tipStyles}

    /* Le bouton d'action, et non celui de fermeture, placé après lui */
    > button:not(:last-child) {
        align-self: flex-start;
        min-height: ${TOUCH_TARGET};
    }
`;

const CloseButton = styled.button`
    position: absolute;
    top: 0;
    right: 0;
    width: ${TOUCH_TARGET};
    height: ${TOUCH_TARGET};
    padding: 0;
    border: none;
    border-radius: ${theme.radius.default};
    background: transparent;
    color: ${theme.colors.text};
    cursor: pointer;

    &:hover {
        background: ${theme.colors.backgroundAlt};
    }
`;

export type TipSheetAction = { label: string; onClick: () => void };

interface TipSheetProps {
    // Emplacement de la page où la fiche est rendue ; sans lui, elle l'est sur place
    slot?: HTMLElement | null;
    tip: MapTip;
    // Ce que l'élément permet d'ouvrir ; null : il se lit seulement
    action: TipSheetAction | null;
    onClose: () => void;
}

const TipSheet: React.FC<TipSheetProps> = ({ slot, tip, action, onClose }) => {
    // Échap ferme la fiche, où que soit le focus
    useEffect(() => {
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', closeOnEscape);
        return () => document.removeEventListener('keydown', closeOnEscape);
    }, [onClose]);

    const sheet = (
        <Sheet aria-label="Élément désigné sur la carte">
            {/* Le gabarit de l'infobulle, qui écrit tout son contenu comme du texte */}
            <div dangerouslySetInnerHTML={{ __html: tipMarkup(tip) }} />
            {action && (
                <Button type="button" size="md" icon="bi bi-box-arrow-in-right" onClick={action.onClick}>
                    {action.label}
                </Button>
            )}
            <CloseButton type="button" title="Fermer" onClick={onClose}>
                <i className="bi bi-x-lg" aria-hidden="true" />
                <span className="fr-sr-only">Fermer la fiche</span>
            </CloseButton>
        </Sheet>
    );
    return slot ? createPortal(sheet, slot) : sheet;
};

export default TipSheet;
