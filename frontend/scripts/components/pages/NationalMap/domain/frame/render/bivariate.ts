// Carte bivariée : croisement, pour chaque territoire, d'un rythme de consommation et de
// l'évolution d'un indicateur, classés chacun en trois niveaux ; neuf couleurs fournies par l'API.
import type { NationalMapBivariateMeta } from '@services/api';
import { formatNumber } from '@utils/formatUtils';
import { getLandTypeLabel } from '@utils/landUtils';
import { NO_DATA_COLOR } from '../../../values';
import type { CrossedLand, Crossing, FrameContext, FrameRender, LandPoint, LegendModel } from '../types';
import { NO_DATA_TEXT, absentPoint, knownPoint, legendSignature } from './points';

// Unité des deux taux d'une carte bivariée, et décimales avec lesquelles ils s'écrivent : le rythme
// de consommation, souvent très petit, en demande une de plus
export const RATE_UNIT = '% par an';
export const CONSO_RATE_DECIMALS = 3;
export const INDIC_RATE_DECIMALS = 2;

const percent = (v: number | null | undefined, decimals: number) =>
    v === null || v === undefined ? 'n.d.' : `${formatNumber({ number: v, decimals })} %`;

// Ce que l'infobulle dit du croisement d'un territoire : ses deux taux
export const crossedRatesText = (meta: NationalMapBivariateMeta, consoRate: number | null, indicRate: number | null): string =>
    `${meta.conso_label} : ${percent(consoRate, CONSO_RATE_DECIMALS)} par an<br/>${meta.indicator_label} : ${percent(indicRate, INDIC_RATE_DECIMALS)} par an`;

// Taux des cartes bivariées : des pourcentages par an souvent très petits, affichés avec juste assez de décimales
const rateDecimals = (v: number): number => {
    if (Math.abs(v) < 0.01) return 4;
    if (Math.abs(v) < 0.1) return 3;
    return 2;
};

export const formatRate = (v: number): string => Number.parseFloat(v.toFixed(rateDecimals(v))).toString().replace('.', ',');

const formatIndicatorRate = (v: number, unit: string): string => (unit === '%' && v > 0 ? `+${formatRate(v)}` : formatRate(v));

type Extremes = { min: number | null; max: number | null };

const extremes = (values: (number | null)[]): Extremes => {
    const present = values.filter((v): v is number => v !== null && v !== undefined);
    return present.length > 0 ? { min: Math.min(...present), max: Math.max(...present) } : { min: null, max: null };
};

// Props de la légende bivariée des diagnostics : seuils nationaux de la maille et bornes des territoires affichés
export const bivariateLegendProps = (meta: NationalMapBivariateMeta, scale: string, conso: Extremes, indic: Extremes) => {
    const [consoT1, consoT2] = meta.conso_thresholds ?? [null, null];
    const [indicT1, indicT2] = meta.indic_thresholds ?? [null, null];
    const unit = meta.indicator_unit;
    const consoMin = conso.min === null ? '0' : formatRate(conso.min);
    const consoMax = conso.max === null ? '∞' : formatRate(conso.max);
    const indicMin = indic.min === null ? '−∞' : formatIndicatorRate(indic.min, unit);
    const indicMax = indic.max === null ? '+∞' : formatIndicatorRate(indic.max, unit);
    return {
        colorGrid: [0, 1, 2].map((row) => meta.palette.slice(row * 3, row * 3 + 3)),
        consoLabel: meta.conso_label,
        consoRanges:
            consoT1 !== null && consoT2 !== null
                ? [`[${consoMin}, ${formatRate(consoT1)}]`, `]${formatRate(consoT1)}, ${formatRate(consoT2)}]`, `]${formatRate(consoT2)}, ${consoMax}]`]
                : null,
        indicName: meta.indicator_label,
        indicUnit: unit,
        indicRanges:
            indicT1 !== null && indicT2 !== null
                ? [
                      `[${indicMin}, ${formatIndicatorRate(indicT1, unit)}]`,
                      `]${formatIndicatorRate(indicT1, unit)}, ${formatIndicatorRate(indicT2, unit)}]`,
                      `]${formatIndicatorRate(indicT2, unit)}, ${indicMax}]`,
                  ]
                : null,
        indicQualif: [
            `${meta.indicator_label} parmi les plus faibles`,
            `${meta.indicator_label} intermédiaire`,
            `${meta.indicator_label} parmi les plus élevées`,
        ],
        // Les trois indicateurs sont des évolutions : accord au féminin
        adjectives: { faible: 'faible', moyen: 'moyenne', fort: 'forte' },
        childLandTypeLabel: getLandTypeLabel(scale, true).toLowerCase(),
    };
};

export const buildBivariate = (ctx: FrameContext): { render: FrameRender; legend: LegendModel } => {
    const { base, indicator, data } = ctx;
    // Les cartes bivariées sont décrites par la réponse de consommation
    const response = data.source === 'conso' ? data.response : undefined;
    const meta = response?.bivariate[indicator.id];
    const crossed = base.features.map((feature) => response?.lands[feature.properties.land_id]?.[indicator.id as 'bivariate_activite_emplois']);
    const points: LandPoint[] = base.features.map((feature, index) => {
        if (!response?.lands[feature.properties.land_id]) return { ...absentPoint(feature, base.scale), legendKey: null };
        const value = crossed[index];
        // Période sans seuils : le territoire n'a pas de classe
        if (!value || !meta) return { ...knownPoint(feature, base.scale, { value: null, color: NO_DATA_COLOR, valueText: NO_DATA_TEXT }), legendKey: null };
        return {
            ...knownPoint(feature, base.scale, {
                value: value.class,
                color: meta.palette[value.class],
                valueText: crossedRatesText(meta, value.conso_rate, value.indic_rate),
            }),
            legendKey: value.class,
        };
    });
    // Bornes des taux des territoires affichés, pour les intervalles de la légende
    const consoRates = extremes(crossed.map((value) => value?.conso_rate ?? null));
    const indicRates = extremes(crossed.map((value) => value?.indic_rate ?? null));
    // Territoires classés, avec leurs deux taux : ce que la carte range en neuf cases
    const lands: CrossedLand[] = points.flatMap(({ land_id, name, color, legendKey, valueText }, index) =>
        legendKey === null ? [] : [{ land_id, name, color, legendKey, valueText, consoRate: crossed[index].conso_rate, indicRate: crossed[index].indic_rate }],
    );
    const crossing: Crossing | null =
        meta?.conso_thresholds && meta.indic_thresholds
            ? {
                  conso: { label: meta.conso_label, thresholds: meta.conso_thresholds },
                  indic: { label: meta.indicator_label, thresholds: meta.indic_thresholds },
                  lands,
              }
            : null;
    return {
        render: { renderer: 'territory', mode: 'bivariate', points, crossing },
        legend: {
            kind: 'bivariate',
            signature: legendSignature(ctx),
            title: indicator.label,
            props: meta ? bivariateLegendProps(meta, base.scale, consoRates, indicRates) : null,
        },
    };
};
