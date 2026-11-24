// Aplat de couleur : chaque territoire prend la couleur de la classe de sa valeur. Réservé aux
// valeurs relatives (parts, taux, évolutions), qui ne dépendent pas de la taille du territoire.
import { getLandTypeLabel } from '@utils/landUtils';
import { classificationMethod, naturalClasses, roundToDisplay, signedNaturalClasses, valueClassIndex } from '../../classification';
import type { FrameContext, FrameRender, LandPoint, LegendModel } from '../types';
import { legendSignature, noDataCountOf, valuePoints } from './points';

export const buildChoropleth = (ctx: FrameContext): { render: FrameRender; legend: LegendModel } => {
    const { base, indicator } = ctx;
    const valued = valuePoints(ctx);
    // Valeur classée : celle que l'infobulle affiche, arrondie à la précision de la carte
    const shown = (value: number): number => roundToDisplay(value, indicator);
    const values = valued.map((point) => point.value).filter((value): value is number => value !== null);
    const diverging = indicator.palette === 'diverging';
    const classes = diverging ? signedNaturalClasses(values.map(shown), indicator) : naturalClasses(values.map(shown), indicator);
    const counts = classes.map(() => 0);
    // La classe d'un territoire décide à la fois de sa couleur et de la ligne de légende qui le
    // compte : la couleur est posée sur le point, sans passer par les classes de Highcharts
    const points = valued.map((point): LandPoint => {
        if (point.value === null) return { ...point, legendKey: null };
        const legendKey = valueClassIndex(shown(point.value), classes);
        counts[legendKey] += 1;
        return { ...point, color: classes[legendKey].color, legendKey };
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
            method: classificationMethod('territoires', diverging),
        },
    };
};
