import { ZONE_FRANCE, ZONE_HEXAGONE } from '../../zones';
import { dominantGeneration, ignArtifGeneration, ignArtifInsetImage, ignArtifTiles, imageBounds, imageFromZoom, soilImage, soilImageMethod } from './soilImage';

// Image des sols artificialisés publiée par l'IGN : la génération montrée, l'adresse de ses tuiles
// et de l'image d'un cartouche, le zoom où elle prend la place des mailles, et son emprise.

describe('génération de millésimes de l’IGN', () => {
    it.each([
        [2019, '2017-2020'],
        [2020, '2017-2020'],
        [2021, '2021-2023'],
        [2023, '2021-2023'],
        [2024, '2024-2026'],
        [2027, '2024-2026'],
    ])('montre, pour un dernier millésime de %i, la génération %s', (year, generation) => {
        expect(ignArtifGeneration(year)).toBe(generation);
    });

    it('montre la génération 2021-2023 tant que le millésime du territoire n’est pas connu', () => {
        expect(ignArtifGeneration(null)).toBe('2021-2023');
    });
});

describe('génération montrée pour les territoires affichés', () => {
    const land = (surface: number, ...years: number[]) => ({ surface_ha: surface, artif_years: years });

    it('est celle du dernier millésime de la plus grande part de la surface', () => {
        // Le Rhône par EPCI : presque tout en 2020, deux EPCI à cheval sur un département en 2022
        expect(dominantGeneration([land(57_000, 2020), land(53_000, 2020), land(9_000, 2020, 2022), land(4_000, 2022)])).toBe('2017-2020');
        expect(dominantGeneration([land(10_000, 2020), land(40_000, 2021), land(30_000, 2023)])).toBe('2021-2023');
    });

    it('est la plus récente à surface égale, et celle par défaut sans millésime connu', () => {
        expect(dominantGeneration([land(10_000, 2020), land(10_000, 2022)])).toBe('2021-2023');
        expect(dominantGeneration([land(10_000)])).toBe('2021-2023');
        expect(dominantGeneration([])).toBe('2021-2023');
    });
});

describe('adresses du flux', () => {
    it('demande une tuile de la couche des surfaces artificialisées de la génération, au format du flux WMTS', () => {
        expect(ignArtifTiles('2017-2020')).toBe(
            'ign-artif://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=OCSGE.ARTIF.2017-2020&STYLE=normal&FORMAT=image/png' +
                '&TILEMATRIXSET=PM_6_16&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
        );
    });

    it('demande l’image d’un cartouche pour l’emprise réelle du territoire, à ses proportions', () => {
        // La Réunion : 68 782 m de large pour 61 304 m de haut
        expect(ignArtifInsetImage('2021-2023', [6146737.4, -2438098.2, 6215519.1, -2376794.3])).toBe(
            'ign-artif://data.geopf.fr/wms-r?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=OCSGE.ARTIF.2021-2023&STYLES=&CRS=EPSG:3857' +
                '&BBOX=6146737,-2438098,6215519,-2376794&WIDTH=512&HEIGHT=456&FORMAT=image/png&TRANSPARENT=TRUE',
        );
    });
});

describe('zoom où l’image existe', () => {
    it('est celui où MapLibre demande le premier niveau publié : un niveau plus tôt pour des tuiles réduites de moitié', () => {
        expect(imageFromZoom(6, 256)).toBe(4.5);
        expect(imageFromZoom(6, 128)).toBe(3.5);
    });

    it('donne à l’image deux paliers, des vues larges aux autres, et la dessine dès le premier', () => {
        const image = soilImage(ZONE_FRANCE);

        expect(image.tiers).toEqual([
            { tileSize: 128, fromZoom: 3.5 },
            { tileSize: 256, fromZoom: 4.5 },
        ]);
        expect(image.fromZoom).toBe(3.5);
        expect([image.minZoom, image.maxZoom]).toEqual([6, 16]);
    });
});

describe('emprise des tuiles demandées', () => {
    const MAINLAND = [-5.3, 41.2, 9.7, 51.2];
    const RHONE: [[number, number], [number, number]] = [
        [4.24, 45.45],
        [5.16, 46.31],
    ];
    const REUNION: [[number, number], [number, number]] = [
        [55.2, -21.4],
        [55.8, -20.9],
    ];

    it.each([ZONE_FRANCE, ZONE_HEXAGONE])('est la métropole pour la zone nationale %s, cartouches d’outre-mer exclus', (zone) => {
        expect(imageBounds(zone, [[-8, 41], [10, 52]])).toEqual(MAINLAND);
    });

    it('est toute la métropole pour un territoire de l’Hexagone : c’est son masque qui la rogne, pas son emprise', () => {
        expect(imageBounds('DEPART_69', RHONE)).toEqual(MAINLAND);
    });

    it('est faite des abords du territoire pour un territoire d’outre-mer', () => {
        const [west, south, east, north] = imageBounds('REGION_04', REUNION);

        expect([west, south, east, north].map((value) => Math.round(value * 100) / 100)).toEqual([54.9, -21.65, 56.1, -20.65]);
    });
});

describe('description de l’image', () => {
    it('change d’identité avec la zone et la génération : une image abandonnée est redemandée à la vue suivante', () => {
        expect(soilImage('DEPART_69', '2017-2020').key).toBe('ign-artif|2017-2020|DEPART_69');
        expect(soilImage('DEPART_69', '2017-2020').tiles).toBe(ignArtifTiles('2017-2020'));
        expect(soilImage('REGION_84').key).toBe('ign-artif|2021-2023|REGION_84');
    });

    it('n’est rognée sur les territoires dessinés que hors de la France entière', () => {
        expect(soilImage(ZONE_FRANCE).clipped).toBe(false);
        expect([ZONE_HEXAGONE, 'REGION_84', 'DEPART_69', 'EPCI_200046977'].map((zone) => soilImage(zone).clipped)).toEqual([true, true, true, true]);
    });

    it('cite dans sa méthode la génération affichée, et prévient qu’elle peut différer des chiffres', () => {
        const method = soilImageMethod(soilImage('DEPART_69', '2017-2020'));

        expect(method).toContain('génération 2017-2020');
        expect(method).toContain('Elle peut être plus récente que les chiffres');
    });
});
