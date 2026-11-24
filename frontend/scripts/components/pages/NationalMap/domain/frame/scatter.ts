// Nuage de points d'une carte bivariée : la carte range ses territoires en neuf cases, le nuage
// les place selon leurs deux taux. Il se construit du croisement que la carte dessine : mêmes
// territoires, mêmes taux, mêmes seuils, mêmes couleurs.
import { getLandTypeLabel } from '@utils/landUtils';
import { periodLabel } from '../../values';
import { RATE_UNIT, formatRate } from './render/bivariate';
import type { CrossedLand, CrossedScatter, Crossing, FrameContext, FrameRender, ScatterAxis, ScatterPoint } from './types';

// Sous ce nombre de points, le nuage ne dit rien que la carte ne montre déjà
const MIN_POINT_COUNT = 10;

// Part des points que chaque bord d'un axe laisse au-delà de lui : quelques taux extrêmes
// n'écrasent pas les autres dans un coin du graphique
const OUTLIER_SHARE = 0.01;

const NO_CLASSES = "Le nuage de points n'est pas dessiné : la carte n'a pas de classes sur cette période.";
const TOO_FEW_LANDS = "Le nuage de points n'est pas dessiné pour moins de dix territoires.";
const TOO_MANY_LANDS = "Le nuage de points n'est pas dessiné pour l'ensemble des communes du pays.";

const lowerFirst = (text: string): string => text.charAt(0).toLowerCase() + text.slice(1);
const upperFirst = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

// Nom d'une maille au fil d'une phrase : un sigle garde ses capitales
const scaleName = (scale: string): string => {
    const label = getLandTypeLabel(scale);
    return label === label.toUpperCase() ? label : label.toLowerCase();
};

// Étendue qui laisse au plus OUTLIER_SHARE des valeurs de chaque côté : toutes, jusqu'à cent valeurs
export const coreExtent = (values: number[]): [number, number] => {
    const sorted = [...values].sort((a, b) => a - b);
    const last = sorted.length - 1;
    return [sorted[Math.floor(last * OUTLIER_SHARE)], sorted[Math.ceil(last * (1 - OUTLIER_SHARE))]];
};

// Axe d'un taux : l'étendue de ses valeurs, élargie aux deux seuils pour que les neuf cases de la
// carte se lisent toujours dans le nuage
const axisOf = ({ label, thresholds }: Crossing['conso'], values: number[]): ScatterAxis => {
    const [low, high] = coreExtent(values);
    return { label, unit: RATE_UNIT, min: Math.min(low, thresholds[0]), max: Math.max(high, thresholds[1]), thresholds };
};

const within = (value: number, { min, max }: ScatterAxis): number => Math.min(Math.max(value, min), max);

// Territoire dont les deux taux sont connus : le seul que le nuage sait placer
type PlacedLand = CrossedLand & { consoRate: number; indicRate: number };

const isPlaced = (land: CrossedLand): land is PlacedLand => land.consoRate !== null && land.indicRate !== null;

const counted = (count: number, one: string, several: string): string => `${count} ${count > 1 ? several : one}`;

// Ce que le sous-titre dit des territoires que le nuage ne montre pas à leur place
const displacedTexts = (moved: number, unplaced: number): string[] => [
    ...(moved > 0 ? [`${counted(moved, 'point hors cadre, ramené', 'points hors cadre, ramenés')} au bord.`] : []),
    ...(unplaced > 0 ? [`${counted(unplaced, 'territoire non placé', 'territoires non placés')}, faute d'un des deux taux.`] : []),
];

// Ce que la fenêtre de détails dit des seuils d'un axe
const thresholdsText = ({ label, unit, thresholds: [first, second] }: ScatterAxis): string =>
    `${formatRate(first)} et ${formatRate(second)} ${unit} pour ${lowerFirst(label)}`;

const OUTLIERS_METHOD =
    "Au-delà de cent points, chaque axe s'arrête avant le centième des points aux taux les plus faibles et le centième des points aux taux les plus élevés : " +
    'ils sont ramenés au bord du graphique, et leur infobulle donne leurs taux.';

// Nuage de points de la carte affichée ; null pour une carte qui ne croise pas deux taux
export const scatterOf = ({ base, indicator, period }: FrameContext, render: FrameRender): CrossedScatter | null => {
    if (render.mode !== 'bivariate') return null;
    // Toutes les communes du pays : 34 875 points ne se lisent pas
    if (render.renderer === 'communes') return { kind: 'none', reason: TOO_MANY_LANDS };
    const { crossing } = render;
    if (!crossing) return { kind: 'none', reason: NO_CLASSES };
    const placed = crossing.lands.filter(isPlaced);
    if (placed.length < MIN_POINT_COUNT) return { kind: 'none', reason: TOO_FEW_LANDS };

    const x = axisOf(crossing.indic, placed.map((land) => land.indicRate));
    const y = axisOf(crossing.conso, placed.map((land) => land.consoRate));
    const points: ScatterPoint[] = placed.map(({ land_id, name, color, legendKey, valueText, consoRate, indicRate }) => ({
        land_id,
        name,
        x: within(indicRate, x),
        y: within(consoRate, y),
        indicRate,
        consoRate,
        color,
        legendKey,
        valueText,
    }));
    const moved = points.filter((point) => point.x !== point.indicRate || point.y !== point.consoRate).length;
    const perLand = `un point par ${scaleName(base.scale)}`;
    // « 2011 - 2024 », comme dans les titres du serveur, ou « 2023 » pour une seule année
    const yearsOf = ({ startYear, endYear }: { startYear: number; endYear: number }): string => (startYear === endYear ? String(startYear) : `${startYear} - ${endYear}`);
    const measured = RATE_UNIT + (period ? `, ${periodLabel(period.startYear, period.endYear)}` : '');
    return {
        kind: 'points',
        model: {
            // Le titre dit ce qu'est un point, puis le territoire et la période, comme ceux des autres
            // graphiques ; les deux taux sont nommés par les flèches de leurs axes, comme dans la
            // légende de la carte
            title: `${upperFirst(perLand)} - ${base.title}${period ? ` (${yearsOf(period)})` : ''}`,
            subtitle: [
                `↑ ${y.label}`,
                `→ ${x.label}`,
                `En ${RATE_UNIT}. Tirets : seuils des classes de la carte.`,
                ...displacedTexts(moved, crossing.lands.length - placed.length),
            ].join('<br/>'),
            description:
                `Nuage de ${points.length} points : ${perLand}. ` +
                `En abscisse, ${lowerFirst(x.label)} ; en ordonnée, ${lowerFirst(y.label)} ; les deux en ${measured}. ` +
                'Chaque point a la couleur de son territoire sur la carte.',
            method:
                `${upperFirst(perLand)} affiché, placé selon les deux taux que la carte croise et coloré comme son territoire sur la carte. ` +
                `Les tirets sont les seuils qui séparent les trois niveaux de chaque taux sur la carte : ${thresholdsText(y)}, ${thresholdsText(x)}. ` +
                OUTLIERS_METHOD,
            filename: `nuage-${base.zone.toLowerCase()}-${base.scale.toLowerCase()}-${indicator.id}`,
            x,
            y,
            points,
        },
    };
};
