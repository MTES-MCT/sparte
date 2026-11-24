import { formatNumber } from '@utils/formatUtils';
import { Indicator, UNIT_LABELS } from './indicators';

// Dégradés de couleurs des cartes : du clair au foncé pour une grandeur croissante,
// du bleu (baisse) au rouge (hausse) pour une évolution
export const SEQUENTIAL_PALETTE = ['#e3e3fd', '#b1b1f1', '#7f7fe6', '#4b4bc8', '#000091'];
// Évolutions : bleus pour les baisses (de la plus forte à la plus faible), orangés et rouges pour
// les hausses. Un couple vert / rouge ne se distingue pas pour les personnes daltoniennes.
export const DECREASE_PALETTE = ['#2166ac', '#67a9cf', '#b5d5e8'];
export const INCREASE_PALETTE = ['#fdc086', '#ef8a62', '#b2182b'];
export const NO_DATA_COLOR = '#dcdcdc';

export type ValueClass = { from?: number; to?: number; color: string; name: string };

type Formatting = Pick<Indicator, 'unit' | 'decimals'>;

// Hectares sous dix, sur une carte qui les écrit sans décimale : un chiffre après la virgule, comme
// leur moyenne annuelle, sans quoi une consommation de moins d'un hectare se lirait « 0 ha ». Une
// valeur entière, comme une référence de la légende, reste écrite sans décimale.
const SMALL_HECTARES = 10;
const shownDecimals = (value: number, { unit, decimals = 1 }: Formatting): number =>
    unit === 'ha' && decimals === 0 && Math.abs(value) < SMALL_HECTARES && !Number.isInteger(value) ? 1 : decimals;

// Décimales des cercles de référence d'une carte dont la plus grande valeur est `maxValue` : sous
// dix hectares, des références d'un dixième d'hectare, sans quoi la légende n'aurait qu'un cercle
export const referenceDecimals = (maxValue: number, { unit, decimals = 0 }: Formatting): number => (unit === 'ha' && maxValue < SMALL_HECTARES ? Math.max(decimals, 1) : decimals);

export const formatValue = (value: number | null | undefined, indicator: Formatting): string => {
    if (value === null || value === undefined || Number.isNaN(value)) return 'Donnée non disponible';
    const decimals = shownDecimals(value, indicator);
    // Une valeur qui s'arrondit à zéro s'écrit comme zéro, sans signe ni décimale de plus
    const zero = Math.round(value * 10 ** decimals) === 0;
    const number = formatNumber({ number: zero ? 0 : value, decimals: zero ? (indicator.decimals ?? 1) : decimals });
    return indicator.unit ? `${number} ${UNIT_LABELS[indicator.unit]}` : number;
};

// Libellé d'une classe d'après ses bornes ; une borne extrême absente est ouverte
const className = (from: number | undefined, to: number | undefined, format: (v: number) => string, unit: string, single: number): string => {
    if (from === undefined && to === undefined) return `${format(single)}${unit}`;
    if (from === undefined) return `Jusqu'à ${format(to as number)}${unit}`;
    if (to === undefined) return `Plus de ${format(from)}${unit}`;
    return `De ${format(from)} à ${format(to)}${unit}`;
};

// Classes délimitées par des bornes intérieures croissantes : une couleur par classe,
// les deux classes extrêmes étant ouvertes
const classesFromBounds = (bounds: number[], colors: string[], format: (v: number) => string, unit: string, single: number): ValueClass[] =>
    colors.map((color, i) => {
        const from = i === 0 ? undefined : bounds[i - 1];
        const to = i === bounds.length ? undefined : bounds[i];
        return { from, to, color, name: className(from, to, format, unit, single) };
    });

export const unitSuffix = (indicator: Formatting): string => (indicator.unit ? ` ${UNIT_LABELS[indicator.unit]}` : '');

// Classes à bornes fixes, identiques d'une vue à l'autre (données carroyées) : `bounds` sont les
// bornes intérieures croissantes, une couleur par classe
export const fixedClasses = (bounds: number[], palette: string[], format: (v: number) => string, unit: string): ValueClass[] =>
    classesFromBounds(bounds, palette.slice(0, bounds.length + 1), format, unit, bounds[0]);

// Nombre signé : « +12,5 », « −3,0 », « 0 »
export const formatSigned = (value: number, decimals: number): string => {
    if (value === 0) return '0';
    const number = formatNumber({ number: Math.abs(value), decimals });
    return `${value > 0 ? '+' : '−'}${number}`;
};

// --- Cercles proportionnels (valeurs absolues) ---------------------------------------

// Diamètre minimal d'un cercle, en pixels : une petite valeur reste visible
export const SYMBOL_MIN_SIZE = 3;

// Diamètre du plus grand cercle selon le nombre de territoires affichés ; `factor` (entre 0 et 1)
// le réduit sur une petite carte
export const symbolMaxSize = (landCount: number, factor = 1): number => {
    let size = 18;
    if (landCount <= 20) size = 64;
    else if (landCount <= 110) size = 40;
    else if (landCount <= 400) size = 28;
    return Math.max(SYMBOL_MIN_SIZE * 2, Math.round(size * factor));
};

// Côté de carte (en pixels) à partir duquel les cercles ont leur taille normale
const SYMBOL_FULL_SIZE_PX = 560;

// Facteur de réduction des cercles pour une carte de cette taille, par paliers de 0,1
export const symbolSizeFactor = (width: number, height: number): number =>
    Math.min(1, Math.max(0.4, Math.round((Math.min(width, height) / SYMBOL_FULL_SIZE_PX) * 10) / 10));

// Rayon en pixels du cercle d'une valeur : la surface du cercle est proportionnelle à la valeur.
// Même calcul que les séries « bubble » de Highcharts avec zMin = 0 et sizeBy = 'area'.
export const symbolRadius = (value: number, maxValue: number, maxSize: number): number => {
    const share = maxValue > 0 ? Math.sqrt(Math.max(value, 0) / maxValue) : 0.5;
    return Math.ceil(SYMBOL_MIN_SIZE + share * (maxSize - SYMBOL_MIN_SIZE)) / 2;
};

// Plus grand nombre « rond » (1, 2 ou 5 × 10^n) inférieur ou égal à la valeur
const roundDown = (value: number): number => {
    const magnitude = 10 ** Math.floor(Math.log10(value));
    const lead = value / magnitude;
    if (lead >= 5) return 5 * magnitude;
    return (lead >= 2 ? 2 : 1) * magnitude;
};

// Valeurs rondes des cercles de référence de la légende, de la plus grande à la plus petite
export const symbolReferenceValues = (maxValue: number, decimals = 0): number[] => {
    if (Number.isNaN(maxValue) || maxValue <= 0) return [];
    const smallest = 10 ** -decimals;
    const references = [maxValue, maxValue / 4, maxValue / 20].map(roundDown).filter((v) => v >= smallest);
    return references.filter((v, i) => references.indexOf(v) === i);
};

export const periodLabel = (startYear: number, endYear: number): string =>
    startYear === endYear ? `en ${startYear}` : `de ${startYear} à ${endYear}`;
