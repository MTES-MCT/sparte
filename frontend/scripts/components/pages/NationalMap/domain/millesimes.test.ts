import type { Millesime } from '@services/types/land';
import {
    EXPLAIN_LABEL,
    countWithoutFlux,
    departmentsMillesimeReading,
    landsMillesimeReading,
    millesimeExplanation,
    millesimeNumber,
    millesimeReading,
    millesimeRows,
    shownOfDepartments,
    shownOfLand,
    yearsRange,
} from './millesimes';

// Territoire d'une réponse « indicateurs d'artificialisation » : son dernier millésime et, par
// défaut, celui d'avant
const land = (index: number, year: number, previousYear: number | null = year - 3) => ({
    artif_years: [year],
    artif_index: index,
    artif_net_years_old: previousYear === null ? [] : [previousYear],
    artif_net_years_new: previousYear === null ? [] : [year],
    artif_net_index_old: previousYear === null ? null : index - 1,
    artif_net_index_new: previousYear === null ? null : index,
});

const RHONE = land(2, 2020, 2017);
const ARDECHE = land(2, 2023, 2020);
const AIN = land(2, 2021, 2018);

const millesime = (departement: string, index: number, year: number, departement_name?: string): Millesime => ({ departement, index, year, departement_name });

describe('yearsRange et millesimeNumber', () => {
    it("écrit une année, ou l'étendue de plusieurs", () => {
        expect(yearsRange([2020])).toBe('2020');
        expect(yearsRange([2023, 2020, 2021, 2020])).toBe('2020 à 2023');
        expect(yearsRange([])).toBe('');
    });

    it("désigne un millésime par son index, suivi de ses années", () => {
        expect(millesimeNumber({ index: 2, years: [2020] })).toBe('n°2 (2020)');
        expect(millesimeNumber({ index: 2, years: [2020, 2023] })).toBe('n°2 (2020 à 2023)');
        expect(millesimeNumber({ index: 2, years: [] })).toBe('n°2');
        expect(millesimeNumber({ index: null, years: [2020] })).toBe('2020');
    });
});

describe("lecture d'un stock", () => {
    it('un seul département : le millésime et son année', () => {
        expect(landsMillesimeReading([RHONE], 'stock')).toEqual({
            kind: 'stock',
            title: 'Millésime n°2',
            detail: '2020',
            short: 'Millésime n°2 (2020)',
            long: 'au millésime n°2 (2020)',
            varies: false,
            mixed: false,
        });
    });

    it('plusieurs départements aux années différentes : le même index, une plage', () => {
        expect(landsMillesimeReading([RHONE, ARDECHE, AIN], 'stock')).toEqual({
            kind: 'stock',
            title: 'Millésime n°2',
            detail: '2020 à 2023',
            short: 'Millésime n°2 (2020 à 2023)',
            long: 'au millésime n°2 (2020 à 2023)',
            varies: true,
            mixed: false,
        });
    });

    it("un territoire à cheval sur des départements porte plusieurs années à lui seul", () => {
        const region = { artif_years: [2020, 2021, 2023], artif_index: 2 };
        expect(landsMillesimeReading([region], 'stock')).toMatchObject({ short: 'Millésime n°2 (2020 à 2023)', varies: true });
    });

    it("le dernier millésime n'a pas le même index partout : la carte montre celui de chaque territoire", () => {
        const reading = landsMillesimeReading([RHONE, AIN, land(3, 2024, 2021), land(1, 2022, null)], 'stock');
        expect(reading).toEqual({
            kind: 'stock',
            title: 'Dernier millésime de chaque territoire',
            detail: 'n°1 (2022) ou n°2 (2020 à 2021) ou n°3 (2024)',
            short: 'Dernier millésime de chaque territoire : n°1 (2022) ou n°2 (2020 à 2021) ou n°3 (2024)',
            long: 'au dernier millésime de chaque territoire : n°1 (2022) ou n°2 (2020 à 2021) ou n°3 (2024)',
            varies: true,
            mixed: true,
        });
    });

    it("sans index dans la réponse : les années seules, sans numéro inventé", () => {
        expect(landsMillesimeReading([{ artif_years: [2020] }], 'stock')).toEqual({
            kind: 'stock',
            title: 'Dernier millésime',
            detail: '2020',
            short: 'Dernier millésime (2020)',
            long: 'au dernier millésime (2020)',
            varies: false,
            mixed: false,
        });
    });

    it('aucun territoire renseigné : rien à lire', () => {
        expect(landsMillesimeReading([], 'stock')).toBeNull();
        expect(landsMillesimeReading([{ artif_years: [], artif_index: null, artif_net_years_old: [], artif_net_years_new: [] }], 'stock')).toBeNull();
    });
});

describe("lecture d'un flux", () => {
    it('un seul département : les deux millésimes et leurs années', () => {
        expect(landsMillesimeReading([RHONE], 'flux')).toEqual({
            kind: 'flux',
            title: 'Millésimes n°1 et n°2',
            detail: '2017 puis 2020',
            short: 'Millésimes n°1 (2017) et n°2 (2020)',
            long: 'entre le millésime n°1 (2017) et le millésime n°2 (2020)',
            varies: false,
            mixed: false,
        });
    });

    it('plusieurs départements : une plage par millésime', () => {
        expect(landsMillesimeReading([RHONE, ARDECHE, AIN], 'flux')).toEqual({
            kind: 'flux',
            title: 'Millésimes n°1 et n°2',
            detail: '2017 à 2020 puis 2020 à 2023',
            short: 'Millésimes n°1 (2017 à 2020) et n°2 (2020 à 2023)',
            long: 'entre le millésime n°1 (2017 à 2020) et le millésime n°2 (2020 à 2023)',
            varies: true,
            mixed: false,
        });
    });

    it("les deux derniers millésimes n'ont pas les mêmes index partout", () => {
        expect(landsMillesimeReading([RHONE, land(3, 2024, 2021)], 'flux')).toEqual({
            kind: 'flux',
            title: 'Deux derniers millésimes de chaque territoire',
            detail: 'n°1 (2017) et n°2 (2020), ou n°2 (2021) et n°3 (2024)',
            short: 'Deux derniers millésimes de chaque territoire : n°1 (2017) et n°2 (2020), ou n°2 (2021) et n°3 (2024)',
            long: 'entre les deux derniers millésimes de chaque territoire : n°1 (2017) et n°2 (2020), ou n°2 (2021) et n°3 (2024)',
            varies: true,
            mixed: true,
        });
    });

    it("les territoires sans deuxième millésime ne comptent pas, et sont dénombrés", () => {
        const single = land(1, 2022, null);
        expect(landsMillesimeReading([RHONE, single], 'flux')).toMatchObject({ short: 'Millésimes n°1 (2017) et n°2 (2020)' });
        expect(landsMillesimeReading([single], 'flux')).toBeNull();
        expect(countWithoutFlux([RHONE, single, { artif_years: [] }])).toBe(1);
    });

    it("sans index dans la réponse : les années seules", () => {
        expect(landsMillesimeReading([{ artif_net_years_old: [2017], artif_net_years_new: [2020] }], 'flux')).toEqual({
            kind: 'flux',
            title: 'Deux derniers millésimes',
            detail: '2017 puis 2020',
            short: 'Deux derniers millésimes (2017 puis 2020)',
            long: 'entre les deux derniers millésimes (2017 puis 2020)',
            varies: false,
            mixed: false,
        });
    });

    it("lit un jeu de millésimes qui ne porte que ceux du flux (valeurs par commune)", () => {
        const yearSet = { artif_net_years_old: [2018], artif_net_years_new: [2021], artif_net_index_old: 1, artif_net_index_new: 2 };
        expect(shownOfLand(yearSet)).toEqual({ last: null, flux: { previous: { index: 1, years: [2018] }, last: { index: 2, years: [2021] } } });
        expect(landsMillesimeReading([yearSet], 'stock')).toBeNull();
        expect(landsMillesimeReading([yearSet], 'flux')?.long).toBe('entre le millésime n°1 (2018) et le millésime n°2 (2021)');
    });
});

describe("lecture d'après les millésimes de la fiche d'un territoire", () => {
    const REGION = [millesime('69', 1, 2017), millesime('69', 2, 2020), millesime('07', 2, 2023), millesime('07', 1, 2020), millesime('01', 1, 2018), millesime('01', 2, 2021)];

    it('prend le dernier millésime de chaque département, et celui qui le précède', () => {
        const span = (index: number, year: number) => ({ index, years: [year] });
        expect(shownOfDepartments(REGION)).toEqual([
            { last: span(2, 2020), flux: { previous: span(1, 2017), last: span(2, 2020) } },
            { last: span(2, 2023), flux: { previous: span(1, 2020), last: span(2, 2023) } },
            { last: span(2, 2021), flux: { previous: span(1, 2018), last: span(2, 2021) } },
        ]);
        expect(shownOfDepartments([millesime('976', 1, 2023)])).toEqual([{ last: span(1, 2023), flux: null }]);
    });

    it('rend la même lecture que les territoires de la carte', () => {
        expect(departmentsMillesimeReading(REGION, 'stock')).toEqual(landsMillesimeReading([RHONE, ARDECHE, AIN], 'stock'));
        expect(departmentsMillesimeReading(REGION, 'flux')).toEqual(landsMillesimeReading([RHONE, ARDECHE, AIN], 'flux'));
    });

    it("un département à trois millésimes à côté d'un département à un seul", () => {
        const millesimes = [millesime('32', 1, 2016), millesime('32', 2, 2019), millesime('32', 3, 2022), millesime('976', 1, 2023)];
        expect(departmentsMillesimeReading(millesimes, 'stock')?.detail).toBe('n°1 (2023) ou n°3 (2022)');
        expect(departmentsMillesimeReading(millesimes, 'flux')?.long).toBe('entre le millésime n°2 (2019) et le millésime n°3 (2022)');
    });

    it('sans millésime : rien à lire', () => {
        expect(departmentsMillesimeReading([], 'stock')).toBeNull();
        expect(millesimeReading([], 'flux')).toBeNull();
    });
});

describe('lignes du tableau des années par département', () => {
    const FRANCE = [millesime('971', 2, 2022, 'Guadeloupe'), millesime('69', 2, 2020, 'Rhône'), millesime('01', 2, 2021, 'Ain'), millesime('69', 1, 2017, 'Rhône'), millesime('2A', 1, 2019, 'Corse-du-Sud')];

    it("trie par index, par année, puis par nom de département, sans modifier la liste reçue", () => {
        const before = [...FRANCE];
        expect(millesimeRows(FRANCE).map(({ index, year, departement }) => `${index}-${year}-${departement}`)).toEqual(['1-2017-69', '1-2019-2A', '2-2020-69', '2-2021-01', '2-2022-971']);
        expect(FRANCE).toEqual(before);
    });

    it("l'Hexagone laisse de côté les départements d'outre-mer, pas la Corse", () => {
        expect(millesimeRows(FRANCE, { hexagoneOnly: true }).map(({ departement }) => departement)).toEqual(['69', '2A', '69', '01']);
    });
});

describe('explication des millésimes', () => {
    const RHONE_ONLY = [millesime('69', 1, 2017, 'Rhône'), millesime('69', 2, 2020, 'Rhône')];
    const paragraphsOf = (input: Parameters<typeof millesimeExplanation>[0]): string[] => millesimeExplanation(input)[1].paragraphs;

    it('explique d’abord pourquoi un numéro, puis ce que la carte montre', () => {
        const sections = millesimeExplanation({ kind: 'stock', reading: landsMillesimeReading([RHONE], 'stock'), zoneName: 'Rhône', zoneMillesimes: RHONE_ONLY });

        expect(sections.map(({ title }) => title)).toEqual(['Pourquoi un numéro plutôt qu’une année ?', 'Ce que montre cette carte']);
        expect(sections[0].paragraphs.join(' ')).toContain('le millésime n°1 est le premier disponible pour un département');
        expect(sections[1].paragraphs).toEqual(['Sur cette carte, chaque territoire affiché est représenté au millésime n°2 (2020).']);
        expect(EXPLAIN_LABEL).toBe('Qu’est-ce qu’un millésime ?');
    });

    it('met en garde quand les années diffèrent, et dit qu’un flux n’a pas partout la même durée', () => {
        const zoneMillesimes = [...RHONE_ONLY, millesime('07', 1, 2020), millesime('07', 2, 2023), millesime('01', 1, 2018), millesime('01', 2, 2021)];
        const stock = paragraphsOf({ kind: 'stock', reading: landsMillesimeReading([RHONE, ARDECHE, AIN], 'stock'), zoneName: 'la région', zoneMillesimes });
        const flux = paragraphsOf({ kind: 'flux', reading: landsMillesimeReading([RHONE, ARDECHE, AIN], 'flux'), zoneName: 'la région', zoneMillesimes });

        expect(stock).toEqual([
            'Sur cette carte, chaque territoire affiché est représenté au millésime n°2 (2020 à 2023).',
            'Les valeurs de deux territoires ne portent pas forcément sur la même année : elles ne sont pas strictement comparables.',
        ]);
        expect(flux[0]).toBe('Sur cette carte, l’évolution de chaque territoire affiché est mesurée entre le millésime n°1 (2017 à 2020) et le millésime n°2 (2020 à 2023).');
        expect(flux[1]).toContain('ni sur la même durée');
    });

    it('dit que des territoires affichés débordent de la zone quand leurs années ne sont pas celles de son tableau', () => {
        const paragraphs = paragraphsOf({ kind: 'stock', reading: landsMillesimeReading([RHONE, AIN], 'stock'), zoneName: 'Rhône', zoneMillesimes: RHONE_ONLY });

        expect(paragraphs[2]).toMatch(/^Certains territoires affichés débordent de la zone \(Rhône\) sur un département voisin/);
    });

    it('dit que le dernier millésime n’a pas le même numéro partout, et que l’image de l’IGN a son calendrier', () => {
        const lands = [RHONE, land(3, 2024, 2021)];
        const zoneMillesimes = [...RHONE_ONLY, millesime('32', 1, 2018), millesime('32', 2, 2021), millesime('32', 3, 2024)];
        const paragraphs = paragraphsOf({ kind: 'stock', reading: landsMillesimeReading(lands, 'stock'), zoneName: 'la zone', zoneMillesimes, image: true });

        expect(paragraphs[0]).toBe('Sur cette carte, chaque territoire affiché est représenté au dernier millésime de chaque territoire : n°2 (2020) ou n°3 (2024).');
        expect(paragraphs[1]).toMatch(/^Tous les départements n’ont pas le même nombre de millésimes/);
        expect(paragraphs[paragraphs.length - 1]).toMatch(/^L’image des sols est publiée par l’IGN/);
    });

    it('dit pourquoi il n’y a rien à lire', () => {
        expect(paragraphsOf({ kind: 'flux', reading: null, zoneName: 'Mayotte', zoneMillesimes: [] })).toEqual(['Aucun territoire affiché n’a deux millésimes : il en faut deux pour mesurer une évolution.']);
        expect(paragraphsOf({ kind: 'stock', reading: null, zoneName: 'Mayotte', zoneMillesimes: [] })).toEqual(['Aucun territoire affiché n’est entièrement couvert par un millésime de l’OCS GE.']);
    });
});
