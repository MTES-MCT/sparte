// Scène de la carte : le cadre blanc que se partagent la carte, sa légende et, sur une petite
// carte, la clé des numéros d'outre-mer. Tout ce qui dépend de sa taille se décide ici, à partir
// de ses seules dimensions : la carte connaît ainsi sa place avant son premier dessin, sans rien
// mesurer de ce qu'elle affiche. La légende ouverte y reçoit une bande en haut ou une colonne à
// gauche, selon ce qui laisse la plus grande carte ; sur une scène trop petite pour l'une comme
// pour l'autre, elle est repliée et s'ouvre par-dessus la carte.
import { symbolSizeFactor } from '../values';

// Place qu'il faut à la carte pour nommer les territoires d'outre-mer. Relevé à l'écran : dans une
// place plus étroite ou plus basse, la France entière fait moins de 420 px de large, où les noms
// voisins se touchent, puis se masquent ; des numéros les remplacent.
const NAMES_MIN_WIDTH_PX = 460;
const NAMES_MIN_HEIGHT_PX = 390;
// Sous cette largeur, la légende masquerait la carte
const NARROW_WIDTH_PX = 440;
// Sous cette largeur, les classes d'une légende aux libellés longs se replient sur une ligne de plus
const WIDE_WIDTH_PX = 600;
// Rapport largeur / hauteur de la carte qui départage la bande et la colonne : celui de la France
// entière avec ses cartouches d'outre-mer
const REFERENCE_MAP_ASPECT = 1.2;

type WidthClass = 'narrow' | 'medium' | 'wide';

// Place de la légende ouverte : par-dessus la carte, dans une bande en haut de la scène ou dans une
// colonne à sa gauche
export type LegendPlacement = 'over' | 'band' | 'side';

export type StageSize = {
    // Petite carte : numéros à la place des noms des territoires d'outre-mer
    compact: boolean;
    // Place de la légende ouverte ; par-dessus la carte, elle est repliée tant que l'utilisateur ne l'ouvre pas
    legendPlacement: LegendPlacement;
    widthClass: WidthClass;
    // Réduction des cercles proportionnels, entre 0 et 1
    symbolFactor: number;
    // Carte masquée (onglet Informations sur mobile) : le reste décrit sa dernière taille visible
    hidden: boolean;
};

// Place prise sur la scène par la légende ouverte, en pixels : la carte est dessinée dans le reste
type LegendReservation = { top: number; left: number };

// Hauteur réservée en haut de la scène à une légende ouverte en bande, par palier de largeur.
// Relevé à l'écran sur tout le catalogue, volet « Méthode » fermé : la plus haute légende descend à
// 142 px du haut de la scène sur une carte large, à 152 px sur une carte moyenne, où ses lignes se
// replient davantage. Les quelques pixels qui dépassent de la bande tombent dans la marge du
// graphique, où rien n'est dessiné.
export const LEGEND_BAND_PX: Record<WidthClass, number> = { narrow: 0, medium: 150, wide: 140 };

// Largeur réservée à gauche de la scène à une légende ouverte en colonne. Relevé à l'écran sur tout
// le catalogue : il faut cette largeur aux cercles de référence et à leur plus long libellé
// (« 2 000,0 ha par an ») ; les classes aux libellés plus longs passent à la ligne.
export const LEGEND_SIDE_PX = 220;

const NO_RESERVATION: LegendReservation = { top: 0, left: 0 };

const widthClassOf = (width: number): WidthClass => {
    if (width < NARROW_WIDTH_PX) return 'narrow';
    return width < WIDE_WIDTH_PX ? 'medium' : 'wide';
};

// Largeur de la carte de référence dans une place donnée
const referenceMapWidth = (width: number, height: number): number => Math.min(width, REFERENCE_MAP_ASPECT * height);

// Une scène basse et large loge la légende dans une colonne, qui ne prend rien à une carte limitée
// par sa hauteur ; une scène haute, dans une bande. Entre les deux, le placement retenu est celui
// qui laisse la plus grande carte de référence. Une scène trop basse pour la bande et trop étroite
// pour la colonne ne réserve rien : la légende s'y ouvre par-dessus la carte. Rien de la carte
// affichée n'entre dans ce choix : à taille de fenêtre égale, toutes les cartes sont dessinées au
// même endroit.
const legendPlacementOf = (width: number, height: number): LegendPlacement => {
    const underBandHeight = height - LEGEND_BAND_PX[widthClassOf(width)];
    // Sous la bande, la carte doit garder la hauteur qu'il faut aux noms d'outre-mer : sur une
    // scène plus basse, la bande lui prendrait jusqu'à la moitié de sa taille
    const bandFits = width >= NARROW_WIDTH_PX && underBandHeight >= NAMES_MIN_HEIGHT_PX;
    // À côté de la colonne, la carte ne doit pas devenir une carte étroite
    const sideFits = width - LEGEND_SIDE_PX >= NARROW_WIDTH_PX;
    if (bandFits && sideFits) {
        const besideColumn = referenceMapWidth(width - LEGEND_SIDE_PX, height);
        const underBand = referenceMapWidth(width, underBandHeight);
        return besideColumn > underBand ? 'side' : 'band';
    }
    if (sideFits) return 'side';
    return bandFits ? 'band' : 'over';
};

// Place prise sur la scène par une légende ouverte, d'après son placement
const openLegendReservation = (placement: LegendPlacement, widthClass: WidthClass): LegendReservation => {
    if (placement === 'band') return { top: LEGEND_BAND_PX[widthClass], left: 0 };
    if (placement === 'side') return { top: 0, left: LEGEND_SIDE_PX };
    return NO_RESERVATION;
};

// `width` et `height` sont ceux du cadre entier, légende et clé des numéros comprises : la place
// qu'elles prennent ne doit pas changer ce qui a décidé de leur présence. Les noms d'outre-mer
// dépendent de la place que la légende ouverte laisse à la carte ; elle est comptée que la légende
// soit ouverte ou repliée, pour que la replier ne recrée pas le graphique.
export const stageSizeOf = (width: number, height: number): StageSize => {
    const legendPlacement = legendPlacementOf(width, height);
    const widthClass = widthClassOf(width);
    const reserved = openLegendReservation(legendPlacement, widthClass);
    return {
        compact: width - reserved.left < NAMES_MIN_WIDTH_PX || height - reserved.top < NAMES_MIN_HEIGHT_PX,
        legendPlacement,
        widthClass,
        symbolFactor: symbolSizeFactor(width, height),
        hidden: false,
    };
};

// Scène tant que le cadre n'a pas été mesuré : une grande carte, sa légende en bande
export const UNMEASURED_STAGE: StageSize = { compact: false, legendPlacement: 'band', widthClass: 'wide', symbolFactor: 1, hidden: false };

const isSameStage = (a: StageSize, b: StageSize): boolean => (Object.keys(a) as (keyof StageSize)[]).every((key) => a[key] === b[key]);

// Scène après un changement de taille du cadre. Un cadre sans largeur est masqué : la scène garde
// sa dernière taille visible, pour qu'à son retour la carte soit dessinée comme elle l'était.
// Rend la scène reçue quand rien n'y change.
export const resizedStage = (current: StageSize, width: number, height: number): StageSize => {
    const next = width === 0 ? { ...current, hidden: true } : stageSizeOf(width, height);
    return isSameStage(current, next) ? current : next;
};

// Place réservée à la légende. Elle ne dépend ni de la représentation de la carte ni de ce que la
// légende contient : deux cartes du même fond sont dessinées au même endroit, quels que soient
// leurs indicateurs. Repliée, ou ouverte par-dessus la carte, la légende ne réserve rien.
export const legendReservation = (stage: StageSize, open: boolean): LegendReservation =>
    open ? openLegendReservation(stage.legendPlacement, stage.widthClass) : NO_RESERVATION;

// Légende ouverte tant que l'utilisateur n'a rien choisi ? Pas quand elle s'ouvre par-dessus la
// carte, qu'elle masquerait.
export const legendOpenByDefault = (stage: StageSize): boolean => stage.legendPlacement !== 'over';
