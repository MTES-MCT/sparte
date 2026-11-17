import type { Millesime } from '@services/types/land';
import { SOIL_IMAGE_CLASSES } from './soilImage';
import { SOIL_OBJECT_CLASSES, departmentsOfCells, departmentsOfLands, soilObjectReading, soilObjectTiles, soilObjects, soilObjectsFilter } from './soilObjects';

// Les nombres sont formatés avec des espaces insécables, étroites pour les milliers
const plain = (text: string): string => text.replace(/[\u00a0\u202f]/g, ' ');

const MILLESIMES: Millesime[] = [
    { index: 1, year: 2017, departement: '35' },
    { index: 2, year: 2020, departement: '35' },
    { index: 1, year: 2018, departement: '22' },
    { index: 2, year: 2021, departement: '22' },
    { index: 3, year: 2024, departement: '22' },
    { index: 1, year: 2019, departement: '2A' },
];

describe('départements des mailles en vue', () => {
    it('réunit les départements des mailles, sans doublon, triés', () => {
        expect(departmentsOfCells([{ DEPART: '["35"]' }, { DEPART: '["35","22"]' }, { DEPART: '["56"]' }])).toEqual(['22', '35', '56']);
    });

    it('ignore les mailles d’outre-mer déplacées près de l’Hexagone : leurs objets sont ailleurs', () => {
        expect(departmentsOfCells([{ DEPART: '["971"]', placement: 'cartouche' }, { DEPART: '["972"]', placement: 'reel' }, { DEPART: '["29"]' }])).toEqual(['29', '972']);
    });

    it('ignore une liste absente ou illisible', () => {
        expect(departmentsOfCells([{}, { DEPART: 'pas une liste' }, { DEPART: '{"35":1}' }, { DEPART: 35 }, { DEPART: '[35, "44"]' }])).toEqual(['44']);
    });
});

describe('départements à lire quand le fichier des mailles manque', () => {
    const department = (id: string) => ({ land_type: 'DEPART', land_id: id });
    const commune = (id: string) => ({ land_type: 'COMM', land_id: id });
    const epci = (id: string) => ({ land_type: 'EPCI', land_id: id });
    // Une centaine de départements, comme dans la fiche de la nation
    const NATION: Millesime[] = [...Array.from({ length: 95 }, (_, rank) => String(rank + 1).padStart(2, '0')), '971', '972'].map((departement) => ({ index: 1, year: 2020, departement }));

    it('retient, parmi les départements de la zone, ceux des départements dessinés en vue', () => {
        expect(departmentsOfLands('REGION_53')(MILLESIMES, [department('35'), department('56')])).toEqual(['35']);
        expect(departmentsOfLands('FRANCE')(NATION, [department('69'), department('01')])).toEqual(['01', '69']);
    });

    it('lit le département d’une commune dans son code, outre-mer et Corse compris', () => {
        expect(departmentsOfLands('EPCI_243500139')(MILLESIMES, [commune('35238'), commune('35047'), commune('22278')])).toEqual(['22', '35']);
        expect(departmentsOfLands('DEPART_2A')(MILLESIMES, [commune('2A004')])).toEqual(['2A']);
        expect(departmentsOfLands('REGION_01')(NATION, [commune('97105')])).toEqual(['971']);
    });

    it('ignore, sur une zone nationale, les territoires d’outre-mer dessinés près de l’Hexagone', () => {
        expect(departmentsOfLands('FRANCE')(NATION, [department('971'), department('33')])).toEqual(['33']);
        expect(departmentsOfLands('REGION_01')(NATION, [department('971')])).toEqual(['971']);
    });

    it('lit tous les départements de la zone quand les territoires en vue ne disent pas le leur', () => {
        expect(departmentsOfLands('REGION_53')(MILLESIMES, [epci('243500139')])).toEqual(['22', '2A', '35']);
        expect(departmentsOfLands('REGION_53')(MILLESIMES, [])).toEqual(['22', '2A', '35']);
    });

    it('n’en lit aucun quand ils seraient trop nombreux : la France entière par région ou par EPCI', () => {
        expect(departmentsOfLands('FRANCE')(NATION, [epci('200046977')])).toEqual([]);
        expect(departmentsOfLands('FRANCE')(NATION, [{ land_type: 'REGION', land_id: '84' }])).toEqual([]);
    });

    it('ne lit rien tant que les millésimes de la zone ne sont pas connus', () => {
        expect(departmentsOfLands('REGION_53')([], [department('35')])).toEqual([]);
    });
});

describe('fichiers des objets', () => {
    it('lit chaque département à son dernier millésime, sous le nom des tuiles des diagnostics', () => {
        expect(soilObjectTiles(MILLESIMES, ['22', '35'])).toEqual([
            { department: '22', file: 'occupation_du_sol_3_22.pmtiles', layer: 'occupation_du_sol_3_22' },
            { department: '35', file: 'occupation_du_sol_2_35.pmtiles', layer: 'occupation_du_sol_2_35' },
        ]);
        expect(soilObjectTiles(MILLESIMES, ['2A'])).toEqual([{ department: '2A', file: 'occupation_du_sol_1_2A.pmtiles', layer: 'occupation_du_sol_1_2A' }]);
    });

    it('ne lit rien pour un département sans millésime, ni tant que les millésimes ne sont pas connus', () => {
        expect(soilObjectTiles(MILLESIMES, ['973', '35']).map(({ department }) => department)).toEqual(['35']);
        expect(soilObjectTiles([], ['35'])).toEqual([]);
        expect(soilObjectTiles(MILLESIMES, [])).toEqual([]);
    });
});

describe('objets retenus pour une zone', () => {
    it('ne restreint pas la France entière ni l’Hexagone', () => {
        expect(soilObjectsFilter('FRANCE', { scale: 'EPCI', landIds: ['243500139'] })).toBeNull();
        expect(soilObjectsFilter('HEXAGONE', { scale: 'DEPART', landIds: [] })).toBeNull();
    });

    it('retient les objets de la région, du département ou de l’EPCI affiché', () => {
        expect(soilObjectsFilter('REGION_53', { scale: 'DEPART', landIds: ['35'] })).toEqual(['==', ['get', 'REGION'], '53']);
        expect(soilObjectsFilter('DEPART_35', { scale: 'COMM', landIds: ['35238'] })).toEqual(['==', ['get', 'DEPART'], '35']);
        expect(soilObjectsFilter('EPCI_243500139', { scale: 'COMM', landIds: ['35238'] })).toEqual(['==', ['get', 'EPCI'], '243500139']);
    });

    it('retient les objets des EPCI dessinés, qui peuvent déborder de la zone, comme pour les mailles', () => {
        expect(soilObjectsFilter('DEPART_35', { scale: 'EPCI', landIds: ['243500139', '200070662'] })).toEqual(['in', ['get', 'EPCI'], ['literal', ['243500139', '200070662']]]);
    });
});

describe('survol d’un objet', () => {
    it('dit sa nature, sa couverture, son usage, sa surface et son millésime', () => {
        const reading = soilObjectReading({ is_artificial: true, code_cs: 'CS1.1.1.1', code_us: 'US5', surface: 4907.92, year: 2020 });

        expect(reading.name).toBe('Sol artificialisé');
        expect(plain(reading.valueText)).toBe('Couverture : zones bâties · usage : résidentiel · 4 908 m² · millésime 2020');
        expect(reading.classIndex).toBe(0);
    });

    it('dit en hectares la surface d’un grand objet non artificialisé', () => {
        const reading = soilObjectReading({ is_artificial: false, code_cs: 'CS2.2.1', code_us: 'US1.1', surface: 4473010.98, year: 2021 });

        expect(reading.name).toBe('Sol non artificialisé');
        expect(plain(reading.valueText)).toBe('Couverture : formations herbacées · usage : agriculture · 447,3 ha · millésime 2021');
        expect(reading.classIndex).toBe(1);
    });

    it('ne répète pas le mot « usage » que portent certains libellés de la nomenclature', () => {
        const usageOf = (code: string): string => soilObjectReading({ is_artificial: true, code_cs: 'CS1.1.1.2', code_us: code }).valueText;

        expect(usageOf('US4.1.1')).toBe('Couverture : zones non bâties · usage : réseaux routiers');
        expect(usageOf('US6.6')).toBe('Couverture : zones non bâties · usage : inconnu');
        expect(usageOf('US6.3')).toBe('Couverture : zones non bâties · usage : aucun');
    });

    it('reste lisible quand la tuile ne porte pas tous ses attributs', () => {
        expect(soilObjectReading({ is_artificial: false }).valueText).toBe('Couverture : inconnue · usage : inconnu');
    });

    it('range les objets dans les deux lignes de la légende', () => {
        expect(SOIL_OBJECT_CLASSES.map(({ name }) => name)).toEqual(['Sol artificialisé', 'Sol non artificialisé']);
    });

    it('donne aux objets la légende de l’image de l’IGN qu’ils remplacent, couleurs comprises', () => {
        expect(SOIL_OBJECT_CLASSES).toEqual(SOIL_IMAGE_CLASSES);
    });
});

describe('objets décrits au moteur', () => {
    const OBJECTS = soilObjects('REGION_53', { scale: 'DEPART', landIds: ['35'] }, { land_type: 'REGION', land_id: '53' });
    const IS_ARTIFICIAL = ['==', ['get', 'is_artificial'], true];

    it('colore les objets comme l’image de l’IGN : artificialisés en rouge, les autres en vert', () => {
        const [artificial, natural] = SOIL_IMAGE_CLASSES.map(({ color }) => color);

        expect(OBJECTS.color).toEqual(['case', IS_ARTIFICIAL, artificial, natural]);
        expect([artificial, natural]).toEqual(['#ff9b93', '#b4ff8d']);
    });

    it('estompe les objets de l’autre nature quand une ligne de la légende est mise en avant', () => {
        expect(OBJECTS.opacity(null, 0.1)).toBe(1);
        expect(OBJECTS.opacity(0, 0.1)).toEqual(['case', ['==', IS_ARTIFICIAL, true], 1, 0.1]);
        expect(OBJECTS.opacity(1, 0.1)).toEqual(['case', ['==', IS_ARTIFICIAL, false], 1, 0.1]);
    });

    it('ne dessine les objets qu’à partir du zoom 13, où une vue fait une dizaine de kilomètres', () => {
        expect(OBJECTS).toMatchObject({ minZoom: 13, maxZoom: 17, land: { land_type: 'REGION', land_id: '53' } });
    });
});
