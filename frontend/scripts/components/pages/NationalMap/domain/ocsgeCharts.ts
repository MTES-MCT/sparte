// Ce que les graphiques complémentaires d'une carte de l'OCS GE lisent du territoire qu'ils
// décrivent, la zone affichée : ses millésimes, que le serveur attend par leur index, et ce qui
// le distingue des territoires affichés, sur lesquels portent les chiffres clés de la carte.
import type { LandDetailResultType, Millesime } from '@services/types/land';
import type { ShownOcsge } from './frame/types';

export type LandMillesimes = {
    // Index du dernier millésime du territoire, tel que le serveur des graphiques l'attend ;
    // le premier millésime porte l'index 1
    lastIndex: number;
    // Années du dernier millésime et du précédent : plusieurs pour un territoire à cheval sur des
    // départements, aucune sans millésime précédent
    lastYears: number[];
    previousYears: number[];
};

const yearsOf = (millesimes: Millesime[], index: number): number[] =>
    [...new Set(millesimes.filter((millesime) => millesime.index === index).map(({ year }) => year))].sort((a, b) => a - b);

// Millésimes d'un territoire ; null si l'OCS GE ne le couvre pas entièrement : la carte le laisse
// alors sans valeur, et ses graphiques ne sont pas proposés
export const millesimesOf = ({ has_ocsge: covered, millesimes }: Pick<LandDetailResultType, 'has_ocsge' | 'millesimes'>): LandMillesimes | null => {
    if (!covered || millesimes.length === 0) return null;
    const lastIndex = Math.max(...millesimes.map(({ index }) => index));
    return { lastIndex, lastYears: yearsOf(millesimes, lastIndex), previousYears: yearsOf(millesimes, lastIndex - 1) };
};

// Écart relatif de surface en deçà duquel les territoires affichés couvrent exactement la zone :
// les surfaces des deux réponses ne sont pas arrondies de la même façon
const SAME_SURFACE_TOLERANCE = 0.001;

// Ce que les graphiques disent du territoire qu'ils décrivent quand les chiffres clés de la carte
// portent sur un autre ensemble : des territoires affichés débordent de la zone (EPCI à cheval sur
// deux départements, comptés en entier), ou sont sans donnée alors que le graphique compte ce que
// l'OCS GE en couvre. Null quand les deux ensembles sont les mêmes.
export const chartScopeOf = ({ name, surface }: Pick<LandDetailResultType, 'name' | 'surface'>, shown: ShownOcsge): string | null => {
    const limits = shown.surfaceHa > surface * (1 + SAME_SURFACE_TOLERANCE) ? ' dans ses limites exactes' : '';
    const missing = shown.hasMissing ? ', territoires hachurés compris' : '';
    return limits || missing ? `${name}${limits}${missing}` : null;
};
