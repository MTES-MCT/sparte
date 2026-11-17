// Rognage d'une image sur les territoires dessinés. MapLibre ne sait pas découper une image en
// tuiles : un masque de la couleur de la scène est posé par-dessus, percé là où sont les
// territoires. Le trou est le contour de leur réunion, et non un trou par territoire : des trous
// qui partagent leurs arêtes ne forment pas un polygone valide, et la triangulation de MapLibre
// les rendait mal (territoires manquants).
//
// La réunion ne demande ni bibliothèque ni calcul géométrique : les fonds de la carte nationale
// sont simplifiés ensemble, deux territoires voisins y partagent exactement les mêmes sommets. Une
// arête parcourue dans les deux sens est intérieure à la réunion ; celles qui restent en sont le
// contour. Mesuré sur les fonds réels (16 novembre 2026) : les 172 EPCI d'Auvergne-Rhône-Alpes
// (5 218 arêtes) donnent un seul anneau de 580 sommets en 3 ms, les 4 293 communes de
// Nouvelle-Aquitaine 26 anneaux en 20 ms ; 27 ms au plus sur les 256 fonds des régions et des
// départements, où aucun anneau n'en croise un autre.
//
// Tout repose sur ces sommets communs. Un fond dont les territoires voisins n'auraient pas les
// mêmes sommets (des géométries simplifiées une à une) garderait un anneau par territoire : des
// trous qui se touchent ou se chevauchent, et les défauts de triangulation reviendraient.
import { ZONE_FRANCE } from '../../zones';

export type Position = [number, number];
export type Ring = Position[];
// Un polygone : son contour, puis ses trous
type Polygon = Ring[];

type Geometry = { type: string; coordinates: unknown };

// Polygones d'une géométrie du fond de carte ; aucun pour une géométrie d'un autre type
const polygonsOf = ({ type, coordinates }: Geometry): Polygon[] => {
    if (type === 'Polygon') return [coordinates as Polygon];
    return type === 'MultiPolygon' ? (coordinates as Polygon[]) : [];
};

// Aire signée d'un anneau : positive s'il tourne dans le sens trigonométrique
export const signedArea = (ring: Ring): number =>
    ring.reduce((sum, [x, y], index) => {
        const [nextX, nextY] = ring[(index + 1) % ring.length];
        return sum + (x * nextY - nextX * y);
    }, 0) / 2;

const keyOf = ([x, y]: Position): string => `${x},${y}`;
const samePosition = (a: Position, b: Position): boolean => a[0] === b[0] && a[1] === b[1];

// Anneau sans son dernier point quand il répète le premier, orienté dans le sens demandé
const oriented = (ring: Ring, counterClockwise: boolean): Ring => {
    const open = ring.length > 1 && samePosition(ring[0], ring[ring.length - 1]) ? ring.slice(0, -1) : ring;
    return signedArea(open) > 0 === counterClockwise ? open : [...open].reverse();
};

// Arêtes qui partent d'un sommet : ce sommet, et ceux où elles mènent
type Leaving = { from: Position; to: Position[] };

// Arêtes du contour de la réunion, par sommet de départ : celles qu'aucun voisin ne parcourt en
// sens inverse. Les contours sont tous orientés dans le même sens, les trous dans l'autre : deux
// territoires voisins parcourent leur limite commune en sens contraires.
const outlineEdges = (polygons: Polygon[]): Map<string, Leaving> => {
    const edges = new Map<string, [Position, Position]>();
    polygons.forEach((polygon) =>
        polygon.forEach((ring, index) => {
            const points = oriented(ring, index === 0);
            points.forEach((from, at) => {
                const to = points[(at + 1) % points.length];
                if (samePosition(from, to)) return;
                const back = `${keyOf(to)}>${keyOf(from)}`;
                if (edges.has(back)) edges.delete(back);
                else edges.set(`${keyOf(from)}>${keyOf(to)}`, [from, to]);
            });
        }),
    );
    const leaving = new Map<string, Leaving>();
    edges.forEach(([from, to]) => {
        const known = leaving.get(keyOf(from));
        if (known) known.to.push(to);
        else leaving.set(keyOf(from), { from, to: [to] });
    });
    return leaving;
};

// Contour de la réunion de polygones jointifs, en anneaux simples et ouverts (le dernier point ne
// répète pas le premier) : dans le sens trigonométrique autour de chaque morceau de la réunion
// (île, partie continentale), dans le sens horaire autour de chaque enclave qu'elle entoure.
// Un anneau ne repasse jamais par un sommet : là où deux morceaux ne se touchent que par un point,
// ils font deux anneaux, que la triangulation de MapLibre lit sans ambiguïté.
export const unionOutline = (polygons: Polygon[]): Ring[] => {
    const leaving = outlineEdges(polygons);
    const rings: Ring[] = [];
    const next = (key: string): Position | undefined => leaving.get(key)?.to.pop();
    leaving.forEach(({ from: start }) => {
        // Chemin parcouru depuis le sommet de départ, et rang de chacun de ses sommets
        const path: Position[] = [start];
        let key = keyOf(start);
        const rankOf = new Map<string, number>([[key, 0]]);
        // Chaque arête n'est suivie qu'une fois. Le contour d'une réunion de polygones fermés a,
        // en chaque sommet, autant d'arêtes qui arrivent que d'arêtes qui partent : le chemin ne
        // s'arrête qu'à son départ, tout anneau fermé.
        for (let to = next(key); to !== undefined; to = next(key)) {
            key = keyOf(to);
            const rank = rankOf.get(key);
            if (rank === undefined) {
                rankOf.set(key, path.length);
                path.push(to);
            } else {
                // Le chemin revient sur lui-même : la boucle fermée est un anneau, le reste continue
                const ring = path.splice(rank);
                ring.slice(1).forEach((position) => rankOf.delete(keyOf(position)));
                path.push(ring[0]);
                rings.push(ring);
            }
        }
    });
    return rings;
};

// Un point est-il à l'intérieur d'un anneau ? Règle pair-impair, par un rayon horizontal.
const contains = (ring: Ring, [x, y]: Position): boolean =>
    ring.reduce((inside, [x1, y1], index) => {
        const [x2, y2] = ring[(index + 1) % ring.length];
        const crosses = y1 > y !== y2 > y && x < x1 + ((y - y1) * (x2 - x1)) / (y2 - y1);
        return crosses ? !inside : inside;
    }, false);

const reversed = (ring: Ring): Ring => [...ring].reverse();
const closed = (ring: Ring): Ring => [...ring, ring[0]];

// Point d'un anneau du contour qu'aucun autre anneau ne touche : le milieu de sa première arête.
// Deux anneaux peuvent partager un sommet, jamais une arête.
const probeOf = ([[x1, y1], [x2, y2]]: Ring): Position => [(x1 + x2) / 2, (y1 + y2) / 2];

// Polygones du masque qui couvre `world` sauf la réunion dont `outline` est le contour (voir
// unionOutline) : le monde percé de chaque morceau de la réunion, et chaque enclave, pleine, percée
// des morceaux qu'elle contient. Anneaux fermés, contours dans le sens trigonométrique et trous
// dans le sens horaire, comme le veut GeoJSON. `world` : dans le sens trigonométrique.
export const maskAround = (outline: Ring[], world: Ring): Polygon[] => {
    const allPieces = outline.filter((ring) => signedArea(ring) > 0);
    const allEnclaves = outline.filter((ring) => signedArea(ring) < 0);
    // Nombre de morceaux, moins nombre d'enclaves, qui entourent un anneau : 0 là où le masque
    // couvre, 1 dans la réunion
    const depthOf = (ring: Ring): number => {
        const probe = probeOf(ring);
        const around = (rings: Ring[]): number => rings.filter((other) => other !== ring && contains(other, probe)).length;
        return around(allPieces) - around(allEnclaves);
    };
    // Deux territoires qui se recouvrent, faute de limite commune (une commune trop petite pour la
    // simplification garde son contour d'origine), laissent un anneau à l'intérieur de la réunion :
    // il n'en change pas le contour. Gardé, il ferait un trou dans un trou, que la triangulation
    // de MapLibre rend mal. Mesuré sur les 256 fonds des régions et des départements : cinq
    // anneaux de ce genre, dans trois fonds de communes.
    const pieces = allPieces.filter((piece) => depthOf(piece) === 0);
    // De la plus petite à la plus grande : un morceau appartient à la plus petite enclave qui le contient
    const enclaves = allEnclaves
        .filter((enclave) => depthOf(enclave) === 1)
        .map(reversed)
        .sort((a, b) => signedArea(a) - signedArea(b));
    const holes = new Map<Ring, Ring[]>([[world, []], ...enclaves.map((enclave): [Ring, Ring[]] => [enclave, []])]);
    pieces.forEach((piece) => {
        const probe = probeOf(piece);
        const holder = enclaves.find((enclave) => contains(enclave, probe)) ?? world;
        holes.get(holder).push(reversed(piece));
    });
    return [...holes].map(([exterior, inner]) => [exterior, ...inner].map(closed));
};

// Zones où l'image est rognée sur les territoires dessinés : toutes, sauf la France entière.
// - Région, département, EPCI : l'image ne montre plus les territoires voisins.
// - Hexagone : la Corse, qui n'en fait pas partie, n'est plus dessinée.
// - France entière : rien à cacher. L'OCS GE ne couvre que la France, et les cartouches
//   d'outre-mer reçoivent chacun leur image, hors des tuiles.
export const clipsImage = (zone: string): boolean => zone !== ZONE_FRANCE;

// Le monde que le masque couvre, dans le sens trigonométrique, en coordonnées projetées
// (EPSG:3857) : un carré, bien au-delà de ce que la carte peut montrer d'une zone
const HALF_WORLD = 20_037_508;
const WORLD: Ring = [
    [-HALF_WORLD, -HALF_WORLD],
    [HALF_WORLD, -HALF_WORLD],
    [HALF_WORLD, HALF_WORLD],
    [-HALF_WORLD, HALF_WORLD],
];

// Plus petite enclave masquée, en mètres carrés projetés : environ 1 km² sur le terrain en
// métropole. En deçà, ce n'est pas un territoire voisin mais un défaut du fond simplifié (le
// morceau détaché d'un territoire, que la simplification a écarté) : l'image y reste, pour ne pas
// semer la zone de points blancs. Mesuré sur les fonds réels : dix défauts de 0,02 à 0,74 km² dans
// l'Hexagone par EPCI ; les enclaves réelles vont de 9,7 km² (Llívia) à 144 km² (l'Enclave des Papes).
const SMALLEST_ENCLAVE_M2 = 2_000_000;

export type ImageMask = { type: 'Feature'; properties: Record<string, never>; geometry: { type: 'MultiPolygon'; coordinates: Polygon[] } };

// Masque d'une image rognée sur des territoires, dans leurs coordonnées (projetées, EPSG:3857) :
// le monde entier, sauf eux. null sans territoire : la carte n'a pas encore de fond à rogner.
export const imageMask = (lands: { geometry: Geometry }[]): ImageMask | null => {
    const outline = unionOutline(lands.flatMap(({ geometry }) => polygonsOf(geometry))).filter((ring) => {
        const area = signedArea(ring);
        return area > 0 || -area >= SMALLEST_ENCLAVE_M2;
    });
    if (outline.length === 0) return null;
    return { type: 'Feature', properties: {}, geometry: { type: 'MultiPolygon', coordinates: maskAround(outline, WORLD) } };
};
