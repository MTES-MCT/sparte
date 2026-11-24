// Note de la carte : ce que la carte ne montre pas (territoires sans donnée, collectivités
// absentes) ou ce qu'il faut savoir pour la lire (source, millésimes, couverture du carroyage)
import { formatNumber } from '@utils/formatUtils';
import { artifFootnote } from '../../artifIndicators';
import { dominantGeneration } from '../grid/soilImage';
import { isRegionInZone, regionLabel } from '../../zones';
import { artifLandsOf } from './shownLands';
import type { FrameBase, FrameContext } from './types';

export type FootnoteId = 'conso_missing' | 'grid' | 'ocsge_stock' | 'ocsge_flux' | 'ocsge_rings' | 'ocsge_soil_grid' | 'communes_conso' | 'communes_ocsge';

// Collectivités françaises absentes des données de consommation d'espaces (et donc de la carte)
const COLLECTIVITIES_OFF_MAP =
    'Saint-Pierre-et-Miquelon, Saint-Barthélemy, Saint-Martin, Wallis-et-Futuna, ' +
    'la Polynésie française, la Nouvelle-Calédonie et les Terres australes et antarctiques françaises';

const GRID_FOOTNOTE =
    "Carroyage de 1 km × 1 km de la consommation d'espaces (Cerema, fichiers fonciers), disponible pour l'Hexagone et la Corse. " +
    'Seule la consommation qui a pu être géolocalisée y figure : la somme des carreaux peut différer du total du territoire. ' +
    'Un carreau à cheval sur plusieurs territoires est affiché en entier.';
// France entière : la carte carroyée est en géographie réelle, sans les territoires d'outre-mer rapprochés
const GRID_FOOTNOTE_FRANCE =
    " Les régions d'outre-mer, absentes du carroyage, ne figurent pas sur cette vue : elles restent accessibles par le sélecteur de zone.";

// Territoires affichés sans données, et, sur la France entière, collectivités absentes de la
// carte. Rien à dire : null.
export const missingDataSentence = (names: string[], wholeFrance: boolean): string | null => {
    const intro = "Les données de consommation d'espaces ne sont pas disponibles pour";
    const shown = names.length > 0 ? `${names.join(', ')} (hachurés sur la carte)` : '';
    if (!wholeFrance) return shown ? `${intro} ${shown}.` : null;
    const offMap = `${COLLECTIVITIES_OFF_MAP}, qui ne figurent pas sur la carte.`;
    return shown ? `${intro} ${shown}, ni pour ${offMap}` : `${intro} ${offMap}`;
};

// Territoires sans données ; un territoire d'outre-mer entièrement sans données est cité
// par son nom (« Mayotte ») plutôt que par la liste de ses EPCI ou de ses communes
const landsWithoutConso = ({ features, baseMap }: FrameBase): string[] => {
    const without = features.filter((f) => !f.properties.has_conso);
    const wholeInsets = baseMap.insets.filter((inset) => {
        const members = features.filter((f) => f.properties.zone === inset.zone);
        return members.length > 0 && members.every((f) => !f.properties.has_conso);
    });
    const grouped = new Set(wholeInsets.map((inset) => inset.zone));
    const names = [...wholeInsets.map((inset) => inset.name), ...without.filter((f) => !grouped.has(f.properties.zone)).map((f) => f.properties.name)];
    return [...new Set(names)].sort((a, b) => a.localeCompare(b, 'fr'));
};

// Source, étendue des millésimes des territoires affichés et territoires sans donnée
const ocsgeFootnote = (ctx: FrameContext): string => {
    const { lands, missing } = artifLandsOf(ctx);
    return artifFootnote(lands, ctx.indicator, missing);
};

// Communes sans donnée de la zone affichée, sur la vue de toutes les communes du pays. Une région
// dont aucune commune n'a de donnée est citée par son nom (« Mayotte » plutôt que ses 17 communes).
// La réponse ne nomme que les premières communes sans donnée : quand il en manque, elles sont
// comptées plutôt que nommées.
const communesWithoutData = ({ base, communes }: FrameContext): string[] => {
    const { ids, regions, no_data: named, no_data_count: count } = communes;
    if (count > named.length) return [base.wholeFrance ? `${count} communes` : 'certaines communes'];
    const withoutData = new Set(named.map(([id]) => id));
    const regionOf = new Map<string, string | null>();
    const sizes = new Map<string | null, { all: number; withoutData: number }>();
    ids.forEach((id, rank) => {
        const region = regions[rank];
        const size = sizes.get(region) ?? { all: 0, withoutData: 0 };
        sizes.set(region, size);
        size.all += 1;
        if (!withoutData.has(id)) return;
        size.withoutData += 1;
        regionOf.set(id, region);
    });
    const emptyRegions = new Set([...sizes].filter(([region, size]) => region !== null && size.withoutData === size.all).map(([region]) => region));
    const shown = (region: string | null): boolean => isRegionInZone(region, base.zone);
    const names = [
        ...[...emptyRegions].filter(shown).map(regionLabel),
        ...named.filter(([id]) => shown(regionOf.get(id) ?? null) && !emptyRegions.has(regionOf.get(id) ?? null)).map(([, name]) => name),
    ];
    return names.sort((a, b) => a.localeCompare(b, 'fr'));
};

// Pourquoi la valeur d'une carte peut manquer à une commune qui a des données
const UNCOMPUTED_CAUSES: Record<string, string> = {
    conso_evolution_between_periods: 'une évolution ne se calcule pas sans consommation sur la première période',
};
const UNCOMPUTED_DEFAULT_CAUSE = 'cette valeur ne peut pas y être calculée';

// Communes hachurées alors qu'elles ont des données : la légende les compte avec les
// communes sans donnée, la note dit pourquoi. null quand il n'y en a pas, ou que la réponse ne
// permet pas de les compter (communes sans donnée non nommées, hors de la France entière).
const uncomputedSentence = ({ base, communes, indicator }: FrameContext): string | null => {
    if (!('values' in communes)) return null;
    const { ids, regions, values, no_data: named, no_data_count: count } = communes;
    const listed = count <= named.length;
    if (!listed && !base.wholeFrance) return null;
    const withoutData = new Set(named.map(([id]) => id));
    let grey = 0;
    let listedWithoutData = 0;
    ids.forEach((id, rank) => {
        if (!isRegionInZone(regions[rank], base.zone)) return;
        if (values[rank] === null) grey += 1;
        if (withoutData.has(id)) listedWithoutData += 1;
    });
    const uncomputed = grey - (listed ? listedWithoutData : count);
    if (uncomputed <= 0) return null;
    const cause = UNCOMPUTED_CAUSES[indicator.id] ?? UNCOMPUTED_DEFAULT_CAUSE;
    const others = uncomputed === 1 ? 'Une autre commune est hachurée' : `${formatNumber({ number: uncomputed, decimals: 0 })} autres communes sont hachurées`;
    return `${others} : ${cause}.`;
};

const communesConsoFootnote = (ctx: FrameContext): string | null => {
    const sentences = [missingDataSentence(communesWithoutData(ctx), ctx.base.wholeFrance), uncomputedSentence(ctx)].filter((sentence) => sentence !== null);
    return sentences.length > 0 ? sentences.join(' ') : null;
};

// Au-delà de ce nombre, les territoires hors des chiffres clés sont comptés plutôt que nommés
const MAX_NAMED_UNCOUNTED = 6;

// Carte des sols artificialisés par maille : la note des cartes de stock, sans leur phrase sur les
// territoires hachurés. Un territoire que l'OCS GE ne couvre qu'en partie ne l'est pas : ses
// mailles couvertes sont dessinées, et seuls les chiffres clés le laissent de côté. Le millésime
// annoncé est celui des chiffres : l'image vient de l'IGN, qui la publie par génération de
// millésimes. Son année peut être plus récente que celle des chiffres, ou plus ancienne pour un
// territoire minoritaire dans la zone : la note dit seulement qu'elle peut différer.
const soilGridFootnote = (ctx: FrameContext): string => {
    const { lands, missing } = artifLandsOf(ctx);
    // La génération est celle de l'image dessinée (voir render/grid.ts)
    const generation = ctx.data.source === 'artif' ? dominantGeneration(Object.values(ctx.data.response.lands)) : null;
    const image = generation ? ` L’image de la carte est celle que publie l’IGN (génération ${generation}) : son année peut différer de celle des chiffres.` : '';
    const note = `${artifFootnote(lands, ctx.indicator, [], 'Chiffres')}${image}`;
    if (missing.length === 0) return note;
    const uncounted = missing.length > MAX_NAMED_UNCOUNTED ? `${missing.length} territoires` : missing.join(', ');
    return `${note} Les chiffres clés ne comptent pas ${uncounted} : l’OCS GE ne les couvre pas entièrement, la carte n’en dessine que les mailles couvertes.`;
};

export const FOOTNOTES: Record<FootnoteId, (ctx: FrameContext) => string | null> = {
    conso_missing: ({ base }) => missingDataSentence(landsWithoutConso(base), base.wholeFrance),
    grid: ({ base }) => `${GRID_FOOTNOTE}${base.wholeFrance ? GRID_FOOTNOTE_FRANCE : ''}`,
    ocsge_stock: ocsgeFootnote,
    ocsge_flux: ocsgeFootnote,
    // La légende des anneaux nomme leurs deux couleurs : la note ne parle pas des cercles d'une valeur signée
    ocsge_rings: (ctx) => {
        const { lands, missing } = artifLandsOf(ctx);
        return artifFootnote(lands, { id: ctx.indicator.id, unit: ctx.indicator.unit }, missing);
    },
    ocsge_soil_grid: soilGridFootnote,
    communes_conso: communesConsoFootnote,
    // Les millésimes sont ceux des départements de la zone, à qui l'OCS GE les doit ; la note
    // ne parle pas des cercles d'une valeur signée, que cette vue ne dessine pas
    communes_ocsge: (ctx) => artifFootnote(artifLandsOf(ctx).lands, { id: ctx.indicator.id, unit: ctx.indicator.unit }, communesWithoutData(ctx)),
};
