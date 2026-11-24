// Ce que les graphiques complémentaires de la carte dessinent à partir des options du serveur,
// écrites pour les diagnostics : panneaux, séries gardées, repères ajoutés. Fonctions pures, qui
// rendent de nouvelles options sans modifier celles qu'elles reçoivent. Elles valent à toute
// largeur ; ce qui ne vaut que pour un graphique étroit est dans narrowChartLayouts.ts.
import type * as Highcharts from 'highcharts';
import { formatNumber } from '@utils/formatUtils';
import { SIGNED_SYMBOL_COLORS } from '../artifIndicators';
import { DECREASE_PALETTE, INCREASE_PALETTE, formatSigned, periodLabel } from '../values';

// Ce que les compositions lisent d'une série du serveur, quel que soit son type
type ServerSerie = { name?: string; type?: string; color?: string; yAxis?: number | string; linkedTo?: string; marker?: object; data?: unknown[] };

const seriesOf = (server: Highcharts.Options): ServerSerie[] => (server.series ?? []) as ServerSerie[];

// Les séries composées gardent le type et les options que le serveur leur donne
const asOptions = (series: ServerSerie[]): Highcharts.SeriesOptionsType[] => series as Highcharts.SeriesOptionsType[];

// Valeur d'un point du serveur, donné seul ou en objet ({ name, y }) ; null pour une valeur absente
const valueOf = (point: unknown): number | null => {
    if (typeof point === 'number') return point;
    if (point && typeof point === 'object' && 'y' in point) return valueOf(point.y);
    return null;
};

const valueCount = (serie: ServerSerie): number => (serie.data ?? []).filter((point) => valueOf(point) !== null).length;

// Gris foncé des grandeurs qui ne sont pas une destination de la consommation : leurs couleurs
// restent ainsi réservées aux destinations, les mêmes d'un graphique à l'autre
const NEUTRAL_COLOR = '#3a3a3a';

// --- Consommation et grandeur de l'Insee : deux axes sur le même tracé ------------------

// Axes des graphiques qui croisent la consommation et une grandeur de l'Insee, dans l'ordre où le
// serveur les rend
const INSEE_AXIS = 0;
const CONSO_AXIS = 1;

// Place d'un axe : tout le tracé. Elle est dite en toutes lettres : un graphique mis à jour en
// place garderait sinon la place qu'un axe occupait dans une présentation précédente.
const WHOLE_PLOT = { top: '0%', height: '100%' };

const axisOf = (serie: ServerSerie): number => (typeof serie.yAxis === 'number' ? serie.yAxis : 0);

// Chaque série a sa ligne de légende : le serveur en rattache parfois une à une autre sans la nommer
const namedInLegend = ({ linkedTo, ...serie }: ServerSerie): ServerSerie => serie;

// Comme dans le diagnostic, la grandeur de l'Insee est tracée par-dessus les barres de la
// consommation : les hectares se lisent sur l'axe de gauche, la grandeur de l'Insee sur celui de
// droite, qui n'ajoute pas ses lignes à celles de la consommation. La grandeur de l'Insee passe
// au gris neutre, avec son axe, et garde le même repère d'une mise à jour à l'autre. Quand elle
// n'a pas deux valeurs à relier (un recensement au plus dans la période, territoire sans donnée),
// il ne reste que la consommation, sur un seul axe.
export const onTwoAxes = (server: Highcharts.Options): Highcharts.Options => {
    const axes = Array.isArray(server.yAxis) ? server.yAxis : [];
    if (axes.length !== 2) return server;
    const series = seriesOf(server).map(namedInLegend);
    const insee = axes[INSEE_AXIS];
    const conso = { ...axes[CONSO_AXIS], ...WHOLE_PLOT, opposite: false };

    if (!series.some((serie) => axisOf(serie) === INSEE_AXIS && valueCount(serie) >= 2)) {
        const consoSeries = series.filter((serie) => axisOf(serie) === CONSO_AXIS).map((serie) => ({ ...serie, yAxis: 0 }));
        return { ...server, yAxis: [conso], series: asOptions(consoSeries) };
    }
    return {
        ...server,
        yAxis: [
            {
                ...insee,
                ...WHOLE_PLOT,
                opposite: true,
                gridLineWidth: 0,
                title: { ...insee.title, style: { ...insee.title?.style, color: NEUTRAL_COLOR } },
                labels: { ...insee.labels, style: { ...insee.labels?.style, color: NEUTRAL_COLOR } },
            },
            conso,
        ],
        // La courbe passe devant les barres
        series: asOptions(
            series.map((serie) => (axisOf(serie) === INSEE_AXIS ? { ...serie, color: NEUTRAL_COLOR, zIndex: 2, marker: { ...serie.marker, symbol: 'circle' } } : serie)),
        ),
    };
};

// --- Consommation par année : une destination devant le total -----------------------------

// Série du total, dans le graphique de la consommation par année et par destination
const TOTAL_SERIE = 'Total';

// Consommation par année réduite à une destination, désignée par le nom de sa série, devant le
// total. La série gardée reçoit en propre la couleur que sa place dans la palette du serveur lui
// donne : celle de la destination dans les graphiques qui les montrent toutes. Si le serveur ne
// rend pas cette série, le graphique reste celui de toutes les destinations.
export const focusedOn =
    (serieName: string) =>
    (server: Highcharts.Options): Highcharts.Options => {
        const series = seriesOf(server);
        const index = series.findIndex((serie) => serie.name === serieName);
        if (index < 0) return server;
        const palette = (server.colors ?? []) as string[];
        const focused = { ...series[index], color: series[index].color ?? palette[index % palette.length] };
        return { ...server, series: asOptions([focused, ...series.filter((serie) => serie.name === TOTAL_SERIE)]) };
    };

// --- Consommation par an : rythme moyen de deux périodes ---------------------------------

// Couleur que le serveur donne à la consommation totale dans les graphiques par destination
const TOTAL_COLOR = '#CFD1E5';

// Demi-largeur du segment d'une moyenne autour d'une barre, en part de l'intervalle entre deux années
const HALF_BAR = 0.45;

// Valeur d'une année, à sa place sur l'axe (une catégorie par point, dans l'ordre du serveur)
type YearValue = { year: number; position: number; value: number };

const yearValuesOf = (serie?: ServerSerie): YearValue[] =>
    (serie?.data ?? [])
        .map((point, position) => ({ year: Number((point as { name?: unknown } | null)?.name), position, value: valueOf(point) }))
        .filter(({ year, value }) => Number.isFinite(year) && value !== null);

const meanOf = (values: YearValue[]): number => values.reduce((sum, { value }) => sum + value, 0) / values.length;

// Segment horizontal à la hauteur de la moyenne d'une période, de sa première à sa dernière
// barre ; sa ligne de légende dit la période et la valeur, dans l'unité des barres, en peu de
// mots : elle doit tenir sur la largeur de la colonne
const meanSegment = (values: YearValue[], color: string): Highcharts.SeriesLineOptions => {
    const mean = meanOf(values);
    const first = values[0];
    const last = values.at(-1)!;
    return {
        type: 'line',
        name: `Moyenne ${periodLabel(first.year, last.year)} : ${formatNumber({ number: mean, decimals: mean < 10 ? 1 : 0 })} ha`,
        color,
        lineWidth: 2,
        marker: { enabled: false },
        enableMouseTracking: false,
        data: [
            [first.position - HALF_BAR, mean],
            [last.position + HALF_BAR, mean],
        ],
    };
};

// Moyenne de la seconde période aux couleurs des évolutions de la carte : la teinte soutenue des
// hausses si le rythme a augmenté, celle des baisses s'il a diminué
const evolutionColor = (before: YearValue[], after: YearValue[]): string => {
    const change = meanOf(after) - meanOf(before);
    if (change === 0) return NEUTRAL_COLOR;
    return change > 0 ? INCREASE_PALETTE.at(-1)! : DECREASE_PALETTE[0];
};

// Consommation par an, avec le rythme moyen de deux périodes : les années avant `splitYear`, puis
// les suivantes. Les barres prennent la couleur du total. La bande de fond que le serveur pose sur
// la première période reste, sans son libellé, que la légende des moyennes remplace ; la légende,
// que le serveur masque, est affichée. Une période sans année connue n'a pas de segment.
export const withPeriodMeans =
    (splitYear: number) =>
    (server: Highcharts.Options): Highcharts.Options => {
        const [bars, ...others] = seriesOf(server);
        if (!bars) return server;
        const values = yearValuesOf(bars);
        const before = values.filter(({ year }) => year < splitYear);
        const after = values.filter(({ year }) => year >= splitYear);
        const means = [
            ...(before.length > 0 ? [meanSegment(before, NEUTRAL_COLOR)] : []),
            ...(after.length > 0 ? [meanSegment(after, before.length > 0 ? evolutionColor(before, after) : NEUTRAL_COLOR)] : []),
        ];
        const xAxis = Array.isArray(server.xAxis) ? server.xAxis[0] : server.xAxis;
        return {
            ...server,
            legend: { ...server.legend, enabled: true },
            xAxis: { ...xAxis, plotBands: (xAxis?.plotBands ?? []).map(({ label, ...band }) => band) },
            series: [...asOptions([{ ...bars, color: TOTAL_COLOR }, ...others]), ...means],
        };
    };

// --- Artificialisation (OCS GE) : les couleurs de la carte ------------------------------

// Les graphiques de l'OCS GE reprennent les couleurs des cartes d'artificialisation, pour que
// carte et graphiques se lisent ensemble : le rouge pour ce qui est artificialisé ou
// s'artificialise, le bleu pour la désartificialisation, le gris neutre pour leur différence.
// Le serveur, lui, dessine ces flux en rouge, vert et indigo.
const FLOW_COLORS: Record<string, string> = {
    Artificialisation: SIGNED_SYMBOL_COLORS.increase,
    Désartificialisation: SIGNED_SYMBOL_COLORS.decrease,
    'Artificialisation nette': NEUTRAL_COLOR,
};

const firstAxis = <Axis,>(axis: Axis | Axis[] | undefined): Axis | undefined => (Array.isArray(axis) ? axis[0] : axis);

// Surface en hectares, sans décimale à partir de 10 ha
const hectares = (value: number): string => `${formatNumber({ number: value, decimals: Math.abs(value) < 10 ? 1 : 0 })} ha`;
// Flux en hectares, avec son signe
const signedHectares = (value: number): string => `${formatSigned(value, Math.abs(value) < 10 ? 1 : 0)} ha`;
// Part en pourcentage, avec une décimale sous 10 %
const percent = (value: number): string => `${formatNumber({ number: value, decimals: value < 10 ? 1 : 0 })} %`;

// Trait du zéro d'un axe de valeurs dont les barres partent des deux côtés
const ZERO_LINE: Highcharts.YAxisPlotLinesOptions = { value: 0, color: NEUTRAL_COLOR, width: 1, zIndex: 3 };

// Axe de valeurs réduit au trait du zéro, pour des barres dont la valeur est écrite
const UNGRADUATED_AXIS: Highcharts.YAxisOptions = { title: { text: undefined }, labels: { enabled: false }, gridLineWidth: 0, plotLines: [ZERO_LINE] };

// Ligne d'infobulle d'un flux, écrite comme les autres nombres de la page
const flowTooltip = (tooltip: Highcharts.TooltipOptions = {}): Highcharts.TooltipOptions => ({
    ...tooltip,
    pointFormatter(this: Highcharts.Point) {
        const label = this.series.name ? `${this.series.name} : ` : '';
        return `<span style="color:${this.color}">●</span> ${label}<b>${signedHectares(this.y ?? 0)}</b><br/>`;
    },
});

// --- Part artificialisée aux millésimes du territoire -------------------------------------

// Point du graphique de la part artificialisée : la part, et la surface qu'elle représente
type SharePoint = { y?: number; surface?: number };

const sharePointsOf = (options: Highcharts.Options): SharePoint[] => (seriesOf(options)[0]?.data ?? []) as SharePoint[];

// De la place au-dessus de la plus haute barre pour son étiquette de deux lignes, en part de la hauteur des barres
const LABELS_HEADROOM = 0.3;

// Part artificialisée du territoire à chacun de ses millésimes : les barres seules, au rouge de la
// carte, avec leur part et leur surface. Le trait et l'étiquette du flux que le serveur pose
// entre les deux barres sont retirés : la présentation compacte le dit en sous-titre. Chaque
// barre garde l'étiquette que le serveur donne à son millésime : son index, puis ses années.
export const shareByMillesime = (server: Highcharts.Options): Highcharts.Options => {
    const [bars] = seriesOf(server);
    if (!bars) return server;
    // L'étiquette est écrite par une fonction : le format du serveur, qui passerait avant elle, est retiré
    const { format, ...dataLabels } = (server.plotOptions?.column?.dataLabels ?? {}) as Highcharts.DataLabelsOptions;
    return {
        ...server,
        yAxis: { ...firstAxis(server.yAxis), maxPadding: LABELS_HEADROOM },
        tooltip: {
            ...server.tooltip,
            pointFormatter(this: Highcharts.Point) {
                const { y = 0, surface } = this.options as SharePoint;
                const surfaceLine = surface === undefined ? '' : `<br/>Surface : <b>${hectares(surface)}</b>`;
                return `Part du territoire : <b>${formatNumber({ number: y, decimals: 2 })} %</b>${surfaceLine}`;
            },
        },
        plotOptions: {
            ...server.plotOptions,
            column: {
                ...server.plotOptions?.column,
                dataLabels: {
                    ...dataLabels,
                    formatter(this: Highcharts.PointLabelObject) {
                        const { y = 0, surface } = this.point.options as SharePoint;
                        const surfaceLine = surface === undefined ? '' : `<br/>${hectares(surface)}`;
                        return `${formatNumber({ number: y, decimals: 2 })} %${surfaceLine}`;
                    },
                },
            },
        },
        series: asOptions([{ ...bars, color: SIGNED_SYMBOL_COLORS.increase }]),
    };
};

// Surface artificialisée gagnée (ou rendue) du premier au dernier millésime du graphique, en
// hectares ; null s'il n'en montre qu'un
export const surfaceChangeOf = (options: Highcharts.Options): number | null => {
    const surfaces = sharePointsOf(options).map(({ surface }) => surface);
    const [first, last] = [surfaces[0], surfaces.at(-1)];
    return surfaces.length >= 2 && first !== undefined && last !== undefined ? last - first : null;
};

// --- Artificialisation, désartificialisation et leur différence ---------------------------

// Point du graphique des flux : un flux, nommé, en hectares
type FlowPoint = { name?: string; y?: number; color?: string };

// Les trois flux en barres horizontales, aux couleurs de la carte. La valeur de chacun est écrite
// sous son nom : au bout de la barre, celle d'une désartificialisation sortirait du tracé. L'axe
// des valeurs, que ces étiquettes remplacent, se réduit au trait du zéro. Sans flux, le graphique
// reste celui du serveur, qui le dit.
export const flowsAsBars = (server: Highcharts.Options): Highcharts.Options => {
    const [flows] = seriesOf(server);
    const points = (flows?.data ?? []) as FlowPoint[];
    if (points.length === 0) return server;
    return {
        ...server,
        chart: { ...server.chart, type: 'bar' },
        xAxis: {
            ...firstAxis(server.xAxis),
            labels: {
                formatter(this: Highcharts.AxisLabelsFormatterContextObject) {
                    const point = points[this.pos];
                    return point ? `${point.name}<br/><b>${signedHectares(point.y ?? 0)}</b>` : String(this.value);
                },
            },
        },
        yAxis: { ...firstAxis(server.yAxis), ...UNGRADUATED_AXIS },
        tooltip: flowTooltip(server.tooltip),
        plotOptions: { ...server.plotOptions, bar: { borderWidth: 0, dataLabels: { enabled: false } } },
        series: asOptions([{ ...flows, type: 'bar', data: points.map((point) => ({ ...point, color: FLOW_COLORS[point.name ?? ''] ?? point.color })) }]),
    };
};

// --- Surfaces artificialisées par type de couverture --------------------------------------

// Secteur du graphique des surfaces par couverture : un type de couverture du sol, son nom
// abrégé et son nom complet, sa couleur dans la nomenclature de l'OCS GE, sa surface en hectares
type CoverPoint = { name?: string; long_name?: string; color?: string; y?: number };

// Barre d'un type de couverture : sa part des surfaces, et la surface qu'elle représente
type CoverShare = { name: string; y: number; surface: number; color?: string };

// Le nom complet d'une couverture se termine par des exemples entre parenthèses
const coverName = ({ long_name: longName, name }: CoverPoint): string => {
    const text = longName ?? name ?? '';
    const examples = text.indexOf('(');
    return examples === -1 ? text : text.slice(0, examples).trimEnd();
};

const OTHER_COVERS = 'Autres couvertures';
const OTHER_COVERS_COLOR = '#bdbdbd';

// De la place au bout de la plus longue barre pour l'étiquette de sa part, en part de sa longueur
const SHARE_LABEL_ROOM = 0.3;

// Les secteurs d'une répartition deviennent des barres horizontales, de la plus grande part à la
// plus petite : les `count` premières couvertures, puis les autres réunies. Dix à treize secteurs
// ne se lisent pas dans la colonne. Chaque barre garde la couleur de sa couverture dans la
// nomenclature de l'OCS GE, et porte sa part au bout. Sans surface, le graphique reste celui du serveur.
export const asRankedShares =
    (count: number) =>
    (server: Highcharts.Options): Highcharts.Options => {
        const [sectors] = seriesOf(server);
        const covers = ((sectors?.data ?? []) as CoverPoint[]).filter((cover) => (cover.y ?? 0) > 0).sort((a, b) => b.y - a.y);
        const total = covers.reduce((sum, cover) => sum + cover.y, 0);
        if (total <= 0) return server;
        const share = (surface: number, name: string, color?: string): CoverShare => ({ name, y: (surface / total) * 100, surface, color });
        const others = covers.slice(count).reduce((sum, cover) => sum + cover.y, 0);
        // Le format du serveur lit la part d'un secteur, que des barres n'ont pas
        const { pointFormat, ...tooltip } = server.tooltip ?? {};
        return {
            ...server,
            chart: { ...server.chart, type: 'bar' },
            legend: { ...server.legend, enabled: false },
            xAxis: { type: 'category' },
            yAxis: { ...UNGRADUATED_AXIS, min: 0, maxPadding: SHARE_LABEL_ROOM, endOnTick: false },
            tooltip: {
                ...tooltip,
                pointFormatter(this: Highcharts.Point) {
                    const { y, surface } = this.options as CoverShare;
                    return `${percent(y)} des surfaces artificialisées, soit ${hectares(surface)}`;
                },
            },
            plotOptions: {
                ...server.plotOptions,
                bar: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        formatter(this: Highcharts.PointLabelObject) {
                            return percent(this.y ?? 0);
                        },
                    },
                },
            },
            series: [
                {
                    type: 'bar',
                    name: sectors.name,
                    data: [...covers.slice(0, count).map((cover) => share(cover.y, coverName(cover), cover.color)), ...(others > 0 ? [share(others, OTHER_COVERS, OTHER_COVERS_COLOR)] : [])],
                },
            ],
        };
    };

// --- Artificialisation et désartificialisation par type de couverture ---------------------

const INCREASE_SERIE = 'Artificialisation';
const DECREASE_SERIE = 'Désartificialisation';

// Catégorie du serveur : le nom de la couverture, son code dans la nomenclature et une balise de couleur vide
// Texte sans ses balises. Ce qui suit un « < » jamais refermé est retiré aussi : le résultat ne
// contient aucun « < », quoi que le serveur envoie.
const withoutTags = (text: string): string => {
    let kept = '';
    let rest = text;
    for (let open = rest.indexOf('<'); open !== -1; open = rest.indexOf('<')) {
        const close = rest.indexOf('>', open);
        kept += rest.slice(0, open);
        rest = close === -1 ? '' : rest.slice(close + 1);
    }
    return kept + rest;
};

const COVER_CODE_START = '(CS';
const COVER_CODE = /^[\d.]+$/;

// Texte sans le code de nomenclature qui le termine, « (CS1.1.1.1) »
const withoutCoverCode = (text: string): string => {
    const trimmed = text.trimEnd();
    const start = trimmed.lastIndexOf(COVER_CODE_START);
    if (start === -1 || !trimmed.endsWith(')')) return text;
    return COVER_CODE.test(trimmed.slice(start + COVER_CODE_START.length, -1)) ? trimmed.slice(0, start) : text;
};

const coverOfCategory = (category: string): string => withoutCoverCode(withoutTags(category)).trim();

// Les deux flux d'une couverture, en hectares : l'artificialisation, positive, et la désartificialisation, négative
type CoverFlows = { name: string; increase: number; decrease: number };

const grossFlowOf = ({ increase, decrease }: CoverFlows): number => Math.abs(increase) + Math.abs(decrease);

// Part du plus grand flux sous laquelle une couverture n'aurait pas de barre visible dans la colonne
const VISIBLE_FLOW_SHARE = 0.01;

// Les flux par couverture en barres horizontales, de part et d'autre du zéro : l'artificialisation
// en rouge, la désartificialisation en bleu, pour les `count` couvertures dont le sol a le plus
// changé, sans celles dont la barre ne se verrait pas. La série de l'artificialisation nette, qui
// triplerait les barres, est retirée. Toutes les couvertures et les trois flux restent dans le
// tableau de données. Sans flux, le graphique reste celui du serveur, qui le dit.
export const flowsByCover =
    (count: number) =>
    (server: Highcharts.Options): Highcharts.Options => {
        const series = seriesOf(server);
        const increase = series.find((serie) => serie.name === INCREASE_SERIE);
        const decrease = series.find((serie) => serie.name === DECREASE_SERIE);
        const categories = firstAxis(server.xAxis)?.categories ?? [];
        if (!increase || !decrease) return server;
        const ranked = categories
            .map((category, index): CoverFlows => ({ name: coverOfCategory(category), increase: valueOf(increase.data?.[index]) ?? 0, decrease: valueOf(decrease.data?.[index]) ?? 0 }))
            .filter((cover) => grossFlowOf(cover) > 0)
            .sort((a, b) => grossFlowOf(b) - grossFlowOf(a));
        if (ranked.length === 0) return server;
        const covers = ranked.filter((cover) => grossFlowOf(cover) >= grossFlowOf(ranked[0]) * VISIBLE_FLOW_SHARE).slice(0, count);
        return {
            ...server,
            chart: { ...server.chart, type: 'bar' },
            xAxis: { categories: covers.map(({ name }) => name) },
            yAxis: { ...firstAxis(server.yAxis), plotLines: [ZERO_LINE] },
            tooltip: flowTooltip(server.tooltip),
            plotOptions: { ...server.plotOptions, bar: { stacking: 'normal', borderWidth: 0, dataLabels: { enabled: false } } },
            series: asOptions([
                { ...increase, type: 'bar', color: FLOW_COLORS[INCREASE_SERIE], data: covers.map((cover) => cover.increase) },
                { ...decrease, type: 'bar', color: FLOW_COLORS[DECREASE_SERIE], data: covers.map((cover) => cover.decrease) },
            ]),
        };
    };
