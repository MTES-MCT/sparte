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

// Seuils naturels de Jenks : partition d'une liste triée en k classes qui minimise la
// variance intra-classe (programmation dynamique de Fisher, O(k·n²)). Renvoie les k + 1
// bornes, du minimum au maximum, chaque borne étant une valeur observée.
export const jenksBreaks = (sorted: number[], k: number): number[] => {
    const n = sorted.length;
    if (n === 0) return [];
    if (k >= n) return [...sorted];
    // lowerLimits[l][j] : indice (1-based) du premier élément de la classe j quand les l premiers éléments sont découpés en j classes
    const lowerLimits = new Int32Array((n + 1) * (k + 1));
    const variances = new Float64Array((n + 1) * (k + 1));
    const at = (l: number, j: number) => l * (k + 1) + j;
    for (let j = 1; j <= k; j += 1) {
        lowerLimits[at(1, j)] = 1;
        for (let l = 2; l <= n; l += 1) variances[at(l, j)] = Infinity;
    }
    for (let l = 2; l <= n; l += 1) {
        let sum = 0;
        let sumSquares = 0;
        let count = 0;
        for (let m = 1; m <= l; m += 1) {
            const lower = l - m + 1;
            const value = sorted[lower - 1];
            count += 1;
            sum += value;
            sumSquares += value * value;
            const variance = sumSquares - (sum * sum) / count;
            const previous = lower - 1;
            if (previous !== 0) {
                for (let j = 2; j <= k; j += 1) {
                    const candidate = variance + variances[at(previous, j - 1)];
                    if (variances[at(l, j)] >= candidate) {
                        lowerLimits[at(l, j)] = lower;
                        variances[at(l, j)] = candidate;
                    }
                }
            }
        }
        lowerLimits[at(l, 1)] = 1;
        variances[at(l, 1)] = sumSquares - (sum * sum) / count;
    }
    const breaks = new Array<number>(k + 1);
    breaks[k] = sorted[n - 1];
    breaks[0] = sorted[0];
    let remaining = n;
    for (let j = k; j > 1; j -= 1) {
        breaks[j - 1] = sorted[lowerLimits[at(remaining, j)] - 2];
        remaining = lowerLimits[at(remaining, j)] - 1;
    }
    return breaks;
};

// Découpe les valeurs en classes par seuils naturels (Jenks), avec autant de classes que de
// couleurs quand les valeurs distinctes le permettent. Les bornes sont des valeurs observées ;
// une valeur égale à une borne appartient à la classe inférieure, comme dans Highcharts.
export const naturalBreaksClasses = (values: number[], palette: string[], indicator: Formatting): ValueClass[] => {
    const sorted = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
    if (sorted.length === 0) return [];
    const distinct = new Set(sorted).size;
    const count = Math.min(palette.length, distinct);
    const breaks = jenksBreaks(sorted, count);
    // Bornes intérieures, sans doublon
    const bounds: number[] = [];
    for (let i = 1; i < breaks.length - 1; i += 1) {
        if (bounds.length === 0 || breaks[i] > bounds[bounds.length - 1]) bounds.push(breaks[i]);
    }
    const format = (v: number) => formatNumber({ number: v, decimals: indicator.decimals ?? 1 });
    const unit = indicator.unit ? ` ${UNIT_LABELS[indicator.unit]}` : '';
    const colors = bounds.length + 1 === palette.length ? palette : palette.slice(0, bounds.length + 1);
    const classes: ValueClass[] = [];
    for (let i = 0; i <= bounds.length; i += 1) {
        const from = i === 0 ? undefined : bounds[i - 1];
        const to = i === bounds.length ? undefined : bounds[i];
        let name: string;
        if (from === undefined && to === undefined) name = `${format(sorted[0])}${unit}`;
        else if (from === undefined) name = `Jusqu'à ${format(to as number)}${unit}`;
        else if (to === undefined) name = `Plus de ${format(from)}${unit}`;
        else name = `De ${format(from)} à ${format(to)}${unit}`;
        classes.push({ from, to, color: colors[Math.min(i, colors.length - 1)], name });
    }
    return classes;
};

export const CLASSIFICATION_LABEL = 'Classes par seuils naturels (méthode de Jenks), calculées sur les territoires affichés';

export const periodLabel = (startYear: number, endYear: number): string =>
    startYear === endYear ? `en ${startYear}` : `de ${startYear} à ${endYear}`;
