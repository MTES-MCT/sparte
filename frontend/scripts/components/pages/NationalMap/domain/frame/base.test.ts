import type { NationalMapBaseMap } from '@services/api';
import { BRETAGNE_BY_DEPARTEMENT, FRANCE_BY_REGION, MAYOTTE_BY_EPCI, RHONE_BY_EPCI } from '../../__fixtures__/nationalMapFixtures';
import { mercatorToLngLat } from '../../gridded';
import { buildBase, insetLabels, insetMapLabels, zoneHeading } from './base';

const landIds = (base: ReturnType<typeof buildBase>): string[] => base.features.map((feature) => feature.properties.land_id);
const labels = (path: { label: string }[]): string[] => path.map((step) => step.label);

// Communes d'un EPCI du Finistère : le fond porte le chemin complet de son parent
const EPCI_BY_COMMUNE: NationalMapBaseMap = {
    scale: 'COMM',
    geojson: { type: 'FeatureCollection', features: [] },
    insets: [],
    separation: [],
    parent_boundary: null,
    no_conso_data: [],
    parent: {
        land_type: 'EPCI',
        land_id: '242900314',
        name: 'Brest Métropole',
        ancestors: [
            { land_type: 'REGION', land_id: '53', name: 'Bretagne' },
            { land_type: 'DEPART', land_id: '29', name: 'Finistère' },
        ],
    },
};

describe('buildBase', () => {
    it('dessine sur la France entière tous les territoires, leurs cartouches et la ligne de séparation', () => {
        const base = buildBase('FRANCE', FRANCE_BY_REGION);

        expect(landIds(base)).toEqual(['03', '06', '11', '53', '75', '84', '94']);
        expect(base.insets.map((inset) => inset.name)).toEqual(['Mayotte', 'Guyane']);
        expect(base.separation).toHaveLength(2);
        expect(base).toMatchObject({ key: 'FRANCE|REGION', zone: 'FRANCE', scale: 'REGION', wholeFrance: true, clickable: true, title: 'France entière', typeLabel: '' });
        expect(labels(base.path)).toEqual(['France entière']);
    });

    it('limite l’Hexagone à la métropole sans la Corse, sans cartouches ni ligne de séparation', () => {
        const base = buildBase('HEXAGONE', FRANCE_BY_REGION);

        expect(landIds(base)).toEqual(['11', '53', '75', '84']);
        expect(base.insets).toEqual([]);
        expect(base.separation).toEqual([]);
        expect(base).toMatchObject({ key: 'HEXAGONE|REGION', wholeFrance: false, title: 'Hexagone' });
        expect(labels(base.path)).toEqual(['France entière', 'Hexagone']);
    });

    it('ne trace pas la ligne de séparation que l’API renvoie pour une région', () => {
        const base = buildBase('REGION_53', BRETAGNE_BY_DEPARTEMENT);

        expect(base.separation).toEqual([]);
        expect(base).toMatchObject({ title: 'Bretagne', typeLabel: 'Région', wholeFrance: false });
    });

    it('porte la limite du département dont les EPCI débordent, et aucune pour les autres fonds', () => {
        const rhone = buildBase('DEPART_69', RHONE_BY_EPCI);

        expect(rhone.parentBoundary).toBe(RHONE_BY_EPCI.parent_boundary);
        // Les territoires restent ceux du fond, dessinés en entier : la limite ne retire rien
        expect(landIds(rhone)).toEqual(['200046977', '200077014']);
        expect(buildBase('REGION_53', BRETAGNE_BY_DEPARTEMENT).parentBoundary).toEqual([]);
        expect(buildBase('FRANCE', FRANCE_BY_REGION).parentBoundary).toEqual([]);
    });

    it('donne le chemin complet d’un EPCI, dont les communes ne sont pas cliquables', () => {
        const base = buildBase('EPCI_242900314', EPCI_BY_COMMUNE);

        expect(base.path).toEqual([
            { zone: 'FRANCE', label: 'France entière' },
            { zone: 'HEXAGONE', label: 'Hexagone' },
            { zone: 'REGION_53', label: 'Bretagne' },
            { zone: 'DEPART_29', label: 'Finistère' },
            { zone: 'EPCI_242900314', label: 'Brest Métropole' },
        ]);
        expect(base).toMatchObject({ title: 'Brest Métropole', typeLabel: 'EPCI', clickable: false });
    });

    it('ne fait pas passer par l’Hexagone le chemin d’une région d’outre-mer ni celui de la Corse', () => {
        expect(labels(buildBase('REGION_06', MAYOTTE_BY_EPCI).path)).toEqual(['France entière', 'Mayotte']);
        expect(labels(zoneHeading('REGION_94', null).path)).toEqual(['France entière', 'Corse']);
    });

    it('rend le même fond, donc les mêmes territoires, pour deux appels sur le même fond de carte', () => {
        expect(buildBase('HEXAGONE', FRANCE_BY_REGION)).toBe(buildBase('HEXAGONE', FRANCE_BY_REGION));
        expect(buildBase('HEXAGONE', FRANCE_BY_REGION).features).toBe(buildBase('HEXAGONE', FRANCE_BY_REGION).features);
        expect(buildBase('FRANCE', FRANCE_BY_REGION)).not.toBe(buildBase('HEXAGONE', FRANCE_BY_REGION));
    });
});

describe('zoneHeading', () => {
    it('nomme un territoire dont le fond n’est pas chargé par un nom déjà rencontré, à défaut par son identifiant', () => {
        expect(zoneHeading('EPCI_242900314', null, { EPCI_242900314: 'Brest Métropole' })).toEqual({
            title: 'Brest Métropole',
            typeLabel: 'EPCI',
            path: [
                { zone: 'FRANCE', label: 'France entière' },
                { zone: 'EPCI_242900314', label: 'Brest Métropole' },
            ],
        });
        expect(zoneHeading('EPCI_999', null).title).toBe('999');
    });
});

describe('insetLabels', () => {
    const { insets } = FRANCE_BY_REGION;

    it('nomme chaque territoire d’outre-mer, au milieu du haut de son cartouche', () => {
        expect(insetLabels(insets, false)).toEqual([
            { text: 'Mayotte', position: [250_000, 100_000] },
            { text: 'Guyane', position: [50_000, 100_000] },
        ]);
    });

    it('les numérote dans l’ordre, au milieu du bord gauche de leur cartouche, sur une petite carte', () => {
        expect(insetLabels(insets, true)).toEqual([
            { text: '1', position: [200_000, 50_000] },
            { text: '2', position: [0, 50_000] },
        ]);
    });

    it('ne rend rien sans territoire d’outre-mer', () => {
        expect(insetLabels([], false)).toEqual([]);
    });
});

describe('insetMapLabels', () => {
    const { insets } = FRANCE_BY_REGION;

    it('ancre les noms en longitude et latitude, par le bas de l’étiquette', () => {
        expect(insetMapLabels(insets, false)).toEqual([
            { text: 'Mayotte', position: mercatorToLngLat([250_000, 100_000]), anchor: 'bottom' },
            { text: 'Guyane', position: mercatorToLngLat([50_000, 100_000]), anchor: 'bottom' },
        ]);
    });

    it('ancre les numéros par la droite de l’étiquette, à gauche du cartouche', () => {
        expect(insetMapLabels(insets, true)).toEqual([
            { text: '1', position: mercatorToLngLat([200_000, 50_000]), anchor: 'right' },
            { text: '2', position: mercatorToLngLat([0, 50_000]), anchor: 'right' },
        ]);
    });
});
