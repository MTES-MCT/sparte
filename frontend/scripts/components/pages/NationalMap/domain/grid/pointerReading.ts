// Ce que la carte de mailles lit sous le pointeur ou le doigt : un territoire, une maille, un objet
// réel, ou plusieurs à la fois. Une seule règle dit lequel donne son nom, sa valeur et sa classe à
// l'infobulle, à la fiche des écrans tactiles et à la légende.
import type { ValueClass } from '../../values';
import type { GridCells, GridDetail, TileReading } from './cells';

// Ce que les tuiles dessinent à cet endroit ; null : rien de tel
export type PointerTarget = {
    // Nom du territoire ; undefined hors de tout territoire
    landName: string | undefined;
    // Attributs de la maille et de l'objet
    cell: Record<string, unknown> | null;
    object: Record<string, unknown> | null;
};

export type PointerContext = {
    cells: GridCells;
    detail: GridDetail | null;
    // Les objets sont dessinés : la légende affichée est la leur
    objectsShown: boolean;
    // Le fichier des mailles manque
    cellsMissing: boolean;
    // L'image est dessinée à la place des mailles
    pictured: boolean;
};

export type PointerReading = {
    name: string;
    valueText: string;
    // Ligne de la légende affichée ; null : aucune
    classIndex: number | null;
    // Couleur de cette ligne ; null : aucune pastille
    swatch: string | null;
};

// Un objet dessiné est lu à la place de la maille qu'il recouvre ; là où il n'est pas encore
// chargé, la maille l'est toujours
const tileReading = ({ cell, object }: PointerTarget, { cells, detail }: PointerContext): TileReading | null => {
    if (object && detail) return detail.read(object);
    return cell ? cells.read(cell) : null;
};

// Sans maille ni objet à cet endroit, la carte dit ce que cela signifie ; sauf si le fichier des
// mailles manque : elle ne sait alors rien de l'endroit ; ni sous l'image, qui montre elle-même
// ce qu'il y a
const emptyText = ({ cells, cellsMissing, pictured }: PointerContext): string => (cellsMissing || pictured ? '' : cells.texts.empty);

const swatchOf = (classes: ValueClass[] | undefined, classIndex: number | null): string | null => (classIndex === null ? null : (classes?.[classIndex]?.color ?? null));

export const pointerReading = (target: PointerTarget, context: PointerContext): PointerReading => {
    const reading = tileReading(target, context);
    // Un objet se nomme lui-même ; une maille est lue sous le nom du territoire qu'un clic ouvrirait
    const name = (target.object ? undefined : target.landName) ?? reading?.name ?? '';
    const valueText = reading?.valueText ?? emptyText(context);
    // La classe est celle de la légende affichée : celle des objets dès qu'ils sont dessinés
    const classIndex = context.objectsShown && !target.object ? null : (reading?.classIndex ?? null);
    // Pastille : la couleur de la classe lue, dans la légende affichée
    const classes = target.object ? context.detail?.classes : context.cells.classes;
    return { name, valueText, classIndex, swatch: swatchOf(classes, classIndex) };
};
