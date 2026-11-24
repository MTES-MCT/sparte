// Couleurs du carroyage de la consommation d'espaces. Chaque destination garde la couleur qu'elle
// a sur la page « Consommation » des diagnostics et dans les graphiques par destination : la carte
// de l'habitat est violette, celle de l'activité turquoise, etc.
//
// La page Consommation colore ses carreaux en continu, du blanc à la couleur de la destination puis
// à une nuance plus sombre, sur une échelle propre à chaque territoire. Ici les classes sont à
// bornes fixes : chaque classe prend une nuance de la couleur de la destination, à une clarté qui
// est la même pour toutes les destinations. Les sept cartes se lisent ainsi de la même façon, et
// les classes restent distinctes même pour une couleur pâle (routes, mixte), dont les nuances
// claires se confondraient entre elles et avec le fond.
import type { GridDestination } from '../../indicators';
import { shadeOfLightness } from '../shades';

// Clé de la carte de toutes les destinations, comme dans la configuration du serveur
export const ALL_DESTINATIONS = 'total';
export type ColoredDestination = GridDestination | typeof ALL_DESTINATIONS;

// Couleur de chaque destination : celles de `CARROYAGE_DESTINATION_CONFIG`
// (project/charts/constants.py), que lit la page Consommation. Un test vérifie que les deux listes
// restent identiques. Toutes destinations confondues, la page prend la couleur de l'habitat.
export const DESTINATION_COLORS: Record<ColoredDestination, string> = {
    total: '#6a6af4',
    habitat: '#6a6af4',
    activite: '#8ecac7',
    mixte: '#eeb088',
    route: '#cab8ee',
    ferroviaire: '#6b8abc',
    inconnu: '#86cdf2',
};

// Clarté de chaque classe, de la plus faible consommation à la plus forte (0 noir, 100 blanc).
// Douze points entre deux classes : l'écart qui les sépare nettement à l'écran. La plus claire
// reste visible sur le fond gris des territoires (clarté 95).
export const CLASS_LIGHTNESS = [90, 78, 66, 54, 42];

// Couleurs des classes d'une destination, de la plus claire à la plus sombre
export const destinationPalette = (destination: ColoredDestination): string[] =>
    CLASS_LIGHTNESS.map((lightness) => shadeOfLightness(DESTINATION_COLORS[destination], lightness));

// Couleur des cercles d'une carte en hectares d'une destination. Les cercles sont à demi
// transparents sur le fond lavande des territoires, où une couleur pastel vire au gris : l'habitat
// garde sa couleur, déjà soutenue, et l'activité prend un turquoise plus saturé de la même teinte.
// Une destination sans couleur propre ici prend une nuance sombre de la sienne.
const SYMBOL_COLORS: Partial<Record<ColoredDestination, string>> = {
    habitat: DESTINATION_COLORS.habitat,
    activite: '#289e98',
};
const SYMBOL_LIGHTNESS = CLASS_LIGHTNESS[3];
export const destinationSymbolColor = (destination: ColoredDestination): string =>
    SYMBOL_COLORS[destination] ?? shadeOfLightness(DESTINATION_COLORS[destination], SYMBOL_LIGHTNESS);
