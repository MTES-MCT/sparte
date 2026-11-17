// Anneaux proportionnels : pour chaque territoire, les surfaces artificialisées et les surfaces
// désartificialisées entre ses deux derniers millésimes OCS GE. La surface de l'anneau porte leur
// somme (le flux brut), ses deux arcs leur partage. Comme un cercle, c'est un symbole de taille
// proportionnelle : des hectares ne se lisent jamais en aplat de couleur.
import type { NationalMapArtifLand } from '@services/api';
import { SIGNED_SYMBOL_COLORS, artifValueNote } from '../../../artifIndicators';
import { NO_DATA_COLOR, formatSigned, formatValue, symbolReferenceValues, unitSuffix } from '../../../values';
import { RING_MIN_DIAMETER } from '../../rings';
import type { FrameContext, FrameRender, LandPoint, LegendModel, RingPoint } from '../types';
import { millesimeReadingOf } from '../shownLands';
import { NO_DATA_TEXT, absentPoint, knownPoint, legendSignature, noDataCountOf } from './points';
import { SYMBOL_BASE_COLOR } from './symbols';

// `between` : les deux millésimes entre lesquels les flux sont mesurés, dans les mots de la note de la carte
const ringsMethod = (between: string): string =>
    'La surface de chaque anneau est proportionnelle au flux brut du territoire : la somme de ses surfaces artificialisées et de ses ' +
    `surfaces désartificialisées ${between}. ` +
    "L'anneau se partage entre les deux flux, l'artificialisation à partir de midi dans le sens horaire. Leur différence, " +
    "l'artificialisation nette, est écrite au centre des plus grands anneaux et donnée au survol de chaque territoire.";

const RINGS_NOTE = `Sous ${RING_MIN_DIAMETER} px, un disque plein de la couleur du flux le plus fort`;

const NO_FLOW_TEXT = 'Aucune surface artificialisée ni désartificialisée';

// Surfaces artificialisées (flux à la hausse) et désartificialisées (flux à la baisse) d'un territoire
type Flows = { increase: number; decrease: number };

// null sans OCS GE, ou sans les deux millésimes qu'il faut à un flux
const flowsOf = (land: NationalMapArtifLand): Flows | null =>
    land.artif_gross_ha === null || land.desartif_gross_ha === null ? null : { increase: land.artif_gross_ha, decrease: land.desartif_gross_ha };

// Les deux flux d'un territoire et leur différence s'écrivent avec la même précision : sans
// décimale quand chaque flux fait au moins 10 ha, avec une décimale sinon, pour que le plus petit
// des deux ne s'écrive pas zéro
const decimalsOf = ({ increase, decrease }: Flows): number => (Math.min(...[increase, decrease].filter((flow) => flow > 0)) >= 10 ? 0 : 1);

type Described = { point: Omit<LandPoint, 'legendKey'>; ring: RingPoint | null };

// Ce que l'infobulle dit d'un territoire renseigné, et son anneau s'il a un flux
const describeFlows = (ctx: FrameContext, land: NationalMapArtifLand, landId: string, flows: Flows): Pick<LandPoint, 'value' | 'valueText'> & { ring: RingPoint | null } => {
    const { increase, decrease } = flows;
    const gross = increase + decrease;
    const net = increase - decrease;
    const years = artifValueNote(land, ctx.indicator);
    if (gross === 0) return { value: net, valueText: `${NO_FLOW_TEXT}${years}`, ring: null };
    const decimals = decimalsOf(flows);
    const amount = (value: number): string => `${formatSigned(value, decimals)}${unitSuffix(ctx.indicator)}`;
    return {
        value: net,
        valueText: `${amount(increase)} artificialisés, ${amount(-decrease)} désartificialisés<br/>soit ${amount(net)} nets${years}`,
        ring: { land_id: landId, gross, decreaseShare: decrease / gross, netLabel: formatSigned(net, decimals) },
    };
};

// Le diamètre des anneaux dépend de la taille de la carte à l'écran, et leur forme de ce
// diamètre : ils sont calculés à l'affichage, pour qu'un redimensionnement ne recalcule pas le cadre.
export const buildRings = (ctx: FrameContext): { render: FrameRender; legend: LegendModel } => {
    const { base, indicator, data } = ctx;
    const lands = data.source === 'artif' ? data.response.lands : {};
    const described: Described[] = base.features.map((feature) => {
        const landId = feature.properties.land_id;
        const land = lands[landId];
        if (!land) return { point: absentPoint(feature, base.scale), ring: null };
        const flows = flowsOf(land);
        if (!flows) return { point: knownPoint(feature, base.scale, { value: null, color: NO_DATA_COLOR, valueText: NO_DATA_TEXT }), ring: null };
        const { ring, ...shown } = describeFlows(ctx, land, landId, flows);
        // Le territoire garde un fond neutre, ses flux sont portés par l'anneau
        return { point: knownPoint(feature, base.scale, { ...shown, color: SYMBOL_BASE_COLOR }), ring };
    });
    const points: LandPoint[] = described.map(({ point }) => ({ ...point, legendKey: point.value === null ? null : 0 }));
    const rings = described.flatMap(({ ring }) => (ring ? [ring] : [])).sort((a, b) => b.gross - a.gross);
    const maxValue = rings.length > 0 ? rings[0].gross : 0;
    // Une valeur de référence ronde s'écrit sans décimale
    const referenceLabel = (value: number): string => formatValue(value, { unit: indicator.unit, decimals: Number.isInteger(value) ? 0 : indicator.decimals });
    return {
        render: { renderer: 'territory', mode: 'rings', points, rings, maxValue },
        legend: {
            kind: 'symbols',
            shape: 'ring',
            signature: legendSignature(ctx),
            title: indicator.label,
            references: symbolReferenceValues(maxValue, indicator.decimals ?? 0).map((value) => ({ value, label: referenceLabel(value) })),
            maxValue,
            landCount: base.features.length,
            colors: [
                { color: SIGNED_SYMBOL_COLORS.increase, label: 'Artificialisation' },
                { color: SIGNED_SYMBOL_COLORS.decrease, label: 'Désartificialisation' },
            ],
            note: RINGS_NOTE,
            noDataCount: noDataCountOf(points),
            method: ringsMethod(millesimeReadingOf(ctx)?.long ?? 'entre ses deux derniers millésimes OCS GE'),
        },
    };
};
