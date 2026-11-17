// Graduations des axes de valeurs des graphiques complémentaires : positions et libellés, calculés
// ici plutôt que par Highcharts (voir narrowChartLayouts.ts). Fonctions pures.
import { formatNumber } from '@utils/formatUtils';

// Pas d'un axe de valeurs, à une puissance de dix près
const TICK_STEPS = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];

// `count` graduations régulières (trois au moins) qui couvrent l'intervalle, au pas le plus fin de
// TICK_STEPS qui le permet ; undefined pour un intervalle vide
export const roundTicks = (min: number, max: number, count: number): number[] | undefined => {
    if (!(max > min)) return undefined;
    const magnitude = 10 ** Math.floor(Math.log10((max - min) / (count - 1)));
    // La première graduation tombe sous le minimum, à un multiple du pas : il faut parfois un pas
    // de la puissance de dix suivante, qui couvre toujours l'intervalle
    const step = [1, 10]
        .flatMap((decade) => TICK_STEPS.map((multiple) => multiple * decade * magnitude))
        .find((candidate) => (Math.floor(min / candidate) + count - 1) * candidate >= max);
    const first = Math.floor(min / step);
    // Arrondi à douze chiffres : un pas décimal ne laisse pas d'erreur de virgule flottante dans les libellés
    return Array.from({ length: count }, (_, index) => Number(((first + index) * step).toPrecision(12)));
};

// Milliers et millions, abrégés comme le fait Highcharts dans les autres graphiques
const TICK_UNITS = [
    { size: 1e6, symbol: 'M' },
    { size: 1e3, symbol: 'k' },
    { size: 1, symbol: '' },
];

// Décimales qu'il faut pour écrire un pas sans l'arrondir, trois au plus
const decimalsOf = (step: number): number => [0, 1, 2].find((decimals) => Number.isInteger(Number((step * 10 ** decimals).toPrecision(12)))) ?? 3;

// Libellé d'une graduation d'un axe au pas donné : en millions ou en milliers quand le pas en
// compte un nombre entier, pour que l'abréviation n'appelle jamais de décimale ; sinon le nombre
// entier, avec les décimales du pas à chaque graduation
export const tickLabel = (value: number, step: number): string => {
    if (value === 0) return '0';
    const { size, symbol } = TICK_UNITS.find((unit) => decimalsOf(step / unit.size) === 0) ?? TICK_UNITS[TICK_UNITS.length - 1];
    return `${formatNumber({ number: value / size, decimals: decimalsOf(step / size) })}${symbol}`;
};
