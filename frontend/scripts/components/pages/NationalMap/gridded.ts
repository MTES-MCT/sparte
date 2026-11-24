// Données carroyées de la carte nationale : consommation d'ENAF par carreau de 1 km × 1 km
// (Cerema), servie en tuiles vectorielles PMTiles et dessinée avec MapLibre.
//
// Deux familles de fichiers de tuiles :
// - `carroyage_lea.pmtiles`, celui des diagnostics : tous les attributs, tous les zooms. Il suffit
//   pour une région, un département ou un EPCI, mais ses tuiles de petite échelle pèsent des
//   dizaines de Mo : il est inutilisable pour la France entière. Il porte par année le total
//   (`conso_AAAA`) et chaque destination (`conso_AAAA_habitat`, `conso_AAAA_route`…) ;
// - `carroyage_national.pmtiles` et un fichier par destination (`carroyage_national_habitat.pmtiles`…),
//   allégés (zooms 3 à 8), produits par le DAG `create_carroyage_national_vector_tiles`, pour la
//   France entière et l'Hexagone. Tous portent les mêmes attributs `conso_AAAA` : c'est le fichier
//   qui désigne la destination. Ils sont multi-résolution : à l'échelle du pays un carreau de 1 km
//   fait moins d'un pixel, les petits zooms portent donc des blocs de 5 km (zooms 3 à 5) puis 2 km
//   (zoom 6) de côté, et les carreaux de 1 km n'arrivent qu'aux zooms 7 et 8. Chaque entité indique
//   son côté dans `resolution_km`. Un bloc porte sa consommation ramenée à sa surface entière
//   (m² par km²) : c'est la grandeur d'un carreau de 1 km, si bien que les expressions, les classes
//   et la légende valent à toutes les résolutions.
import type { ExpressionSpecification } from 'maplibre-gl';
import { CARROYAGE_FIRST_YEAR, CARROYAGE_LAST_YEAR } from '@components/map/constants/config';
import { formatNumber } from '@utils/formatUtils';
import { GridCells, cellClassIndex, hasCode } from './domain/grid/cells';
import { ALL_DESTINATIONS, ColoredDestination, DESTINATION_COLORS, destinationPalette } from './domain/grid/consoColors';
import type { GridDestination } from './indicators';
import { ValueClass, fixedClasses } from './values';
import { ZONE_HEXAGONE, zoneToLand } from './zones';

// Zones d'affichage (propriété `zone` du fond de carte) couvertes par le carroyage
const ZONE_CORSE = 'CORSE';
const REGION_CORSE = '94';

export const isInGridCoverage = (displayZone: string): boolean => displayZone === ZONE_HEXAGONE || displayZone === ZONE_CORSE;

// Bornes des classes, en hectares par carreau. Elles sont fixes : un carreau a la même couleur
// quels que soient le territoire affiché et le niveau de zoom, et deux périodes se comparent.
// Sur des carreaux de même surface, ces hectares sont une densité (1 ha = 1 % du carreau) ;
// pour un bloc agrégé ce sont des hectares par km², en moyenne sur le bloc.
export const GRID_BOUNDS_HA = [0.1, 0.5, 1, 5];
const M2_PER_HA = 10000;

const formatBound = (value: number): string => formatNumber({ number: value, decimals: Number.isInteger(value) ? 0 : 1 });

// Classes de chaque carte : les mêmes bornes pour toutes, dans les nuances de la couleur de sa
// destination (voir consoColors.ts). Elles sont calculées une fois : d'un rendu à l'autre, une
// carte reçoit le même tableau.
const CLASSES_BY_DESTINATION = Object.fromEntries(
    (Object.keys(DESTINATION_COLORS) as ColoredDestination[]).map((destination) => [
        destination,
        fixedClasses(GRID_BOUNDS_HA, destinationPalette(destination), formatBound, ' ha'),
    ]),
) as Record<ColoredDestination, ValueClass[]>;

// Classes de la carte d'une destination de la consommation ; null : toutes les destinations
export const gridClasses = (destination: GridDestination | null): ValueClass[] => CLASSES_BY_DESTINATION[destination ?? ALL_DESTINATIONS];

export const GRID_METHOD_LABEL =
    'Classes à bornes fixes, identiques pour tous les territoires et toutes les périodes. Chaque carreau couvre 100 ha : 1 ha consommé représente 1 % du carreau. ' +
    "À l'échelle du pays, les carreaux sont regroupés en blocs de 2 km ou 5 km de côté, colorés selon leur consommation moyenne par km²";

// Classe d'une valeur en hectares
export const gridClassIndex = (valueHa: number): number => cellClassIndex(GRID_BOUNDS_HA, valueHa);

// Ce qui désigne, dans un fichier de tuiles, les attributs annuels à lire
type YearAttributes = {
    // Suffixe des attributs `conso_AAAA` : la destination dans le fichier des diagnostics, qui les
    // porte toutes ; vide pour le total, et dans un fichier national, qui n'en porte qu'une
    yearSuffix: string;
};

// Attributs des tuiles qui portent la consommation de chaque année de la période
const yearAttributes = (startYear: number, endYear: number, { yearSuffix }: YearAttributes): string[] => {
    const attributes: string[] = [];
    for (let year = Math.max(startYear, CARROYAGE_FIRST_YEAR); year <= Math.min(endYear, CARROYAGE_LAST_YEAR); year += 1) attributes.push(`conso_${year}${yearSuffix}`);
    return attributes;
};

// Côté, en km, de la maille d'une entité des tuiles. Seul le fichier national porte
// `resolution_km` : une entité qui ne l'a pas est un carreau de 1 km du fichier des diagnostics.
export const gridCellSizeKm = (properties: Record<string, unknown>): number => {
    const size = properties.resolution_km;
    return typeof size === 'number' && size > 1 ? size : 1;
};

// Nom d'une maille dans la légende, d'après son côté en km
export const gridCellName = (sizeKm: number): string => (sizeKm === 1 ? 'Carreau de 1 km × 1 km' : `Bloc de ${sizeKm} km × ${sizeKm} km`);

// Consommation d'un carreau sur la période, en hectares, d'après les attributs de sa tuile (en m²).
// Pour un bloc agrégé, c'est une moyenne : des hectares par km² (voir gridCellSizeKm).
export const gridValueHa = (properties: Record<string, unknown>, startYear: number, endYear: number, tiles: YearAttributes): number =>
    yearAttributes(startYear, endYear, tiles).reduce((sum, attribute) => {
        const value = properties[attribute];
        return typeof value === 'number' ? sum + value : sum;
    }, 0) / M2_PER_HA;

// Même somme, en m², calculée par MapLibre ; une année absente de la tuile compte pour zéro
export const gridSumExpression = (startYear: number, endYear: number, tiles: YearAttributes): ExpressionSpecification =>
    ['+', 0, ...yearAttributes(startYear, endYear, tiles).map((attribute): ExpressionSpecification => ['coalesce', ['get', attribute], 0])];

type GridTiles = YearAttributes & {
    // Nom du fichier PMTiles, et de sa couche
    file: string;
    layer: string;
    // Fichier allégé de la France entière (true) ou fichier complet des diagnostics (false)
    national: boolean;
    // Restriction des carreaux au territoire affiché, null sans restriction
    territoryFilter: ExpressionSpecification | null;
};

// Tuiles à utiliser pour une zone de la carte nationale (voir zones.ts), une destination de la
// consommation (null : toutes) et les territoires qui sont dessinés. La destination se lit de deux
// façons : par le suffixe des attributs dans le fichier des diagnostics, par le fichier lui-même à
// l'échelle du pays.
export const gridTiles = (zone: string, destination: GridDestination | null, displayed?: { scale: string; landIds: string[] }): GridTiles => {
    const land = zoneToLand(zone);
    const ofDestination = destination ? `_${destination}` : '';
    if (land) {
        // Un EPCI peut déborder de la région ou du département affiché, et il est dessiné en entier :
        // les carreaux retenus sont alors ceux des EPCI dessinés, pour qu'aucun ne paraisse à moitié vide
        const straddling = displayed?.scale === 'EPCI' && displayed.landIds.length > 0;
        const territoryFilter = straddling
            ? (['any', ...displayed.landIds.map((id) => hasCode('EPCI', id))] as ExpressionSpecification)
            : hasCode(land.land_type, land.land_id);
        return { file: 'carroyage_lea.pmtiles', layer: 'carroyage_lea', national: false, yearSuffix: ofDestination, territoryFilter };
    }
    return {
        file: `carroyage_national${ofDestination}.pmtiles`,
        layer: `carroyage_national${ofDestination}`,
        national: true,
        yearSuffix: '',
        // L'Hexagone est la métropole sans la Corse
        territoryFilter: zone === ZONE_HEXAGONE ? (['!', hasCode('REGION', REGION_CORSE)] as ExpressionSpecification) : null,
    };
};

// Carreaux à dessiner : ceux du territoire dont la consommation de la période est positive
export const gridFilterExpression = (startYear: number, endYear: number, tiles: GridTiles): ExpressionSpecification =>
    ['all', ['>', gridSumExpression(startYear, endYear, tiles), 0], ...(tiles.territoryFilter ? [tiles.territoryFilter] : [])] as ExpressionSpecification;

// Couleur des territoires sous les carreaux : là où il n'y en a pas, aucune consommation n'est localisée
const LAND_COLOR = '#f0f0f0';

const NOTICE_OUTSIDE_COVERAGE = "Les données carroyées ne couvrent que l'Hexagone et la Corse.";
const NOTICE_NATIONAL_MISSING =
    'Les données carroyées ne sont pas encore disponibles pour la France entière : choisissez une région, un département ou un EPCI pour les afficher.';
// Le fichier d'une destination manque : celui de toutes les destinations est publié à part
const NOTICE_DESTINATION_MISSING =
    'Les données carroyées de cette destination ne sont pas encore disponibles pour la France entière : choisissez « Toutes » les destinations, ou une région, un département ou un EPCI.';
const NOTICE_MISSING = "Les données carroyées n'ont pas pu être chargées.";

// Message d'une carte dont le fichier de tuiles manque
const missingTilesNotice = (tiles: GridTiles, destination: GridDestination | null): string => {
    if (!tiles.national) return NOTICE_MISSING;
    return destination ? NOTICE_DESTINATION_MISSING : NOTICE_NATIONAL_MISSING;
};

type ConsoCellsOptions = {
    // Zone de la carte nationale (voir zones.ts) et territoires qui y sont dessinés
    zone: string;
    displayed: { scale: string; landIds: string[] };
    // L'un des territoires dessinés est dans l'emprise du carroyage
    covered: boolean;
    // Destination de la consommation ; null : toutes
    destination: GridDestination | null;
    period: { startYear: number; endYear: number };
    // Période en toutes lettres : « de 2011 à 2024 »
    periodText: string;
    // Texte de la valeur d'un carreau, en hectares, d'après son côté en km (au-delà de 1 km : un
    // bloc de carreaux regroupés, dont la valeur est une moyenne par km²) ; null : pas de carreau
    // dessiné à cet endroit, donc pas de consommation
    describeValue: (valueHa: number | null, cellSizeKm: number) => string;
};

// Carreaux de la consommation d'espaces d'une zone sur une période, tels que le moteur les dessine
export const consoCells = ({ zone, displayed, covered, destination, period, periodText, describeValue }: ConsoCellsOptions): GridCells => {
    const { startYear, endYear } = period;
    const tiles = gridTiles(zone, destination, displayed);
    return {
        // D'une zone ou d'une destination à l'autre la source est recréée, même si le fichier reste le même
        key: `${tiles.file}|${zone}|${destination ?? ''}`,
        file: tiles.file,
        layer: tiles.layer,
        filter: gridFilterExpression(startYear, endYear, tiles),
        value: gridSumExpression(startYear, endYear, tiles),
        bounds: GRID_BOUNDS_HA.map((bound) => bound * M2_PER_HA),
        classes: gridClasses(destination),
        antialias: true,
        landColor: LAND_COLOR,
        read: (properties) => {
            const cellSizeKm = gridCellSizeKm(properties);
            const valueHa = gridValueHa(properties, startYear, endYear, tiles);
            return { name: gridCellName(cellSizeKm), valueText: describeValue(valueHa, cellSizeKm), classIndex: gridClassIndex(valueHa) };
        },
        texts: {
            empty: describeValue(null, 1),
            loading: 'Chargement des carreaux…',
            missing: missingTilesNotice(tiles, destination),
            outside: covered ? null : NOTICE_OUTSIDE_COVERAGE,
            caption: `carreaux de 1 km × 1 km · ${periodText}`,
            spoken: `par carreau de 1 km × 1 km ${periodText}`,
        },
    };
};

// --- Géométries du fond de carte --------------------------------------------------------
// L'endpoint du fond de carte renvoie des coordonnées projetées (EPSG:3857, en mètres) pour
// Highcharts ; MapLibre attend des longitudes et latitudes.

const EARTH_RADIUS = 6378137;
const DEGREES = 180 / Math.PI;

export const mercatorToLngLat = ([x, y]: [number, number]): [number, number] => [
    (x / EARTH_RADIUS) * DEGREES,
    (2 * Math.atan(Math.exp(y / EARTH_RADIUS)) - Math.PI / 2) * DEGREES,
];

export const lngLatToMercator = ([lng, lat]: [number, number]): [number, number] => [
    (lng / DEGREES) * EARTH_RADIUS,
    Math.log(Math.tan(Math.PI / 4 + lat / DEGREES / 2)) * EARTH_RADIUS,
];

// Un cartouche d'outre-mer est une vignette posée près de l'Hexagone : rien de plus précis n'y
// est dessiné quand on s'en approche. Rend celui que la vue a isolé (son centre y tombe, et elle
// n'est pas beaucoup plus large que lui), pour que la carte ouvre ce territoire à sa position
// réelle ; null sinon. Positions et largeur en coordonnées projetées (EPSG:3857).
const INSET_VIEW_WIDTHS = 2.5;
type Inset = { zone: string; name: string; bbox: [number, number, number, number] };
export const isolatedInset = <T extends Inset>(insets: T[], [x, y]: [number, number], viewWidth: number): T | null =>
    insets.find(({ bbox: [west, south, east, north] }) => x >= west && x <= east && y >= south && y <= north && viewWidth <= Math.max(east - west, north - south) * INSET_VIEW_WIDTHS) ??
    null;

// Par-dessus les carreaux, les mailles ou l'image, les limites s'effacent aux vues larges, où des
// centaines de traits recouvriraient la donnée, et reprennent leur force quand la carte se
// rapproche. Zooms de la carte entre lesquels le trait passe de son opacité la plus faible à la
// plus forte, par maille.
type BorderFade = { from: number; to: number; faint: number; strong: number };
const BORDER_FADES_OVER_DATA: Record<string, BorderFade> = {
    REGION: { from: 4, to: 6, faint: 0.8, strong: 0.95 },
    DEPART: { from: 4, to: 7, faint: 0.55, strong: 0.9 },
    EPCI: { from: 5, to: 8.5, faint: 0.22, strong: 0.85 },
    COMM: { from: 8, to: 11, faint: 0.2, strong: 0.75 },
};
const borderFade = (scale: string): BorderFade => BORDER_FADES_OVER_DATA[scale] ?? BORDER_FADES_OVER_DATA.EPCI;

export const borderOpacityOverData = (scale: string): ExpressionSpecification => {
    const { from, to, faint, strong } = borderFade(scale);
    return ['interpolate', ['linear'], ['zoom'], from, faint, to, strong];
};

// Le liseré clair n'apparaît qu'avec le trait fort : sous un trait effacé, il ne ferait que voiler la donnée
export const haloOpacityOverData = (scale: string): ExpressionSpecification | number => {
    if (!landBorderStyle(scale).halo) return 0;
    const { from, to } = borderFade(scale);
    return ['interpolate', ['linear'], ['zoom'], (from + to) / 2, 0, to, HALO_OPACITY];
};

// Ligne qui sépare de l'Hexagone les territoires d'outre-mer rapprochés de lui, pour une carte MapLibre
export const separationLine = (points: [number, number][]): GeoJSON.Feature => ({
    type: 'Feature',
    properties: {},
    geometry: { type: 'LineString', coordinates: points.map(mercatorToLngLat) },
});

const convertCoordinates = (coordinates: unknown): unknown => {
    if (!Array.isArray(coordinates)) return coordinates;
    if (typeof coordinates[0] === 'number') return mercatorToLngLat(coordinates as [number, number]);
    return coordinates.map(convertCoordinates);
};

export type Bounds = [[number, number], [number, number]];

// Étend une emprise ([ouest, sud, est, nord], ou [xmin, ymin, xmax, ymax] en coordonnées
// projetées) à toutes les positions d'une géométrie
export const extendBounds = (coordinates: unknown, bounds: number[]): void => {
    if (!Array.isArray(coordinates)) return;
    if (typeof coordinates[0] === 'number') {
        const [x, y] = coordinates as [number, number];
        bounds[0] = Math.min(bounds[0], x);
        bounds[1] = Math.min(bounds[1], y);
        bounds[2] = Math.max(bounds[2], x);
        bounds[3] = Math.max(bounds[3], y);
        return;
    }
    coordinates.forEach((part) => extendBounds(part, bounds));
};

type ProjectedFeature = { type: 'Feature'; properties: Record<string, unknown>; geometry: { type: string; coordinates: unknown } };

// Fond de carte en longitudes et latitudes, avec son emprise ([[ouest, sud], [est, nord]]), null s'il est vide
export const toLngLatCollection = <T extends ProjectedFeature>(features: T[]): { collection: { type: 'FeatureCollection'; features: T[] }; bounds: Bounds | null } => {
    const bounds = [Infinity, Infinity, -Infinity, -Infinity];
    const converted = features.map((feature) => {
        const coordinates = convertCoordinates(feature.geometry.coordinates);
        extendBounds(coordinates, bounds);
        return { ...feature, geometry: { ...feature.geometry, coordinates } };
    });
    return {
        collection: { type: 'FeatureCollection', features: converted },
        bounds: Number.isFinite(bounds[0]) ? [[bounds[0], bounds[1]], [bounds[2], bounds[3]]] : null,
    };
};

// Limites administratives des cartes MapLibre : un trait foncé sur un liseré clair, lisible sur
// des mailles ou des communes colorées comme sur le fond des territoires
export const LAND_BORDER_COLOR = '#2f2f5e';
export const LAND_HALO_COLOR = '#ffffff';

// Limites administratives de la carte carroyée, dessinées par-dessus les carreaux. Plus la maille
// est fine, plus le trait est léger, pour ne pas couvrir les carreaux qu'il sépare. `halo` : liseré
// clair sous le trait, qui le détache des carreaux colorés ; la maille commune s'en passe, ses
// limites sont trop serrées. Épaisseurs en pixels au cadrage ; le trait s'épaissit avec le zoom.
// `thinBelow` : zoom sous lequel le trait s'amincit et perd son liseré. Au cadrage du pays sur un
// téléphone (zoom 3,7), les limites des 1 255 EPCI couvriraient sinon la moitié de ce qui est dessiné.
type LandBorderStyle = { width: number; halo: boolean; thinBelow?: number };
const LAND_BORDER_STYLES: Record<string, LandBorderStyle> = {
    REGION: { width: 1.4, halo: true },
    DEPART: { width: 1.2, halo: true },
    EPCI: { width: 0.9, halo: true, thinBelow: 5 },
    COMM: { width: 0.5, halo: false },
};
export const landBorderStyle = (scale: string): LandBorderStyle => LAND_BORDER_STYLES[scale] ?? LAND_BORDER_STYLES.EPCI;

// Le trait a l'épaisseur donnée au zoom 4, celui du cadrage du pays sur un grand écran, et 1,6 fois plus au zoom 9
const FRAMING_ZOOM = 4;
const CLOSE_ZOOM = 9;
const CLOSE_GROWTH = 1.6;
const widthAtZoom = (width: number, zoom: number): number => width * (1 + ((CLOSE_GROWTH - 1) * (zoom - FRAMING_ZOOM)) / (CLOSE_ZOOM - FRAMING_ZOOM));
// Trait aminci : il perd 60 % de son épaisseur sur un niveau et demi de zoom, et son liseré sur un niveau
const THIN_SHARE = 0.4;
const THINNING_ZOOMS = 1.5;
const HALO_FADING_ZOOMS = 1;
const HALO_OPACITY = 0.85;

// Épaisseur d'un trait de la carte selon le zoom. Au-dessus de `thinBelow`, elle est la même avec ou sans lui.
export const lineWidthExpression = (width: number, thinBelow?: number): ExpressionSpecification => {
    if (thinBelow === undefined) return ['interpolate', ['linear'], ['zoom'], FRAMING_ZOOM, width, CLOSE_ZOOM, width * CLOSE_GROWTH];
    return ['interpolate', ['linear'], ['zoom'], thinBelow - THINNING_ZOOMS, width * THIN_SHARE, thinBelow, widthAtZoom(width, thinBelow), CLOSE_ZOOM, width * CLOSE_GROWTH];
};

// Opacité du liseré clair sous le trait
export const haloOpacityExpression = ({ halo, thinBelow }: LandBorderStyle): ExpressionSpecification | number => {
    if (!halo) return 0;
    return thinBelow === undefined ? HALO_OPACITY : ['interpolate', ['linear'], ['zoom'], thinBelow - HALO_FADING_ZOOMS, 0, thinBelow, HALO_OPACITY];
};
