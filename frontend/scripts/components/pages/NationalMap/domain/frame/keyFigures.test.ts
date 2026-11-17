import type { NationalMapIndicators, NationalMapLandIndicators } from '@services/api';
import { artifFrame, consoFrame } from '../../__fixtures__/frames';
import {
    ARTIF_FRANCE_BY_REGION,
    BRETAGNE_BY_DEPARTEMENT,
    CONSO_BRETAGNE_BY_DEPARTEMENT,
    CONSO_FRANCE_BY_REGION,
    CONSO_FRANCE_BY_REGION_IN_2024,
    CONSO_MAYOTTE_BY_EPCI,
    FRANCE_BY_REGION,
    MAYOTTE_BY_EPCI,
} from '../../__fixtures__/nationalMapFixtures';
import type { KeyFigure, KeyFiguresModel } from './types';

// Les nombres sont formatés avec des espaces insécables, étroites pour les milliers
const plain = (text: string | null): string | null => text?.replace(/[  ]/g, ' ') ?? null;

const figuresOf = (model: KeyFiguresModel): KeyFigure[] => {
    if (model.kind !== 'figures') throw new Error('chiffres clés attendus');
    return model.figures;
};

// Libellé, valeur et unité de chaque chiffre clé, comme ils se lisent à l'écran
const read = (model: KeyFiguresModel): [string, string | null, string][] => figuresOf(model).map(({ label, value, unit }) => [label, plain(value), unit]);
const footers = (model: KeyFiguresModel): KeyFigure['footer'][] => figuresOf(model).map(({ footer }) => footer);

describe('chiffres clés de la consommation', () => {
    it('somme la consommation des territoires affichés et en donne le rythme annuel sur la période de la réponse', () => {
        const { keyFigures } = consoFrame('FRANCE', FRANCE_BY_REGION, 'conso_ha', CONSO_FRANCE_BY_REGION);

        expect(read(keyFigures)).toEqual([
            ["Consommation d'espaces", '123 748', 'ha'],
            ['Rythme annuel moyen', '8 839', 'ha/an'],
        ]);
        expect(footers(keyFigures)).toEqual([
            { type: 'period', from: '2011', to: '2024' },
            { type: 'period', from: '2011', to: '2024' },
        ]);
    });

    it('lit la période dans la réponse : une seule année donne un rythme égal au total', () => {
        const { keyFigures } = consoFrame('FRANCE', FRANCE_BY_REGION, 'conso_ha', CONSO_FRANCE_BY_REGION_IN_2024);
        const [[, total], [, yearly]] = read(keyFigures);

        expect(yearly).toBe(total);
        expect(footers(keyFigures)[0]).toEqual({ type: 'period', from: '2024', to: '2024' });
    });

    it('ne compte que les territoires de la zone : l’Hexagone sans la Corse ni l’outre-mer', () => {
        const { keyFigures } = consoFrame('HEXAGONE', FRANCE_BY_REGION, 'conso_ha', CONSO_FRANCE_BY_REGION);

        expect(read(keyFigures)[0]).toEqual(["Consommation d'espaces", '118 943', 'ha']);
    });

    it('accompagne de même une carte bivariée, une carte carroyée ou la carte d’évolution entre deux périodes', () => {
        const expected = consoFrame('REGION_53', BRETAGNE_BY_DEPARTEMENT, 'conso_ha', CONSO_BRETAGNE_BY_DEPARTEMENT).keyFigures;

        ['bivariate_habitat_menages', 'conso_ha_gridded', 'conso_evolution_between_periods'].forEach((indicatorId) =>
            expect(consoFrame('REGION_53', BRETAGNE_BY_DEPARTEMENT, indicatorId, CONSO_BRETAGNE_BY_DEPARTEMENT).keyFigures).toEqual(expected),
        );
        expect(read(expected)[0]).toEqual(["Consommation d'espaces", '22 824', 'ha']);
    });

    it('n’affiche pas de valeur quand aucun territoire n’en a', () => {
        const withoutValue = (land: NationalMapLandIndicators): NationalMapLandIndicators => ({ ...land, conso_ha: null });
        const lands = Object.fromEntries(Object.entries(CONSO_MAYOTTE_BY_EPCI.lands).map(([landId, land]) => [landId, withoutValue(land)]));
        const unknown: NationalMapIndicators = { ...CONSO_MAYOTTE_BY_EPCI, lands };

        expect(read(consoFrame('REGION_06', MAYOTTE_BY_EPCI, 'conso_ha', unknown).keyFigures)).toEqual([
            ["Consommation d'espaces", null, 'ha'],
            ['Rythme annuel moyen', null, 'ha/an'],
        ]);
    });

    it('le dit quand la réponse ne connaît aucun des territoires affichés', () => {
        const empty: NationalMapIndicators = { ...CONSO_MAYOTTE_BY_EPCI, lands: {} };

        expect(consoFrame('REGION_06', MAYOTTE_BY_EPCI, 'conso_ha', empty).keyFigures).toEqual({ kind: 'empty', message: 'Aucune donnée pour cette zone.' });
    });
});

describe('chiffres clés des espaces artificialisés', () => {
    it('donne la surface et la part artificialisées des territoires renseignés, avec leurs millésimes', () => {
        const { keyFigures } = artifFrame('FRANCE', FRANCE_BY_REGION, 'artif_pct', ARTIF_FRANCE_BY_REGION);

        expect(read(keyFigures)).toEqual([
            ['Surface artificialisée', '1 920 202', 'ha'],
            ['Part du territoire artificialisée', '9,4', '%'],
        ]);
        expect(footers(keyFigures)[0]).toEqual({ type: 'period', from: 'Millésime n°2' });
    });

    it('le dit quand aucun territoire affiché n’est couvert par l’OCS GE', () => {
        const uncovered = { scale: 'REGION', lands: { '03': ARTIF_FRANCE_BY_REGION.lands['03'] } };

        expect(artifFrame('FRANCE', FRANCE_BY_REGION, 'artif_pct', uncovered).keyFigures).toEqual({ kind: 'empty', message: 'Aucune donnée OCS GE pour cette zone.' });
        expect(artifFrame('FRANCE', FRANCE_BY_REGION, 'artif_net_ha', uncovered).keyFigures.kind).toBe('empty');
        expect(artifFrame('FRANCE', FRANCE_BY_REGION, 'artif_desartif_ha', uncovered).keyFigures.kind).toBe('empty');
    });
});

describe('chiffres clés de l’artificialisation', () => {
    it('donne le flux net et son rythme annuel, signés, entre les millésimes des territoires renseignés', () => {
        const { keyFigures } = artifFrame('FRANCE', FRANCE_BY_REGION, 'artif_net_pct_surface', ARTIF_FRANCE_BY_REGION);

        expect(read(keyFigures)).toEqual([
            ['Artificialisation nette', '+22 429', 'ha'],
            ['Rythme annuel moyen', '+7 132', 'ha/an'],
        ]);
        expect(footers(keyFigures)[0]).toEqual({ type: 'period', from: 'Millésimes n°1 et n°2' });
    });

    it('ajoute, pour la carte en anneaux, les deux flux bruts que ses anneaux somment', () => {
        const { keyFigures } = artifFrame('FRANCE', FRANCE_BY_REGION, 'artif_desartif_ha', ARTIF_FRANCE_BY_REGION);

        expect(read(keyFigures)).toEqual([
            ['Artificialisation nette', '+22 429', 'ha'],
            ['Rythme annuel moyen', '+7 132', 'ha/an'],
            ['Surfaces artificialisées', '28 063', 'ha'],
            ['Surfaces désartificialisées', '5 634', 'ha'],
        ]);
        expect(new Set(footers(keyFigures).map(({ from }) => from))).toEqual(new Set(['Millésimes n°1 et n°2']));
    });

    it('garde pour la carte en anneaux les deux premiers chiffres clés des autres cartes de flux, à la même place', () => {
        const net = artifFrame('FRANCE', FRANCE_BY_REGION, 'artif_net_ha', ARTIF_FRANCE_BY_REGION).keyFigures;
        const ringed = artifFrame('FRANCE', FRANCE_BY_REGION, 'artif_desartif_ha', ARTIF_FRANCE_BY_REGION).keyFigures;

        expect(figuresOf(ringed).slice(0, 2)).toEqual(figuresOf(net));
    });

    it('écrit une désartificialisation nette avec le signe moins du clavier', () => {
        const corsica = { scale: 'REGION', lands: { '94': ARTIF_FRANCE_BY_REGION.lands['94'] } };

        expect(read(artifFrame('FRANCE', FRANCE_BY_REGION, 'artif_net_ha', corsica).keyFigures)).toEqual([
            ['Artificialisation nette', '-491', 'ha'],
            ['Rythme annuel moyen', '-246', 'ha/an'],
        ]);
    });
});
