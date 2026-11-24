// Objets OCS GE de la carte des sols artificialisés : aux grands zooms, la carte dessine les objets
// eux-mêmes, artificialisés ou non, à la place des mailles. Ce sont les tuiles des diagnostics, un
// fichier par département et par millésime (`occupation_du_sol_<millésime>_<département>.pmtiles`),
// lues au dernier millésime de chaque département. Elles contiennent tous les objets à tous les
// zooms : elles ne sont lues qu'à partir du zoom où une vue reste légère, et pour les seuls
// départements en vue.
import type { ExpressionSpecification } from 'maplibre-gl';
import { getCouvertureLabel, getLastMillesimeIndex, getUsageLabel } from '@components/map/utils/ocsge';
import type { Millesime } from '@services/types/land';
import { formatNumber } from '@utils/formatUtils';
import type { ValueClass } from '../../values';
import { LandRef, zoneToLand } from '../../zones';
import type { DetailTiles, GridDetail, TileReading } from './cells';
import { SOIL_IMAGE_CLASSES } from './soilImage';

// Zoom de la carte à partir duquel les objets remplacent l'image ou les mailles. Poids mesuré des
// tuiles qu'une vue de 1440 × 900 px charge au plus (douze tuiles) : au zoom 13, 6,3 Mo dans le
// centre de Lyon et 3,1 Mo dans celui de Paris ; au zoom 14, 1,8 Mo et 1,1 Mo, et 0,2 Mo en campagne.
// Le zoom 13 est retenu à la demande de l'utilisateur (« le passage au vecteur arrive trop tard »
// au zoom 14) : une vue y fait une dizaine de kilomètres de large. Au zoom 12, elle pèserait
// quatre fois plus.
const OBJECTS_MIN_ZOOM = 13;
// Les tuiles s'arrêtent au zoom 14, la carte les agrandit ensuite : au zoom 17, un pixel couvre
// 40 cm, moins que la précision de l'OCS GE
const MAP_MAX_ZOOM = 17;

const TILES_PREFIX = 'occupation_du_sol';

// Lignes de la légende des objets, dans l'ordre : leur rang est la classe d'un objet. Ce sont
// celles de l'image de l'IGN, couleurs comprises (demande de l'utilisateur) : en zoomant, le
// passage de l'image aux objets ne change pas ce qu'on lit, seulement ce qu'on peut faire.
const ARTIFICIAL_CLASS = 0;
const NATURAL_CLASS = 1;
export const SOIL_OBJECT_CLASSES: ValueClass[] = SOIL_IMAGE_CLASSES;

// Rien ne distingue à l'œil les objets de l'image qu'ils remplacent : la légende et la carte disent
// qu'ils se laissent interroger
export const SOIL_OBJECTS_BASIS = "Objets de l'OCS GE, interactifs : survolez ou touchez un objet pour lire sa nature.";
export const SOIL_OBJECTS_HINT = 'Objets interactifs';

export const SOIL_OBJECTS_METHOD_LABEL =
    "Objets de l'OCS GE (IGN) au dernier millésime de leur département, artificialisés ou non d'après leur couverture et leur usage, " +
    "dans les couleurs de l'image de l'IGN. Survolez ou touchez un objet pour lire sa couverture, son usage et sa surface. " +
    "En dézoomant, la carte revient à l'image d'ensemble";

const IS_ARTIFICIAL: ExpressionSpecification = ['==', ['get', 'is_artificial'], true];

// Les territoires d'une maille sont une liste sérialisée, `["35","22"]` ; liste vide si elle est illisible
const codesOf = (serialized: unknown): string[] => {
    if (typeof serialized !== 'string') return [];
    try {
        const codes: unknown = JSON.parse(serialized);
        return Array.isArray(codes) ? codes.filter((code): code is string => typeof code === 'string') : [];
    } catch {
        return [];
    }
};

// Départements des mailles en vue, triés. Les mailles d'outre-mer déplacées près de l'Hexagone ne
// comptent pas : leurs objets sont à leur position réelle, hors de la vue.
export const departmentsOfCells = (cells: Record<string, unknown>[]): string[] => {
    const departments = new Set<string>();
    cells.filter((cell) => cell.placement !== 'cartouche').forEach((cell) => codesOf(cell.DEPART).forEach((code) => departments.add(code)));
    return [...departments].sort((a, b) => a.localeCompare(b));
};

// Au-delà de ce nombre de départements, lire l'en-tête du fichier de chacun pèserait plus que les
// objets d'une vue. La plus grande région en compte treize.
const MAX_UNLOCATED_DEPARTMENTS = 13;
const OVERSEAS_PREFIX = '97';

// Département d'un territoire dessiné quand son code le donne : le sien, ou celui de sa commune
const departmentOfLand = ({ land_type: type, land_id: id }: Record<string, unknown>): string | null => {
    if (typeof id !== 'string') return null;
    if (type === 'DEPART') return id;
    if (type === 'COMM') return id.slice(0, id.startsWith(OVERSEAS_PREFIX) ? 3 : 2);
    return null;
};

// Départements à lire quand le fichier des mailles manque : ceux de la zone, que donnent les
// millésimes de sa fiche. Quand les territoires en vue sont des départements ou des communes, seuls
// les leurs sont retenus ; sur une zone nationale, ceux d'outre-mer ne comptent pas, leurs
// territoires étant dessinés près de l'Hexagone, loin de leurs objets. Sinon (régions, EPCI), tous
// ceux de la zone : un fichier hors de la vue ne charge que son en-tête. La France entière par
// région ou par EPCI en compterait une centaine : aucun n'est lu, les objets se voient alors en
// ouvrant un territoire.
export const departmentsOfLands =
    (zone: string) =>
    (millesimes: Millesime[], lands: Record<string, unknown>[]): string[] => {
        const ofZone = [...new Set(millesimes.map((millesime) => millesime.departement))].sort((a, b) => a.localeCompare(b));
        const ofLands = lands.map(departmentOfLand);
        if (ofLands.length > 0 && ofLands.every((department) => department !== null)) {
            const national = zoneToLand(zone) === null;
            const inView = new Set(ofLands.filter((department) => !(national && department.startsWith(OVERSEAS_PREFIX))));
            return ofZone.filter((department) => inView.has(department));
        }
        return ofZone.length <= MAX_UNLOCATED_DEPARTMENTS ? ofZone : [];
    };

// Fichiers des objets de ces départements, à leur dernier millésime ; un département sans
// millésime n'a pas d'objets
export const soilObjectTiles = (millesimes: Millesime[], departments: string[]): DetailTiles[] =>
    departments.flatMap((department) => {
        const own = millesimes.filter((millesime) => millesime.departement === department);
        if (own.length === 0) return [];
        const name = `${TILES_PREFIX}_${getLastMillesimeIndex(own)}_${department}`;
        return [{ department, file: `${name}.pmtiles`, layer: name }];
    });

// Territoires dessinés d'une zone, dont dépendent les objets retenus
type Displayed = { scale: string; landIds: string[] };

// Objets d'une zone de la carte nationale : ceux de la région, du département ou de l'EPCI affiché,
// ou des EPCI dessinés quand ils peuvent en déborder (voir soilZoneFilter). Sans restriction pour
// la France entière et l'Hexagone, où seuls les départements des mailles en vue sont lus. Chaque
// objet porte le code de son territoire de chaque niveau.
export const soilObjectsFilter = (zone: string, { scale, landIds }: Displayed): ExpressionSpecification | null => {
    const land = zoneToLand(zone);
    if (!land) return null;
    if (land.land_type !== 'EPCI' && scale === 'EPCI' && landIds.length > 0) return ['in', ['get', 'EPCI'], ['literal', landIds]];
    return ['==', ['get', land.land_type], land.land_id];
};

const M2_PER_HA = 10000;

// « 4 908 m² », « 447,3 ha » à partir d'un hectare
const surfaceText = (surfaceM2: number): string =>
    surfaceM2 >= M2_PER_HA ? `${formatNumber({ number: surfaceM2 / M2_PER_HA, decimals: 1 })} ha` : `${formatNumber({ number: surfaceM2, decimals: 0 })} m²`;

// Usage d'un objet à la suite de « usage : » : le libellé de la nomenclature, sans le mot qu'il répète
// (« Usage résidentiel », « Sans usage »)
const usageText = (code: unknown): string => {
    if (typeof code !== 'string') return 'inconnu';
    const label = getUsageLabel(code).toLowerCase();
    return label === 'sans usage' ? 'aucun' : label.replace(/^usage /, '');
};

// Ce que le survol dit d'un objet : sa nature, puis sa couverture, son usage, sa surface et son millésime
export const soilObjectReading = (properties: Record<string, unknown>): TileReading => {
    const artificial = properties.is_artificial === true;
    const { code_cs: cover, code_us: use, surface, year } = properties;
    const facts = [
        `Couverture : ${typeof cover === 'string' ? getCouvertureLabel(cover).toLowerCase() : 'inconnue'}`,
        `usage : ${usageText(use)}`,
        ...(typeof surface === 'number' && surface > 0 ? [surfaceText(surface)] : []),
        ...(typeof year === 'number' ? [`millésime ${year}`] : []),
    ];
    const reading = SOIL_OBJECT_CLASSES[artificial ? ARTIFICIAL_CLASS : NATURAL_CLASS];
    return { name: reading.name, valueText: facts.join(' · '), classIndex: artificial ? ARTIFICIAL_CLASS : NATURAL_CLASS };
};

const NOTICE_PARTIAL = 'Les objets OCS GE ne sont pas disponibles partout dans cette vue : la carte y garde ses mailles.';

// Objets des sols artificialisés d'une zone, tels que le moteur des carreaux les dessine.
// `land` : territoire dont la fiche donne les millésimes des départements de la zone.
export const soilObjects = (zone: string, displayed: Displayed, land: LandRef): GridDetail => ({
    minZoom: OBJECTS_MIN_ZOOM,
    maxZoom: MAP_MAX_ZOOM,
    land,
    departmentsOf: departmentsOfCells,
    departmentsWithoutCells: departmentsOfLands(zone),
    tilesOf: soilObjectTiles,
    filter: soilObjectsFilter(zone, displayed),
    color: ['case', IS_ARTIFICIAL, SOIL_OBJECT_CLASSES[ARTIFICIAL_CLASS].color, SOIL_OBJECT_CLASSES[NATURAL_CLASS].color],
    // Un liseré clair sépare les objets voisins de même nature
    outlineColor: 'rgba(255, 255, 255, 0.45)',
    opacity: (highlightedClass, dimmedOpacity) => {
        if (highlightedClass === null) return 1;
        return ['case', ['==', IS_ARTIFICIAL, highlightedClass === ARTIFICIAL_CLASS], 1, dimmedOpacity];
    },
    classes: SOIL_OBJECT_CLASSES,
    read: soilObjectReading,
    caption: 'objets OCS GE, artificialisés ou non · dernier millésime de chaque département',
    partialNotice: NOTICE_PARTIAL,
});
