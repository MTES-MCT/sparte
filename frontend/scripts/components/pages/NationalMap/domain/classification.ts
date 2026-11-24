// Classes de valeurs des aplats de couleur, sur les cartes par territoire comme sur la vue de
// toutes les communes : seuils naturels de Jenks, qui réunissent les valeurs proches et placent
// les coupures là où la distribution en fait.
//
// Une seule règle de borne vaut pour les couleurs, les effectifs et les libellés : une classe
// commence à sa borne inférieure et s'arrête avant sa borne supérieure. Une valeur égale à une
// borne appartient donc à la classe supérieure, et chaque borne est la plus petite valeur de la
// classe qu'elle ouvre. Les valeurs sont classées arrondies à la précision d'affichage (voir
// roundToDisplay) : un territoire n'est jamais rangé dans une autre classe que celle que désigne
// sa valeur affichée.
import { formatNumber } from '@utils/formatUtils';
import type { Indicator } from '../indicators';
import { DECREASE_PALETTE, INCREASE_PALETTE, SEQUENTIAL_PALETTE, ValueClass, formatSigned, unitSuffix } from '../values';

type ValueFormat = Pick<Indicator, 'unit' | 'decimals'>;

// Couleur des valeurs exactement nulles d'une évolution, entre les bleus des baisses et les
// orangés des hausses : un jaune pâle, distinct du gris des territoires sans donnée
export const NEUTRAL_COLOR = '#ffffbf';

// Décimales affichées quand l'indicateur n'en déclare pas, comme formatValue
const DEFAULT_DECIMALS = 1;

const decimalsOf = (format: ValueFormat): number => format.decimals ?? DEFAULT_DECIMALS;

// Valeur arrondie comme l'affichage l'arrondit : au plus proche, la demie vers l'extérieur
// (-75,85 donne -75,9). La correction d'un epsilon empêche l'erreur de représentation binaire
// (1,005 × 100 = 100,49999999999999) de faire pencher une demie du mauvais côté.
export const roundToDisplay = (value: number, format: ValueFormat): number => {
    const scale = 10 ** decimalsOf(format);
    const rounded = Math.round(Math.abs(value) * scale * (1 + Number.EPSILON)) / scale;
    if (rounded === 0) return 0;
    return value < 0 ? -rounded : rounded;
};

// Valeurs distinctes d'une liste triée, et nombre de fois où chacune apparaît
const distinctValues = (sorted: Float64Array): { values: Float64Array; weights: Float64Array } => {
    const values: number[] = [];
    const weights: number[] = [];
    sorted.forEach((value) => {
        if (values.length > 0 && values[values.length - 1] === value) weights[weights.length - 1] += 1;
        else {
            values.push(value);
            weights.push(1);
        }
    });
    return { values: Float64Array.from(values), weights: Float64Array.from(weights) };
};

// Programmation dynamique de Fisher–Jenks sur des valeurs distinctes pondérées par leur effectif.
// Pour les l premières valeurs découpées en j classes, `starts[at(l, j)]` est le rang (à partir
// de 1) de la première valeur de la dernière classe, et `variances[at(l, j)]` la plus petite somme
// des variances intra-classe. Le coût ne dépend que du nombre de valeurs distinctes : les 34 875
// communes du pays, arrondies à la précision d'affichage, n'en comptent que quelques milliers.
const jenksStarts = (values: Float64Array, weights: Float64Array, k: number): { starts: Int32Array; at: (l: number, j: number) => number } => {
    const n = values.length;
    const at = (l: number, j: number) => l * (k + 1) + j;
    const starts = new Int32Array((n + 1) * (k + 1));
    const variances = new Float64Array((n + 1) * (k + 1)).fill(Infinity);
    for (let j = 1; j <= k; j += 1) {
        starts[at(1, j)] = 1;
        variances[at(1, j)] = 0;
    }
    for (let l = 2; l <= n; l += 1) {
        let weight = 0;
        let sum = 0;
        let sumSquares = 0;
        let variance = 0;
        // Débuts possibles de la dernière classe, de la l-ième valeur vers la première
        for (let start = l; start >= 1; start -= 1) {
            const value = values[start - 1];
            const count = weights[start - 1];
            weight += count;
            sum += count * value;
            sumSquares += count * value * value;
            variance = sumSquares - (sum * sum) / weight;
            if (start > 1) {
                for (let j = 2; j <= k; j += 1) {
                    const candidate = variance + variances[at(start - 1, j - 1)];
                    if (variances[at(l, j)] >= candidate) {
                        starts[at(l, j)] = start;
                        variances[at(l, j)] = candidate;
                    }
                }
            }
        }
        starts[at(l, 1)] = 1;
        variances[at(l, 1)] = variance;
    }
    return { starts, at };
};

// Bornes intérieures d'un découpage de valeurs triées en `count` classes au plus, par seuils
// naturels de Jenks : la partition qui minimise la variance à l'intérieur des classes. Chaque
// borne est la plus petite valeur de la classe qu'elle ouvre. Des ex æquo ne sont jamais séparés,
// et il n'y a pas plus de classes que de valeurs distinctes.
export const jenksBounds = (sorted: Float64Array, count: number): number[] => {
    const { values, weights } = distinctValues(sorted);
    const k = Math.min(count, values.length);
    if (k < 2) return [];
    if (k === values.length) return Array.from(values.subarray(1));
    const { starts, at } = jenksStarts(values, weights, k);
    const bounds = new Array<number>(k - 1);
    let remaining = values.length;
    for (let j = k; j > 1; j -= 1) {
        const start = starts[at(remaining, j)];
        bounds[j - 2] = values[start - 1];
        remaining = start - 1;
    }
    return bounds;
};

type Segment = { from?: number; to?: number };

// Intervalles que découpent des bornes croissantes, entre deux limites ; une limite absente est ouverte
const segmentsOf = (bounds: number[], from?: number, to?: number): Segment[] =>
    [from, ...bounds].map((start, index) => ({ from: start, to: index < bounds.length ? bounds[index] : to }));

// Libellé d'une classe, fidèle à la règle de borne : sa borne supérieure n'en fait pas partie.
// Une classe sans borne réunit toutes les valeurs : elle est nommée par leur étendue.
const nameOf = ({ from, to }: Segment, text: (value: number) => string, unit: string, sorted: Float64Array): string => {
    if (from === undefined && to === undefined) {
        const [min, max] = [sorted[0], sorted.at(-1)!];
        return min === max ? `${text(min)}${unit}` : `De ${text(min)} à ${text(max)}${unit}`;
    }
    if (from === undefined) return `Moins de ${text(to)}${unit}`;
    if (to === undefined) return `${text(from)}${unit} et plus`;
    return `De ${text(from)} à ${text(to)}${unit}`;
};

// Couleurs de `count` classes, de la plus claire à la plus foncée d'une palette. Moins nombreuses
// que les couleurs, les classes se répartissent sur toute la palette : la dernière garde la
// teinte la plus foncée, une classe unique la plus claire.
const spreadColors = (palette: string[], count: number): string[] =>
    Array.from({ length: count }, (_, index) => palette[count === 1 ? 0 : Math.round((index * (palette.length - 1)) / (count - 1))]);

// Classes d'une grandeur croissante : autant de classes que de couleurs, moins quand les valeurs
// distinctes sont moins nombreuses. `palette` : de la couleur la plus claire à la plus foncée.
export const naturalClasses = (values: ArrayLike<number>, format: ValueFormat, palette: string[] = SEQUENTIAL_PALETTE): ValueClass[] => {
    if (values.length === 0) return [];
    const sorted = Float64Array.from(values).sort();
    const text = (value: number) => formatNumber({ number: value, decimals: decimalsOf(format) });
    const segments = segmentsOf(jenksBounds(sorted, palette.length));
    const colors = spreadColors(palette, segments.length);
    return segments.map((segment, index) => ({ ...segment, color: colors[index], name: nameOf(segment, text, unitSuffix(format), sorted) }));
};

// Classes d'une évolution, de part et d'autre de zéro : les baisses et les hausses sont découpées
// séparément par seuils naturels, trois classes au plus de chaque côté, et les valeurs exactement
// nulles forment une classe à part. Les couleurs gardent ainsi leur sens : bleu pour une baisse,
// orangé ou rouge pour une hausse, les plus claires au plus près de zéro.
export const signedNaturalClasses = (values: ArrayLike<number>, format: ValueFormat): ValueClass[] => {
    const sorted = Float64Array.from(values).sort();
    const decreases = sorted.filter((value) => value < 0);
    const increases = sorted.filter((value) => value > 0);
    const hasDecrease = decreases.length > 0;
    const hasIncrease = increases.length > 0;
    const hasZero = decreases.length + increases.length < sorted.length;
    // Plus petite valeur positive que l'affichage distingue de zéro : la classe des valeurs nulles
    // s'arrête avant elle, et les hausses commencent avec elle
    const step = 1 / 10 ** decimalsOf(format);
    const decreaseEnd = hasZero || hasIncrease ? 0 : undefined;
    let increaseStart: number | undefined;
    if (hasZero) increaseStart = step;
    else if (hasDecrease) increaseStart = 0;

    const text = (value: number) => formatSigned(value, decimalsOf(format));
    const unit = unitSuffix(format);
    const side = (part: Float64Array, segments: Segment[], colors: string[]): ValueClass[] =>
        segments.map((segment, index) => ({ ...segment, color: colors[index], name: nameOf(segment, text, unit, part) }));

    const classes: ValueClass[] = [];
    if (hasDecrease) {
        const segments = segmentsOf(jenksBounds(decreases, DECREASE_PALETTE.length), undefined, decreaseEnd);
        // La palette des baisses va de la plus forte à la plus faible : elle est lue depuis zéro
        classes.push(...side(decreases, segments, spreadColors([...DECREASE_PALETTE].reverse(), segments.length).reverse()));
    }
    if (hasZero) classes.push({ from: hasDecrease ? 0 : undefined, to: hasIncrease ? step : undefined, color: NEUTRAL_COLOR, name: `${text(0)}${unit}` });
    if (hasIncrease) {
        const segments = segmentsOf(jenksBounds(increases, INCREASE_PALETTE.length), increaseStart);
        classes.push(...side(increases, segments, spreadColors(INCREASE_PALETTE, segments.length)));
    }
    return classes;
};

// Rang de la classe d'une valeur : la dernière dont la borne inférieure ne la dépasse pas
export const valueClassIndex = (value: number, classes: ValueClass[]): number => {
    let index = 0;
    while (index + 1 < classes.length && value >= classes[index + 1].from) index += 1;
    return index;
};


// Ce que le volet « Méthode » de la légende dit du classement ; `lands` nomme ce qui est classé
export const classificationMethod = (lands: 'territoires' | 'communes', signed: boolean): string =>
    signed
        ? `Classes par seuils naturels (méthode de Jenks), calculées de part et d’autre de zéro sur les ${lands} ${lands === 'communes' ? 'affichées' : 'affichés'} : ` +
          'les baisses et les hausses sont découpées séparément, et les valeurs nulles forment une classe à part. ' +
          'Une valeur égale à une borne appartient à la classe supérieure'
        : `Classes par seuils naturels (méthode de Jenks), calculées sur les ${lands} ${lands === 'communes' ? 'affichées' : 'affichés'}. ` +
          'Une valeur égale à une borne appartient à la classe supérieure';
