import type { Millesime } from '@services/types/land';
import { chartScopeOf, millesimesOf } from './ocsgeCharts';

// Ce que les graphiques d'une carte de l'OCS GE lisent de la fiche de leur territoire

const millesime = (index: number, year: number, departement = '35'): Millesime => ({ index, year, departement });

describe('millésimes du territoire des graphiques', () => {
    it('donne l’index du dernier millésime, son année et celle du précédent', () => {
        // La fiche les range du plus récent au plus ancien
        expect(millesimesOf({ has_ocsge: true, millesimes: [millesime(2, 2020), millesime(1, 2017)] })).toEqual({ lastIndex: 2, lastYears: [2020], previousYears: [2017] });
    });

    it('suit un troisième millésime le jour où il arrive', () => {
        const millesimes = [millesime(1, 2017), millesime(2, 2020), millesime(3, 2023)];

        expect(millesimesOf({ has_ocsge: true, millesimes })).toEqual({ lastIndex: 3, lastYears: [2023], previousYears: [2020] });
    });

    it('réunit les années d’un territoire à cheval sur des départements, triées et sans doublon', () => {
        const millesimes = [
            millesime(2, 2021, '22'),
            millesime(1, 2018, '22'),
            millesime(2, 2021, '29'),
            millesime(1, 2018, '29'),
            millesime(2, 2020, '35'),
            millesime(1, 2017, '35'),
            millesime(2, 2022, '56'),
            millesime(1, 2019, '56'),
        ];

        expect(millesimesOf({ has_ocsge: true, millesimes })).toEqual({ lastIndex: 2, lastYears: [2020, 2021, 2022], previousYears: [2017, 2018, 2019] });
    });

    it('ne donne aucune année au millésime précédent d’un territoire qui n’en a qu’un', () => {
        expect(millesimesOf({ has_ocsge: true, millesimes: [millesime(1, 2021)] })).toEqual({ lastIndex: 1, lastYears: [2021], previousYears: [] });
    });

    it('n’en donne aucun pour un territoire que l’OCS GE ne couvre pas entièrement, même s’il a des millésimes', () => {
        // La Guyane : deux millésimes sur une partie du territoire
        expect(millesimesOf({ has_ocsge: false, millesimes: [millesime(2, 2022, '973'), millesime(1, 2018, '973')] })).toBeNull();
    });

    it('n’en donne aucun pour un territoire sans millésime', () => {
        expect(millesimesOf({ has_ocsge: true, millesimes: [] })).toBeNull();
    });
});

describe('territoire que les graphiques décrivent, quand ce n’est pas l’ensemble des territoires affichés', () => {
    const ILLE_ET_VILAINE = { name: 'Ille-et-Vilaine', surface: 683_129 };
    const FRANCE = { name: 'France', surface: 63_764_822 };

    it('ne dit rien quand les territoires affichés couvrent exactement la zone, tous avec des données', () => {
        // Les 332 communes du département
        expect(chartScopeOf(ILLE_ET_VILAINE, { surfaceHa: 683_129, hasMissing: false })).toBeNull();
    });

    it('tient pour égales deux surfaces qui ne diffèrent que par leurs arrondis', () => {
        // Les EPCI de la France entière : 0,007 % de moins que le pays
        expect(chartScopeOf(FRANCE, { surfaceHa: 63_760_442, hasMissing: false })).toBeNull();
        expect(chartScopeOf(ILLE_ET_VILAINE, { surfaceHa: 683_129 * 1.0009, hasMissing: false })).toBeNull();
    });

    it('dit que le graphique s’arrête aux limites de la zone quand des territoires affichés en débordent', () => {
        // Les 18 EPCI du département, dont deux à cheval sur un département voisin
        expect(chartScopeOf(ILLE_ET_VILAINE, { surfaceHa: 749_863, hasMissing: false })).toBe('Ille-et-Vilaine dans ses limites exactes');
        // L'Île-de-France par EPCI : 0,5 % de plus que la région
        expect(chartScopeOf({ name: 'Île-de-France', surface: 1_206_496 }, { surfaceHa: 1_212_926, hasMissing: false })).toBe('Île-de-France dans ses limites exactes');
    });

    it('dit que le graphique compte les territoires sans donnée de la carte', () => {
        // La France par département : la Guyane, en gris, pèse dans les graphiques de la nation
        expect(chartScopeOf(FRANCE, { surfaceHa: 63_764_822, hasMissing: true })).toBe('France, territoires en gris compris');
    });

    it('dit l’un et l’autre quand les deux écarts se cumulent', () => {
        expect(chartScopeOf(ILLE_ET_VILAINE, { surfaceHa: 749_863, hasMissing: true })).toBe('Ille-et-Vilaine dans ses limites exactes, territoires en gris compris');
    });

    it('ne dit rien d’une zone plus grande que les territoires affichés, tous avec des données : l’Hexagone, que la nation remplace', () => {
        expect(chartScopeOf(FRANCE, { surfaceHa: 54_394_000, hasMissing: false })).toBeNull();
    });
});
