// Ce que les cartes par territoire ont en commun : un point par territoire affiché, la lecture
// de sa valeur et le texte de son infobulle.
import type { NationalMapFeature } from '@services/api';
import { artifValueNote } from '../../../artifIndicators';
import type { Indicator } from '../../../indicators';
import { NO_DATA_COLOR, ValueClass, formatValue, periodLabel } from '../../../values';
import { landToZone } from '../../../zones';
import type { FrameBase, FrameContext, LandPoint, Period } from '../types';

export const NO_DATA_TEXT = 'Donnée non disponible';

type UnkeyedPoint = Omit<LandPoint, 'legendKey'>;

const landOf = ({ properties }: NationalMapFeature, scale: string): Pick<LandPoint, 'land_id' | 'name' | 'zone'> => ({
    land_id: properties.land_id,
    name: properties.name,
    zone: landToZone({ land_type: scale, land_id: properties.land_id }),
});

// Territoire que la réponse ne connaît pas : hachuré, annoncé sans donnée s'il n'en a jamais
export const absentPoint = (feature: NationalMapFeature, scale: string): UnkeyedPoint => ({
    ...landOf(feature, scale),
    value: null,
    color: NO_DATA_COLOR,
    valueText: feature.properties.has_conso ? '' : NO_DATA_TEXT,
});

export const knownPoint = (feature: NationalMapFeature, scale: string, shown: Pick<LandPoint, 'value' | 'valueText' | 'color'>): UnkeyedPoint => ({
    ...landOf(feature, scale),
    ...shown,
});

// Valeur de l'indicateur pour un territoire, et précision de son infobulle (millésimes de l'OCS GE) ;
// undefined si la réponse ne connaît pas le territoire. La valeur est celle dont la clé est
// l'identifiant de l'indicateur.
const readValue = ({ indicator, data }: FrameContext, landId: string): { value: number | null; note: string } | undefined => {
    if (data.source === 'artif') {
        const land = data.response.lands[landId];
        if (!land) return undefined;
        const value = land[indicator.id as 'artif_ha'];
        return { value, note: value === null ? '' : artifValueNote(land, indicator) };
    }
    const land = data.response.lands[landId];
    return land && { value: land[indicator.id as 'conso_ha'], note: '' };
};

// Moyenne annuelle d'un cumul en hectares, à la suite de sa période : c'est elle qui se compare
// d'une période à l'autre, quand elles n'ont pas la même durée. Rien pour une seule année, où
// elle répéterait le cumul, ni pour une moyenne qui s'écrirait zéro.
const annualMeanText = (value: number | null, { startYear, endYear }: Period): string => {
    const years = endYear - startYear + 1;
    if (value === null || years < 2) return '';
    const mean = value / years;
    if (Math.round(mean * 10) === 0) return '';
    // Sous 10 ha par an, sans décimale, des territoires très différents afficheraient la même moyenne
    return `, soit ${formatValue(mean, { unit: 'ha/an', decimals: Math.abs(mean) < 10 ? 1 : 0 })}`;
};

// Texte d'une valeur qui dépend de la période choisie : « 1 652 ha de 2011 à 2020, soit 165 ha par an »
const periodValueText = (value: number | null, indicator: Indicator, period: Period): string => {
    const text = `${formatValue(value, indicator)} ${periodLabel(period.startYear, period.endYear)}`;
    return indicator.unit === 'ha' ? `${text}${annualMeanText(value, period)}` : text;
};

// Un point par territoire affiché pour un indicateur à une valeur par territoire : la valeur,
// suivie dans l'infobulle de la période choisie ou des millésimes du territoire
export const valuePoints = (ctx: FrameContext): UnkeyedPoint[] => {
    const { base, indicator, period } = ctx;
    return base.features.map((feature) => {
        const read = readValue(ctx, feature.properties.land_id);
        if (!read) return absentPoint(feature, base.scale);
        const valueText = indicator.usesPeriod && period ? periodValueText(read.value, indicator, period) : `${formatValue(read.value, indicator)}${read.note}`;
        return knownPoint(feature, base.scale, { value: read.value, valueText });
    });
};

export const noDataCountOf = (points: LandPoint[]): number => points.filter((point) => point.legendKey === null).length;

// Les lignes d'une légende gardent leur sens tant que le fond et l'indicateur ne changent pas et,
// pour des classes calculées sur les valeurs, tant que leurs bornes ne changent pas
export const legendSignature = ({ base, indicator }: { base: Pick<FrameBase, 'key'>; indicator: Pick<Indicator, 'id'> }, classes: ValueClass[] = []): string =>
    [base.key, indicator.id, ...classes.map(({ from, to }) => `${from ?? ''}:${to ?? ''}`)].join('|');
