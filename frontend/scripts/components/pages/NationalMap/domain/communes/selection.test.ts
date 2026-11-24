import type { NationalMapValues } from '@services/api';
import { COMMUNES_CONSO_HA, COMMUNES_CONSO_SHARE, COMMUNES_HABITAT_MENAGES } from '../../__fixtures__/communesFixtures';
import { communesFrame } from '../../__fixtures__/frames';
import { CONSO_FRANCE_BY_DEPARTEMENT, FRANCE_BY_DEPARTEMENT } from '../../__fixtures__/nationalMapFixtures';
import { ZONE_FRANCE, ZONE_HEXAGONE } from '../../zones';
import type { CommunesRender } from '../frame/types';
import { CommuneHit, communeHitOf, selectionOf, selectionSheetOf } from './selection';

const renderOf = (zone: string, indicatorId: string, values: NationalMapValues = COMMUNES_CONSO_SHARE): CommunesRender =>
    communesFrame(zone, indicatorId, values, { base: FRANCE_BY_DEPARTEMENT, conso: CONSO_FRANCE_BY_DEPARTEMENT }).render as CommunesRender;

const SHARE = renderOf(ZONE_FRANCE, 'conso_pct_surface');
const HECTARES = renderOf(ZONE_FRANCE, 'conso_ha', COMMUNES_CONSO_HA);
const CROSSED = renderOf(ZONE_FRANCE, 'bivariate_habitat_menages', COMMUNES_HABITAT_MENAGES);
const HEXAGONE = renderOf(ZONE_HEXAGONE, 'conso_pct_surface');

// Attributs des entités des tuiles
const RENNES = { land_id: '35238', name: 'Rennes', REGION: '53', DEPART: '35' };
const AJACCIO = { land_id: '2A004', name: 'Ajaccio', REGION: '94', DEPART: '2A' };
const SUZAN = { land_id: '09304', name: 'Suzan', REGION: '76', DEPART: '09' };

const plain = (text: string): string => text.replace(/[  ]/g, ' ');

describe('communeHitOf', () => {
    it('désigne la commune dessinée sous le point, avec son département et sa valeur', () => {
        const hit = communeHitOf([RENNES], SHARE);

        expect(hit).toMatchObject({ landId: '35238', name: 'Rennes', departmentId: '35' });
        expect(plain(hit.value.valueText)).toBe('2,45 % de 2011 à 2024');
        expect(hit.value.legendKey).toBe(SHARE.legendKeys[5]);
    });

    it('ne retient qu’une fois la commune rendue par deux tuiles à leur limite', () => {
        expect(communeHitOf([RENNES, RENNES], SHARE)).toEqual(communeHitOf([RENNES], SHARE));
    });

    it('ne désigne rien hors des communes', () => {
        expect(communeHitOf([], SHARE)).toBeNull();
    });

    it('ignore une commune hors de la zone affichée, et passe à la suivante sous le point', () => {
        expect(communeHitOf([AJACCIO], SHARE)).toMatchObject({ landId: '2A004' });
        expect(communeHitOf([AJACCIO], HEXAGONE)).toBeNull();
        expect(communeHitOf([AJACCIO, RENNES], HEXAGONE)).toMatchObject({ landId: '35238' });
    });

    it('ignore une entité sans identifiant, ou inconnue des valeurs', () => {
        expect(communeHitOf([{ name: 'Sans identifiant' }, { land_id: '00000', name: 'Inconnue' }], SHARE)).toBeNull();
    });

    it('désigne une commune sans donnée, pour le dire', () => {
        expect(communeHitOf([SUZAN], SHARE)).toMatchObject({ name: 'Suzan', value: { valueText: 'Donnée non disponible', legendKey: null } });
    });

    it('écrit sur une seule ligne les deux taux d’une carte bivariée', () => {
        const { valueText } = communeHitOf([RENNES], CROSSED).value;

        expect(valueText).not.toContain('<br/>');
        expect(CROSSED.describe('35238').valueText).toContain('<br/>');
    });
});

describe('selectionOf', () => {
    const hit = communeHitOf([RENNES], SHARE) as CommuneHit;

    it('ne sélectionne que le département sous le zoom 7,5, où une commune est trop petite pour être visée', () => {
        expect(selectionOf(3.8, hit)).toEqual({ departmentId: '35', commune: null });
        expect(selectionOf(7.49, hit)).toEqual({ departmentId: '35', commune: null });
    });

    it('sélectionne aussi la commune à partir du zoom 7,5', () => {
        expect(selectionOf(7.5, hit)).toEqual({ departmentId: '35', commune: { landId: '35238', name: 'Rennes' } });
        expect(selectionOf(11, hit)).toEqual({ departmentId: '35', commune: { landId: '35238', name: 'Rennes' } });
    });

    it('ne sélectionne rien hors des communes, quel que soit le zoom', () => {
        expect(selectionOf(5, null)).toBeNull();
        expect(selectionOf(9, null)).toBeNull();
    });
});

describe('selectionSheetOf', () => {
    const department = { departmentId: '35', commune: null as { landId: string; name: string } | null };
    const commune = { departmentId: '35', commune: { landId: '35238', name: 'Rennes' } };

    it('nomme le département et donne la zone qui l’ouvre par commune', () => {
        expect(selectionSheetOf(department, SHARE)).toEqual({ department: { landId: '35', zone: 'DEPART_35', name: 'Ille-et-Vilaine' }, commune: null });
    });

    it('donne la commune, sa valeur sur la carte affichée et l’adresse de son diagnostic', () => {
        const sheet = selectionSheetOf(commune, HECTARES);

        expect(sheet.department.name).toBe('Ille-et-Vilaine');
        expect(sheet.commune).toMatchObject({ landId: '35238', name: 'Rennes', diagnosticUrl: '/diagnostic/commune/35238' });
        expect(plain(sheet.commune.valueText)).toBe('2,45 %, soit 123 ha de 2011 à 2024');
    });

    it('suit la carte affichée : la même sélection y prend une autre valeur', () => {
        expect(selectionSheetOf(commune, SHARE).commune.valueText).not.toBe(selectionSheetOf(commune, HECTARES).commune.valueText);
    });

    it('n’affiche rien quand la carte ne montre plus le département ou la commune sélectionnés', () => {
        const ajaccio = { departmentId: '2A', commune: { landId: '2A004', name: 'Ajaccio' } };

        // Le fond d'essai n'a pas le département de la Corse-du-Sud
        expect(selectionSheetOf(ajaccio, SHARE)).toBeNull();
        expect(selectionSheetOf({ departmentId: '35', commune: ajaccio.commune }, HEXAGONE)).toBeNull();
    });
});
