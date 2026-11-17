import { BRETAGNE_BY_DEPARTEMENT, FRANCE_BY_REGION } from '../../__fixtures__/nationalMapFixtures';
import { buildBase } from '../frame/base';
import { extentToLngLat, zoneExtent } from './extent';

// Côté d'un territoire d'essai, en mètres : les territoires sont des carrés rangés côte à côte,
// tous les deux côtés
const SIDE = 100_000;

describe('zoneExtent', () => {
    it('englobe les territoires, les cartouches d’outre-mer et la ligne de séparation de la France entière', () => {
        // Sept régions de 0 à 1 300 km ; la ligne de séparation dépasse en haut et en bas
        expect(zoneExtent(buildBase('FRANCE', FRANCE_BY_REGION))).toEqual([0, -SIDE, 13 * SIDE, 2 * SIDE]);
    });

    it('se limite aux territoires de l’Hexagone, sans cartouche ni séparation', () => {
        // Île-de-France, Bretagne, Nouvelle-Aquitaine et Auvergne-Rhône-Alpes : les colonnes 2 à 5
        expect(zoneExtent(buildBase('HEXAGONE', FRANCE_BY_REGION))).toEqual([4 * SIDE, 0, 11 * SIDE, SIDE]);
    });

    it('ignore la ligne de séparation que l’API renvoie pour une région', () => {
        expect(zoneExtent(buildBase('REGION_53', BRETAGNE_BY_DEPARTEMENT))).toEqual([0, 0, 7 * SIDE, SIDE]);
    });

    it('étend l’emprise à un cartouche qui dépasse des territoires', () => {
        const [feature] = FRANCE_BY_REGION.geojson.features;

        expect(zoneExtent({ features: [feature], insets: [{ zone: '03', name: 'Guyane', bbox: [-50_000, -20_000, 150_000, 120_000], source_bbox: [-6_078_000, 235_000, -5_746_000, 467_400] }], separation: [] })).toEqual([
            -50_000, -20_000, 150_000, 120_000,
        ]);
    });

    it('ne rend rien sans territoire', () => {
        expect(zoneExtent({ features: [], insets: [], separation: [] })).toBeNull();
    });
});

describe('extentToLngLat', () => {
    it('convertit l’emprise projetée en longitudes et latitudes, du sud-ouest au nord-est', () => {
        // Emprise réelle de la France entière par département, cartouches et séparation compris (mètres, EPSG:3857)
        const [[west, south], [east, north]] = extentToLngLat([-841_357, 5_050_841, 1_064_094, 6_684_195]);

        expect(west).toBeCloseTo(-7.558, 3);
        expect(south).toBeCloseTo(41.2605, 3);
        expect(east).toBeCloseTo(9.5589, 3);
        expect(north).toBeCloseTo(51.3542, 3);
    });

    it('place l’origine de la projection sur l’équateur et le méridien de Greenwich', () => {
        const [[west, south]] = extentToLngLat([0, 0, 1, 1]);

        expect(west).toBeCloseTo(0, 10);
        expect(south).toBeCloseTo(0, 10);
    });
});
