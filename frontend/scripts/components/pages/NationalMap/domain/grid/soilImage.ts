// Image des sols artificialisés publiée par l'IGN : la couche « OCS GE – surfaces artificialisées »
// du flux WMTS de la Géoplateforme, dessinée objet par objet, sols artificialisés d'une couleur et
// le reste d'une autre. Elle est précise du niveau de tuiles 6 (une région) au niveau 16 (une rue),
// sans calcul de notre côté : dès qu'elle existe au zoom de la carte, elle remplace les mailles.
//
// Mesuré sur des tuiles réelles le 13 novembre 2026 :
// - tuiles PNG de 256 px, jeu `PM_6_16`, lisibles depuis un navigateur (`access-control-allow-origin: *`) ;
// - couleurs à moitié transparentes : sol artificialisé rgba(255, 145, 145, 0.5), sol non
//   artificialisé rgba(165, 255, 128, 0.5) ; hors de la couverture, pixels transparents ;
// - 105 à 130 Ko par tuile du niveau 6 au niveau 12.
//
// L'IGN publie une couche par génération de millésimes. Les tuiles sont à la position réelle des
// territoires : pour les cartouches d'outre-mer de la France entière, une image de chaque
// territoire est demandée au flux WMS de la même couche et posée sur son cartouche.
// Nos mailles ne servent que de secours : sous le premier niveau de l'image (vue plus large que le
// pays) et quand elle ne répond pas.
import type { ValueClass } from '../../values';
import { zoneToLand } from '../../zones';
import type { GridImage } from './cells';
import { clipsImage } from './imageClip';

const WMTS_URL = 'https://data.geopf.fr/wmts';
const WMS_URL = 'https://data.geopf.fr/wms-r';
// Largeur demandée pour l'image d'un cartouche, en pixels : un cartouche fait de 40 à 170 px de
// large au cadrage du pays, et la carte ouvre le territoire dès qu'on zoome dessus
const INSET_IMAGE_WIDTH_PX = 512;
const LAYER_PREFIX = 'OCSGE.ARTIF';
const TILE_MATRIX_SET = 'PM_6_16';
const FIRST_LEVEL = 6;
const LAST_LEVEL = 16;
// Taille d'affichage des tuiles, de 256 px : en vraie grandeur, et réduites de moitié aux vues
// larges. Réduites, MapLibre demande un niveau de plus pour le même zoom de la carte : le
// niveau 6, le premier publié, suffit alors à la France entière sur un téléphone.
const TILE_SIZES_PX = [128, 256];
// Taille de tuile pour laquelle le zoom de la carte et le niveau de tuiles coïncident
const MAP_TILE_SIZE_PX = 512;

// Générations publiées, et dernière année des millésimes que chacune rassemble
const GENERATIONS: { name: string; lastYear: number }[] = [
    { name: '2017-2020', lastYear: 2020 },
    { name: '2021-2023', lastYear: 2023 },
    { name: '2024-2026', lastYear: Infinity },
];
// Génération affichée tant que le dernier millésime du territoire n'est pas connu
const DEFAULT_GENERATION = '2021-2023';

// Génération qui contient le dernier millésime d'un territoire : l'image est alors celle des
// chiffres affichés à côté de la carte
export const ignArtifGeneration = (lastYear: number | null): string =>
    lastYear === null ? DEFAULT_GENERATION : (GENERATIONS.find((generation) => lastYear <= generation.lastYear) as { name: string }).name;

// Génération montrée pour les territoires affichés : celle du dernier millésime de la plus grande
// part de leur surface. L'image est alors celle des chiffres pour l'essentiel de la vue : le
// Rhône, dont le dernier millésime est 2020, est montré dans la génération 2017-2020 même si
// quelques EPCI affichés débordent sur un département plus récent. À surface égale, la plus
// récente ; sans millésime connu, celle par défaut.
export const dominantGeneration = (lands: { surface_ha: number; artif_years: number[] }[]): string => {
    const surfaces = new Map<string, number>();
    lands.forEach(({ surface_ha: surface, artif_years: years }) => {
        if (years.length === 0) return;
        const generation = ignArtifGeneration(Math.max(...years));
        surfaces.set(generation, (surfaces.get(generation) ?? 0) + surface);
    });
    const ranked = GENERATIONS.map(({ name }) => ({ name, surface: surfaces.get(name) ?? 0 })).filter(({ surface }) => surface > 0);
    if (ranked.length === 0) return DEFAULT_GENERATION;
    return ranked.reduce((best, candidate) => (candidate.surface >= best.surface ? candidate : best)).name;
};

// Image d'une emprise ([xmin, ymin, xmax, ymax] en EPSG:3857), aux proportions de l'emprise
export const ignArtifInsetImage = (generation: string, [xmin, ymin, xmax, ymax]: [number, number, number, number]): string => {
    const height = Math.max(1, Math.round((INSET_IMAGE_WIDTH_PX * (ymax - ymin)) / (xmax - xmin)));
    return (
        `${WMS_URL}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=${LAYER_PREFIX}.${generation}&STYLES=&CRS=EPSG:3857` +
        `&BBOX=${[xmin, ymin, xmax, ymax].map(Math.round).join(',')}&WIDTH=${INSET_IMAGE_WIDTH_PX}&HEIGHT=${height}&FORMAT=image/png&TRANSPARENT=TRUE`
    );
};

export const ignArtifTiles = (generation: string): string =>
    `${WMTS_URL}?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${LAYER_PREFIX}.${generation}&STYLE=normal&FORMAT=image/png` +
    `&TILEMATRIXSET=${TILE_MATRIX_SET}&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`;

// Zoom de la carte à partir duquel MapLibre demande le premier niveau publié : pour une image, il
// arrondit le niveau au plus proche, et des tuiles de 256 px sont demandées un niveau plus haut
// que le zoom de la carte
export const imageFromZoom = (firstLevel: number, tileSizePx: number): number => firstLevel - Math.log2(MAP_TILE_SIZE_PX / tileSizePx) - 0.5;

type Box = [number, number, number, number];

// Hexagone et Corse, [ouest, sud, est, nord]
const MAINLAND_BOUNDS: Box = [-5.3, 41.2, 9.7, 51.2];
// Marge autour d'un territoire d'outre-mer, en part de sa largeur et de sa hauteur
const OVERSEAS_MARGIN = 0.5;

// Emprise hors de laquelle aucune tuile de l'image n'est demandée. Elle ne rogne pas l'image sur
// les territoires affichés : un masque le fait, au contour de ces territoires (voir imageClip.ts).
// - Zone nationale, ou territoire de l'Hexagone ou de Corse : toute la métropole. Rien n'est
//   demandé sur l'Atlantique, où sont posés les cartouches d'outre-mer.
// - Territoire d'outre-mer : ses abords.
export const imageBounds = (zone: string, [[west, south], [east, north]]: [[number, number], [number, number]]): Box => {
    const [mainWest, mainSouth, mainEast, mainNorth] = MAINLAND_BOUNDS;
    const inMainland = west >= mainWest && south >= mainSouth && east <= mainEast && north <= mainNorth;
    if (!zoneToLand(zone) || inMainland) return MAINLAND_BOUNDS;
    const marginX = (east - west) * OVERSEAS_MARGIN;
    const marginY = (north - south) * OVERSEAS_MARGIN;
    return [west - marginX, south - marginY, east + marginX, north + marginY];
};

// Fond sous l'image, visible là où elle est transparente : pas de donnée OCS GE
export const SOIL_IMAGE_LAND_COLOR = '#ffffff';

// Couleurs de l'image à l'écran, mesurées sur des captures avec le réglage de `soilImage`
export const SOIL_IMAGE_CLASSES: ValueClass[] = [
    { color: '#ff9b93', name: 'Sol artificialisé' },
    { color: '#b4ff8d', name: 'Sol non artificialisé' },
];

// Ce que la légende dit de l'image
export const SOIL_IMAGE_BASIS = "Image de l'OCS GE (IGN). Zoomez pour lire les objets.";

export const soilImageMethod = ({ generation }: Pick<GridImage, 'generation'>): string =>
    `Image de l'OCS GE publiée par l'IGN (flux WMTS de la Géoplateforme, génération ${generation}) : chaque objet y est dessiné, artificialisé ou non. ` +
    'Elle peut être plus récente que les chiffres, qui portent sur le dernier millésime intégré à Mon Diagnostic Artificialisation';

// Image des sols artificialisés d'une zone, telle que le moteur des carreaux la dessine, dans la
// génération donnée (voir dominantGeneration)
export const soilImage = (zone: string, generation: string = DEFAULT_GENERATION): GridImage => {
    const tiers = TILE_SIZES_PX.map((tileSize) => ({ tileSize, fromZoom: imageFromZoom(FIRST_LEVEL, tileSize) }));
    return {
        key: `ign-artif|${generation}|${zone}`,
        generation,
        tiles: ignArtifTiles(generation),
        minZoom: FIRST_LEVEL,
        maxZoom: LAST_LEVEL,
        attribution: '© IGN – OCS GE',
        tiers,
        fromZoom: tiers[0].fromZoom,
        boundsOf: (lands) => imageBounds(zone, lands),
        landColor: SOIL_IMAGE_LAND_COLOR,
        clipped: clipsImage(zone),
        // Réglage retenu sur captures : deux passes et une saturation de 0,3 donnent à l'écran un vert
        // #b4ff8d et un rouge #ff9b93 ; au-delà, le vert devient criard
        passes: 2,
        saturation: 0.3,
        contrast: 0,
        insetImage: (sourceBbox) => ignArtifInsetImage(generation, sourceBbox),
        caption: `image de l'OCS GE (IGN), sols artificialisés ou non · génération ${generation}`,
        partialNotice: 'Les objets OCS GE ne sont pas disponibles partout dans cette vue : l’image y reste affichée, sans survol.',
        failedNotice: 'L’image de l’IGN ne répond pas : la carte montre à sa place la part artificialisée par maille.',
    };
};
