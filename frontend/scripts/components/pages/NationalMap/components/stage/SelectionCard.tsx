import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled, { css } from 'styled-components';
import { theme } from '@theme';
import Button from '@components/ui/Button';
import type { SelectionSheet } from '../../domain/communes/selection';

// Fiche de la sélection faite sur la carte de toutes les communes du pays : le département
// désigné, avec l'action qui l'ouvre par commune, et la commune quand le zoom a permis de la
// viser. Elle ne connaît pas le moteur qui dessine la carte. Elle prend place dans l'emplacement
// que la page réserve aux fiches de lecture (voir SheetSlot dans NationalMapChart), comme celle
// des autres cartes : sous la carte quand la page défile, elle ne masque rien. Sans emplacement,
// elle est posée en bas à gauche de la carte.

// Côté d'une cible tactile : celui du bouton de fermeture
const TOUCH_TARGET = '2.75rem';

const Card = styled.section<{ $docked: boolean }>`
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 0.5rem 0.75rem 0.6rem;
    background: ${theme.colors.background};
    font-size: ${theme.fontSize.xs};
    line-height: 1.4;
    color: ${theme.colors.text};

    ${({ $docked }) =>
        $docked
            ? css`
                  position: relative;
              `
            : css`
                  position: absolute;
                  left: ${theme.spacing.sm};
                  bottom: ${theme.spacing.sm};
                  z-index: 1;
                  width: max-content;
                  max-width: min(22rem, calc(100% - 2 * ${theme.spacing.sm}));
                  border: 1px solid ${theme.colors.border};
                  border-radius: ${theme.radius.default};
                  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
              `}
`;

// Bloc d'un territoire ; à droite du premier, la place du bouton de fermeture
const Land = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.15rem;

    &:first-of-type {
        padding-right: ${TOUCH_TARGET};
    }

    & + & {
        padding-top: 0.4rem;
        border-top: 1px solid ${theme.colors.border};
    }

    /* Le lien et le bouton gardent la largeur de leur texte */
    > a,
    > button {
        align-self: flex-start;
    }

    > button {
        margin-top: 0.3rem;
        min-height: ${TOUCH_TARGET};
    }

    > a {
        /* Hauteur d'une cible tactile, sans écarter les lignes de texte */
        padding: 0.6rem 0;
    }
`;

// Nom du territoire, précédé de sa nature sur la même ligne : la fiche reste basse sur une petite carte
const Name = styled.p`
    margin: 0;
    font-size: ${theme.fontSize.sm};
    line-height: 1.35;
    font-weight: ${theme.fontWeight.semibold};

    span {
        margin-right: 0.15rem;
        font-size: ${theme.fontSize.xs};
        font-weight: ${theme.fontWeight.normal};
        color: ${theme.colors.textMuted};
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

interface SelectionCardProps {
    // Emplacement de la page où la fiche est rendue ; sans lui, elle l'est sur la carte
    slot?: HTMLElement | null;
    sheet: SelectionSheet;
    // Appelé avec la zone et le nom du département à afficher par commune
    onShowDepartment: (zone: string, name: string) => void;
    onClose: () => void;
}

const SelectionCard: React.FC<SelectionCardProps> = ({ slot, sheet: { department, commune }, onShowDepartment, onClose }) => {
    // Échap ferme la fiche, où que soit le focus
    useEffect(() => {
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', closeOnEscape);
        return () => document.removeEventListener('keydown', closeOnEscape);
    }, [onClose]);

    const card = (
        <Card aria-label="Sélection sur la carte" $docked={Boolean(slot)}>
            <CloseButton type="button" title="Fermer" onClick={onClose}>
                <i className="bi bi-x-lg" aria-hidden="true" />
                <span className="fr-sr-only">Fermer la sélection</span>
            </CloseButton>
            {commune && (
                <Land>
                    <Name>
                        <span>Commune</span> {commune.name}
                    </Name>
                    <span>{commune.valueText}</span>
                    {/* Dans un autre onglet : la carte garde sa zone, son zoom et sa sélection */}
                    <a href={commune.diagnosticUrl} target="_blank" rel="noopener noreferrer" title="Voir le diagnostic de la commune - nouvelle fenêtre">
                        Voir le diagnostic de la commune
                    </a>
                </Land>
            )}
            <Land>
                <Name>
                    <span>Département</span> {department.name}
                </Name>
                <Button type="button" size="sm" icon="bi bi-zoom-in" onClick={() => onShowDepartment(department.zone, department.name)}>
                    Afficher ce département par commune
                </Button>
            </Land>
        </Card>
    );
    return slot ? createPortal(card, slot) : card;
};

export default SelectionCard;
