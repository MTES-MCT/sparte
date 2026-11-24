// Ce que le moteur des carreaux dessine : des mailles carrées lues dans un fichier de tuiles,
// colorées selon la classe de leur valeur, et, pour certaines cartes, les objets réels qui les
// remplacent aux grands zooms. Le moteur ne connaît ni la grandeur ni les fichiers : la
// consommation carroyée et les sols artificialisés sont deux descriptions qu'il reçoit.
import type { ExpressionSpecification } from 'maplibre-gl';
import type { Millesime } from '@services/types/land';
import type { ValueClass } from '../../values';
import type { LandRef } from '../../zones';

// Ce que le survol dit d'une maille ou d'un objet
export type TileReading = {
    // Titre de l'infobulle d'un objet, et d'une maille là où elle dépasse des territoires dessinés
    name: string;
    valueText: string;
    // Ligne de la légende ; null : aucune
    classIndex: number | null;
};

export type GridCells = {
    // Identité de la source des mailles : en changer la recrée, pour qu'aucune maille de la vue
    // précédente ne reste dessinée le temps que les tuiles déjà chargées soient retraitées
    key: string;
    // Fichier PMTiles et sa couche
    file: string;
    layer: string;
    // Mailles à dessiner
    filter: ExpressionSpecification;
    // Valeur d'une maille, calculée par MapLibre
    value: ExpressionSpecification;
    // Bornes intérieures croissantes des classes, dans l'unité de `value` : une valeur égale à une
    // borne appartient à la classe supérieure
    bounds: number[];
    // Une classe de plus que de bornes, avec sa couleur
    classes: ValueClass[];
    // Lissage du bord des mailles ; sans lui, des mailles jointives ne se chevauchent pas d'un pixel
    antialias: boolean;
    // Couleur des territoires, visible là où aucune maille n'est dessinée
    landColor: string;
    read: (properties: Record<string, unknown>) => TileReading;
    texts: {
        // Survol d'un territoire là où aucune maille n'est dessinée
        empty: string;
        // Pendant le chargement des tuiles
        loading: string;
        // Le fichier de tuiles manque
        missing: string;
        // La zone est hors de l'emprise des données : rien n'est chargé. null : elle y est.
        outside: string | null;
        // Ce que l'image exportée et les lecteurs d'écran disent des mailles
        caption: string;
        spoken: string;
    };
};

// Fichier de tuiles des objets d'un département
export type DetailTiles = { department: string; file: string; layer: string };

// Objets réels dessinés à la place des mailles à partir d'un zoom, lus dans un fichier de tuiles
// par département : seuls les départements en vue sont chargés
export type GridDetail = {
    // Zoom de la carte à partir duquel les objets sont dessinés, et zoom où elle s'arrête
    minZoom: number;
    maxZoom: number;
    // Territoire dont la fiche donne les millésimes de chaque département
    land: LandRef;
    // Départements des mailles en vue, d'après leurs attributs
    departmentsOf: (cells: Record<string, unknown>[]) => string[];
    // Départements à lire quand le fichier des mailles manque : les objets restent explorables
    // sans elles. D'après les millésimes de la fiche et les attributs des territoires en vue.
    departmentsWithoutCells: (millesimes: Millesime[], lands: Record<string, unknown>[]) => string[];
    // Fichiers à lire pour ces départements, à leur dernier millésime
    tilesOf: (millesimes: Millesime[], departments: string[]) => DetailTiles[];
    // Objets à dessiner ; null : tous
    filter: ExpressionSpecification | null;
    color: ExpressionSpecification;
    outlineColor: string;
    // Opacité des objets : pleine, sauf ceux des autres classes quand une classe est mise en avant
    opacity: (highlightedClass: number | null, dimmedOpacity: number) => ExpressionSpecification | number;
    // Classes de la légende des objets, pour l'image exportée
    classes: ValueClass[];
    read: (properties: Record<string, unknown>) => TileReading;
    // Ce que l'image exportée dit des objets
    caption: string;
    // Des objets manquent dans la vue : les mailles y restent dessinées
    partialNotice: string;
};

// Ce que la carte de mailles dessine à un instant : ses mailles, l'image qui les remplace dès
// qu'elle existe au zoom de la carte, ou les objets réels aux grands zooms. La légende suit.
export type GridStage = 'cells' | 'image' | 'objects';

// Image publiée par un tiers, en tuiles : dès que la carte est assez zoomée pour qu'elle existe,
// elle est dessinée à la place des mailles, qui ne servent plus qu'aux vues plus larges, là où
// l'image n'a rien, et quand elle ne répond pas
export type GridImage = {
    // Identité de l'image d'une vue : la légende suit ce que la carte en dessine, et une image qui
    // ne répond pas n'est abandonnée que pour cette vue
    key: string;
    // Génération de millésimes publiée par l'éditeur, citée dans la légende
    generation: string;
    // Adresse d'une tuile, avec {z}, {x} et {y}
    tiles: string;
    // Niveaux de tuiles publiés
    minZoom: number;
    maxZoom: number;
    attribution: string;
    // Paliers, du plus large au plus proche : la même image, demandée en tuiles plus petites aux
    // vues larges pour que son premier niveau publié suffise plus tôt. Chaque palier est dessiné
    // de son zoom jusqu'à celui du suivant.
    tiers: { tileSize: number; fromZoom: number }[];
    // Zoom de la carte à partir duquel l'image est dessinée : celui du premier palier
    fromZoom: number;
    // Emprise hors de laquelle aucune tuile n'est demandée ([ouest, sud, est, nord]), d'après celle
    // des territoires affichés ([[ouest, sud], [est, nord]])
    boundsOf: (lands: [[number, number], [number, number]]) => [number, number, number, number];
    // Couleur des territoires sous l'image, visible là où elle est transparente
    landColor: string;
    // L'image n'est dessinée que sur les territoires affichés : autour, la carte montre son fond.
    // Sans cela, elle montre aussi leurs voisins, comme un fond de carte.
    clipped: boolean;
    // Nombre de fois où l'image est dessinée : ses couleurs sont translucides, deux passes les renforcent
    passes: number;
    saturation: number;
    contrast: number;
    // Adresse d'une image de la même couche pour une emprise donnée, en coordonnées projetées
    // (EPSG:3857, [xmin, ymin, xmax, ymax]). Elle sert aux cartouches d'outre-mer : l'image d'un
    // territoire à sa position réelle est posée sur son cartouche, où les tuiles n'ont rien.
    insetImage: (sourceBbox: [number, number, number, number]) => string;
    // Ce que l'image exportée dit de l'image
    caption: string;
    // Des objets manquent dans la vue : l'image y reste, sans survol
    partialNotice: string;
    // Les tuiles de l'image ne répondent pas : la carte dessine ses mailles à la place
    failedNotice: string;
};

// Dans les tuiles, les territoires d'une maille sont des listes sérialisées : `["35","22"]`.
// Le code est cherché avec ses guillemets, pour ne pas confondre un code avec un morceau d'un autre.
export const hasCode = (property: string, code: string): ExpressionSpecification =>
    ['in', `"${code}"`, ['coalesce', ['get', property], '']] as ExpressionSpecification;

// Classe d'une valeur, avec la règle de l'expression `step` de MapLibre : une valeur égale à une
// borne appartient à la classe supérieure
export const cellClassIndex = (bounds: number[], value: number): number => bounds.filter((bound) => value >= bound).length;

type Classified = Pick<GridCells, 'value' | 'bounds'>;

export const cellColorExpression = ({ value, bounds, classes }: Classified & Pick<GridCells, 'classes'>): ExpressionSpecification =>
    ['step', value, classes[0].color, ...bounds.flatMap((bound, index) => [bound, classes[index + 1].color])] as ExpressionSpecification;

// Opacité des mailles : pleine, sauf celles des autres classes quand une classe est mise en avant
export const cellOpacityExpression = ({ value, bounds }: Classified, highlightedClass: number | null, dimmedOpacity: number): ExpressionSpecification | number => {
    if (highlightedClass === null) return 1;
    const lower = highlightedClass === 0 ? null : bounds[highlightedClass - 1];
    const upper = highlightedClass >= bounds.length ? null : bounds[highlightedClass];
    const conditions: ExpressionSpecification[] = [];
    if (lower !== null) conditions.push(['>=', value, lower]);
    if (upper !== null) conditions.push(['<', value, upper]);
    return ['case', ['all', ...conditions], 1, dimmedOpacity];
};
