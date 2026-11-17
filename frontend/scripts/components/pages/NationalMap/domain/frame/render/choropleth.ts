// Aplat de couleur : chaque territoire prend la couleur de la classe de sa valeur. Réservé aux
// valeurs relatives (parts, taux, évolutions), qui ne dépendent pas de la taille du territoire.
import { getLandTypeLabel } from '@utils/landUtils';
import {
    CLASSIFICATION_LABEL,
    DIVERGING_CLASSIFICATION_LABEL,
    SEQUENTIAL_PALETTE,
    ValueClass,
    divergingClasses,
    naturalBreaksClasses,
} from '../../../values';
import type { FrameContext, FrameRender, LandPoint, LegendModel } from '../types';
import { legendSignature, noDataCountOf, valuePoints } from './points';

// Classe d'une valeur. Deux classes voisines partagent leur borne : une valeur égale à cette borne
// est rangée dans la classe inférieure ('lower', règle des effectifs de la légende) ou dans la
// classe supérieure ('upper', règle de Highcharts pour la couleur du territoire).
export const classIndexOf = (value: number, classes: ValueClass[], atBound: 'lower' | 'upper'): number | null => {
    const holds = ({ from, to }: ValueClass): boolean => (from === undefined || value >= from) && (to === undefined || value <= to);
    const index = atBound === 'lower' ? classes.findIndex(holds) : classes.length - 1 - [...classes].reverse().findIndex(holds);
    return index < 0 || index >= classes.length ? null : index;
};

export const buildChoropleth = (ctx: FrameContext): { render: FrameRender; legend: LegendModel } => {
    const { base, indicator } = ctx;
    const valued = valuePoints(ctx);
    const values = valued.map((point) => point.value).filter((value): value is number => value !== null);
    const diverging = indicator.palette === 'diverging';
    const classes = diverging ? divergingClasses(values, indicator) : naturalBreaksClasses(values, SEQUENTIAL_PALETTE, indicator);
    const points: LandPoint[] = valued.map((point) => ({ ...point, legendKey: point.value === null ? null : classIndexOf(point.value, classes, 'lower') }));
    const counts = classes.map(() => 0);
    points.forEach(({ legendKey }) => {
        if (legendKey !== null) counts[legendKey] += 1;
    });
    return {
        render: { renderer: 'territory', mode: 'choropleth', points, classes },
        legend: {
            kind: 'classes',
            signature: legendSignature(ctx, classes),
            title: indicator.label,
            classes,
            counts,
            noDataCount: noDataCountOf(points),
            landTypeLabel: getLandTypeLabel(base.scale, true),
            method: diverging ? DIVERGING_CLASSIFICATION_LABEL : CLASSIFICATION_LABEL,
        },
    };
};
