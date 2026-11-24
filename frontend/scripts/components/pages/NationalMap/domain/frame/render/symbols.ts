// Cercles proportionnels : une valeur absolue (hectares) se lit à la surface d'un cercle posé sur
// le territoire, jamais en aplat de couleur, qui ferait ressortir les territoires les plus grands.
import { destinationSymbolColor } from '../../grid/consoColors';
import { NO_DATA_COLOR, formatValue, referenceDecimals, symbolReferenceValues } from '../../../values';
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
    // Pas de cercle pour une valeur nulle
    const symbols: SymbolPoint[] = points
        .flatMap(({ land_id, name, zone, value, valueText, legendKey }) => (value === null ? [] : [{ land_id, name, zone, z: value, valueText, legendKey }]))
        .filter((symbol) => symbol.z > 0)
        .sort((a, b) => b.z - a.z);
    const maxValue = symbols.length > 0 ? symbols[0].z : 0;
    // Une carte d'une destination prend sa couleur, comme sa carte carroyée et ses graphiques
    const color = indicator.destination ? destinationSymbolColor(indicator.destination) : SYMBOL_COLOR;
    return {
        render: { renderer: 'territory', mode: 'symbols', points, symbols, maxValue, color },
        legend: {
            kind: 'symbols',
            shape: 'circle',
            signature: legendSignature(ctx),
            title: indicator.label,
            references: symbolReferenceValues(maxValue, referenceDecimals(maxValue, indicator)).map((value) => ({ value, label: formatValue(value, indicator) })),
            maxValue,
            landCount: base.features.length,
            colors: [{ color, label: null }],
            note: null,
            noDataCount: noDataCountOf(points),
            method: SYMBOL_METHOD,
        },
    };
};
