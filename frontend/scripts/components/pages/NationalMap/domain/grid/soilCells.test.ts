import { cellColorExpression, hasCode } from './cells';
import { SOIL_BOUNDS_PCT, SOIL_CLASSES, soilCellText, soilCells, soilClassIndex, soilPart, soilZoneFilter } from './soilCells';

// Les nombres sont formatés avec des espaces insécables, étroites pour les milliers
const plain = (text: string): string => text.replace(/[\u00a0\u202f]/g, ' ');

const PLACEMENT = ['coalesce', ['get', 'placement'], ''];
const AT_REAL_POSITION = ['!=', PLACEMENT, 'cartouche'];
const CARRIES_EPCI = ['<=', ['coalesce', ['get', 'resolution_m'], 0], 1000];

const BY_DEPARTMENT = { scale: 'DEPART', landIds: ['22', '29', '35', '56'], departments: [] as string[] };

describe('classes de la part artificialisée', () => {
    it('va du vert au rouge en cinq classes, aux bornes 10, 20, 35 et 50 %', () => {
        expect(SOIL_BOUNDS_PCT).toEqual([10, 20, 35, 50]);
        expect(SOIL_CLASSES.map(({ name, color }) => [name, color])).toEqual([
            ['Moins de 10 %', '#BFE6B0'],
            ['De 10 à 20 %', '#DCD487'],
            ['De 20 à 35 %', '#EDB062'],
            ['De 35 à 50 %', '#E67A42'],
            ['50 % et plus', '#CF2A1B'],
        ]);
        expect(SOIL_CLASSES.map(({ from, to }) => [from, to])).toEqual([[undefined, 10], [10, 20], [20, 35], [35, 50], [50, undefined]]);
    });

    it('range une part égale à une borne dans la classe supérieure, comme le dit son libellé', () => {
        expect([0, 9, 10, 19, 20, 34, 35, 49, 50, 100].map(soilClassIndex)).toEqual([0, 0, 1, 1, 2, 2, 3, 3, 4, 4]);
    });
});

describe('mailles retenues pour une zone', () => {
    it('France entière : tout sauf les mailles d’outre-mer à leur position réelle', () => {
        expect(soilZoneFilter('FRANCE', { scale: 'EPCI', landIds: ['243500139'], departments: [] })).toEqual(['!=', PLACEMENT, 'reel']);
    });

    it('Hexagone : ni la Corse, ni l’outre-mer, déplacé ou non', () => {
        expect(soilZoneFilter('HEXAGONE', { scale: 'REGION', landIds: [], departments: [] })).toEqual(['all', ['==', PLACEMENT, ''], ['!', hasCode('REGION', '94')]]);
    });

    it('région ou département : ses mailles à leur position réelle', () => {
        expect(soilZoneFilter('REGION_53', BY_DEPARTMENT)).toEqual(['all', AT_REAL_POSITION, hasCode('REGION', '53')]);
        expect(soilZoneFilter('DEPART_35', { scale: 'COMM', landIds: ['35238'], departments: [] })).toEqual(['all', AT_REAL_POSITION, hasCode('DEPART', '35')]);
        expect(soilZoneFilter('REGION_01', { scale: 'DEPART', landIds: ['971'], departments: [] })).toEqual(['all', AT_REAL_POSITION, hasCode('REGION', '01')]);
    });

    it('département par EPCI : les mailles des EPCI dessinés, qui peuvent déborder ; celles du département pour les grandes mailles, sans EPCI', () => {
        expect(soilZoneFilter('DEPART_35', { scale: 'EPCI', landIds: ['243500139', '200070662'], departments: [] })).toEqual([
            'all',
            AT_REAL_POSITION,
            ['case', CARRIES_EPCI, ['any', hasCode('EPCI', '243500139'), hasCode('EPCI', '200070662')], hasCode('DEPART', '35')],
        ]);
    });

    it('EPCI : ses mailles ; celles de son département pour les grandes mailles, sans EPCI', () => {
        expect(soilZoneFilter('EPCI_243500139', { scale: 'COMM', landIds: ['35238'], departments: ['35'] })).toEqual([
            'all',
            AT_REAL_POSITION,
            ['case', CARRIES_EPCI, hasCode('EPCI', '243500139'), hasCode('DEPART', '35')],
        ]);
    });

    it('EPCI à cheval sur deux départements : les grandes mailles de l’un ou de l’autre', () => {
        const [, , byResolution] = soilZoneFilter('EPCI_200070662', { scale: 'COMM', landIds: [], departments: ['35', '56'] }) as unknown[];

        expect(byResolution).toEqual(['case', CARRIES_EPCI, hasCode('EPCI', '200070662'), ['any', hasCode('DEPART', '35'), hasCode('DEPART', '56')]]);
    });

    it('EPCI dont le département n’est pas connu : aucune grande maille', () => {
        const [, , byResolution] = soilZoneFilter('EPCI_243500139', { scale: 'COMM', landIds: [], departments: [] }) as unknown[];

        expect(byResolution).toEqual(['case', CARRIES_EPCI, hasCode('EPCI', '243500139'), ['literal', false]]);
    });
});

describe('valeur d’une maille', () => {
    it('lit la part artificialisée, zéro compris', () => {
        expect(soilPart({ part_artif: 23 })).toBe(23);
        expect(soilPart({ part_artif: 0 })).toBe(0);
        expect(soilPart({})).toBeNull();
    });

    it('dit le côté de la maille, sa part et son millésime', () => {
        expect(soilCellText({ part_artif: 23, resolution_m: 1000, annee_min: 2021, annee_max: 2021 })).toBe('Maille de 1 km × 1 km : 23 % de sols artificialisés (millésime 2021)');
        expect(soilCellText({ part_artif: 0, resolution_m: 250, annee_min: 2022, annee_max: 2022 })).toBe('Maille de 250 m × 250 m : 0 % de sols artificialisés (millésime 2022)');
        expect(plain(soilCellText({ part_artif: 100, resolution_m: 5000, annee_min: 2019, annee_max: 2019 }))).toBe('Maille de 5 km × 5 km : 100 % de sols artificialisés (millésime 2019)');
    });

    it('donne les deux années d’une maille à cheval sur des départements aux millésimes différents', () => {
        expect(soilCellText({ part_artif: 7, resolution_m: 2000, annee_min: 2020, annee_max: 2022 })).toBe('Maille de 2 km × 2 km : 7 % de sols artificialisés (millésimes 2020 et 2022)');
    });

    it('reste lisible quand la tuile ne porte pas tous ses attributs', () => {
        expect(soilCellText({ part_artif: 12 })).toBe('Maille : 12 % de sols artificialisés');
        expect(soilCellText({ resolution_m: 500 })).toBe('Maille de 500 m × 500 m : part artificialisée inconnue');
    });
});

describe('mailles décrites au moteur', () => {
    const CELLS = soilCells('REGION_53', BY_DEPARTMENT);

    it('colore toutes les mailles de la zone par leur part, 0 % compris', () => {
        expect(CELLS.filter).toEqual(soilZoneFilter('REGION_53', BY_DEPARTMENT));
        expect(JSON.stringify(CELLS.filter)).not.toContain('part_artif');
        expect(cellColorExpression(CELLS)).toEqual(['step', ['coalesce', ['get', 'part_artif'], 0], '#BFE6B0', 10, '#DCD487', 20, '#EDB062', 35, '#E67A42', 50, '#CF2A1B']);
    });

    it('lit une maille : le texte de son survol et sa classe', () => {
        expect(CELLS.read({ part_artif: 23, resolution_m: 1000, annee_min: 2021, annee_max: 2021 })).toEqual({
            name: 'Hors des territoires affichés',
            valueText: 'Maille de 1 km × 1 km : 23 % de sols artificialisés (millésime 2021)',
            classIndex: 2,
        });
        expect(CELLS.read({ resolution_m: 1000 }).classIndex).toBeNull();
    });

    it('ne change d’identité qu’avec la zone : la maille des territoires ne recrée pas la source', () => {
        expect(soilCells('REGION_53', { scale: 'EPCI', landIds: ['243500139'], departments: [] }).key).toBe(CELLS.key);
        expect(soilCells('DEPART_35', BY_DEPARTMENT).key).not.toBe(CELLS.key);
    });
});
