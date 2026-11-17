import {
    DECREASE_PALETTE,
    INCREASE_PALETTE,
    SEQUENTIAL_PALETTE,
    divergingClasses,
    formatValue,
    jenksBreaks,
    naturalBreaksClasses,
    periodLabel,
    symbolMaxSize,
    symbolRadius,
    symbolSizeFactor,
    symbolReferenceValues,
} from './values';
import {
    availableScales,
    defaultScale,
    filterByZone,
    isRegionInZone,
    isValidZone,
    landToZone,
    zonePath,
    zoneToLand,
    ZONE_FRANCE,
    ZONE_HEXAGONE,
} from './zones';

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

    it('reconnaît à sa région un territoire de l’Hexagone ; tout territoire est de la France entière', () => {
        expect(['84', '53', '94', '01', '06'].map((region) => isRegionInZone(region, ZONE_HEXAGONE))).toEqual([true, true, false, false, false]);
        expect(['84', '94', '06'].map((region) => isRegionInZone(region, ZONE_FRANCE))).toEqual([true, true, true]);
        // Sans région connue, un territoire n'est pas rangé dans l'Hexagone
        expect(isRegionInZone(null, ZONE_HEXAGONE)).toBe(false);
        expect(isRegionInZone(null, ZONE_FRANCE)).toBe(true);
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

    it('propose les mailles plus fines que la zone, la commune comprise pour les zones nationales', () => {
        expect(availableScales(ZONE_FRANCE)).toEqual(['REGION', 'DEPART', 'EPCI', 'COMM']);
        expect(availableScales(ZONE_HEXAGONE)).toEqual(['REGION', 'DEPART', 'EPCI', 'COMM']);
        expect(availableScales('REGION_84')).toEqual(['DEPART', 'EPCI', 'COMM']);
        expect(availableScales('DEPART_69')).toEqual(['EPCI', 'COMM']);
        expect(availableScales('EPCI_200046977')).toEqual(['COMM']);
    });

    it.each([ZONE_FRANCE, ZONE_HEXAGONE])('ouvre la zone nationale %s par EPCI', (zone) => {
        expect(defaultScale(zone)).toBe('EPCI');
    });

    it.each([
        ['REGION_84', 'DEPART'],
        ['DEPART_69', 'EPCI'],
        ['EPCI_200046977', 'COMM'],
    ])('ouvre le territoire %s à la maille juste en dessous (%s)', (zone, scale) => {
        expect(defaultScale(zone)).toBe(scale);
    });

    it('ouvre chaque zone à une maille qu’elle propose', () => {
        [ZONE_FRANCE, ZONE_HEXAGONE, 'REGION_84', 'DEPART_69', 'EPCI_200046977'].forEach((zone) => {
            expect(availableScales(zone)).toContain(defaultScale(zone));
        });
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

describe('divergingClasses', () => {
    const indicator = { unit: '%' as const, decimals: 0 };

    it('sépare les baisses et les hausses par une borne à zéro', () => {
        const classes = divergingClasses([-80, -78, -40, -38, -5, -3, 2, 4, 50, 52, 300, 310], indicator);
        expect(classes).toHaveLength(6);
        const zeroIndex = classes.findIndex((c) => c.to === 0);
        expect(zeroIndex).toBe(2);
        expect(classes[zeroIndex + 1].from).toBe(0);
        expect(classes.slice(0, 3).map((c) => c.color)).toEqual(DECREASE_PALETTE);
        expect(classes.slice(3).map((c) => c.color)).toEqual(INCREASE_PALETTE);
        for (let i = 1; i < classes.length; i += 1) expect(classes[i].from).toBe(classes[i - 1].to);
    });

    it('signe les libellés', () => {
        const names = divergingClasses([-80, -78, -5, -3, 2, 4, 50, 52], indicator).map((c) => c.name);
        expect(names[0]).toMatch(/^Jusqu'à −/);
        expect(names.some((name) => /à 0 %$/.test(name))).toBe(true);
        expect(names[names.length - 1]).toMatch(/^Plus de \+/);
    });

    it("n'utilise que les bleus sans hausse et que les rouges sans baisse", () => {
        const decreases = divergingClasses([-50, -49, -10, -9], indicator);
        expect(decreases.every((c) => DECREASE_PALETTE.includes(c.color))).toBe(true);
        expect(decreases[decreases.length - 1].color).toBe(DECREASE_PALETTE[2]);
        const increases = divergingClasses([10, 11, 90, 91], indicator);
        expect(increases.every((c) => INCREASE_PALETTE.includes(c.color))).toBe(true);
        expect(increases[0].color).toBe(INCREASE_PALETTE[0]);
        expect(divergingClasses([], indicator)).toEqual([]);
    });

    it.failing('réserve une classe neutre aux valeurs exactement nulles, ni baisse ni hausse', () => {
        const colors = divergingClasses([-2, -1, 0, 0, 1, 2], indicator).map((c) => c.color);

        expect(colors.some((color) => !DECREASE_PALETTE.includes(color) && !INCREASE_PALETTE.includes(color))).toBe(true);
    });

    it.failing('ne laisse pas quelques valeurs extrêmes rassembler presque tous les territoires dans une seule classe', () => {
        const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 1000, 2000, 10000];
        const classes = divergingClasses(values, indicator);
        const counts = classes.map(() => 0);
        values.forEach((value) => {
            counts[classes.findIndex((c) => (c.from === undefined || value >= c.from) && (c.to === undefined || value <= c.to))] += 1;
        });

        expect(classes.length).toBeGreaterThan(1);
        expect(Math.max(...counts)).toBeLessThanOrEqual(values.length / 2);
    });
});

describe('cercles proportionnels', () => {
    it('donne une surface proportionnelle à la valeur', () => {
        const max = symbolRadius(100, 100, 43);
        const quarter = symbolRadius(25, 100, 43);
        expect(max).toBe(21.5);
        // Un quart de la valeur : moitié de la plage de diamètres
        expect(quarter).toBe((3 + 20) / 2);
        expect(symbolRadius(0, 100, 43)).toBe(1.5);
    });

    it('réduit les cercles quand les territoires sont nombreux ou la carte étroite', () => {
        expect(symbolMaxSize(18)).toBeGreaterThan(symbolMaxSize(101));
        expect(symbolMaxSize(101)).toBeGreaterThan(symbolMaxSize(1255));
        expect(symbolMaxSize(18, 0.5)).toBeLessThan(symbolMaxSize(18));
        expect(symbolSizeFactor(1200, 700)).toBe(1);
        expect(symbolSizeFactor(800, 320)).toBe(0.6);
        expect(symbolSizeFactor(300, 100)).toBe(0.4);
    });

    it('choisit des valeurs de référence rondes et distinctes', () => {
        expect(symbolReferenceValues(37610)).toEqual([20000, 5000, 1000]);
        expect(symbolReferenceValues(3)).toEqual([2]);
        expect(symbolReferenceValues(0)).toEqual([]);
    });
});
