import { roundTicks, tickLabel } from './chartTicks';

describe('roundTicks', () => {
    it.each([
        ['des centaines d’hectares', 0, 713, [0, 250, 500, 750]],
        ['des dizaines de milliers', 0, 30943, [0, 12000, 24000, 36000]],
        ['quelques hectares', 0, 4.2, [0, 1.5, 3, 4.5]],
        ['des dixièmes, sans erreur de virgule flottante', 0, 0.31, [0, 0.12, 0.24, 0.36]],
        ['un maximum sur une graduation', 0, 750, [0, 250, 500, 750]],
        ['des valeurs négatives', -120, 340, [-200, 0, 200, 400]],
    ])('donne quatre graduations régulières qui couvrent les valeurs : %s', (_case, min, max, expected) => {
        expect(roundTicks(min, max, 4)).toEqual(expected);
    });

    it('donne trois graduations, sans partir de zéro pour des valeurs qui en sont loin', () => {
        expect(roundTicks(0, 713, 3)).toEqual([0, 400, 800]);
        expect(roundTicks(990799, 1114872, 3)).toEqual([960000, 1040000, 1120000]);
        expect(roundTicks(95, 205, 3)).toEqual([80, 160, 240]);
    });

    it('prend un pas de la puissance de dix suivante quand la première graduation tombe loin sous le minimum', () => {
        expect(roundTicks(99, 280, 3)).toEqual([0, 150, 300]);
    });

    it('couvre toujours l’intervalle, d’un pas régulier', () => {
        const intervals = [0.001, 0.37, 1, 9.99, 42, 250, 999, 1000, 31415, 2.5e6, 6.8e7].flatMap((max) => [0, max * 0.37, max * 0.93].map((min) => [min, max]));

        intervals.forEach(([min, max]) =>
            [3, 4].forEach((count) => {
                const ticks = roundTicks(min, max, count);
                const steps = ticks.slice(1).map((tick, index) => tick - ticks[index]);

                expect(ticks).toHaveLength(count);
                expect(ticks[0]).toBeLessThanOrEqual(min);
                expect(ticks[count - 1]).toBeGreaterThanOrEqual(max);
                steps.forEach((step) => expect(step).toBeCloseTo(steps[0], 9));
            }),
        );
    });

    it('ne rend rien pour un intervalle vide ou inconnu', () => {
        expect(roundTicks(5, 5, 4)).toBeUndefined();
        expect(roundTicks(7, 5, 4)).toBeUndefined();
        expect(roundTicks(undefined, undefined, 4)).toBeUndefined();
    });
});

describe('tickLabel', () => {
    const labels = (ticks: number[]): string[] => ticks.map((tick) => tickLabel(tick, ticks[1] - ticks[0]));

    it.each([
        ['en entier sous mille', [0, 250, 500, 750], ['0', '250', '500', '750']],
        ['en entier, avec le séparateur des milliers, quand le pas n’en compte pas un nombre entier', [0, 1200, 2400, 3600], ['0', '1\u202f200', '2\u202f400', '3\u202f600']],
        ['en milliers quand le pas en compte un nombre entier', [0, 12000, 24000, 36000], ['0', '12k', '24k', '36k']],
        ['en milliers, loin de zéro', [960000, 1040000, 1120000], ['960k', '1\u202f040k', '1\u202f120k']],
        ['en millions quand le pas en compte un nombre entier', [64e6, 66e6, 68e6], ['64M', '66M', '68M']],
        ['en milliers plutôt qu’en millions à décimales', [0, 1.5e6, 3e6, 4.5e6], ['0', '1\u202f500k', '3\u202f000k', '4\u202f500k']],
        ['avec la virgule et autant de décimales à chaque graduation, pour un petit pas', [0, 1.5, 3, 4.5], ['0', '1,5', '3,0', '4,5']],
        ['avec les décimales d’un pas de quelques centièmes', [0, 0.12, 0.24, 0.36], ['0', '0,12', '0,24', '0,36']],
        ['négatives', [-200, 0, 200, 400], ['-200', '0', '200', '400']],
    ])('écrit les graduations %s', (_case, ticks, expected) => {
        expect(labels(ticks)).toEqual(expected);
    });
});
