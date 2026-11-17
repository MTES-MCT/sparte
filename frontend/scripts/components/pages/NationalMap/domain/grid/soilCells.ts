// Sols artificialisés de la carte nationale : la part artificialisée de mailles carrées, d'après
// l'OCS GE au dernier millésime de chaque département. Un seul fichier de tuiles pour toutes les
// zones, `sols_artificialises_national.pmtiles`, produit par le DAG
// `create_sols_artificialises_national_vector_tiles`. Il est multi-résolution : chaque zoom de
// tuile ne porte qu'une taille de maille (`resolution_m`), de 5 km aux zooms 3 à 5 jusqu'à 250 m
// au zoom 10, et toutes portent la même grandeur, `part_artif`, en % de la surface que l'OCS GE
// couvre dans la maille. Les classes et la légende valent donc à toutes les résolutions.
//
// Les mailles d'outre-mer y figurent deux fois, départagées par `placement` : à leur position
// réelle (`reel`) et déplacées près de l'Hexagone (`cartouche`), là où le fond de la France
// entière place leurs territoires. Les mailles de l'Hexagone et de la Corse n'ont pas cet attribut.
import type { ExpressionSpecification } from 'maplibre-gl';
import { formatNumber } from '@utils/formatUtils';
import { NO_DATA_COLOR, ValueClass } from '../../values';
import { ZONE_FRANCE, ZONE_HEXAGONE, zoneToLand } from '../../zones';
import { GridCells, cellClassIndex, hasCode } from './cells';

const TILES_FILE = 'sols_artificialises_national.pmtiles';
const TILES_LAYER = 'sols_artificialises_national';

const REGION_CORSE = '94';
// Au-delà de ce côté, en mètres, une maille ne porte pas la liste de ses EPCI
const LARGEST_CELL_WITH_EPCI_M = 1000;

// Bornes des classes, en % de la maille. Elles sont fixes : une maille a la même couleur quels que
// soient le territoire affiché et le niveau de zoom.
export const SOIL_BOUNDS_PCT = [10, 20, 35, 50];

// Du vert au rouge, de clarté décroissante : les classes restent ordonnées pour une personne
// daltonienne. Cette rampe ne sert qu'à la nature du sol ; les évolutions gardent le bleu et le rouge.
const SOIL_PALETTE = ['#BFE6B0', '#DCD487', '#EDB062', '#E67A42', '#CF2A1B'];

// Les parts sont des entiers : le libellé dit de quel côté tombe une maille égale à une borne
const className = (from: number | undefined, to: number | undefined): string => {
    if (from === undefined) return `Moins de ${to} %`;
    return to === undefined ? `${from} % et plus` : `De ${from} à ${to} %`;
};

export const SOIL_CLASSES: ValueClass[] = SOIL_PALETTE.map((color, index) => {
    const from = index === 0 ? undefined : SOIL_BOUNDS_PCT[index - 1];
    const to = SOIL_BOUNDS_PCT[index];
    return { from, to, color, name: className(from, to) };
});

export const SOIL_METHOD_LABEL =
    "Part de la surface de chaque maille occupée par des sols artificialisés, d'après l'OCS GE au dernier millésime de chaque département (2019 à 2023). " +
    'Mailles de 5 km à 250 m de côté selon le zoom. Classes à bornes fixes, identiques pour tous les territoires et tous les zooms';

// Ce que la légende dit d'un endroit sans maille
export const SOIL_NO_DATA_LABEL = 'Pas de donnée OCS GE';

const PART: ExpressionSpecification = ['coalesce', ['get', 'part_artif'], 0];
const PLACEMENT: ExpressionSpecification = ['coalesce', ['get', 'placement'], ''];
const AT_REAL_POSITION: ExpressionSpecification = ['!=', PLACEMENT, 'cartouche'];
const CARRIES_EPCI: ExpressionSpecification = ['<=', ['coalesce', ['get', 'resolution_m'], 0], LARGEST_CELL_WITH_EPCI_M];

const anyOf = (conditions: ExpressionSpecification[]): ExpressionSpecification => (conditions.length === 1 ? conditions[0] : ['any', ...conditions]);

// Territoires dessinés d'une zone, dont dépendent les mailles retenues
type Displayed = {
    scale: string;
    landIds: string[];
    // Départements de la zone, quand elle est un EPCI
    departments: string[];
};

// Mailles d'une zone de la carte nationale (voir zones.ts).
// - France entière : l'Hexagone, la Corse et les mailles d'outre-mer déplacées.
// - Hexagone : la métropole sans la Corse.
// - Région, département, EPCI : ses mailles à leur position réelle. Un EPCI dessiné peut déborder
//   de la région ou du département affiché : les mailles retenues sont alors celles des EPCI
//   dessinés, pour qu'aucun ne paraisse à moitié vide.
// Les plus grandes mailles ne portent pas leurs EPCI : elles sont retenues par la région ou le
// département affiché et, pour un EPCI, par son département, dont elles débordent alors l'EPCI.
// Cela ne se voit que pour un EPCI assez étendu pour être cadré à petite échelle.
export const soilZoneFilter = (zone: string, { scale, landIds, departments }: Displayed): ExpressionSpecification => {
    if (zone === ZONE_FRANCE) return ['!=', PLACEMENT, 'reel'];
    if (zone === ZONE_HEXAGONE) return ['all', ['==', PLACEMENT, ''], ['!', hasCode('REGION', REGION_CORSE)]];
    const land = zoneToLand(zone);
    if (!land) return AT_REAL_POSITION;
    if (land.land_type === 'EPCI') {
        const inDepartments: ExpressionSpecification = departments.length > 0 ? anyOf(departments.map((code) => hasCode('DEPART', code))) : ['literal', false];
        return ['all', AT_REAL_POSITION, ['case', CARRIES_EPCI, hasCode('EPCI', land.land_id), inDepartments]];
    }
    const inLand = hasCode(land.land_type, land.land_id);
    if (scale !== 'EPCI' || landIds.length === 0) return ['all', AT_REAL_POSITION, inLand];
    return ['all', AT_REAL_POSITION, ['case', CARRIES_EPCI, anyOf(landIds.map((id) => hasCode('EPCI', id))), inLand]];
};

// Part artificialisée d'une maille, en % ; null si la tuile ne la porte pas
export const soilPart = (properties: Record<string, unknown>): number | null => (typeof properties.part_artif === 'number' ? properties.part_artif : null);

export const soilClassIndex = (partPct: number): number => cellClassIndex(SOIL_BOUNDS_PCT, partPct);

const sideText = (meters: number): string => (meters >= 1000 ? `${formatNumber({ number: meters / 1000, decimals: 0 })} km` : `${meters} m`);

// « Maille de 1 km × 1 km », « Maille de 250 m × 250 m » ; « Maille » quand la tuile ne dit pas son côté
const soilCellName = (properties: Record<string, unknown>): string => {
    const side = properties.resolution_m;
    return typeof side === 'number' && side > 0 ? `Maille de ${sideText(side)} × ${sideText(side)}` : 'Maille';
};

// « millésime 2021 », ou « millésimes 2020 et 2022 » pour une maille à cheval sur des départements
// aux millésimes différents ; chaîne vide quand la tuile ne les porte pas
const millesimeText = ({ annee_min: first, annee_max: last }: Record<string, unknown>): string => {
    if (typeof first !== 'number' || typeof last !== 'number') return '';
    return first === last ? ` (millésime ${first})` : ` (millésimes ${first} et ${last})`;
};

// Ce que le survol dit d'une maille : « Maille de 1 km × 1 km : 23 % de sols artificialisés (millésime 2021) »
export const soilCellText = (properties: Record<string, unknown>): string => {
    const part = soilPart(properties);
    const value = part === null ? 'part artificialisée inconnue' : `${formatNumber({ number: part, decimals: 0 })} % de sols artificialisés`;
    return `${soilCellName(properties)} : ${value}${millesimeText(properties)}`;
};

const NO_CELL_TEXT = 'Pas de donnée OCS GE à cet endroit';
// Titre de l'infobulle d'une maille de bord, là où elle dépasse des territoires affichés
const OUTSIDE_LANDS_NAME = 'Hors des territoires affichés';
const NOTICE_MISSING =
    'La carte des sols artificialisés par maille n’est pas encore disponible : la carte « Part du territoire artificialisée » montre la même grandeur par territoire.';
// Sans mailles, les objets OCS GE restent lisibles en zoomant (la légende y invite), mais pas de
// partout sur une zone nationale : voir departmentsOfLands
const NOTICE_OBJECTS_FROM_LAND = 'Pour voir les objets OCS GE en zoomant, ouvrez une région, un département ou un EPCI.';

// Mailles des sols artificialisés d'une zone, telles que le moteur des carreaux les dessine
export const soilCells = (zone: string, displayed: Displayed): GridCells => ({
    key: `${TILES_FILE}|${zone}`,
    file: TILES_FILE,
    layer: TILES_LAYER,
    // Toutes les mailles sont dessinées, y compris à 0 % : là où il n'y en a pas, c'est la donnée qui manque
    filter: soilZoneFilter(zone, displayed),
    value: PART,
    bounds: SOIL_BOUNDS_PCT,
    classes: SOIL_CLASSES,
    antialias: false,
    landColor: NO_DATA_COLOR,
    read: (properties) => {
        const part = soilPart(properties);
        return { name: OUTSIDE_LANDS_NAME, valueText: soilCellText(properties), classIndex: part === null ? null : soilClassIndex(part) };
    },
    texts: {
        empty: NO_CELL_TEXT,
        loading: 'Chargement des mailles…',
        missing: zoneToLand(zone) ? NOTICE_MISSING : `${NOTICE_MISSING} ${NOTICE_OBJECTS_FROM_LAND}`,
        outside: null,
        caption: 'part artificialisée par maille · dernier millésime OCS GE de chaque département',
        spoken: 'par maille carrée, au dernier millésime OCS GE de chaque département',
    },
});
