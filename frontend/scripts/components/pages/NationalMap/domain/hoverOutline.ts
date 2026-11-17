// Contour de l'élément survolé sur une carte MapLibre (commune, carreau, objet OCS GE), d'après
// ce que les tuiles en dessinent. Une entité à cheval sur plusieurs tuiles y est découpée en
// morceaux, chacun fermé le long du bord de sa tuile : ces coutures ne font pas partie de son
// contour. Elles se reconnaissent à ce qu'elles suivent exactement un méridien ou un parallèle,
// la grille des tuiles ; elles ne sont cherchées que dans une entité en plusieurs morceaux, pour
// ne rien retirer au contour d'une entité entière.
type Position = [number, number];
export type OutlinePiece = { type: 'Polygon'; coordinates: Position[][] } | { type: 'MultiPolygon'; coordinates: Position[][][] };
export type Outline = { type: 'MultiLineString'; coordinates: Position[][] };

const ringsOf = (piece: OutlinePiece): Position[][] => (piece.type === 'Polygon' ? piece.coordinates : piece.coordinates.flat());

const alongTileGrid = ([x1, y1]: Position, [x2, y2]: Position): boolean => x1 === x2 || y1 === y2;

// Un anneau sans ses coutures : les suites de segments qui restent
const withoutSeams = (ring: Position[]): Position[][] => {
    const lines: Position[][] = [];
    let line: Position[] = [];
    ring.forEach((position, index) => {
        if (index > 0 && alongTileGrid(ring[index - 1], position)) {
            if (line.length > 1) lines.push(line);
            line = [];
        }
        line.push(position);
    });
    if (line.length > 1) lines.push(line);
    return lines;
};

// Ce qui n'est pas un polygone (attribut absent, autre géométrie) est ignoré ; null : rien à tracer
export const outlineOf = (geometries: unknown[]): Outline | null => {
    const pieces = geometries.filter((geometry): geometry is OutlinePiece => {
        const type = (geometry as { type?: string } | null | undefined)?.type;
        return type === 'Polygon' || type === 'MultiPolygon';
    });
    const rings = pieces.flatMap(ringsOf);
    const coordinates = pieces.length > 1 ? rings.flatMap(withoutSeams) : rings;
    return coordinates.length > 0 ? { type: 'MultiLineString', coordinates } : null;
};
