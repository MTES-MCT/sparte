// Classes de valeurs par quantiles : chaque classe réunit à peu près le même nombre de territoires.
// Elles servent là où les seuils naturels (Jenks, voir values.ts) ne conviennent pas : sur les
// 34 875 communes du pays, ils rangent 70 % des communes dans une seule classe, et leur calcul,
// quadratique, prend plus de cinq secondes.
//
// Une seule règle de borne vaut pour les couleurs, les effectifs et les libellés : une classe
// commence à sa borne inférieure et s'arrête avant sa borne supérieure. Une valeur égale à une
// borne appartient donc à la classe supérieure. Les valeurs reçues sont déjà arrondies à la
// précision d'affichage (voir roundToDisplay) : un territoire n'est jamais rangé dans une autre
// classe que celle que désigne sa valeur affichée.
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

// Bornes intérieures d'un découpage de valeurs triées en `count` classes de même effectif. Chaque
// borne est la plus petite valeur de la classe qu'elle ouvre. Des ex æquo ne sont jamais séparés :
// une borne qui répéterait la précédente, ou le minimum, ouvrirait une classe vide.
const quantileBounds = (sorted: Float64Array, count: number): number[] => {
    const bounds: number[] = [];
    let previous = sorted[0];
    for (let rank = 1; rank < count; rank += 1) {
        const bound = sorted[Math.floor((rank * sorted.length) / count)];
        if (bound > previous) bounds.push(bound);
        previous = bound;
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

// Classes d'une grandeur croissante : autant de classes de même effectif que de couleurs, moins
// quand trop de territoires partagent la même valeur
export const quantileClasses = (values: ArrayLike<number>, format: ValueFormat): ValueClass[] => {
    if (values.length === 0) return [];
    const sorted = Float64Array.from(values).sort();
    const text = (value: number) => formatNumber({ number: value, decimals: decimalsOf(format) });
    const segments = segmentsOf(quantileBounds(sorted, SEQUENTIAL_PALETTE.length));
    const colors = spreadColors(SEQUENTIAL_PALETTE, segments.length);
    return segments.map((segment, index) => ({ ...segment, color: colors[index], name: nameOf(segment, text, unitSuffix(format), sorted) }));
};

// Classes d'une évolution, de part et d'autre de zéro : les baisses et les hausses sont découpées
// séparément en classes de même effectif, trois au plus de chaque côté, et les valeurs exactement
// nulles forment une classe à part. Les couleurs gardent ainsi leur sens : bleu pour une baisse,
// orangé ou rouge pour une hausse, les plus claires au plus près de zéro.
export const signedQuantileClasses = (values: ArrayLike<number>, format: ValueFormat): ValueClass[] => {
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
        const segments = segmentsOf(quantileBounds(decreases, DECREASE_PALETTE.length), undefined, decreaseEnd);
        // La palette des baisses va de la plus forte à la plus faible : elle est lue depuis zéro
        classes.push(...side(decreases, segments, spreadColors([...DECREASE_PALETTE].reverse(), segments.length).reverse()));
    }
    if (hasZero) classes.push({ from: hasDecrease ? 0 : undefined, to: hasIncrease ? step : undefined, color: NEUTRAL_COLOR, name: `${text(0)}${unit}` });
    if (hasIncrease) {
        const segments = segmentsOf(quantileBounds(increases, INCREASE_PALETTE.length), increaseStart);
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
