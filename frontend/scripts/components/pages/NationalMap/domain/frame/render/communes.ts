// Toutes les communes d'une zone nationale, dessinées par MapLibre à partir de tuiles : chaque
// commune prend la couleur de sa clé de légende, lue dans une colonne de valeurs alignée sur la
// liste de leurs identifiants. Pour 34 875 communes, rien n'est calculé par commune au-delà d'un
// arrondi et d'un rang de classe : le texte d'une valeur n'est écrit que pour la commune survolée
// (la mise en forme de tous les nombres prendrait près d'une seconde).
import type { NationalMapBivariateColumns, NationalMapValueColumns } from '@services/api';
import { getLandTypeLabel } from '@utils/landUtils';
import { artifValueNote } from '../../../artifIndicators';
import { formatValue, periodLabel } from '../../../values';
import { isRegionInZone } from '../../../zones';
import { quantileClasses, roundToDisplay, signedQuantileClasses, valueClassIndex } from '../../classification';
import { mapNameOf } from '../../mapName';
import type { ViewProfile } from '../../viewProfile';
import type { CommuneValue, FrameContext, FrameRender, LegendModel } from '../types';
import { bivariateLegendProps, crossedRatesText } from './bivariate';
import { NO_DATA_TEXT, legendSignature } from './points';

// Dans la colonne des clés de légende, marques d'une commune sans donnée et d'une commune hors de
// la zone affichée (la Corse et l'outre-mer sur la zone Hexagone). Une commune hors zone n'est pas
// dessinée : elle ne compte ni dans les classes ni dans les effectifs.
export const NO_DATA_KEY = -1;
export const OUTSIDE_ZONE_KEY = -2;

const SCALE = 'COMM';

const QUANTILE_METHOD =
    'Classes par quantiles, calculées sur les communes affichées : chacune réunit à peu près le même nombre de communes. ' +
    'Une valeur égale à une borne appartient à la classe supérieure';
const SIGNED_QUANTILE_METHOD =
    'Classes par quantiles, calculées de part et d’autre de zéro sur les communes affichées : les baisses et les hausses sont ' +
    'découpées séparément en classes de même effectif, et les valeurs nulles forment une classe à part. ' +
    'Une valeur égale à une borne appartient à la classe supérieure';

type Built = { render: FrameRender; legend: LegendModel };

// La légende d'une zone à la maille commune n'est pas celle de la même zone par département,
// dont la vue emprunte le fond
const signatureBase = ({ base }: FrameContext): { key: string } => ({ key: `${base.zone}|${SCALE}` });

// Rang d'une commune dans la colonne, d'après son identifiant. L'index n'est construit qu'au
// premier survol : il ne coûte rien à un changement de carte.
const rankFinder = (ids: string[]): ((landId: string) => number | undefined) => {
    let ranks: Map<string, number> | null = null;
    return (landId) => {
        ranks ??= new Map(ids.map((id, rank) => [id, rank]));
        return ranks.get(landId);
    };
};

// Ce que le survol dit d'une commune, d'après sa clé de légende
const describer = (ids: string[], legendKeys: Int8Array, valueText: (rank: number) => string): ((landId: string) => CommuneValue | null) => {
    const rankOf = rankFinder(ids);
    return (landId) => {
        const rank = rankOf(landId);
        if (rank === undefined || legendKeys[rank] === OUTSIDE_ZONE_KEY) return null;
        if (legendKeys[rank] === NO_DATA_KEY) return { valueText: NO_DATA_TEXT, legendKey: null };
        return { valueText: valueText(rank), legendKey: legendKeys[rank] };
    };
};

// Aplat d'une valeur relative : classes par quantiles des communes affichées
const buildValueClasses = (ctx: FrameContext, communes: NationalMapValueColumns, { drawn }: ViewProfile): Built => {
    const { base, indicator, period } = ctx;
    // Carte en hectares : la méthode dit ce que la carte dessine à leur place, comme la ligne du menu
    const { label, standIn } = mapNameOf({ zone: base.zone, scale: SCALE }, indicator);
    const { ids, regions, values, amounts } = communes;
    const legendKeys = new Int8Array(ids.length);
    // Communes affichées et renseignées, et leur valeur arrondie à la précision d'affichage : c'est elle qui est classée
    const shownRanks: number[] = [];
    const shownValues: number[] = [];
    let noDataCount = 0;
    ids.forEach((_, rank) => {
        if (!isRegionInZone(regions[rank], base.zone)) {
            legendKeys[rank] = OUTSIDE_ZONE_KEY;
        } else if (values[rank] === null) {
            legendKeys[rank] = NO_DATA_KEY;
            noDataCount += 1;
        } else {
            shownRanks.push(rank);
            shownValues.push(roundToDisplay(values[rank], drawn));
        }
    });
    const classes = drawn.diverging ? signedQuantileClasses(shownValues, drawn) : quantileClasses(shownValues, drawn);
    const counts = classes.map(() => 0);
    shownRanks.forEach((rank, index) => {
        const key = valueClassIndex(shownValues[index], classes);
        legendKeys[rank] = key;
        counts[key] += 1;
    });

    // Valeur dessinée, puis les hectares d'une carte en hectares, puis la période choisie ou les millésimes de la commune
    const { year_sets: yearSets, year_set_index: yearSetIndex } = communes;
    const periodText = period && indicator.usesPeriod ? ` ${periodLabel(period.startYear, period.endYear)}` : '';
    const valueText = (rank: number): string => {
        const drawnText = formatValue(roundToDisplay(values[rank], drawn), drawn);
        const amount = amounts?.[rank] ?? null;
        // Arrondis comme la valeur dessinée : de très petits hectares négatifs ne s'écrivent pas « -0,0 ha »
        const amountText = amount === null ? '' : `, soit ${formatValue(roundToDisplay(amount, indicator), indicator)}`;
        const yearsNote = yearSets && yearSetIndex ? artifValueNote(yearSets[yearSetIndex[rank]], indicator) : '';
        return `${drawnText}${amountText}${periodText}${yearsNote}`;
    };

    return {
        render: {
            renderer: 'communes',
            mode: 'choropleth',
            departments: base.features,
            ids,
            legendKeys,
            palette: classes.map(({ color }) => color),
            describe: describer(ids, legendKeys, valueText),
        },
        legend: {
            kind: 'classes',
            signature: legendSignature({ base: signatureBase(ctx), indicator }, classes),
            title: label,
            classes,
            counts,
            noDataCount,
            landTypeLabel: getLandTypeLabel(SCALE, true),
            method: [drawn.diverging ? SIGNED_QUANTILE_METHOD : QUANTILE_METHOD, ...(standIn ? [standIn] : [])].join('. '),
        },
    };
};

type Extremes = { min: number | null; max: number | null };

const widen = (extremes: Extremes, value: number | null): void => {
    if (value === null) return;
    extremes.min = extremes.min === null ? value : Math.min(extremes.min, value);
    extremes.max = extremes.max === null ? value : Math.max(extremes.max, value);
};

// Carte bivariée : la classe de chaque commune (0 à 8) et la palette viennent de la réponse
const buildCrossedClasses = (ctx: FrameContext, communes: NationalMapBivariateColumns, { drawn }: ViewProfile): Built => {
    const { base, indicator } = ctx;
    const { ids, regions, classes, conso_rates: consoRates, indic_rates: indicRates, bivariate: meta } = communes;
    const legendKeys = new Int8Array(ids.length);
    // Bornes des taux des communes affichées, pour les intervalles de la légende
    const consoExtremes: Extremes = { min: null, max: null };
    const indicExtremes: Extremes = { min: null, max: null };
    ids.forEach((_, rank) => {
        if (!isRegionInZone(regions[rank], base.zone)) {
            legendKeys[rank] = OUTSIDE_ZONE_KEY;
            return;
        }
        if (classes[rank] === null) {
            legendKeys[rank] = NO_DATA_KEY;
            return;
        }
        legendKeys[rank] = classes[rank];
        widen(consoExtremes, consoRates[rank]);
        widen(indicExtremes, indicRates[rank]);
    });
    return {
        render: {
            renderer: 'communes',
            mode: 'bivariate',
            departments: base.features,
            ids,
            legendKeys,
            palette: meta.palette,
            describe: describer(ids, legendKeys, (rank) => crossedRatesText(meta, consoRates[rank], indicRates[rank])),
        },
        legend: {
            kind: 'bivariate',
            signature: legendSignature({ base: signatureBase(ctx), indicator }),
            title: drawn.label,
            props: bivariateLegendProps(meta, SCALE, consoExtremes, indicExtremes),
        },
    };
};

// Rendu et légende de la vue dense, d'après la colonne de valeurs du cadre
export const buildCommunes = (ctx: FrameContext, profile: ViewProfile): Built => {
    const { communes } = ctx;
    return 'classes' in communes ? buildCrossedClasses(ctx, communes, profile) : buildValueClasses(ctx, communes, profile);
};
