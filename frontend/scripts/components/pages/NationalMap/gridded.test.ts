import { GridCells, cellColorExpression, cellOpacityExpression } from './domain/grid/cells';
import {
    GRID_BOUNDS_HA,
    consoCells,
    gridCellName,
    gridCellSizeKm,
    gridClassIndex,
    gridClasses,
    gridFilterExpression,
    gridSumExpression,
    gridTiles,
    gridValueHa,
    isInGridCoverage,
    haloOpacityExpression,
    landBorderStyle,
    lineWidthExpression,
    mercatorToLngLat,
    separationLine,
    toLngLatCollection,
} from './gridded';
import { destinationPalette } from './domain/grid/consoColors';
import { GRID_DESTINATIONS, GridDestination } from './indicators';
import { ZONE_FRANCE, ZONE_HEXAGONE } from './zones';

// Attributs annuels du total, que lisent toutes les tuiles nationales, et d'une destination dans
// le fichier des diagnostics
const TOTAL = { yearSuffix: '' };
const HABITAT_IN_LEA = { yearSuffix: '_habitat' };
const DESTINATIONS = Object.keys(GRID_DESTINATIONS) as GridDestination[];

describe('classes des données carroyées', () => {
    it('a une classe de plus que de bornes, dans les nuances de la couleur de toutes les destinations', () => {
        const classes = gridClasses(null);

        expect(classes).toHaveLength(GRID_BOUNDS_HA.length + 1);
        expect(classes.map(({ color }) => color)).toEqual(destinationPalette('total'));
        expect(classes[0].name).toBe("Jusqu'à 0,1 ha");
        expect(classes[3].name).toBe('De 1 à 5 ha');
        expect(classes[4].name).toBe('Plus de 5 ha');
    });

    it.each(DESTINATIONS)('donne à la carte « %s » les bornes de toutes les destinations, dans sa propre couleur', (destination) => {
        const classes = gridClasses(destination);

        expect(classes.map(({ name, from, to }) => ({ name, from, to }))).toEqual(gridClasses(null).map(({ name, from, to }) => ({ name, from, to })));
        expect(classes.map(({ color }) => color)).toEqual(destinationPalette(destination));
    });

    it('rend le même tableau à chaque demande, pour ne pas redessiner une carte inchangée', () => {
        expect(gridClasses('route')).toBe(gridClasses('route'));
        expect(gridClasses(null)).toBe(gridClasses(null));
    });

    it('range une valeur égale à une borne dans la classe supérieure, comme MapLibre', () => {
        expect(gridClassIndex(0.05)).toBe(0);
        expect(gridClassIndex(0.1)).toBe(1);
        expect(gridClassIndex(0.99)).toBe(2);
        expect(gridClassIndex(5)).toBe(4);
        expect(gridClassIndex(70)).toBe(4);
    });
});

describe('valeur d’un carreau', () => {
    const properties = { conso_2011: 10000, conso_2012: 5000, conso_2024: 2500, conso_2012_habitat: 99999 };

    it('somme les années de la période, en hectares', () => {
        expect(gridValueHa(properties, 2011, 2012, TOTAL)).toBe(1.5);
        expect(gridValueHa(properties, 2012, 2012, TOTAL)).toBe(0.5);
        expect(gridValueHa(properties, 2013, 2023, TOTAL)).toBe(0);
    });

    it('ignore les années hors des tuiles', () => {
        expect(gridValueHa(properties, 2005, 2030, TOTAL)).toBe(1.75);
    });

    it('lit, dans le fichier des diagnostics, les attributs de la destination et non le total', () => {
        const cell = { conso_2011: 10000, conso_2011_habitat: 6000, conso_2012: 5000, conso_2012_habitat: 1500, conso_2012_activite: 3500 };

        expect(gridValueHa(cell, 2011, 2012, HABITAT_IN_LEA)).toBe(0.75);
        expect(gridValueHa(cell, 2011, 2012, { yearSuffix: '_activite' })).toBe(0.35);
        expect(gridValueHa(cell, 2011, 2012, { yearSuffix: '_route' })).toBe(0);
    });
});

describe('maille d’une entité', () => {
    it('lit le côté des blocs agrégés du fichier national', () => {
        expect(gridCellSizeKm({ resolution_km: 5, conso_2020: 300 })).toBe(5);
        expect(gridCellSizeKm({ resolution_km: 1 })).toBe(1);
    });

    it('considère une entité sans résolution comme un carreau de 1 km', () => {
        expect(gridCellSizeKm({ conso_2020: 300 })).toBe(1);
        expect(gridCellSizeKm({ resolution_km: '5' })).toBe(1);
    });

    it('nomme les carreaux et les blocs', () => {
        expect(gridCellName(1)).toBe('Carreau de 1 km × 1 km');
        expect(gridCellName(5)).toBe('Bloc de 5 km × 5 km');
    });

    it('lit la densité d’un bloc comme la valeur d’un carreau', () => {
        // 300 m² par km² pendant deux ans : 0,06 ha par km², quel que soit le côté du bloc
        expect(gridValueHa({ resolution_km: 5, conso_2020: 300, conso_2021: 300 }, 2020, 2021, TOTAL)).toBe(0.06);
    });
});

describe('expressions MapLibre', () => {
    it('somme les colonnes des années, une année absente comptant pour zéro', () => {
        expect(gridSumExpression(2020, 2021, TOTAL)).toEqual(['+', 0, ['coalesce', ['get', 'conso_2020'], 0], ['coalesce', ['get', 'conso_2021'], 0]]);
    });

    it('somme les colonnes d’une destination dans le fichier des diagnostics', () => {
        expect(gridSumExpression(2020, 2021, HABITAT_IN_LEA)).toEqual(['+', 0, ['coalesce', ['get', 'conso_2020_habitat'], 0], ['coalesce', ['get', 'conso_2021_habitat'], 0]]);
    });
});

describe('carreaux décrits au moteur', () => {
    // Carreaux d'une zone en 2020, tels que la carte les reçoit
    const cellsOf = (zone: string, destination: GridDestination | null, covered = true): GridCells =>
        consoCells({
            zone,
            displayed: { scale: 'DEPART', landIds: [] },
            covered,
            destination,
            period: { startYear: 2020, endYear: 2020 },
            periodText: 'en 2020',
            describeValue: (valueHa, cellSizeKm) => `${valueHa} ha, ${cellSizeKm} km`,
        });
    const FRANCE = cellsOf(ZONE_FRANCE, null);
    const BRETAGNE_HABITAT = cellsOf('REGION_53', 'habitat');

    it('désigne le fichier, la couche et les carreaux à dessiner', () => {
        expect(FRANCE).toMatchObject({ file: 'carroyage_national.pmtiles', layer: 'carroyage_national', antialias: true });
        expect(FRANCE.filter).toEqual(gridFilterExpression(2020, 2020, gridTiles(ZONE_FRANCE, null)));
        expect(BRETAGNE_HABITAT).toMatchObject({ file: 'carroyage_lea.pmtiles', layer: 'carroyage_lea' });
        expect(BRETAGNE_HABITAT.filter).toEqual(gridFilterExpression(2020, 2020, gridTiles('REGION_53', 'habitat', { scale: 'DEPART', landIds: [] })));
    });

    it('change d’identité avec le fichier, la zone ou la destination, pas avec la période', () => {
        const keys = [FRANCE, cellsOf(ZONE_HEXAGONE, null), cellsOf(ZONE_FRANCE, 'habitat'), cellsOf('REGION_53', null), BRETAGNE_HABITAT].map(({ key }) => key);

        expect(new Set(keys).size).toBe(keys.length);
        expect(consoCells({ zone: ZONE_FRANCE, displayed: { scale: 'DEPART', landIds: [] }, covered: true, destination: null, period: { startYear: 2011, endYear: 2024 }, periodText: '', describeValue: () => '' }).key).toBe(
            FRANCE.key,
        );
    });

    it('colore par paliers, les bornes étant converties en m²', () => {
        const expression = cellColorExpression(FRANCE) as unknown[];
        expect(expression[0]).toBe('step');
        expect(expression[1]).toEqual(gridSumExpression(2020, 2020, TOTAL));
        const [first, second, third, fourth, last] = destinationPalette('total');
        expect(expression.slice(2)).toEqual([first, 1000, second, 5000, third, 10000, fourth, 50000, last]);
    });

    it('colore une destination avec les paliers du total, appliqués à ses propres colonnes', () => {
        const total = cellColorExpression(FRANCE) as unknown[];
        const habitat = cellColorExpression(BRETAGNE_HABITAT) as unknown[];

        expect(habitat[1]).toEqual(gridSumExpression(2020, 2020, HABITAT_IN_LEA));
        expect(habitat.slice(2)).toEqual(total.slice(2));
    });

    it('estompe les carreaux hors de la classe mise en avant', () => {
        const sum = gridSumExpression(2020, 2020, TOTAL);
        expect(cellOpacityExpression(FRANCE, null, 0.1)).toBe(1);
        expect(cellOpacityExpression(FRANCE, 0, 0.1)).toEqual(['case', ['all', ['<', sum, 1000]], 1, 0.1]);
        expect(cellOpacityExpression(FRANCE, 2, 0.1)).toEqual(['case', ['all', ['>=', sum, 5000], ['<', sum, 10000]], 1, 0.1]);
        expect(cellOpacityExpression(FRANCE, 4, 0.1)).toEqual(['case', ['all', ['>=', sum, 50000]], 1, 0.1]);
    });

    it('estompe une destination d’après ses propres colonnes', () => {
        const sum = gridSumExpression(2020, 2020, HABITAT_IN_LEA);
        expect(cellOpacityExpression(BRETAGNE_HABITAT, 4, 0.1)).toEqual(['case', ['all', ['>=', sum, 50000]], 1, 0.1]);
    });

    it('lit un carreau : son nom, sa valeur sur la période et sa classe', () => {
        expect(FRANCE.read({ conso_2020: 12500, conso_2021: 99999 })).toEqual({ name: 'Carreau de 1 km × 1 km', valueText: '1.25 ha, 1 km', classIndex: 3 });
        expect(FRANCE.read({ resolution_km: 5, conso_2020: 500 })).toEqual({ name: 'Bloc de 5 km × 5 km', valueText: '0.05 ha, 5 km', classIndex: 0 });
        expect(BRETAGNE_HABITAT.read({ conso_2020: 99999, conso_2020_habitat: 5000 })).toMatchObject({ valueText: '0.5 ha, 1 km', classIndex: 2 });
        expect(FRANCE.texts.empty).toBe('null ha, 1 km');
    });

    it('dit ce qui manque : le fichier national, celui d’une destination, ou une zone hors du carroyage', () => {
        expect(FRANCE.texts.outside).toBeNull();
        expect(cellsOf('REGION_01', null, false).texts.outside).toBe("Les données carroyées ne couvrent que l'Hexagone et la Corse.");
        expect(FRANCE.texts.missing).toMatch(/^Les données carroyées ne sont pas encore disponibles pour la France entière : choisissez une région/);
        expect(cellsOf(ZONE_FRANCE, 'habitat').texts.missing).toMatch(/^Les données carroyées de cette destination ne sont pas encore disponibles pour la France entière : choisissez « Toutes »/);
        expect(BRETAGNE_HABITAT.texts.missing).toBe("Les données carroyées n'ont pas pu être chargées.");
    });

    it('dit ses carreaux et sa période à l’image exportée et aux lecteurs d’écran', () => {
        expect(FRANCE.texts).toMatchObject({ caption: 'carreaux de 1 km × 1 km · en 2020', spoken: 'par carreau de 1 km × 1 km en 2020', loading: 'Chargement des carreaux…' });
    });
});

describe('gridTiles', () => {
    it('utilise le fichier allégé pour la France entière et l’Hexagone', () => {
        expect(gridTiles(ZONE_FRANCE, null)).toEqual({
            file: 'carroyage_national.pmtiles',
            layer: 'carroyage_national',
            national: true,
            yearSuffix: '',
            territoryFilter: null,
        });
        const hexagone = gridTiles(ZONE_HEXAGONE, null);
        expect(hexagone.national).toBe(true);
        // Hexagone : tout sauf la Corse
        expect(hexagone.territoryFilter).toEqual(['!', ['in', '"94"', ['coalesce', ['get', 'REGION'], '']]]);
    });

    it('filtre le fichier des diagnostics sur le territoire affiché', () => {
        const tiles = gridTiles('DEPART_35', null, { scale: 'COMM', landIds: ['35238'] });
        expect(tiles.file).toBe('carroyage_lea.pmtiles');
        expect(tiles.national).toBe(false);
        expect(tiles.yearSuffix).toBe('');
        expect(tiles.territoryFilter).toEqual(['in', '"35"', ['coalesce', ['get', 'DEPART'], '']]);
    });

    it('retient les carreaux des EPCI dessinés, qui peuvent déborder du territoire', () => {
        const tiles = gridTiles('DEPART_35', null, { scale: 'EPCI', landIds: ['243500139', '243500741'] });
        expect(tiles.territoryFilter).toEqual([
            'any',
            ['in', '"243500139"', ['coalesce', ['get', 'EPCI'], '']],
            ['in', '"243500741"', ['coalesce', ['get', 'EPCI'], '']],
        ]);
    });

    it('ne dessine que les carreaux consommés sur la période', () => {
        const tiles = gridTiles('REGION_53', null);
        expect(gridFilterExpression(2020, 2020, tiles)).toEqual(['all', ['>', gridSumExpression(2020, 2020, TOTAL), 0], tiles.territoryFilter]);
        expect(gridFilterExpression(2020, 2020, gridTiles(ZONE_FRANCE, null))).toEqual(['all', ['>', gridSumExpression(2020, 2020, TOTAL), 0]]);
    });

    describe('par destination', () => {
        it.each([ZONE_FRANCE, ZONE_HEXAGONE])('lit pour la zone %s le fichier de la destination, dont les attributs sont ceux du total', (zone) => {
            expect(DESTINATIONS.map((destination) => gridTiles(zone, destination)).map(({ file, layer, national, yearSuffix }) => ({ file, layer, national, yearSuffix }))).toEqual([
                { file: 'carroyage_national_habitat.pmtiles', layer: 'carroyage_national_habitat', national: true, yearSuffix: '' },
                { file: 'carroyage_national_activite.pmtiles', layer: 'carroyage_national_activite', national: true, yearSuffix: '' },
                { file: 'carroyage_national_mixte.pmtiles', layer: 'carroyage_national_mixte', national: true, yearSuffix: '' },
                { file: 'carroyage_national_route.pmtiles', layer: 'carroyage_national_route', national: true, yearSuffix: '' },
                { file: 'carroyage_national_ferroviaire.pmtiles', layer: 'carroyage_national_ferroviaire', national: true, yearSuffix: '' },
                { file: 'carroyage_national_inconnu.pmtiles', layer: 'carroyage_national_inconnu', national: true, yearSuffix: '' },
            ]);
        });

        it('garde pour l’Hexagone le filtre du fichier total : les régions d’un bloc y sont les mêmes', () => {
            DESTINATIONS.forEach((destination) => expect(gridTiles(ZONE_HEXAGONE, destination).territoryFilter).toEqual(gridTiles(ZONE_HEXAGONE, null).territoryFilter));
            DESTINATIONS.forEach((destination) => expect(gridTiles(ZONE_FRANCE, destination).territoryFilter).toBeNull());
        });

        it.each(['REGION_53', 'DEPART_35', 'EPCI_243500139'])('lit pour la zone %s le fichier des diagnostics, par le suffixe de ses attributs', (zone) => {
            const displayed = { scale: 'COMM', landIds: ['35238'] };

            expect(DESTINATIONS.map((destination) => gridTiles(zone, destination, displayed)).map(({ file, layer, national, yearSuffix }) => ({ file, layer, national, yearSuffix }))).toEqual(
                ['_habitat', '_activite', '_mixte', '_route', '_ferroviaire', '_inconnu'].map((yearSuffix) => ({
                    file: 'carroyage_lea.pmtiles',
                    layer: 'carroyage_lea',
                    national: false,
                    yearSuffix,
                })),
            );
            DESTINATIONS.forEach((destination) => expect(gridTiles(zone, destination, displayed).territoryFilter).toEqual(gridTiles(zone, null, displayed).territoryFilter));
        });

        it('ne dessine que les carreaux où la destination est consommée sur la période', () => {
            const region = gridTiles('REGION_53', 'route');
            expect(gridFilterExpression(2020, 2021, region)).toEqual([
                'all',
                ['>', ['+', 0, ['coalesce', ['get', 'conso_2020_route'], 0], ['coalesce', ['get', 'conso_2021_route'], 0]], 0],
                region.territoryFilter,
            ]);
            // À l'échelle du pays, le fichier de la destination porte les attributs sans suffixe
            expect(gridFilterExpression(2020, 2020, gridTiles(ZONE_FRANCE, 'route'))).toEqual(['all', ['>', ['+', 0, ['coalesce', ['get', 'conso_2020'], 0]], 0]]);
        });
    });
});

describe('géométries', () => {
    it('couvre l’Hexagone et la Corse, pas l’outre-mer', () => {
        expect(isInGridCoverage('HEXAGONE')).toBe(true);
        expect(isInGridCoverage('CORSE')).toBe(true);
        expect(isInGridCoverage('01')).toBe(false);
    });

    it('convertit le Web Mercator en longitude et latitude', () => {
        expect(mercatorToLngLat([0, 0])).toEqual([0, 0]);
        // Rennes : 1,6778° O, 48,1173° N
        const [lng, lat] = mercatorToLngLat([-186771.8, 6126391.6]);
        expect(lng).toBeCloseTo(-1.6778, 3);
        expect(lat).toBeCloseTo(48.1173, 3);
    });

    it('convertit un fond de carte et calcule son emprise', () => {
        const feature = (coordinates: unknown, type = 'Polygon') => ({ type: 'Feature' as const, properties: { land_id: 'a' }, geometry: { type, coordinates } });
        const { collection, bounds } = toLngLatCollection([
            feature([[[0, 0], [111319.49, 0], [111319.49, 111325.14], [0, 0]]]),
            feature([[[[-111319.49, -111325.14], [0, 0], [0, -111325.14], [-111319.49, -111325.14]]]], 'MultiPolygon'),
        ]);
        expect(collection.features).toHaveLength(2);
        expect(collection.features[0].properties).toEqual({ land_id: 'a' });
        expect(bounds?.[0][0]).toBeCloseTo(-1, 3);
        expect(bounds?.[0][1]).toBeCloseTo(-1, 3);
        expect(bounds?.[1][0]).toBeCloseTo(1, 3);
        expect(bounds?.[1][1]).toBeCloseTo(1, 3);
        expect(toLngLatCollection([]).bounds).toBeNull();
    });
});

describe('limites administratives', () => {
    it('allège le trait quand la maille s’affine, et ne garde le liseré que tant qu’il ne couvre pas les carreaux', () => {
        const widths = ['REGION', 'DEPART', 'EPCI', 'COMM'].map((scale) => landBorderStyle(scale).width);
        expect(widths).toEqual([...widths].sort((a, b) => b - a));
        expect(new Set(widths).size).toBe(4);
        expect(['REGION', 'DEPART', 'EPCI'].map((scale) => landBorderStyle(scale).halo)).toEqual([true, true, true]);
        expect(landBorderStyle('COMM').halo).toBe(false);
    });

    it('trace une maille inconnue comme des EPCI', () => {
        expect(landBorderStyle('SCOT')).toEqual(landBorderStyle('EPCI'));
    });

    it('épaissit le trait avec le zoom', () => {
        expect(lineWidthExpression(1)).toEqual(['interpolate', ['linear'], ['zoom'], 4, 1, 9, 1.6]);
    });

    it('amincit le trait des EPCI sous le zoom du pays, où ils couvriraient les mailles, et le laisse tel quel au-dessus', () => {
        const { width, thinBelow } = landBorderStyle('EPCI');
        const [, , , fromZoom, thin, atZoom, regular, closeZoom, close] = lineWidthExpression(width, thinBelow) as unknown as number[];

        expect([fromZoom, atZoom, closeZoom]).toEqual([3.5, 5, 9]);
        expect(thin).toBeCloseTo(0.36, 5);
        // À ce zoom et au-delà, l'épaisseur est celle du trait sans amincissement
        expect(regular).toBeCloseTo(width * 1.12, 5);
        expect(close).toBeCloseTo(width * 1.6, 5);
        expect(['REGION', 'DEPART', 'COMM'].map((scale) => landBorderStyle(scale).thinBelow)).toEqual([undefined, undefined, undefined]);
    });

    it('efface le liseré d’un trait aminci, et n’en donne pas à une maille qui s’en passe', () => {
        expect(haloOpacityExpression(landBorderStyle('DEPART'))).toBe(0.85);
        expect(haloOpacityExpression(landBorderStyle('EPCI'))).toEqual(['interpolate', ['linear'], ['zoom'], 4, 0, 5, 0.85]);
        expect(haloOpacityExpression(landBorderStyle('COMM'))).toBe(0);
    });
});

describe('ligne de séparation de l’outre-mer', () => {
    it('convertit la polyligne du fond en longitudes et latitudes', () => {
        const line = separationLine([
            [0, 0],
            [111319.49079327357, 0],
        ]);

        expect(line.geometry).toMatchObject({ type: 'LineString' });
        const [[west, south], [east]] = (line.geometry as GeoJSON.LineString).coordinates;
        expect([west, south]).toEqual([0, expect.closeTo(0, 6)]);
        expect(east).toBeCloseTo(1, 6);
    });
});
