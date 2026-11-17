import { CONSO_FRANCE_BY_REGION } from '../__fixtures__/nationalMapFixtures';
import { presetPeriodsOf } from './presetPeriods';

describe('presetPeriodsOf', () => {
    it('propose la décennie de référence, la période ouverte en 2021 et toute la période, avec leurs années', () => {
        expect(presetPeriodsOf(CONSO_FRANCE_BY_REGION.fixed_periods).map(({ label, startYear, endYear }) => [label, startYear, endYear])).toEqual([
            ['Décennie de référence', 2011, 2020],
            ['Depuis 2021', 2021, 2024],
            ['Toute la période', 2011, 2024],
        ]);
    });

    it('rappelle les dates que chaque période couvre : la décennie de référence finit au millésime 2020', () => {
        expect(presetPeriodsOf(CONSO_FRANCE_BY_REGION.fixed_periods).map(({ hint }) => hint)).toEqual([
            'du 1er janvier 2011 au 1er janvier 2021',
            'du 1er janvier 2021 au 1er janvier 2025',
            'du 1er janvier 2011 au 1er janvier 2025',
        ]);
    });

    it('suit le dernier millésime de la réponse', () => {
        const periods = presetPeriodsOf({ p1: [2011, 2020], p2: [2021, 2026], total: [2011, 2026] });

        expect(periods.map(({ label, endYear }) => [label, endYear])).toEqual([
            ['Décennie de référence', 2020],
            ['Depuis 2021', 2026],
            ['Toute la période', 2026],
        ]);
    });

    it('n’en propose aucune tant que la réponse manque', () => {
        expect(presetPeriodsOf(undefined)).toEqual([]);
    });
});
