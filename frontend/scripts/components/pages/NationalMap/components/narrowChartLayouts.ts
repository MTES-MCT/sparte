// Présentation des graphiques complémentaires de la carte. Leurs options viennent du serveur, où
// elles sont écrites pour la pleine largeur d'un diagnostic. Chaque graphique du catalogue y
// déclare ce qu'il en dessine (chartCompositions.ts : un seul axe des ordonnées par graphique ou
// par panneau, séries gardées), sa hauteur, et sa présentation compacte : sous
// NARROW_CHART_MAX_WIDTH (colonne à droite de la carte, téléphone), une règle Highcharts range
// le titre et le sous-titre à gauche et la légende sous le graphique. Au-delà, le graphique garde
// la légende des diagnostics ; l'image exportée depuis la colonne reprend la présentation
// compacte. La fenêtre de détails montre le graphique du serveur.
// Les textes suivent une règle unique, écrite au serveur avec la variante « carte nationale » de
// chaque graphique (project/charts/mixins/NationalMapChartMixin.py) : le titre dit ce que le
// graphique montre, dans les mots de sa ligne du menu, sans le territoire, nommé en tête de
// page ; le sous-titre dit l'unité, puis la période ou les millésimes représentés. Le titre et le
// sous-titre sont ceux du serveur ; ils ne sont complétés ou remplacés ici que là où le
// graphique de la colonne ne montre pas la même chose que celui du serveur.
// Les couleurs des destinations restent celles du serveur ; les graphiques de l'OCS GE prennent
// celles des cartes d'artificialisation.
import type * as Highcharts from 'highcharts';
import { theme } from '@theme';
import { formatNumber } from '@utils/formatUtils';
import { GRID_DESTINATIONS, GridDestination } from '../indicators';
import { formatSigned } from '../values';
import { asRankedShares, flowsAsBars, flowsByCover, focusedOn, onTwoAxes, shareByMillesime, surfaceChangeOf, withPeriodMeans } from './chartCompositions';
import { roundTicks, tickLabel } from './chartTicks';

const NARROW_CHART_MAX_WIDTH = 520;

// Couleur de texte du thème en valeur fixe : une variable CSS ne survit pas à l'export en image
const CHART_TEXT_COLOR = '#161616';
const AXIS_FONT_SIZE = '11px';
export const AXIS_LABEL_STYLE = { color: CHART_TEXT_COLOR, fontSize: AXIS_FONT_SIZE };
const TEXT_STYLE = { color: CHART_TEXT_COLOR, fontSize: '12px', fontWeight: '400' };

// Marges et titre d'un graphique de la colonne, partagés avec celui que la page dessine elle-même
export const COMPACT_SPACING = [4, 4, 8, 4];
export const COMPACT_TITLE: Highcharts.TitleOptions = { align: 'left', margin: 12, style: { color: CHART_TEXT_COLOR, fontSize: '14px', fontWeight: '600' } };

const COMPACT_SUBTITLE: Highcharts.SubtitleOptions = { align: 'left', style: { color: theme.colors.textMuted, fontSize: '12px' } };

// Le titre et le sous-titre n'ont pas de texte ici : ceux du graphique sont gardés
const NARROW_COMMON: Highcharts.Options = {
    chart: { spacing: COMPACT_SPACING },
    title: COMPACT_TITLE,
    subtitle: COMPACT_SUBTITLE,
    legend: {
        layout: 'horizontal',
        align: 'left',
        verticalAlign: 'bottom',
        // 0 : largeur automatique, à la place des 200 px du serveur qui empilent les séries
        itemWidth: 0,
        itemDistance: 12,
        itemMarginTop: 2,
        symbolHeight: 10,
        symbolWidth: 10,
        symbolPadding: 4,
        padding: 0,
        margin: 8,
        itemStyle: TEXT_STYLE,
    },
};

export const subtitle = (text: string): Highcharts.SubtitleOptions => ({ ...COMPACT_SUBTITLE, text });

// Espace insécable, devant « % », « : », « ; » et une unité
const NBSP = '\u00a0';

export type ChartPeriod = { startYear: number; endYear: number };

// Ce que les textes d'un graphique disent de la vue, en plus de ce qu'en dit le serveur : pour
// l'OCS GE, le territoire décrit quand les chiffres clés de la carte portent sur un autre ensemble
export type ChartContext = {
    // null pour une carte de la consommation
    scope: string | null;
};

// Titre que le serveur donne au graphique, au format du diagnostic : « sujet - territoire (période) »
const TITLE_SEPARATOR = ' - ';
const serverTitle = (options: Highcharts.Options): string => options.title?.text ?? '';

// Même titre avec un autre sujet : le territoire et la période du serveur sont gardés
const retitled = (options: Highcharts.Options, subject: string): string => {
    const title = serverTitle(options);
    const cut = title.indexOf(TITLE_SEPARATOR);
    return cut < 0 ? subject : subject + title.slice(cut);
};

// Sous-titre que le serveur donne au graphique : l'unité, puis les millésimes pour l'OCS GE
const serverSubtitle = (options: Highcharts.Options): string => options.subtitle?.text ?? '';

// Sous-titre du serveur suivi d'une précision ; sans lui, la précision seule
const completed = (text: string, addition: string): string => (text ? `${text}, ${addition}` : addition);

// Étiquettes des années, à l'horizontale
const YEAR_LABELS: Highcharts.XAxisLabelsOptions = { rotation: 0, style: AXIS_LABEL_STYLE };

// Années que la zone de tracé a la place d'écrire, à côté d'un axe de valeurs
const MAX_YEAR_LABELS = 7;

// Axe des années : `maxLabels` graduations au plus, régulièrement espacées. Elles sont données à
// Highcharts au lieu d'être calculées par lui : quand la règle fait passer sous le graphique une
// légende que le serveur range sur le côté, il les calcule sur l'ancienne largeur de tracé,
// presque nulle, et n'en garde que la première et la dernière.
const yearAxis = (server: Highcharts.Options, maxLabels: number): Highcharts.XAxisOptions => {
    const serverAxis = Array.isArray(server.xAxis) ? server.xAxis[0] : server.xAxis;
    const yearCount = serverAxis?.categories?.length ?? 0;
    const step = Math.ceil(yearCount / maxLabels);
    return {
        labels: YEAR_LABELS,
        // Sans année (aucune donnée), le calcul est laissé à Highcharts
        tickPositions: yearCount > 0 ? Array.from({ length: Math.ceil(yearCount / step) }, (_, index) => index * step) : undefined,
    };
};

// Ce que la présentation compacte change aux options du graphique, telles qu'il les dessine
type NarrowLayout = (context: ChartContext, options: Highcharts.Options) => Highcharts.Options;

type ChartLayout = {
    // Hauteur de l'emplacement du graphique, en pixels ; DEFAULT_HEIGHT sans elle
    height?: number;
    // Ce que le graphique dessine des options du serveur, à toute largeur ; tout, sans elle
    compose?: (server: Highcharts.Options) => Highcharts.Options;
    narrow: NarrowLayout;
};

const DEFAULT_HEIGHT = 300;

// Axe des valeurs : sans titre, l'unité étant dite en sous-titre. Ses graduations sont données à
// Highcharts au lieu d'être calculées par lui, comme celles des années : il les calcule avant que
// la règle ait raccourci le titre et rangé la légende, sur une zone de tracé presque sans
// hauteur, et n'en garde alors que la première et la dernière. Leurs libellés suivent le pas
// retenu, que Highcharts ne connaît pas.
const valueAxis = (tickCount: number): Highcharts.YAxisOptions => ({
    title: { text: undefined },
    gridLineColor: theme.colors.border,
    labels: {
        style: AXIS_LABEL_STYLE,
        formatter(this: Highcharts.AxisLabelsFormatterContextObject) {
            const [first, second] = this.axis.tickPositions ?? [];
            // Sans deux graduations, pas de pas : le libellé est laissé à Highcharts
            if (typeof this.value !== 'number' || second === undefined) return this.axis.defaultLabelFormatter.call(this);
            return tickLabel(this.value, second - first);
        },
    },
    // Appelée par Highcharts une fois les extrêmes de l'axe connus
    tickPositioner(this: Highcharts.Axis) {
        return roundTicks(this.min, this.max, tickCount);
    },
});
const VALUE_AXIS = valueAxis(4);

// Axe des valeurs de barres horizontales, sous le tracé : il s'arrête aux valeurs extrêmes, pour
// que les barres prennent toute la largeur, et ne garde des graduations rondes que celles qui y
// tombent. Leurs libellés restent à l'horizontale : Highcharts masque ceux qui se chevaucheraient
// plutôt que de les incliner. `tickCount` : graduations cherchées sur l'étendue des valeurs.
const barValueAxis = (tickCount: number): Highcharts.YAxisOptions => {
    const axis = valueAxis(tickCount);
    return {
        ...axis,
        startOnTick: false,
        endOnTick: false,
        labels: { ...axis.labels, rotation: 0 },
        tickPositioner(this: Highcharts.Axis) {
            return roundTicks(this.min, this.max, tickCount)?.filter((tick) => tick >= this.min && tick <= this.max);
        },
    };
};

// Barres par année de la période choisie : les totaux au-dessus des barres (qui se chevauchent)
// sont retirés, ils restent dans l'infobulle et le tableau de données
const YEARLY_BARS: NarrowLayout = () => ({
    // Une année sur deux : celles d'une longue période ne tiennent pas toutes dans la colonne
    xAxis: { labels: { ...YEAR_LABELS, step: 2 } },
    yAxis: { ...VALUE_AXIS, stackLabels: { enabled: false } },
});

// Consommation par année d'une destination, devant le total. Le serveur n'a que le graphique de
// toutes les destinations : le sujet du titre de celui-ci est écrit ici, à toute largeur, dans
// les mots des cartes de la destination, et son sous-titre complète celui du serveur. `serie` : nom que
// le serveur donne à la série de la destination.
const destinationByYear = (serie: string, destination: GridDestination): ChartLayout => ({
    compose: (server) => {
        const focused = focusedOn(serie)(server);
        // Série absente : le graphique reste celui de toutes les destinations, sous son titre
        if (focused === server) return server;
        return {
            ...focused,
            title: { ...server.title, text: retitled(server, `Consommation d'ENAF ${GRID_DESTINATIONS[destination].complement}, par année`) },
            subtitle: { ...server.subtitle, text: completed(serverSubtitle(server), 'devant le total') },
        };
    },
    narrow: YEARLY_BARS,
});

// Ce que le sous-titre dit quand la grandeur de l'Insee n'a pas deux valeurs à relier
const TOO_FEW_CENSUSES = 'moins de deux recensements sur cette période';

// Consommation par année et grandeur de l'Insee aux recensements, sur le même tracé, comme dans
// le diagnostic. Un titre d'axe prendrait une bande de la colonne : ils sont retirés, et le
// sous-titre, qui remplace celui du serveur, dit l'unité, le dessin et l'axe de chaque grandeur.
// `count` : ce que la grandeur de l'Insee dénombre.
const consoOverInsee = (count: string): ChartLayout => ({
    compose: onTwoAxes,
    narrow: (_context, options) => {
        // Deux axes : les deux grandeurs. Un seul : la grandeur de l'Insee n'a pas d'évolution à montrer.
        const axes = Array.isArray(options.yAxis) ? options.yAxis : [options.yAxis ?? {}];
        const texts =
            axes.length === 2
                ? `En hectares par année (barres, axe de gauche) et en ${count} aux recensements (courbe, axe de droite)`
                : `En hectares par année${NBSP}; ${TOO_FEW_CENSUSES}`;
        return {
            subtitle: subtitle(texts),
            xAxis: [yearAxis(options, MAX_YEAR_LABELS)],
            // Autant d'entrées que d'axes : Highcharts retirerait ceux qui manquent
            yAxis: axes.map(() => VALUE_AXIS),
            // La source est déjà dite sous le graphique, où la mention du serveur recouvrirait la légende
            credits: { enabled: false },
        };
    },
});

// Première année de la seconde des deux périodes que compare la carte de l'évolution de la
// consommation : du 1er janvier 2011 au 1er janvier 2021, puis jusqu'au dernier millésime
const SECOND_REFERENCE_PERIOD_START = 2021;

// --- Artificialisation (OCS GE) ---------------------------------------------------------

// Sous-titre d'un graphique de l'OCS GE : ce qu'il mesure et à quels millésimes, que le serveur
// lit dans ses données, puis le territoire qu'il décrit quand ce n'est pas l'ensemble des
// territoires affichés
const ocsgeSubtitle = (text: string, { scope }: ChartContext): Highcharts.SubtitleOptions => subtitle(scope ? `${text}. ${scope}.` : text);

// Libellés des types de couverture du sol, sur deux lignes au plus dans une marge de cette largeur
const COVER_LABELS: Highcharts.XAxisLabelsOptions = { style: { ...AXIS_LABEL_STYLE, width: 112 } };

// Nombre de couvertures que la colonne a la place de montrer : celles de la répartition des
// surfaces, suivies des autres réunies, et celles des flux
const RANKED_COVERS = 5;
const FLOW_COVERS = 6;

// Étiquette de valeur d'une barre
const BAR_LABEL_STYLE = { color: CHART_TEXT_COLOR, fontSize: AXIS_FONT_SIZE, fontWeight: '400', textOutline: 'none' };

// Graphiques complémentaires du catalogue, sous leur identifiant
const CHART_LAYOUTS = {
    conso_by_year_and_destination: { narrow: YEARLY_BARS },
    conso_habitat_by_year: destinationByYear('Habitat', 'habitat'),
    conso_activite_by_year: destinationByYear('Activité', 'activite'),
    // Depuis 2011, quelle que soit la période choisie : le serveur lit les années du titre dans ses données
    conso_by_year: {
        compose: withPeriodMeans(SECOND_REFERENCE_PERIOD_START),
        narrow: () => ({
            xAxis: { labels: { ...YEAR_LABELS, step: 2 } },
            yAxis: VALUE_AXIS,
        }),
    },
    // Répartition : les parts sont lues dans la légende, les étiquettes autour du disque ne
    // tiennent pas. Le sous-titre du serveur, qui annonce des hectares, est remplacé.
    destination_share: {
        narrow: () => ({
            subtitle: subtitle(`En${NBSP}% de la consommation`),
            legend: {
                labelFormatter(this: Highcharts.Point | Highcharts.Series) {
                    const share = (this as Highcharts.Point).percentage ?? 0;
                    return `${this.name}${NBSP}: ${formatNumber({ number: share, decimals: 1 })}${NBSP}%`;
                },
            },
            plotOptions: { pie: { showInLegend: true, dataLabels: { enabled: false }, size: '95%' } },
        }),
    },
    conso_and_population_by_year: consoOverInsee("nombre d'habitants"),
    conso_and_households_by_year: consoOverInsee('nombre de ménages'),
    // Trois recensements, quelle que soit la période choisie
    employment_by_census: {
        narrow: (_context, options) => ({
            xAxis: yearAxis(options, 3),
            yAxis: VALUE_AXIS,
            credits: { enabled: false },
        }),
    },
    // Deux barres : le flux entre elles, que le serveur écrit sur le tracé, complète le sous-titre,
    // après un point-virgule (le sous-titre se termine par les années d'un millésime, entre parenthèses)
    artif_share_by_millesime: {
        height: 260,
        compose: shareByMillesime,
        narrow: (context, options) => {
            const change = surfaceChangeOf(options);
            return {
                subtitle: ocsgeSubtitle(serverSubtitle(options) + (change === null ? '' : `${NBSP}; ${formatSigned(change, 0)}${NBSP}ha`), context),
                xAxis: { labels: YEAR_LABELS },
                yAxis: VALUE_AXIS,
                plotOptions: { column: { dataLabels: { style: BAR_LABEL_STYLE } } },
            };
        },
    },
    artif_by_cover: {
        compose: asRankedShares(RANKED_COVERS),
        narrow: (context, options) => ({
            subtitle: ocsgeSubtitle(serverSubtitle(options), context),
            xAxis: { labels: COVER_LABELS },
            plotOptions: { bar: { dataLabels: { style: BAR_LABEL_STYLE } } },
        }),
    },
    // Trois barres, sous un titre de trois lignes et un sous-titre qui date deux millésimes : la
    // hauteur d'un graphique par année, pour que le nom de chaque flux reste écrit en entier
    artif_and_desartif: {
        height: 300,
        compose: flowsAsBars,
        narrow: (context, options) => ({
            subtitle: ocsgeSubtitle(serverSubtitle(options), context),
            xAxis: { labels: { style: AXIS_LABEL_STYLE } },
        }),
    },
    // Une ligne par couverture, la légende des deux flux, et les mêmes titres : plus de hauteur,
    // sans quoi Highcharts n'écrit qu'une couverture sur deux
    artif_flux_by_cover: {
        height: 400,
        compose: flowsByCover(FLOW_COVERS),
        narrow: (context, options) => {
            const axis = Array.isArray(options.xAxis) ? options.xAxis[0] : options.xAxis;
            const truncated = (axis?.categories?.length ?? 0) >= FLOW_COVERS;
            const shown = serverSubtitle(options);
            return {
                subtitle: ocsgeSubtitle(truncated ? completed(shown, 'pour les six couvertures les plus concernées') : shown, context),
                // À droite, la place de la moitié du libellé d'une graduation proche du bord, que Highcharts masquerait
                chart: { spacing: [4, 20, 8, 4] },
                xAxis: { labels: COVER_LABELS },
                yAxis: barValueAxis(5),
            };
        },
    },
} satisfies Record<string, ChartLayout>;

// Graphiques complémentaires qui ont une présentation
export type ComplementaryChart = keyof typeof CHART_LAYOUTS;

const layoutOf = (chart: ComplementaryChart): ChartLayout => CHART_LAYOUTS[chart];

// Hauteur de l'emplacement d'un graphique, en pixels, tant que ses textes n'en demandent pas plus
export const chartHeight = (chart: ComplementaryChart): number => layoutOf(chart).height ?? DEFAULT_HEIGHT;

// Place prévue, dans la hauteur d'un graphique, pour ses textes : un titre de deux lignes, un
// sous-titre, les années et la légende. Le reste est le tracé.
const TEXT_ROOM = 130;

// Hauteur qu'un graphique étroit doit avoir pour que son tracé garde celle que sa présentation
// prévoit. Le titre nomme le territoire et la période : pour un nom long, il prend quatre lignes
// dans la colonne, que le tracé perdrait. `base` : hauteur de l'emplacement ; la hauteur rendue
// ne lui est jamais inférieure.
export const heightKeepingPlot = (base: number, chartHeightNow: number, plotHeight: number): number =>
    Math.max(base, Math.round(chartHeightNow + (base - TEXT_ROOM) - plotHeight));

// À chaque dessin, un graphique étroit prend la hauteur que demandent ses textes ; son
// emplacement, qui n'a qu'une hauteur minimale, le suit. Un graphique large (image exportée,
// plein écran) garde la hauteur qu'on lui donne.
const keepingPlotHeight = (base: number) =>
    function resize(this: Highcharts.Chart): void {
        if (this.chartWidth > NARROW_CHART_MAX_WIDTH) return;
        const needed = heightKeepingPlot(base, this.chartHeight, this.plotHeight);
        if (Math.abs(needed - this.chartHeight) > 1) this.setSize(undefined, needed, false);
    };

const mergeOptions = (base: Highcharts.Options, extra: Highcharts.Options): Highcharts.Options => ({
    ...base,
    ...extra,
    title: { ...base.title, ...extra.title },
    legend: { ...base.legend, ...extra.legend },
});

// La hauteur du graphique est celle de son emplacement : celle que le serveur fixe pour un
// diagnostic est retirée
const withoutFixedHeight = (options: Highcharts.Options): Highcharts.Options => {
    if (options.chart?.height === undefined) return options;
    const { height, ...chart } = options.chart;
    return { ...options, chart };
};

// Options d'un graphique complémentaire à partir de celles du serveur : ce qu'il en dessine, puis
// la règle Highcharts qui ne vaut que pour un graphique étroit, ajoutée après celles du serveur
export const withChartLayout =
    (chart: ComplementaryChart, context: ChartContext) =>
    (server: Highcharts.Options): Highcharts.Options => {
        const { compose, narrow } = layoutOf(chart);
        const options = withoutFixedHeight(compose ? compose(server) : server);
        return {
            ...options,
            chart: { ...options.chart, events: { ...options.chart?.events, render: keepingPlotHeight(chartHeight(chart)) } },
            responsive: {
                rules: [...(options.responsive?.rules ?? []), { condition: { maxWidth: NARROW_CHART_MAX_WIDTH }, chartOptions: mergeOptions(NARROW_COMMON, narrow(context, options)) }],
            },
        };
    };
