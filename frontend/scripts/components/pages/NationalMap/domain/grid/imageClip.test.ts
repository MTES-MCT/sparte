import { ZONE_FRANCE, ZONE_HEXAGONE } from '../../zones';
import { Position, Ring, clipsImage, imageMask, maskAround, signedArea, unionOutline } from './imageClip';

// Rognage de l'image sur les territoires dessinés : le contour de leur réunion, le masque percé à
// ce contour, et les zones où il s'applique.

// Carré de côté `side` dont le coin sud-ouest est en (x, y), fermé, dans le sens trigonométrique
const square = (x: number, y: number, side = 10): Ring => [
    [x, y],
    [x + side, y],
    [x + side, y + side],
    [x, y + side],
    [x, y],
];
const clockwise = (ring: Ring): Ring => [...ring].reverse();
// Sommets d'un anneau, triés : deux anneaux égaux quel que soit leur sommet de départ
const vertices = (ring: Ring): string[] => ring.map(([x, y]) => `${x},${y}`).sort((a, b) => a.localeCompare(b));
const sorted = (rings: Ring[]): Ring[] => [...rings].sort((a, b) => signedArea(b) - signedArea(a));
// Un anneau ne repasse par aucun sommet
const isSimple = (ring: Ring): boolean => new Set(vertices(ring)).size === ring.length;

describe('contour de la réunion de territoires jointifs', () => {
    it('efface la limite commune de deux territoires voisins : un seul anneau, dans le sens trigonométrique', () => {
        const outline = unionOutline([[square(0, 0)], [square(10, 0)]]);

        expect(outline).toHaveLength(1);
        expect(vertices(outline[0])).toEqual(vertices([[0, 0], [10, 0], [20, 0], [20, 10], [10, 10], [0, 10]]));
        expect(signedArea(outline[0])).toBe(200);
    });

    it('ne dépend ni du sens des anneaux reçus, ni de la répétition de leur premier point', () => {
        const open = square(10, 0).slice(0, -1);

        expect(sorted(unionOutline([[clockwise(square(0, 0))], [open]])).map(signedArea)).toEqual([200]);
    });

    it('rend un anneau par morceau : une île reste séparée du continent', () => {
        const outline = sorted(unionOutline([[square(0, 0)], [square(10, 0)], [square(50, 50, 2)]]));

        expect(outline.map(signedArea)).toEqual([200, 4]);
    });

    it('entoure dans le sens horaire une enclave que les territoires laissent entre eux', () => {
        // Huit territoires autour d'un carré central qui n'appartient à aucun
        const around = [0, 10, 20].flatMap((x) => [0, 10, 20].filter((y) => x !== 10 || y !== 10).map((y) => [square(x, y)]));
        const outline = sorted(unionOutline(around));

        expect(outline.map(signedArea)).toEqual([900, -100]);
        expect(vertices(outline[1])).toEqual(vertices(square(10, 10).slice(0, -1)));
    });

    it('ne laisse pas d’enclave là où un territoire remplit le trou d’un autre', () => {
        const ring = [square(0, 0, 30), clockwise(square(10, 10))];

        expect(unionOutline([ring]).map(signedArea).sort((a, b) => b - a)).toEqual([900, -100]);
        expect(unionOutline([ring, [square(10, 10)]]).map(signedArea)).toEqual([900]);
    });

    it('sépare en deux anneaux deux territoires qui ne se touchent que par un point', () => {
        const outline = unionOutline([[square(0, 0)], [square(10, 10)]]);

        expect(outline.map(signedArea)).toEqual([100, 100]);
        expect(outline.every(isSimple)).toBe(true);
    });

    it('ne rend rien sans territoire', () => {
        expect(unionOutline([])).toEqual([]);
    });
});

describe('masque autour des territoires', () => {
    const WORLD: Ring = [
        [-100, -100],
        [100, -100],
        [100, 100],
        [-100, 100],
    ];
    const piece = square(0, 0, 30).slice(0, -1);
    const enclave = clockwise(square(10, 10).slice(0, -1));
    const islet = square(14, 14, 2).slice(0, -1);
    const island = square(50, 50, 5).slice(0, -1);

    it('perce le monde d’un trou par morceau, sans rien d’autre', () => {
        const mask = maskAround([piece, island], WORLD);

        expect(mask).toHaveLength(1);
        expect(mask[0].map(signedArea)).toEqual([40_000, -900, -25]);
    });

    it('ferme ses anneaux, contours dans le sens trigonométrique et trous dans le sens horaire', () => {
        const [[exterior, hole]] = maskAround([piece], WORLD);

        expect(exterior[0]).toEqual(exterior[exterior.length - 1]);
        expect(hole[0]).toEqual(hole[hole.length - 1]);
        expect(vertices(hole.slice(0, -1))).toEqual(vertices(piece));
    });

    it('ignore un anneau situé dans la réunion : deux territoires qui se recouvrent n’y percent pas un trou dans un trou', () => {
        const overlapping = square(5, 5, 2).slice(0, -1);
        const insideOverlap = clockwise(square(5.5, 5.5, 1).slice(0, -1));

        expect(maskAround([piece, overlapping], WORLD)).toEqual(maskAround([piece], WORLD));
        expect(maskAround([piece, overlapping, insideOverlap], WORLD)).toEqual(maskAround([piece], WORLD));
    });

    it('recouvre une enclave d’un polygone plein, percé du morceau qu’elle contient', () => {
        const mask = maskAround([piece, enclave, islet, island], WORLD);

        expect(mask.map((polygon) => polygon.map(signedArea))).toEqual([
            [40_000, -900, -25],
            [100, -4],
        ]);
    });
});

describe('zones où l’image est rognée', () => {
    it('garde l’image entière sur la France entière, cartouches d’outre-mer compris', () => {
        expect(clipsImage(ZONE_FRANCE)).toBe(false);
    });

    it.each([ZONE_HEXAGONE, 'REGION_84', 'DEPART_69', 'EPCI_200046977', 'REGION_01'])('rogne l’image sur les territoires dessinés de %s', (zone) => {
        expect(clipsImage(zone)).toBe(true);
    });
});

describe('masque de l’image d’un fond de carte', () => {
    const KM = 1000;
    const land = (...polygons: Ring[][]) => ({ geometry: polygons.length === 1 ? { type: 'Polygon', coordinates: polygons[0] } : { type: 'MultiPolygon', coordinates: polygons } });
    const holesOf = (lands: { geometry: { type: string; coordinates: unknown } }[]): number[][] =>
        imageMask(lands).geometry.coordinates.map((polygon) => polygon.slice(1).map((ring) => Math.round(-signedArea(ring) / KM ** 2)));

    it('couvre le monde entier, sauf la réunion des territoires, îles comprises', () => {
        const mainland = land([square(0, 0, 100 * KM)]);
        const withIsland = land([square(100 * KM, 0, 100 * KM)], [square(300 * KM, 0, 10 * KM)]);
        const mask = imageMask([mainland, withIsland]);
        const [world] = mask.geometry.coordinates[0];

        expect(mask).toMatchObject({ type: 'Feature', geometry: { type: 'MultiPolygon' } });
        expect(holesOf([mainland, withIsland]).map((holes) => holes.sort((a, b) => b - a))).toEqual([[20_000, 100]]);
        // Le monde : le carré de la projection, à plus de 20 000 km du centre de chaque côté
        expect(world.slice(0, -1).map(([x, y]: Position) => [Math.sign(x), Math.sign(y), Math.abs(x) > 20_000 * KM, Math.abs(y) > 20_000 * KM])).toEqual([
            [-1, -1, true, true],
            [1, -1, true, true],
            [1, 1, true, true],
            [-1, 1, true, true],
        ]);
    });

    it('masque une enclave d’un autre territoire, mais pas un défaut du fond de moins de 2 km² projetés', () => {
        const pierced = (holeSide: number) => land([square(0, 0, 100 * KM), clockwise(square(40 * KM, 40 * KM, holeSide))]);

        const coveredKm2 = (holeSide: number): number[] => imageMask([pierced(holeSide)]).geometry.coordinates.slice(1).map(([exterior]) => signedArea(exterior) / KM ** 2);

        // Enclave de 10 km de côté : un second polygone, plein, la recouvre
        expect(holesOf([pierced(10 * KM)])).toEqual([[10_000], []]);
        expect(coveredKm2(10 * KM)).toEqual([100]);
        // Trou de 1 km de côté : seul le monde est masqué, l'image reste dans le trou
        expect(holesOf([pierced(KM)])).toEqual([[10_000]]);
        expect(coveredKm2(KM)).toEqual([]);
    });

    it('n’a rien à masquer sans territoire, ni pour une géométrie qui n’est pas une surface', () => {
        expect(imageMask([])).toBeNull();
        expect(imageMask([{ geometry: { type: 'Point', coordinates: [0, 0] } }])).toBeNull();
    });
});
