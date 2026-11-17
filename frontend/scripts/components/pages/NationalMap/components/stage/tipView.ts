// Apparence de ce qu'une carte dit de l'élément désigné : un seul gabarit et une seule feuille de
// style pour l'infobulle de Highcharts, celle de MapLibre et la fiche des écrans tactiles. Le
// gabarit est une chaîne HTML : c'est la seule forme que les deux moteurs acceptent.
import { css } from 'styled-components';
import { theme } from '@theme';
import type { MapTip } from '../../domain/tip';

export const TIP_CLASS = 'national-map-tip';

// Les noms viennent des données, les phrases des cartes : tout est écrit comme du texte
const ESCAPED: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const text = (value: string): string => value.replace(/[&<>"']/g, (character) => ESCAPED[character]);

const part = (name: string, content: string): string => `<div class="${TIP_CLASS}__${name}">${content}</div>`;

// `hint` : ce que fait un clic sur l'élément, en dernière ligne ; vide sur la fiche, qui a son bouton
export const tipMarkup = ({ title, swatch, measures, context }: MapTip, hint = ''): string => {
    const dot = swatch ? `<span class="${TIP_CLASS}__swatch" style="background-color:${text(swatch)}"></span>` : '';
    return (
        `<div class="${TIP_CLASS}">` +
        part('title', `${dot}<span>${text(title)}</span>`) +
        measures.map(({ label, value }) => (label ? part('label', text(label)) : '') + part('value', text(value))).join('') +
        (context ? part('context', text(context)) : '') +
        (hint ? part('hint', text(hint)) : '') +
        '</div>'
    );
};

// Gris des lignes secondaires : 5,7:1 sur blanc, là où la couleur atténuée du thème ne passe que de peu
const SECONDARY_COLOR = '#555555';

// Contenu : le même partout. Les tailles sont écrites en entier : le style de la page (DSFR) et
// ceux des deux moteurs imposent sinon chacun les leurs.
export const tipStyles = css`
    .${TIP_CLASS} {
        font-family: Marianne, arial, sans-serif;
        font-size: ${theme.fontSize.xs};
        font-weight: ${theme.fontWeight.normal};
        line-height: 1.4;
        color: ${theme.colors.text};
        white-space: normal;
        text-align: left;
    }

    .${TIP_CLASS}__title {
        display: flex;
        align-items: baseline;
        gap: 0.4rem;
        font-size: ${theme.fontSize.sm};
        font-weight: ${theme.fontWeight.semibold};
    }

    /* Pastille de la classe de l'élément : sa couleur dans la légende */
    .${TIP_CLASS}__swatch {
        flex: none;
        width: 0.65rem;
        height: 0.65rem;
        border-radius: 2px;
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.25);
    }

    .${TIP_CLASS}__value {
        font-size: ${theme.fontSize.md};
        font-weight: 700;
        line-height: 1.3;
    }

    .${TIP_CLASS}__label {
        margin-top: 0.2rem;
        color: ${SECONDARY_COLOR};
    }

    .${TIP_CLASS}__context,
    .${TIP_CLASS}__hint {
        color: ${SECONDARY_COLOR};
    }

    .${TIP_CLASS}__hint {
        margin-top: 0.3rem;
        padding-top: 0.25rem;
        border-top: 1px solid ${theme.colors.border};
    }
`;

// Bulle posée près du pointeur : le cadre de l'infobulle, le même pour les deux moteurs, qui
// n'y dessinent plus le leur. Le pointeur survole la carte à travers elle.
export const tipBubbleStyles = css`
    ${tipStyles}

    .${TIP_CLASS} {
        box-sizing: border-box;
        width: max-content;
        max-width: 17rem;
        padding: 0.45rem 0.65rem;
        background: ${theme.colors.background};
        border: 1px solid ${theme.colors.border};
        border-radius: ${theme.radius.default};
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.16);
        pointer-events: none;
    }
`;

// Écart entre le pointeur et la bulle, en pixels : elle ne masque pas ce qu'il désigne
export const TIP_OFFSET_PX = 14;
