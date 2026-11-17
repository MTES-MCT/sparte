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

export const formatValue = (value: number | null | undefined, indicator: Formatting): string => {
    if (value === null || value === undefined || Number.isNaN(value)) return 'Donnée non disponible';
    const number = formatNumber({ number: value, decimals: indicator.decimals ?? 1 });
    return indicator.unit ? `${number} ${UNIT_LABELS[indicator.unit]}` : number;
};

// Programmation dynamique de Fisher–Jenks. Pour les l premiers éléments découpés en j classes,
// `lowerLimits[l][j]` est l'indice (1-based) du premier élément de la dernière classe et
// `variances[l][j]` la somme des variances intra-classe minimale.
type JenksTables = { lowerLimits: Int32Array; variances: Float64Array; at: (l: number, j: number) => number };

// Essaie `lower` comme début de la dernière classe pour les l premiers éléments, en 2..k classes
const relaxJenksClasses = (tables: JenksTables, k: number, l: number, lower: number, variance: number): void => {
    const { lowerLimits, variances, at } = tables;
    for (let j = 2; j <= k; j += 1) {
        const candidate = variance + variances[at(lower - 1, j - 1)];
        if (variances[at(l, j)] >= candidate) {
            lowerLimits[at(l, j)] = lower;
            variances[at(l, j)] = candidate;
        }
    }
};

const jenksTables = (sorted: number[], k: number): JenksTables => {
    const n = sorted.length;
    const at = (l: number, j: number) => l * (k + 1) + j;
    const tables: JenksTables = { lowerLimits: new Int32Array((n + 1) * (k + 1)), variances: new Float64Array((n + 1) * (k + 1)).fill(Infinity), at };
    for (let j = 1; j <= k; j += 1) {
        tables.lowerLimits[at(1, j)] = 1;
        tables.variances[at(1, j)] = 0;
    }
    for (let l = 2; l <= n; l += 1) {
        let sum = 0;
        let sumSquares = 0;
        // Parcourt les débuts de classe possibles, du dernier élément vers le premier (m éléments dans la classe)
        for (let m = 1; m <= l; m += 1) {
            const lower = l - m + 1;
            const value = sorted[lower - 1];
            sum += value;
            sumSquares += value * value;
            const variance = sumSquares - (sum * sum) / m;
            if (lower > 1) relaxJenksClasses(tables, k, l, lower, variance);
        }
        tables.lowerLimits[at(l, 1)] = 1;
        tables.variances[at(l, 1)] = sumSquares - (sum * sum) / l;
    }
    return tables;
};

// Seuils naturels de Jenks : partition d'une liste triée en k classes qui minimise la
// variance intra-classe (O(k·n²)). Renvoie les k + 1 bornes, du minimum au maximum,
// chaque borne étant une valeur observée.
export const jenksBreaks = (sorted: number[], k: number): number[] => {
    const n = sorted.length;
    if (n === 0) return [];
    if (k >= n) return [...sorted];
    const { lowerLimits, at } = jenksTables(sorted, k);
    const breaks = new Array<number>(k + 1);
    breaks[0] = sorted[0];
    breaks[k] = sorted[n - 1];
    let remaining = n;
    for (let j = k; j > 1; j -= 1) {
        breaks[j - 1] = sorted[lowerLimits[at(remaining, j)] - 2];
        remaining = lowerLimits[at(remaining, j)] - 1;
    }
    return breaks;
};

// Bornes intérieures d'une partition de Jenks en `count` classes, sans doublon
const innerBounds = (sorted: number[], count: number): number[] =>
    jenksBreaks(sorted, count)
        .slice(1, -1)
        .filter((bound, index, bounds) => index === 0 || bound > bounds[index - 1]);

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

// Découpe les valeurs en classes par seuils naturels (Jenks), avec autant de classes que de
// couleurs quand les valeurs distinctes le permettent. Les bornes sont des valeurs observées ;
// une valeur égale à une borne appartient à la classe inférieure, comme dans Highcharts.
export const naturalBreaksClasses = (values: number[], palette: string[], indicator: Formatting): ValueClass[] => {
    const sorted = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
    if (sorted.length === 0) return [];
    const bounds = innerBounds(sorted, Math.min(palette.length, new Set(sorted).size));
    const format = (v: number) => formatNumber({ number: v, decimals: indicator.decimals ?? 1 });
    return classesFromBounds(bounds, palette.slice(0, bounds.length + 1), format, unitSuffix(indicator), sorted[0]);
};

// Nombre signé : « +12,5 », « −3,0 », « 0 »
export const formatSigned = (value: number, decimals: number): string => {
    if (value === 0) return '0';
    const number = formatNumber({ number: Math.abs(value), decimals });
    return `${value > 0 ? '+' : '−'}${number}`;
};

// Classes d'une évolution, de part et d'autre de zéro : les baisses (valeurs négatives ou nulles)
// et les hausses sont découpées séparément par seuils naturels, avec une borne fixe à zéro.
// Les couleurs gardent ainsi leur sens : jamais de bleu pour une hausse ni de rouge pour une baisse.
export const divergingClasses = (values: number[], indicator: Formatting): ValueClass[] => {
    const sorted = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
    if (sorted.length === 0) return [];
    const decreases = sorted.filter((v) => v <= 0);
    const increases = sorted.filter((v) => v > 0);
    const side = (part: number[], palette: string[]) =>
        part.length === 0 ? [] : innerBounds(part, Math.min(palette.length, new Set(part).size));
    const decreaseBounds = side(decreases, DECREASE_PALETTE);
    const increaseBounds = side(increases, INCREASE_PALETTE);
    const zero = decreases.length > 0 && increases.length > 0 ? [0] : [];
    // Les classes les plus proches de zéro prennent les couleurs les plus claires
    const colors = [
        ...(decreases.length > 0 ? DECREASE_PALETTE.slice(DECREASE_PALETTE.length - decreaseBounds.length - 1) : []),
        ...(increases.length > 0 ? INCREASE_PALETTE.slice(0, increaseBounds.length + 1) : []),
    ];
    const format = (v: number) => formatSigned(v, indicator.decimals ?? 1);
    return classesFromBounds([...decreaseBounds, ...zero, ...increaseBounds], colors, format, unitSuffix(indicator), sorted[0]);
};

export const CLASSIFICATION_LABEL = 'Classes par seuils naturels (méthode de Jenks), calculées sur les territoires affichés';
export const DIVERGING_CLASSIFICATION_LABEL =
    'Classes par seuils naturels (méthode de Jenks), calculées de part et d’autre de zéro sur les territoires affichés';

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
    if (!(maxValue > 0)) return [];
    const smallest = 10 ** -decimals;
    const references = [maxValue, maxValue / 4, maxValue / 20].map(roundDown).filter((v) => v >= smallest);
    return references.filter((v, i) => references.indexOf(v) === i);
};

export const periodLabel = (startYear: number, endYear: number): string =>
    startYear === endYear ? `en ${startYear}` : `de ${startYear} à ${endYear}`;
