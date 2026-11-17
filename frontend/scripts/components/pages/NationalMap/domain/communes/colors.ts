// Couleurs des communes de la vue dense, telles que le moteur les pose une à une sur les tuiles
// (état d'entité `color`). Poser une couleur coûte du temps au fil principal, en proportion du
// nombre de communes touchées : seules celles dont la couleur change sont à mettre à jour.
import { NO_DATA_COLOR } from '../../values';
import { NO_DATA_KEY, OUTSIDE_ZONE_KEY } from '../frame/render/communes';
import type { CommunesRender, LegendKey } from '../frame/types';

// Une commune hors de la zone affichée n'est pas dessinée
const OUTSIDE_ZONE_COLOR = 'rgba(0, 0, 0, 0)';

// Part de sa couleur que garde une commune estompée, comme sur la carte par territoire
const DIMMED_OPACITY = 0.2;

// Couleur estompée : la couleur mêlée au blanc du fond de la carte. Elle reste opaque, pour que
// deux communes qui se recouvrent d'un pixel ne dessinent pas de liseré plus sombre.
const dimmed = (color: string): string => {
    const channels = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(color);
    if (!channels) return color;
    const mixed = channels.slice(1).map((channel) => Math.round(255 - (255 - Number.parseInt(channel, 16)) * DIMMED_OPACITY));
    return `#${mixed.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
};

// Couleur de chaque commune, par identifiant : `colors` suit l'ordre de `ids`
export type CommuneColors = { ids: string[]; colors: string[] };

// Couleur affichée de chaque commune : celle de sa clé de légende, grise sans donnée,
// transparente hors de la zone. Quand une ligne de légende est mise en avant (`highlighted`), les
// communes des autres lignes, et celles sans donnée, prennent la version estompée de leur couleur.
export const communeColors = ({ ids, legendKeys, palette }: CommunesRender, highlighted: LegendKey | null): CommuneColors => {
    const faded = palette.map(dimmed);
    const noData = highlighted === null ? NO_DATA_COLOR : dimmed(NO_DATA_COLOR);
    const colors = new Array<string>(ids.length);
    for (let rank = 0; rank < ids.length; rank += 1) {
        const key = legendKeys[rank];
        if (key === OUTSIDE_ZONE_KEY) colors[rank] = OUTSIDE_ZONE_COLOR;
        else if (key === NO_DATA_KEY) colors[rank] = noData;
        else colors[rank] = highlighted === null || key === highlighted ? palette[key] : faded[key];
    }
    return { ids, colors };
};

export type ColorChange = { id: string; color: string };

const sameIds = (a: string[], b: string[]): boolean => a === b || (a.length === b.length && a.every((id, rank) => id === b[rank]));

// Communes dont la couleur est à poser pour passer des couleurs affichées (`shown`, null si
// aucune ne l'est) aux suivantes : celles dont la couleur change, et elles seules. Si la liste
// des communes a changé entre deux réponses, toutes sont reposées, et celles qui ont disparu
// repassent au gris des communes sans donnée.
export const colorChanges = (shown: CommuneColors | null, next: CommuneColors): ColorChange[] => {
    const all = (): ColorChange[] => next.ids.map((id, rank) => ({ id, color: next.colors[rank] }));
    if (!shown) return all();
    if (!sameIds(shown.ids, next.ids)) {
        const kept = new Set(next.ids);
        return [...all(), ...shown.ids.filter((id) => !kept.has(id)).map((id) => ({ id, color: NO_DATA_COLOR }))];
    }
    const changes: ColorChange[] = [];
    for (let rank = 0; rank < next.ids.length; rank += 1) {
        if (next.colors[rank] !== shown.colors[rank]) changes.push({ id: next.ids[rank], color: next.colors[rank] });
    }
    return changes;
};
