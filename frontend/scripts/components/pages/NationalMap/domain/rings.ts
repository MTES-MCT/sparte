// Anneaux proportionnels : deux flux de sens contraire d'un territoire, lus sur un seul symbole.
// Sa surface porte leur somme, comme celle d'un cercle proportionnel, et ses deux arcs leur
// partage. Ici, ce qui ne dépend que du diamètre du symbole à l'écran et de ce partage : sa forme
// et le tracé de ses arcs, les mêmes sur la carte et dans sa légende.

// Les deux flux d'un anneau : celui qui augmente la grandeur mesurée (l'artificialisation) et
// celui qui la diminue (la désartificialisation)
export type RingFlow = 'increase' | 'decrease';

// Sous ce diamètre, en pixels, le partage d'un anneau ne se lit plus : un disque plein le remplace
export const RING_MIN_DIAMETER = 12;
// À partir de ce diamètre, la valeur nette s'écrit au centre de l'anneau
const RING_LABEL_MIN_DIAMETER = 40;

// Arc d'un anneau, en fractions de tour comptées depuis midi dans le sens horaire
export type RingArc = { flow: RingFlow; from: number; to: number };

// Ce qui est dessiné pour un territoire : un disque plein de la couleur de son flux le plus fort,
// ou un anneau partagé entre ses deux flux, avec ou sans sa valeur nette au centre
export type RingMark = { shape: 'disc'; flow: RingFlow } | { shape: 'ring'; arcs: RingArc[]; labelled: boolean };

// Flux le plus fort ; à égalité, celui qui augmente la grandeur mesurée
const dominantFlow = (decreaseShare: number): RingFlow => (decreaseShare > 0.5 ? 'decrease' : 'increase');

// Arcs d'un anneau d'après la part du flux à la baisse (de 0 à 1) : le flux à la hausse à partir
// de midi, le flux à la baisse à sa suite. Un flux nul n'a pas d'arc.
export const ringArcs = (decreaseShare: number): RingArc[] => {
    const split = 1 - Math.min(1, Math.max(0, decreaseShare));
    const arcs: RingArc[] = [
        { flow: 'increase', from: 0, to: split },
        { flow: 'decrease', from: split, to: 1 },
    ];
    return arcs.filter(({ from, to }) => to > from);
};

// Forme du symbole d'un territoire, d'après son diamètre à l'écran. Le diamètre est le même dans
// les deux formes : la taille du symbole reste celle du flux brut.
export const ringMarkOf = (diameter: number, decreaseShare: number): RingMark =>
    diameter < RING_MIN_DIAMETER
        ? { shape: 'disc', flow: dominantFlow(decreaseShare) }
        : { shape: 'ring', arcs: ringArcs(decreaseShare), labelled: diameter >= RING_LABEL_MIN_DIAMETER };

// Rayon du trou d'un anneau : son épaisseur vaut un quart de son diamètre
export const ringInnerRadius = (radius: number): number => radius / 2;

// Un arc d'un tour complet se refermerait sur son point de départ et ne serait pas tracé : il
// s'arrête juste avant, assez tôt pour que l'écart survive à l'arrondi des coordonnées sur le plus
// petit anneau
const FULL_TURN = 0.999;

// Tracé SVG d'un arc d'anneau de centre (cx, cy)
export const ringArcPath = (cx: number, cy: number, radius: number, { from, to }: Pick<RingArc, 'from' | 'to'>): string => {
    const end = Math.min(to, from + FULL_TURN);
    const inner = ringInnerRadius(radius);
    const at = (distance: number, turn: number): string => {
        const angle = 2 * Math.PI * (turn - 0.25);
        return `${(cx + distance * Math.cos(angle)).toFixed(2)} ${(cy + distance * Math.sin(angle)).toFixed(2)}`;
    };
    const largeArc = end - from > 0.5 ? 1 : 0;
    return [
        `M ${at(inner, from)}`,
        `L ${at(radius, from)}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${at(radius, end)}`,
        `L ${at(inner, end)}`,
        `A ${inner} ${inner} 0 ${largeArc} 0 ${at(inner, from)}`,
        'Z',
    ].join(' ');
};
