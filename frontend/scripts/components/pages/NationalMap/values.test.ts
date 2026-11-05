import { formatValue, jenksBreaks, naturalBreaksClasses, periodLabel, SEQUENTIAL_PALETTE } from './values';
import { availableScales, defaultScale, filterByZone, isValidZone, landToZone, zonePath, zoneToLand, ZONE_FRANCE, ZONE_HEXAGONE } from './zones';

describe('jenksBreaks', () => {
    it('sépare des groupes nettement distincts', () => {
        expect(jenksBreaks([1, 2, 3, 10, 11, 12, 100, 101, 102], 3)).toEqual([1, 3, 12, 102]);
        expect(jenksBreaks([1, 2, 3, 10, 11, 12], 2)).toEqual([1, 3, 12]);
    });

    it('gère les cas limites', () => {
        expect(jenksBreaks([], 3)).toEqual([]);
        expect(jenksBreaks([5], 3)).toEqual([5]);
        expect(jenksBreaks([1, 2], 5)).toEqual([1, 2]);
    });
});

describe('naturalBreaksClasses', () => {
    it('découpe en autant de classes que de couleurs quand les valeurs le permettent', () => {
        const values = Array.from({ length: 100 }, (_, i) => i + 1);
        const classes = naturalBreaksClasses(values, SEQUENTIAL_PALETTE, { unit: 'ha', decimals: 0 });
        expect(classes).toHaveLength(5);
        expect(classes[0].from).toBeUndefined();
        expect(classes[4].to).toBeUndefined();
        expect(classes[0].name).toMatch(/^Jusqu'à/);
        expect(classes[4].name).toMatch(/^Plus de/);
        // Les bornes se suivent sans trou
        for (let i = 1; i < classes.length; i += 1) expect(classes[i].from).toBe(classes[i - 1].to);
    });

    it('place les bornes entre les groupes naturels', () => {
        const classes = naturalBreaksClasses([1, 2, 3, 10, 11, 12, 100, 101, 102], ['#a', '#b', '#c'], { unit: 'ha', decimals: 0 });
        expect(classes.map((c) => [c.from, c.to])).toEqual([
            [undefined, 3],
            [3, 12],
            [12, undefined],
        ]);
    });

    it('ne crée pas plus de classes que de valeurs distinctes', () => {
        expect(naturalBreaksClasses([1, 1, 1, 1, 10], SEQUENTIAL_PALETTE, { unit: 'ha', decimals: 0 })).toHaveLength(2);
        expect(naturalBreaksClasses([42], SEQUENTIAL_PALETTE, { unit: '%', decimals: 1 })).toHaveLength(1);
        expect(naturalBreaksClasses([], SEQUENTIAL_PALETTE, { unit: '%', decimals: 1 })).toEqual([]);
    });
});

describe('formatValue', () => {
    it('ajoute l’unité et gère l’absence de donnée', () => {
        expect(formatValue(1234.5, { unit: 'ha', decimals: 0 })).toMatch(/^1.?235 ha$/);
        expect(formatValue(null, { unit: 'ha' })).toBe('Donnée non disponible');
    });
});

describe('periodLabel', () => {
    it('distingue une année seule d’un intervalle', () => {
        expect(periodLabel(2011, 2011)).toBe('en 2011');
        expect(periodLabel(2011, 2020)).toBe('de 2011 à 2020');
    });
});

describe('zones', () => {
    const features = [
        { properties: { zone: 'HEXAGONE', region: '84' } },
        { properties: { zone: 'HEXAGONE', region: '53' } },
        { properties: { zone: 'CORSE', region: '94' } },
        { properties: { zone: '01', region: '01' } },
    ];

    it('ne filtre que l’Hexagone, les autres fonds étant déjà limités au parent', () => {
        expect(filterByZone(features, ZONE_FRANCE)).toHaveLength(4);
        expect(filterByZone(features, ZONE_HEXAGONE)).toHaveLength(2);
        expect(filterByZone(features, 'REGION_94')).toHaveLength(4);
    });

    it('code et décode les zones territoire', () => {
        expect(zoneToLand('DEPART_2A')).toEqual({ land_type: 'DEPART', land_id: '2A' });
        expect(zoneToLand('EPCI_200046977')).toEqual({ land_type: 'EPCI', land_id: '200046977' });
        expect(zoneToLand(ZONE_FRANCE)).toBeNull();
        expect(landToZone({ land_type: 'REGION', land_id: '84' })).toBe('REGION_84');
        expect(isValidZone('REGION_84')).toBe(true);
        expect(isValidZone('COMM_69123')).toBe(false);
        expect(isValidZone('nimporte')).toBe(false);
    });

    it('propose les mailles juste en dessous de la zone', () => {
        expect(availableScales(ZONE_FRANCE)).toEqual(['REGION', 'DEPART', 'EPCI']);
        expect(availableScales('REGION_84')).toEqual(['DEPART', 'EPCI', 'COMM']);
        expect(availableScales('DEPART_69')).toEqual(['EPCI', 'COMM']);
        expect(availableScales('EPCI_200046977')).toEqual(['COMM']);
        expect(defaultScale(ZONE_HEXAGONE)).toBe('REGION');
        expect(defaultScale('DEPART_69')).toBe('EPCI');
    });

    it('construit le chemin du fil d’Ariane', () => {
        expect(zonePath(ZONE_FRANCE).map((p) => p.zone)).toEqual([ZONE_FRANCE]);
        expect(zonePath('REGION_84').map((p) => p.zone)).toEqual([ZONE_FRANCE, ZONE_HEXAGONE, 'REGION_84']);
        expect(zonePath('REGION_94').map((p) => p.zone)).toEqual([ZONE_FRANCE, 'REGION_94']);
        const parent = {
            land_type: 'EPCI',
            land_id: '200046977',
            name: 'Métropole de Lyon',
            ancestors: [
                { land_type: 'REGION', land_id: '84', name: 'Auvergne-Rhône-Alpes' },
                { land_type: 'DEPART', land_id: '69', name: 'Rhône' },
            ],
        };
        expect(zonePath('EPCI_200046977', parent).map((p) => p.label)).toEqual([
            'France entière',
            'Hexagone',
            'Auvergne-Rhône-Alpes',
            'Rhône',
            'Métropole de Lyon',
        ]);
    });
});
