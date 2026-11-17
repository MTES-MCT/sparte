// Cercles proportionnels : une valeur absolue (hectares) se lit à la surface d'un cercle posé sur
// le territoire, jamais en aplat de couleur, qui ferait ressortir les territoires les plus grands.
import { SIGNED_SYMBOL_COLORS, signedSymbolColor, symbolMagnitude } from '../../../artifIndicators';
import { NO_DATA_COLOR, formatValue, symbolReferenceValues } from '../../../values';
import type { FrameContext, FrameRender, LandPoint, LegendModel, SymbolPoint } from '../types';
import { legendSignature, noDataCountOf, valuePoints } from './points';

// Fond neutre des territoires sous les symboles, et couleur des cercles
export const SYMBOL_BASE_COLOR = '#eeeef8';
const SYMBOL_COLOR = '#000091';

const SYMBOL_METHOD =
    "La surface de chaque cercle est proportionnelle à la valeur du territoire. Une valeur absolue ne se compare pas d'un " +
    "territoire à l'autre sans tenir compte de leur taille : l'indicateur en pourcentage de la surface le permet.";

// Le diamètre des cercles dépend de la taille de la carte à l'écran : il est calculé à
// l'affichage, pour qu'un redimensionnement ne recalcule pas le cadre.
export const buildSymbols = (ctx: FrameContext): { render: FrameRender; legend: LegendModel } => {
    const { base, indicator } = ctx;
    // Le territoire garde un fond neutre, la valeur est portée par le cercle
    const points: LandPoint[] = valuePoints(ctx).map((point) => ({
        ...point,
        color: point.value === null ? NO_DATA_COLOR : SYMBOL_BASE_COLOR,
        legendKey: point.value === null ? null : 0,
    }));
    // Valeur signée : la taille porte la valeur absolue, la couleur le signe ; pas de cercle pour une valeur nulle
    const symbols: SymbolPoint[] = points
        .flatMap(({ land_id, name, zone, value, valueText, legendKey }) =>
            value === null ? [] : [{ land_id, name, zone, z: symbolMagnitude(value, indicator), color: signedSymbolColor(value, indicator), valueText, legendKey }],
        )
        .filter((symbol) => symbol.z > 0)
        .sort((a, b) => b.z - a.z);
    const maxValue = symbols.length > 0 ? symbols[0].z : 0;
    // Valeur signée : rouge pour une hausse ; le bleu d'une baisse est porté par chaque cercle
    const color = indicator.signed ? SIGNED_SYMBOL_COLORS.increase : SYMBOL_COLOR;
    return {
        render: { renderer: 'territory', mode: 'symbols', points, symbols, maxValue, color },
        legend: {
            kind: 'symbols',
            shape: 'circle',
            signature: legendSignature(ctx),
            title: indicator.label,
            references: symbolReferenceValues(maxValue, indicator.decimals ?? 0).map((value) => ({ value, label: formatValue(value, indicator) })),
            maxValue,
            landCount: base.features.length,
            colors: [{ color, label: null }],
            note: null,
            noDataCount: noDataCountOf(points),
            method: SYMBOL_METHOD,
        },
    };
};
