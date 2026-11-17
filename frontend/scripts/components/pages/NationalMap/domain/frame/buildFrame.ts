import type { NationalMapArtifIndicators, NationalMapBaseMap, NationalMapIndicators, NationalMapValues } from '@services/api';
import { isArtifFluxIndicator } from '../../artifIndicators';
import { Indicator, UNIT_LABELS } from '../../indicators';
import { formatValue, periodLabel } from '../../values';
import { SCALE_LABELS, chartsLandOf, landToZone, zoneToLand } from '../../zones';
import type { MillesimeReading } from '../millesimes';
import type { ViewRequest } from '../viewState';
import { DrawnValue, ViewProfile, answersValuesQuery, valuesQueryOf, viewProfileOf } from '../viewProfile';
import { buildBase } from './base';
import { FOOTNOTES, FootnoteId } from './footnotes';
import { KEY_FIGURES, KeyFiguresId } from './keyFigures';
import { RENDER_BUILDERS } from './render';
import { buildCommunes } from './render/communes';
import { scatterOf } from './scatter';
import { millesimeReadingOf, shownOcsgeOf } from './shownLands';
import type { ExportMeta, FrameContext, FrameRender, MapFrame, ViewData } from './types';

export type FrameInput = {
    request: ViewRequest;
    indicator: Indicator;
    base?: NationalMapBaseMap;
    conso?: NationalMapIndicators;
    artif?: NationalMapArtifIndicators;
    // Valeurs par commune, que seule la vue de toutes les communes du pays demande
    values?: NationalMapValues;
};

// Réponse dont un indicateur tire ses valeurs : l'artificialisation pour l'OCS GE, la consommation sinon
export const dataSourceOf = (indicator: Indicator): ViewData['source'] => (indicator.source === 'ocsge' ? 'artif' : 'conso');

const usesOcsge = (indicator: Indicator): boolean => dataSourceOf(indicator) === 'artif';

// L'OCS GE n'a pas de période : deux périodes y désignent la même vue
const frameKeyOf = (request: ViewRequest, indicator: Indicator): string => {
    const view = `${request.zone}|${request.scale}|${indicator.id}`;
    return usesOcsge(indicator) ? view : `${view}|${request.startYear}-${request.endYear}`;
};

// Le fond est-il celui que la vue demande : sa zone, et la maille de son profil ?
const baseMatches = (base: NationalMapBaseMap, request: ViewRequest, baseScale: string): boolean => {
    if (base.scale !== baseScale) return false;
    const land = zoneToLand(request.zone);
    return land && base.parent ? landToZone(base.parent) === request.zone : !land && !base.parent;
};

// Réponse par territoire que l'indicateur lit, si elle est celle de la demande : à la maille du
// fond et, pour la consommation, sur la période choisie. L'autre réponse n'est jamais regardée :
// elle ne retarde ni ne change la carte.
const dataOf = ({ request, indicator, conso, artif }: FrameInput, baseScale: string): ViewData | null => {
    if (usesOcsge(indicator)) return artif?.scale === baseScale ? { source: 'artif', response: artif } : null;
    const matches = conso?.scale === baseScale && conso.start_year === request.startYear && conso.end_year === request.endYear;
    return matches ? { source: 'conso', response: conso } : null;
};

// Valeurs par commune de la vue : null quand elle n'en demande pas, undefined tant que la réponse
// attendue manque ou qu'elle est celle d'une autre demande
const communesOf = ({ request, indicator, values }: FrameInput): NationalMapValues | null | undefined => {
    const query = valuesQueryOf(request, indicator);
    if (!query) return null;
    return values && answersValuesQuery(values, query) ? values : undefined;
};

// Chiffres clés et note d'un indicateur : ceux de sa source et, pour l'OCS GE, de sa rubrique
// (espaces artificialisés au dernier millésime, ou artificialisation entre deux millésimes). La
// carte en anneaux a les siens : les deux flux bruts que ses anneaux partagent, et une note qui
// ne dit rien de cercles.
const keyFiguresIdOf = (indicator: Indicator): KeyFiguresId => {
    if (!usesOcsge(indicator)) return 'conso_period';
    if (indicator.rings) return 'artif_gross_flux';
    return isArtifFluxIndicator(indicator) ? 'artif_flux' : 'artif_stock';
};

const footnoteIdOf = (indicator: Indicator, { renderer }: ViewProfile): FootnoteId => {
    if (renderer === 'grid') return usesOcsge(indicator) ? 'ocsge_soil_grid' : 'grid';
    if (renderer === 'communes') return usesOcsge(indicator) ? 'communes_ocsge' : 'communes_conso';
    if (!usesOcsge(indicator)) return 'conso_missing';
    if (indicator.rings) return 'ocsge_rings';
    return isArtifFluxIndicator(indicator) ? 'ocsge_flux' : 'ocsge_stock';
};

const CEREMA_CREDITS = 'Mon Diagnostic Artificialisation · données Cerema (fichiers fonciers)';
const IGN_CREDITS = 'Mon Diagnostic Artificialisation · données IGN (OCS GE)';

// Ce que les textes disent de la vue : sa maille, qui n'est pas toujours celle de son fond, et la
// valeur que la carte dessine
type Shown = { scale: string; drawn: DrawnValue };

// Ce que l'image exportée dit des symboles proportionnels, qu'elle montre sans leur légende
const symbolsCaption = (render: FrameRender, indicator: Indicator): string => {
    if (render.mode === 'symbols') return `surface des cercles proportionnelle à la valeur (maximum : ${formatValue(render.maxValue, indicator)})`;
    if (render.mode !== 'rings') return '';
    return (
        `surface des anneaux proportionnelle à la somme des deux flux (maximum : ${formatValue(render.maxValue, indicator)})` +
        ' · artificialisation en rouge, désartificialisation en bleu'
    );
};

// Textes de l'image exportée : l'image dessine son titre, son sous-titre et ses crédits
const exportMetaOf = ({ base, indicator, period }: FrameContext, render: FrameRender, { scale, drawn }: Shown, millesimes: MillesimeReading | null): ExportMeta => {
    const credits = usesOcsge(indicator) ? IGN_CREDITS : CEREMA_CREDITS;
    if (render.renderer === 'grid') {
        return {
            title: indicator.label,
            subtitle: `${base.title} · ${render.cells.texts.caption}`,
            ...(render.detail ? { detailSubtitle: `${base.title} · ${render.detail.caption}` } : {}),
            ...(render.image ? { imageSubtitle: `${base.title} · ${render.image.caption}` } : {}),
            filename: `carte-${base.zone.toLowerCase()}-${indicator.id}`,
            credits,
        };
    }
    // La période choisie ou, pour l'OCS GE, les millésimes représentés : l'image ne montre pas la barre de titre
    const periodText = period ? periodLabel(period.startYear, period.endYear) : (millesimes?.short ?? '');
    const subtitle = [base.title, `par ${SCALE_LABELS[scale].toLowerCase()}`, periodText, symbolsCaption(render, indicator)];
    return {
        title: drawn.label,
        subtitle: subtitle.filter(Boolean).join(' · '),
        filename: `carte-${base.zone.toLowerCase()}-${scale.toLowerCase()}-${indicator.id}`,
        credits,
        unitLabel: drawn.unit ? UNIT_LABELS[drawn.unit] : undefined,
    };
};

// Description de la carte pour les lecteurs d'écran
const ariaLabelOf = ({ base, indicator }: FrameContext, render: FrameRender, { drawn }: Shown): string => {
    if (render.renderer === 'grid') return `Carte de la zone ${base.title}, indicateur ${indicator.label}, ${render.cells.texts.spoken}.`;
    const lands = render.renderer === 'communes' ? 'commune' : 'territoire';
    return base.wholeFrance
        ? `Carte de la France entière par ${lands}, indicateur ${drawn.label}. Les régions d'outre-mer sont placées à gauche de l'Hexagone.`
        : `Carte de la zone ${base.title} par ${lands}, indicateur ${drawn.label}.`;
};

// Cadre de la vue demandée ; null tant qu'une réponse dont il dépend manque ou ne correspond pas
// à la demande : le fond attendu pour la vue, les données par territoire à la maille de ce fond
// et, s'il en faut une, la colonne de valeurs de la maille et de la période demandées. Un cadre
// ne mêle donc jamais le fond d'une vue et les valeurs d'une autre.
export const buildFrame = (input: FrameInput): MapFrame | null => {
    const { request, indicator, base } = input;
    const profile = viewProfileOf(request, indicator);
    if (!base || !baseMatches(base, request, profile.baseScale)) return null;
    const data = dataOf(input, profile.baseScale);
    const communes = communesOf(input);
    if (!data || communes === undefined) return null;
    const ctx: FrameContext = {
        base: buildBase(request.zone, base),
        indicator,
        data,
        period: data.source === 'conso' ? { startYear: data.response.start_year, endYear: data.response.end_year } : null,
        communes,
    };
    const { render, legend } = profile.renderer === 'communes' ? buildCommunes(ctx, profile) : RENDER_BUILDERS[profile.mode](ctx);
    const shown: Shown = { scale: request.scale, drawn: profile.drawn };
    const millesimes = millesimeReadingOf(ctx);
    return {
        ...ctx,
        key: frameKeyOf(request, indicator),
        render,
        legend,
        keyFigures: KEY_FIGURES[keyFiguresIdOf(indicator)](ctx),
        footnote: FOOTNOTES[footnoteIdOf(indicator, profile)](ctx),
        chartsLand: chartsLandOf(request.zone),
        shownOcsge: shownOcsgeOf(ctx),
        millesimes,
        scatter: scatterOf(ctx, render),
        exportMeta: exportMetaOf(ctx, render, shown, millesimes),
        ariaLabel: ariaLabelOf(ctx, render, shown),
    };
};

export type ViewError = 'base-map' | 'data';

type RequestOutcome = { isError: boolean };

// Échec qui empêche d'afficher la vue demandée : celui du fond, sinon celui de la réponse que
// l'indicateur lit ou de la colonne de valeurs par commune, qui n'est demandée que si la vue la dessine
export const viewErrorOf = (
    indicator: Indicator,
    sources: { base: RequestOutcome; conso: RequestOutcome; artif: RequestOutcome; values: RequestOutcome },
): ViewError | null => {
    if (sources.base.isError) return 'base-map';
    return sources[dataSourceOf(indicator)].isError || sources.values.isError ? 'data' : null;
};
