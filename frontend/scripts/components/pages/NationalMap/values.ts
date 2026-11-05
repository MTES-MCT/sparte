import { formatNumber } from '@utils/formatUtils';
import { Indicator, UNIT_LABELS } from './indicators';

// Dégradés de couleurs des cartes : du clair au foncé pour une grandeur croissante,
// du vert (baisse) au rouge (hausse) pour une évolution
export const SEQUENTIAL_PALETTE = ['#e3e3fd', '#b1b1f1', '#7f7fe6', '#4b4bc8', '#000091'];
export const DIVERGING_PALETTE = ['#1a9850', '#a6d96a', '#fee08b', '#f46d43', '#d73027'];
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

// Découpe les valeurs en classes par seuils naturels (Jenks), avec autant de classes que de
// couleurs quand les valeurs distinctes le permettent. Les bornes sont des valeurs observées ;
// une valeur égale à une borne appartient à la classe inférieure, comme dans Highcharts.
export const naturalBreaksClasses = (values: number[], palette: string[], indicator: Formatting): ValueClass[] => {
    const sorted = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
    if (sorted.length === 0) return [];
    const bounds = innerBounds(sorted, Math.min(palette.length, new Set(sorted).size));
    const format = (v: number) => formatNumber({ number: v, decimals: indicator.decimals ?? 1 });
    const unit = indicator.unit ? ` ${UNIT_LABELS[indicator.unit]}` : '';
    const classes: ValueClass[] = [];
    for (let i = 0; i <= bounds.length; i += 1) {
        const from = i === 0 ? undefined : bounds[i - 1];
        const to = i === bounds.length ? undefined : bounds[i];
        classes.push({ from, to, color: palette[Math.min(i, palette.length - 1)], name: className(from, to, format, unit, sorted[0]) });
    }
    return classes;
};

export const CLASSIFICATION_LABEL = 'Classes par seuils naturels (méthode de Jenks), calculées sur les territoires affichés';

export const periodLabel = (startYear: number, endYear: number): string =>
    startYear === endYear ? `en ${startYear}` : `de ${startYear} à ${endYear}`;
