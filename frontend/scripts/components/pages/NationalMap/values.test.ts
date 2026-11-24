import {
    DECREASE_PALETTE,
    INCREASE_PALETTE,
    SEQUENTIAL_PALETTE,
    formatValue,
    periodLabel,
    symbolMaxSize,
    symbolRadius,
    symbolSizeFactor,
    referenceDecimals,
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
        // Sous dix hectares, la légende descend au dixième d'hectare
        expect(symbolReferenceValues(2.38, referenceDecimals(2.38, { unit: 'ha', decimals: 0 }))).toEqual([2, 0.5, 0.1]);
        expect(referenceDecimals(250, { unit: 'ha', decimals: 0 })).toBe(0);
        expect(formatValue(0.35, { unit: 'ha', decimals: 0 })).toBe('0,4 ha');
        expect(formatValue(-0.03, { unit: 'ha', decimals: 0 })).toBe('0 ha');
        expect(formatValue(12.4, { unit: 'ha', decimals: 0 })).toBe('12 ha');
        expect(symbolReferenceValues(0)).toEqual([]);
    });
});
