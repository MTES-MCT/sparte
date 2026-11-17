// Vue AFFICHÉE de la carte nationale : le cadre. Tout ce que l'écran dit d'une carte (territoires,
// titre, fil d'Ariane, couleurs, légende, chiffres clés, note, export) se lit dans ce seul objet,
// construit par des fonctions pures et remplacé d'un bloc : aucune image ne peut mêler deux vues.
import type { BivariateLegendProps } from '@components/charts/consommation/BivariateMap/types';
import type {
    NationalMapArtifIndicators,
    NationalMapBaseMap,
    NationalMapFeature,
    NationalMapIndicators,
    NationalMapInset,
    NationalMapParent,
    NationalMapValues,
} from '@services/api';
import type { Indicator } from '../../indicators';
import type { LandRef } from '../../zones';
import type { ValueClass } from '../../values';
import type { GridCells, GridDetail, GridImage } from '../grid/cells';
import type { MillesimeReading } from '../millesimes';
import type { BoundaryLines } from '../parentBoundary';

// Réponse dont la carte tire ses valeurs : la consommation d'espaces ou l'artificialisation (OCS GE)
export type ViewData = { source: 'conso'; response: NationalMapIndicators } | { source: 'artif'; response: NationalMapArtifIndicators };

export type Period = { startYear: number; endYear: number };

// Ce que la barre de titre et le fil d'Ariane disent d'une zone
export type ZoneHeading = {
    title: string;
    // Nature du territoire (« Région », « Département »), vide pour la France entière et l'Hexagone
    typeLabel: string;
    // Chemin depuis la France entière
    path: { zone: string; label: string }[];
};

// Fond dessiné : les territoires d'une zone à une maille
export type FrameBase = ZoneHeading & {
    // Identité de la géométrie dessinée
    key: string;
    zone: string;
    scale: string;
    baseMap: NationalMapBaseMap;
    parent: NationalMapParent | null;
    // Territoires de la zone ; le même tableau tant que le fond et la zone ne changent pas
    features: NationalMapFeature[];
    // Territoires d'outre-mer rapprochés de l'Hexagone et ligne qui les en sépare : France entière seulement
    insets: NationalMapInset[];
    separation: [number, number][];
    // Limite de la zone, dessinée par-dessus les territoires qui débordent d'elle ; vide pour les
    // fonds qui n'en portent pas (voir domain/parentBoundary.ts)
    parentBoundary: BoundaryLines;
    wholeFrance: boolean;
    // Un clic sur un territoire descend d'un niveau, sauf pour les communes
    clickable: boolean;
};

// Ce dont se construit tout ce qu'un cadre affiche : le fond, l'indicateur et la réponse qu'il lit
export type FrameContext = {
    base: FrameBase;
    indicator: Indicator;
    data: ViewData;
    // Période de la réponse ; null pour l'OCS GE
    period: Period | null;
    // Valeurs par commune que dessine la vue dense (voir domain/viewProfile.ts) ; null pour les
    // autres vues, dont les valeurs sont dans `data`
    communes: NationalMapValues | null;
};

// Un territoire de la carte, avec ce dont l'infobulle et la légende ont besoin
export type LandPoint = {
    land_id: string;
    name: string;
    // Zone affichée par un clic sur le territoire
    zone: string;
    value: number | null;
    // Couleur propre au territoire ; absente quand elle vient des classes de valeurs
    color?: string;
    valueText: string;
    // null sans donnée
    // Ce qui relie un territoire à sa ligne de légende : indice de classe (aplats), case 0 à 8
    // (bivariées), 0 pour tout territoire renseigné d'une carte en cercles
    legendKey: number | null;
};

// Cercle proportionnel d'un territoire
export type SymbolPoint = {
    land_id: string;
    name: string;
    zone: string;
    // Grandeur portée par la surface du cercle
    z: number;
    // Couleur propre au cercle (signe d'une valeur signée) ; indéfinie pour celle de la carte
    color?: string;
    valueText: string;
    legendKey: number;
};

// Anneau d'un territoire : deux flux de sens contraire entre deux millésimes
export type RingPoint = {
    land_id: string;
    // Flux brut, somme des deux flux : la grandeur portée par la surface de l'anneau
    gross: number;
    // Part du flux à la baisse (la désartificialisation) dans le flux brut, de 0 à 1
    decreaseShare: number;
    // Valeur nette, écrite au centre des plus grands anneaux
    netLabel: string;
};

// Territoire classé d'une carte bivariée, avec les deux taux que la carte croise
export type CrossedLand = {
    land_id: string;
    name: string;
    // Rythme de consommation, puis évolution de l'indicateur croisé ; null : taux inconnu
    consoRate: number | null;
    indicRate: number | null;
    // Couleur et case de la légende du territoire sur la carte, et texte de son infobulle
    color: string;
    legendKey: number;
    valueText: string;
};

// Croisement que dessine une carte bivariée : ce que mesurent ses deux taux, les seuils de leurs
// trois niveaux et les territoires classés
export type Crossing = {
    conso: { label: string; thresholds: [number, number] };
    indic: { label: string; thresholds: [number, number] };
    lands: CrossedLand[];
};

// Ce que le survol dit d'une commune de la vue dense
export type CommuneValue = {
    valueText: string;
    // null sans donnée
    legendKey: number | null;
};

// Ce que le moteur de rendu dessine : des territoires (Highcharts), des carreaux ou toutes les
// communes du pays (MapLibre)
export type FrameRender =
    | { renderer: 'territory'; mode: 'choropleth'; points: LandPoint[]; classes: ValueClass[] }
    // `crossing` : null quand la période n'a pas de seuils, et donc pas de classes
    | { renderer: 'territory'; mode: 'bivariate'; points: LandPoint[]; crossing: Crossing | null }
    | {
          renderer: 'territory';
          mode: 'symbols';
          points: LandPoint[];
          // Du plus grand au plus petit : les petits, dessinés ensuite, restent visibles et cliquables
          symbols: SymbolPoint[];
          // Plus grande grandeur représentée : celle du plus grand cercle
          maxValue: number;
          color: string;
      }
    | {
          renderer: 'territory';
          mode: 'rings';
          points: LandPoint[];
          // Du plus grand au plus petit : les petits, dessinés ensuite, restent visibles
          rings: RingPoint[];
          // Plus grand flux brut représenté : celui du plus grand anneau
          maxValue: number;
      }
    | {
          renderer: 'grid';
          mode: 'grid';
          // Territoires dont le contour est dessiné sous les mailles
          features: NationalMapFeature[];
          // Territoires d'outre-mer rapprochés de l'Hexagone et ligne qui les en sépare ; vides
          // pour une carte en géographie réelle
          insets: NationalMapInset[];
          separation: [number, number][];
          // Limite de la zone, dessinée par-dessus les mailles, l'image et les objets ; vide sans limite
          parentBoundary: BoundaryLines;
          // Mailles dessinées : leur fichier de tuiles, leur valeur, leurs classes
          cells: GridCells;
          // Objets réels qui remplacent les mailles aux grands zooms ; null : la carte n'en a pas
          detail: GridDetail | null;
          // Image qui remplace les mailles dès qu'elle existe au zoom de la carte ; null : la carte n'en a pas
          image: GridImage | null;
      }
    | {
          renderer: 'communes';
          mode: 'choropleth' | 'bivariate';
          // Départements de la zone : leurs limites sont dessinées sur les communes, et ils sont
          // la cible du clic
          departments: NationalMapFeature[];
          // Identifiants des communes du pays, triés : c'est par eux que les couleurs rejoignent les tuiles
          ids: string[];
          // Pour chaque commune, dans l'ordre de `ids` : sa clé de légende, ou l'une des deux
          // marques de render/communes.ts (sans donnée, hors de la zone affichée)
          legendKeys: Int8Array;
          // Couleur de chaque clé de légende
          palette: string[];
          // null : commune inconnue ou hors de la zone, que le survol et le clic ignorent
          describe: (landId: string) => CommuneValue | null;
      };

// Ce que dessine le moteur des communes du pays
export type CommunesRender = Extract<FrameRender, { renderer: 'communes' }>;

// Ce que dessine le moteur des carreaux
export type GridRender = Extract<FrameRender, { renderer: 'grid' }>;

// Ce que dessine le calque des anneaux, sur la carte par territoire
export type RingsRender = Extract<FrameRender, { mode: 'rings' }>;

// Corps d'une légende de mailles ou d'objets : ses classes, ce qu'elles mesurent et leur méthode
export type GridLegendBody = {
    classes: ValueClass[];
    // Ce que mesurent les classes : « Par km², de 2011 à 2024 »
    basis: string;
    method: string;
};

// Ce que la légende affiche. `signature` change quand les lignes de la légende changent de sens :
// une classe mise en avant ne vaut que pour une signature.
export type LegendModel = { signature: string; title: string } & (
    | {
          kind: 'classes';
          classes: ValueClass[];
          // Nombre de territoires de chaque classe, puis sans donnée
          counts: number[];
          noDataCount: number;
          // Nom au pluriel des territoires affichés
          landTypeLabel: string;
          method: string;
      }
    | {
          kind: 'symbols';
          // Forme des symboles de la carte : cercles pleins, ou anneaux partagés entre deux flux
          shape: 'circle' | 'ring';
          // Symboles de référence, du plus grand au plus petit ; leur rayon dépend de la taille de la carte, il est calculé à l'affichage
          references: { value: number; label: string }[];
          maxValue: number;
          landCount: number;
          // Couleur des cercles ; pour des anneaux, celles du flux à la hausse puis du flux à la baisse, nommées
          colors: { color: string; label: string | null }[];
          // Ce qu'il faut savoir pour lire les symboles ; null : rien à ajouter
          note: string | null;
          noDataCount: number;
          method: string;
      }
    // `props` : null si la réponse ne décrit pas la carte bivariée
    | { kind: 'bivariate'; props: Omit<BivariateLegendProps, 'highlightedCell'> | null }
    | ({
          kind: 'grid';
          // Ligne de ce que la carte laisse sans maille ; null : rien à signaler
          noData: { label: string; color: string } | null;
          // Légende des objets qui remplacent les mailles aux grands zooms (son titre compris), et
          // `hint`, ce que la carte dit, posé sur elle, de ce qu'on peut faire d'eux ; null : la
          // carte n'en a pas
          detail: (GridLegendBody & { title: string; hint: string }) | null;
          // Légende de l'image qui remplace les mailles dès qu'elle existe, avec la couleur de ce
          // qu'elle laisse vide ; null : la carte n'en a pas
          image: (GridLegendBody & { title: string; noDataColor: string }) | null;
      } & GridLegendBody)
);

export type KeyFigure = {
    icon: string;
    label: string;
    // Nombre déjà mis en forme ; null : aucune valeur à afficher
    value: string | null;
    unit: string;
    footer: { type: 'period'; from: string; to?: string };
};

// Territoires affichés d'une carte de l'OCS GE, sur lesquels portent ses chiffres clés. Les
// graphiques complémentaires décrivent la zone : ils le disent quand les deux ensembles diffèrent.
export type ShownOcsge = {
    // Surface de tous les territoires affichés, en hectares
    surfaceHa: number;
    // Certains sont sans donnée, en gris sur la carte
    hasMissing: boolean;
};

export type KeyFiguresModel = { kind: 'empty'; message: string } | { kind: 'figures'; figures: KeyFigure[] };

// Axe du nuage de points d'une carte bivariée : l'un des deux taux que la carte croise
export type ScatterAxis = {
    // Ce que l'axe mesure et son unité, comme l'infobulle de la carte les écrit
    label: string;
    unit: string;
    // Étendue où les points sont placés : un taux au-delà est ramené à son bord
    min: number;
    max: number;
    // Seuils des trois niveaux de la carte
    thresholds: [number, number];
};

export type ScatterPoint = {
    land_id: string;
    name: string;
    // Place du point dans l'étendue des axes : l'évolution de l'indicateur croisé, puis le rythme de consommation
    x: number;
    y: number;
    // Les deux taux du territoire, que la place du point ne dit pas quand il est ramené au bord
    indicRate: number;
    consoRate: number;
    // Couleur et case de la légende du territoire sur la carte, et texte de son infobulle
    color: string;
    legendKey: number;
    valueText: string;
};

// Nuage de points d'une carte bivariée : un point par territoire affiché, placé selon ses deux taux
export type ScatterModel = {
    title: string;
    // Ce que montre chaque axe, puis ce qu'il faut savoir pour lire le nuage
    subtitle: string;
    // Description pour les lecteurs d'écran
    description: string;
    // Ce que la fenêtre de détails dit de sa construction : seuils, points ramenés au bord
    method: string;
    // Nom du fichier de l'image exportée, sans extension
    filename: string;
    x: ScatterAxis;
    y: ScatterAxis;
    points: ScatterPoint[];
};

// Ce que la colonne montre du croisement d'une carte bivariée : son nuage de points, ou ce qui
// empêche de le dessiner
export type CrossedScatter = { kind: 'points'; model: ScatterModel } | { kind: 'none'; reason: string };

// Textes de l'image exportée
export type ExportMeta = {
    title: string;
    subtitle: string;
    // Sous-titre de l'image quand la carte dessine ses objets réels à la place de ses mailles
    detailSubtitle?: string;
    // Sous-titre de l'image quand la carte dessine l'image qui remplace ses mailles
    imageSubtitle?: string;
    filename: string;
    credits: string;
    // Titre de la légende des classes de l'image
    unitLabel?: string;
};

export type MapFrame = FrameContext & {
    // Identité de la vue : fond, indicateur et période (sans période pour l'OCS GE, qui n'en dépend pas)
    key: string;
    render: FrameRender;
    legend: LegendModel;
    keyFigures: KeyFiguresModel;
    // Note de la carte, sous ses chiffres clés ; null : rien à signaler
    footnote: string | null;
    // Territoire des graphiques complémentaires : la nation pour la France entière et l'Hexagone
    chartsLand: LandRef;
    // Étendue des territoires affichés d'une carte de l'OCS GE ; null pour la consommation
    shownOcsge: ShownOcsge | null;
    // Millésimes de l'OCS GE que la carte représente, tels que la barre de titre, les chiffres clés,
    // la note et l'image exportée les désignent ; null pour la consommation, ou sans millésime
    millesimes: MillesimeReading | null;
    // Nuage de points des territoires affichés ; null pour une carte qui ne croise pas deux taux
    scatter: CrossedScatter | null;
    exportMeta: ExportMeta;
    ariaLabel: string;
};
