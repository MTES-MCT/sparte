import { realisticShares } from '../__fixtures__/communesFixtures';
import { DECREASE_PALETTE, INCREASE_PALETTE, SEQUENTIAL_PALETTE, ValueClass } from '../values';
import { NEUTRAL_COLOR, quantileClasses, roundToDisplay, signedQuantileClasses, valueClassIndex } from './classification';

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

describe('quantileClasses', () => {
    it('découpe 5 000 valeurs réalistes en cinq classes de 18 à 22 % de l’effectif', () => {
        const values = realisticShares(5000);
        const classes = quantileClasses(values, SHARE);
        const shares = countsOf(values, classes).map((count) => (100 * count) / values.length);

        expect(classes).toHaveLength(5);
        shares.forEach((share) => {
            expect(share).toBeGreaterThanOrEqual(18);
            expect(share).toBeLessThanOrEqual(22);
        });
        expect(colors(classes)).toEqual(SEQUENTIAL_PALETTE);
    });

    it('prend pour borne la plus petite valeur de la classe qu’elle ouvre', () => {
        const classes = quantileClasses([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], { unit: 'ha', decimals: 0 });

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
        const classes = quantileClasses([0.01, 0.05, 0.09, 0.15, 0.22, 0.3, 0.43, 0.6, 0.9, 2.5], SHARE);

        expect(names(classes)).toEqual(['Moins de 0,09 %', 'De 0,09 à 0,22 %', 'De 0,22 à 0,43 %', 'De 0,43 à 0,90 %', '0,90 % et plus']);
    });

    it('ne sépare pas des ex æquo : moins de classes quand trop de territoires partagent une valeur', () => {
        const values = [0, 0, 0, 0, 0, 0, 0, 1, 2, 3];
        const classes = quantileClasses(values, SHARE);

        expect(bounds(classes)).toEqual([
            [undefined, 2],
            [2, undefined],
        ]);
        expect(countsOf(values, classes)).toEqual([8, 2]);
    });

    it('répartit des classes moins nombreuses que les couleurs sur toute la palette, de la plus claire à la plus foncée', () => {
        const [lightest, , middle, , darkest] = SEQUENTIAL_PALETTE;

        expect(colors(quantileClasses([0, 0, 0, 0, 0, 0, 0, 1, 2, 3], SHARE))).toEqual([lightest, darkest]);
        expect(colors(quantileClasses([0, 0, 0, 0, 0, 1, 1, 2, 3, 4], SHARE))).toEqual([lightest, middle, darkest]);
        expect(colors(quantileClasses([4, 4, 4], SHARE))).toEqual([lightest]);
    });

    it('réunit dans une seule classe des valeurs que rien ne sépare, et la nomme par leur étendue', () => {
        expect(names(quantileClasses([4, 4, 4], SHARE))).toEqual(['4,00 %']);
        expect(names(quantileClasses([1, 1, 1, 1, 1, 1, 1, 1, 1, 2], SHARE))).toEqual(['De 1,00 à 2,00 %']);
    });

    it('ne rend aucune classe sans valeur', () => {
        expect(quantileClasses([], SHARE)).toEqual([]);
    });
});

describe('signedQuantileClasses', () => {
    // Six baisses, deux valeurs nulles, six hausses
    const VALUES = [-60, -50, -40, -30, -20, -10, 0, 0, 5, 10, 15, 20, 25, 30];

    it('découpe séparément les baisses et les hausses, trois classes au plus de chaque côté, autour d’une classe neutre', () => {
        const classes = signedQuantileClasses(VALUES, EVOLUTION);

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
        const classes = signedQuantileClasses(VALUES, EVOLUTION);

        expect(valueClassIndex(0, classes)).toBe(3);
        expect(valueClassIndex(-0.1, classes)).toBe(2);
        expect(valueClassIndex(0.1, classes)).toBe(4);
        expect(classes[3]).toMatchObject({ color: NEUTRAL_COLOR, name: '0 %' });
    });

    it('colore les baisses en bleu et les hausses en orangé puis rouge, les plus claires au plus près de zéro', () => {
        expect(colors(signedQuantileClasses(VALUES, EVOLUTION))).toEqual([...DECREASE_PALETTE, NEUTRAL_COLOR, ...INCREASE_PALETTE]);
        // Une seule classe d'un côté : sa couleur la plus claire ; deux classes : la plus claire et la plus foncée
        expect(colors(signedQuantileClasses([-3, -3, 0, 4, 4], EVOLUTION))).toEqual([DECREASE_PALETTE[2], NEUTRAL_COLOR, INCREASE_PALETTE[0]]);
        expect(colors(signedQuantileClasses([-2, -2, -1, -1, 1, 1, 2, 2], EVOLUTION))).toEqual([
            DECREASE_PALETTE[0],
            DECREASE_PALETTE[2],
            INCREASE_PALETTE[0],
            INCREASE_PALETTE[2],
        ]);
    });

    it('signe les libellés', () => {
        expect(names(signedQuantileClasses(VALUES, EVOLUTION))).toEqual([
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
        const classes = signedQuantileClasses([-2, -1, 1, 2], EVOLUTION);

        expect(bounds(classes)).toEqual([
            [undefined, -1],
            [-1, 0],
            [0, 2],
            [2, undefined],
        ]);
        expect(colors(classes)).not.toContain(NEUTRAL_COLOR);
    });

    it('ne garde que les couleurs du côté présent', () => {
        expect(colors(signedQuantileClasses([1, 2, 3, 4, 5, 6], EVOLUTION))).toEqual(INCREASE_PALETTE);
        expect(colors(signedQuantileClasses([-6, -5, -4, -3, -2, -1], EVOLUTION))).toEqual(DECREASE_PALETTE);
        expect(names(signedQuantileClasses([0, 0], EVOLUTION))).toEqual(['0 %']);
        expect(signedQuantileClasses([], EVOLUTION)).toEqual([]);
    });
});

describe('valueClassIndex', () => {
    const CLASSES = quantileClasses([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], { unit: 'ha', decimals: 0 });

    it('range une valeur égale à une borne dans la classe supérieure', () => {
        expect([3, 5, 7, 9].map((bound) => valueClassIndex(bound, CLASSES))).toEqual([1, 2, 3, 4]);
    });

    it('range dans les classes extrêmes les valeurs hors de l’étendue observée', () => {
        expect(valueClassIndex(-5, CLASSES)).toBe(0);
        expect(valueClassIndex(1000, CLASSES)).toBe(4);
    });

    it('range toute valeur dans la seule classe d’un découpage sans borne', () => {
        expect(valueClassIndex(7, quantileClasses([4, 4, 4], SHARE))).toBe(0);
    });
});
