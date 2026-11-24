import { realisticShares } from '../__fixtures__/communesFixtures';
import { DECREASE_PALETTE, INCREASE_PALETTE, SEQUENTIAL_PALETTE, ValueClass } from '../values';
import { NEUTRAL_COLOR, jenksBounds, naturalClasses, roundToDisplay, signedNaturalClasses, valueClassIndex } from './classification';

// Les nombres sont formatés avec des espaces insécables, étroites pour les milliers
const plain = (text: string): string => text.replace(/[  ]/g, ' ');
const names = (classes: ValueClass[]): string[] => classes.map((valueClass) => plain(valueClass.name));
const bounds = (classes: ValueClass[]): [number | undefined, number | undefined][] => classes.map(({ from, to }) => [from, to]);
const colors = (classes: ValueClass[]): string[] => classes.map(({ color }) => color);

const SHARE = { unit: '%' as const, decimals: 2 };
const EVOLUTION = { unit: '%' as const, decimals: 1 };

// Nombre de valeurs de chaque classe, avec la règle de borne des couleurs
const countsOf = (values: number[], classes: ValueClass[]): number[] => {
    const counts = classes.map(() => 0);
    values.forEach((value) => {
        counts[valueClassIndex(value, classes)] += 1;
    });
    return counts;
};

describe('roundToDisplay', () => {
    it('arrondit au plus proche, à la précision d’affichage', () => {
        expect(roundToDisplay(0.344, SHARE)).toBe(0.34);
        expect(roundToDisplay(0.346, SHARE)).toBe(0.35);
        expect(roundToDisplay(12.34, EVOLUTION)).toBe(12.3);
    });

    it('arrondit une demie vers l’extérieur, comme l’affichage : -75,85 s’écrit -75,9', () => {
        expect(roundToDisplay(-75.85, EVOLUTION)).toBe(-75.9);
        expect(roundToDisplay(75.85, EVOLUTION)).toBe(75.9);
        expect((-75.85).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })).toBe('-75,9');
    });

    it('ne se laisse pas tromper par la représentation binaire d’une demie', () => {
        // 1,005 × 100 vaut 100,49999999999999 en virgule flottante
        expect(roundToDisplay(1.005, SHARE)).toBe(1.01);
        expect(roundToDisplay(0.045, SHARE)).toBe(0.05);
    });

    it('rend zéro, sans signe, pour une valeur que l’affichage ne distingue pas de zéro', () => {
        expect(Object.is(roundToDisplay(-0.004, SHARE), 0)).toBe(true);
    });

    it('arrondit à une décimale quand l’indicateur n’en déclare pas', () => {
        expect(roundToDisplay(2.26, {})).toBe(2.3);
    });
});

// Somme des variances à l'intérieur des classes que découpent des bornes (chaque borne ouvre une classe)
const withinVariance = (sorted: number[], bounds: number[]): number => {
    const groups = [...bounds, Infinity].map((to, index) => sorted.filter((value) => value < to && (index === 0 || value >= bounds[index - 1])));
    return groups.reduce((total, group) => {
        const mean = group.reduce((sum, value) => sum + value, 0) / group.length;
        return total + group.reduce((sum, value) => sum + (value - mean) ** 2, 0);
    }, 0);
};

// Tous les choix de `count` bornes parmi les valeurs distinctes, sauf la première
const everyBounds = (distinct: number[], count: number): number[][] => {
    if (count === 0) return [[]];
    return distinct.flatMap((bound, index) => (index === 0 ? [] : everyBounds(distinct.slice(index), count - 1).map((rest) => [bound, ...rest])));
};

describe('jenksBounds', () => {
    const bounded = (values: number[], count: number): number[] => jenksBounds(Float64Array.from(values).sort(), count);

    it('sépare des groupes nettement distincts, chaque borne étant la plus petite valeur de la classe qu’elle ouvre', () => {
        expect(bounded([1, 2, 3, 10, 11, 12, 100, 101, 102], 3)).toEqual([10, 100]);
        expect(bounded([1, 2, 3, 10, 11, 12], 2)).toEqual([10]);
    });

    it('ne fait pas plus de classes que de valeurs distinctes', () => {
        expect(bounded([], 3)).toEqual([]);
        expect(bounded([5], 3)).toEqual([]);
        expect(bounded([5, 5, 5], 3)).toEqual([]);
        expect(bounded([1, 2], 5)).toEqual([2]);
        expect(bounded([1, 1, 1, 2, 2, 7], 5)).toEqual([2, 7]);
    });

    it('tient compte du nombre de territoires qui partagent une valeur', () => {
        // Une fois chacune, les valeurs se partagent en deux paires ; répétée cent fois, la valeur 4
        // attire à elle ses voisines et seule la plus forte reste à part
        expect(bounded([0, 4, 6, 10], 2)).toEqual([6]);
        expect(bounded([0, ...Array.from({ length: 100 }, () => 4), 6, 10], 2)).toEqual([10]);
    });

    it('rend le découpage de plus petite variance à l’intérieur des classes', () => {
        const samples = [
            [3, 7, 8, 15, 16, 16, 21, 40, 41, 44, 90],
            [0, 0, 0, 1, 1, 2, 5, 5, 6, 9, 30, 31],
            [-12, -11.5, -4, -3.9, -3.8, 0.2, 0.4, 7, 7.5, 19],
        ];
        samples.forEach((sample) => {
            const sorted = [...sample].sort((a, b) => a - b);
            const distinct = [...new Set(sorted)];
            [2, 3, 4].forEach((count) => {
                const best = Math.min(...everyBounds(distinct, count - 1).map((bounds) => withinVariance(sorted, bounds)));
                expect(withinVariance(sorted, bounded(sample, count))).toBeCloseTo(best, 8);
            });
        });
    });

    it('classe les 34 875 communes du pays en moins d’une demi-seconde', () => {
        const values = Float64Array.from(realisticShares(34875)).sort();
        const start = performance.now();
        const bounds = jenksBounds(values, 5);

        expect(bounds).toHaveLength(4);
        expect(performance.now() - start).toBeLessThan(500);
    });
});

describe('naturalClasses', () => {
    it('découpe des valeurs en autant de classes que de couleurs', () => {
        const values = realisticShares(5000);
        const classes = naturalClasses(values, SHARE);

        expect(classes).toHaveLength(5);
        expect(colors(classes)).toEqual(SEQUENTIAL_PALETTE);
        expect(countsOf(values, classes).reduce((sum, count) => sum + count, 0)).toBe(values.length);
        // Les bornes se suivent sans trou, de la classe ouverte du bas à celle du haut
        expect(classes[0].from).toBeUndefined();
        expect(classes[4].to).toBeUndefined();
        for (let i = 1; i < classes.length; i += 1) expect(classes[i].from).toBe(classes[i - 1].to);
    });

    it('réunit les valeurs proches : sur une distribution très dissymétrique, la première classe rassemble la plupart des territoires', () => {
        // Propriété connue des seuils naturels, à l'inverse de classes de même effectif : la carte
        // montre où sont les valeurs fortes, pas un classement des territoires par rang
        const values = realisticShares(5000);
        const counts = countsOf(values, naturalClasses(values, SHARE));

        expect(counts[0] / values.length).toBeGreaterThan(0.5);
        expect(counts[4]).toBeGreaterThan(0);
    });

    it('prend pour borne la plus petite valeur de la classe qu’elle ouvre', () => {
        const classes = naturalClasses([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], { unit: 'ha', decimals: 0 });

        expect(bounds(classes)).toEqual([
            [undefined, 3],
            [3, 5],
            [5, 7],
            [7, 9],
            [9, undefined],
        ]);
        expect(countsOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], classes)).toEqual([2, 2, 2, 2, 2]);
    });

    it('nomme les classes selon la règle de borne : la borne supérieure d’une classe n’en fait pas partie', () => {
        const classes = naturalClasses([0.01, 0.05, 0.09, 0.15, 0.22, 0.3, 0.43, 0.6, 0.9, 2.5], SHARE);

        expect(names(classes)).toEqual(['Moins de 0,22 %', 'De 0,22 à 0,43 %', 'De 0,43 à 0,90 %', 'De 0,90 à 2,50 %', '2,50 % et plus']);
    });

    it('ne sépare pas des ex æquo : une classe par valeur quand les valeurs distinctes sont moins nombreuses que les couleurs', () => {
        const values = [0, 0, 0, 0, 0, 0, 0, 1, 2, 3];
        const classes = naturalClasses(values, SHARE);

        expect(bounds(classes)).toEqual([
            [undefined, 1],
            [1, 2],
            [2, 3],
            [3, undefined],
        ]);
        expect(countsOf(values, classes)).toEqual([7, 1, 1, 1]);
    });

    it('répartit des classes moins nombreuses que les couleurs sur toute la palette, de la plus claire à la plus foncée', () => {
        const [lightest, , middle, , darkest] = SEQUENTIAL_PALETTE;

        expect(colors(naturalClasses([0, 0, 0, 0, 0, 0, 0, 3, 3, 3], SHARE))).toEqual([lightest, darkest]);
        expect(colors(naturalClasses([0, 0, 0, 0, 0, 1, 1, 4, 4, 4], SHARE))).toEqual([lightest, middle, darkest]);
        expect(colors(naturalClasses([4, 4, 4], SHARE))).toEqual([lightest]);
    });

    it('réunit dans une seule classe des valeurs toutes égales, nommée par cette valeur', () => {
        expect(names(naturalClasses([4, 4, 4], SHARE))).toEqual(['4,00 %']);
        expect(names(naturalClasses([1, 1, 1, 1, 1, 1, 1, 1, 1, 2], SHARE))).toEqual(['Moins de 2,00 %', '2,00 % et plus']);
    });

    it('ne rend aucune classe sans valeur', () => {
        expect(naturalClasses([], SHARE)).toEqual([]);
    });
});

describe('signedNaturalClasses', () => {
    // Six baisses, deux valeurs nulles, six hausses
    const VALUES = [-60, -50, -40, -30, -20, -10, 0, 0, 5, 10, 15, 20, 25, 30];

    it('découpe séparément les baisses et les hausses, trois classes au plus de chaque côté, autour d’une classe neutre', () => {
        const classes = signedNaturalClasses(VALUES, EVOLUTION);

        expect(bounds(classes)).toEqual([
            [undefined, -40],
            [-40, -20],
            [-20, 0],
            [0, 0.1],
            [0.1, 15],
            [15, 25],
            [25, undefined],
        ]);
        expect(countsOf(VALUES, classes)).toEqual([2, 2, 2, 2, 2, 2, 2]);
    });

    it('réserve la classe neutre aux valeurs exactement nulles', () => {
        const classes = signedNaturalClasses(VALUES, EVOLUTION);

        expect(valueClassIndex(0, classes)).toBe(3);
        expect(valueClassIndex(-0.1, classes)).toBe(2);
        expect(valueClassIndex(0.1, classes)).toBe(4);
        expect(classes[3]).toMatchObject({ color: NEUTRAL_COLOR, name: '0 %' });
    });

    it('colore les baisses en bleu et les hausses en orangé puis rouge, les plus claires au plus près de zéro', () => {
        expect(colors(signedNaturalClasses(VALUES, EVOLUTION))).toEqual([...DECREASE_PALETTE, NEUTRAL_COLOR, ...INCREASE_PALETTE]);
        // Une seule classe d'un côté : sa couleur la plus claire ; deux classes : la plus claire et la plus foncée
        expect(colors(signedNaturalClasses([-3, -3, 0, 4, 4], EVOLUTION))).toEqual([DECREASE_PALETTE[2], NEUTRAL_COLOR, INCREASE_PALETTE[0]]);
        expect(colors(signedNaturalClasses([-2, -2, -1, -1, 1, 1, 2, 2], EVOLUTION))).toEqual([
            DECREASE_PALETTE[0],
            DECREASE_PALETTE[2],
            INCREASE_PALETTE[0],
            INCREASE_PALETTE[2],
        ]);
    });

    it('signe les libellés', () => {
        expect(names(signedNaturalClasses(VALUES, EVOLUTION))).toEqual([
            'Moins de −40,0 %',
            'De −40,0 à −20,0 %',
            'De −20,0 à 0 %',
            '0 %',
            'De +0,1 à +15,0 %',
            'De +15,0 à +25,0 %',
            '+25,0 % et plus',
        ]);
    });

    it('n’ouvre pas de classe neutre sans valeur nulle : zéro sépare alors les baisses des hausses', () => {
        const classes = signedNaturalClasses([-2, -1, 1, 2], EVOLUTION);

        expect(bounds(classes)).toEqual([
            [undefined, -1],
            [-1, 0],
            [0, 2],
            [2, undefined],
        ]);
        expect(colors(classes)).not.toContain(NEUTRAL_COLOR);
    });

    it('ne garde que les couleurs du côté présent', () => {
        expect(colors(signedNaturalClasses([1, 2, 3, 4, 5, 6], EVOLUTION))).toEqual(INCREASE_PALETTE);
        expect(colors(signedNaturalClasses([-6, -5, -4, -3, -2, -1], EVOLUTION))).toEqual(DECREASE_PALETTE);
        expect(names(signedNaturalClasses([0, 0], EVOLUTION))).toEqual(['0 %']);
        expect(signedNaturalClasses([], EVOLUTION)).toEqual([]);
    });
});

describe('valueClassIndex', () => {
    const CLASSES = naturalClasses([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], { unit: 'ha', decimals: 0 });

    it('range une valeur égale à une borne dans la classe supérieure', () => {
        expect([3, 5, 7, 9].map((bound) => valueClassIndex(bound, CLASSES))).toEqual([1, 2, 3, 4]);
    });

    it('range dans les classes extrêmes les valeurs hors de l’étendue observée', () => {
        expect(valueClassIndex(-5, CLASSES)).toBe(0);
        expect(valueClassIndex(1000, CLASSES)).toBe(4);
    });

    it('range toute valeur dans la seule classe d’un découpage sans borne', () => {
        expect(valueClassIndex(7, naturalClasses([4, 4, 4], SHARE))).toBe(0);
    });
});
