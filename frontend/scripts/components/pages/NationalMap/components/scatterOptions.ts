// Options Highcharts du nuage de points d'une carte bivariée : fonction pure de son modèle.
// Sans `live`, elles ne contiennent aucune fonction : la fenêtre de détails les recopie en JSON,
// où une fonction ne survit pas.
import type * as Highcharts from 'highcharts';
import { theme } from '@theme';
import { formatNumber } from '@utils/formatUtils';
import { CONSO_RATE_DECIMALS, INDIC_RATE_DECIMALS } from '../domain/frame/render/bivariate';
import type { ScatterAxis, ScatterModel, ScatterPoint } from '../domain/frame/types';
import { roundTicks, tickLabel } from './chartTicks';
import { AXIS_LABEL_STYLE, COMPACT_SPACING, COMPACT_TITLE, subtitle } from './narrowChartLayouts';
import { OUTLINE_COLOR, outlineWidthOf, renderScatterPoints } from './scatterLayer';

// Hauteur de l'emplacement du nuage dans la colonne, en pixels : de quoi garder un tracé presque
// carré sous un sous-titre de quatre à six lignes
export const SCATTER_HEIGHT = 360;

// Rayon des points, en pixels : il diminue quand leur nombre augmente, pour qu'ils se recouvrent moins
const MARKER_RADIUS = 3.5;
const CROWDED_POINT_COUNT = 150;
const CROWDED_MARKER_RADIUS = 2.75;
const DENSE_POINT_COUNT = 1500;
const DENSE_MARKER_RADIUS = 2;

const markerRadius = (pointCount: number): number => {
    if (pointCount > DENSE_POINT_COUNT) return DENSE_MARKER_RADIUS;
    return pointCount > CROWDED_POINT_COUNT ? CROWDED_MARKER_RADIUS : MARKER_RADIUS;
};

// Marge d'un axe de part et d'autre de l'étendue des points, en part de celle-ci : un point
// ramené au bord reste entier
const AXIS_MARGIN = 0.05;
// Graduations cherchées sur l'étendue d'un axe ; celles qui tombent hors de lui sont écartées
const TICK_COUNT = 6;

// Sources de l'image exportée, qui n'a pas les étiquettes posées sous le graphique
const EXPORT_CREDITS = 'Mon Diagnostic Artificialisation · données Cerema (fichiers fonciers) et Insee (recensements)';
// Marge de l'image sous le tracé, où s'écrivent ses sources
const EXPORT_BOTTOM_SPACING = 28;

const THRESHOLD_COLOR = '#6b6b6b';
const HOVER_OUTLINE = '#161616';
// Au-dessus de la fenêtre de détails, où l'infobulle est dessinée hors du graphique
const TOOLTIP_Z_INDEX = 1100;

// Highcharts écrit les nombres à l'anglaise et ne connaît pas le pas retenu : les libellés des
// graduations passent par une aide de gabarit, inscrite sous un nom propre à la carte nationale
const TICK_HELPER = 'nationalMapTick';

type TemplateHelpers = Record<string, (...values: number[]) => string>;

// À appeler une fois, avant de dessiner un nuage
export const registerTickHelper = (highcharts: typeof Highcharts): void => {
    const { helpers } = (highcharts as unknown as { Templating: { helpers: TemplateHelpers } }).Templating;
    helpers[TICK_HELPER] = (value, step) => tickLabel(value, step);
};

// Axe d'un taux : son étendue, ses graduations rondes et les deux seuils de la carte, en tirets
const axisOptions = ({ min, max, thresholds }: ScatterAxis): Highcharts.XAxisOptions => {
    // Étendue nulle : tous les points ont le même taux
    const margin = (max - min || Math.abs(max) || 1) * AXIS_MARGIN;
    const [low, high] = [min - margin, max + margin];
    const ticks = roundTicks(low, high, TICK_COUNT) ?? [];
    const step = ticks.length > 1 ? ticks[1] - ticks[0] : 1;
    return {
        min: low,
        max: high,
        startOnTick: false,
        endOnTick: false,
        // null, et non undefined, que la copie en JSON retirerait : Highcharts écrirait son titre par défaut
        title: { text: null },
        gridLineWidth: 0,
        lineWidth: 1,
        lineColor: theme.colors.border,
        tickWidth: 1,
        tickLength: 4,
        tickColor: theme.colors.border,
        tickPositions: ticks.filter((tick) => tick >= low && tick <= high),
        labels: { style: AXIS_LABEL_STYLE, rotation: 0, format: `{${TICK_HELPER} value ${step}}` },
        plotLines: thresholds.map((value) => ({ value, color: THRESHOLD_COLOR, width: 1, dashStyle: 'ShortDash', zIndex: 1 })),
    };
};

// Ce que le graphique de la colonne ajoute aux options : il dessine lui-même ses points, un tracé
// par couleur (voir scatterLayer.ts), et signale à la carte le point survolé
export type LiveScatter = { pointEvents: Highcharts.PointEventsOptionsObject };

// Options du nuage. Sans `live`, les points sont ceux de Highcharts, un élément chacun.
export const scatterOptions = (model: ScatterModel, live?: LiveScatter): Highcharts.Options => {
    const radius = markerRadius(model.points.length);
    return {
        chart: {
            type: 'scatter',
            spacing: COMPACT_SPACING,
            // Le nuage est remplacé d'un bloc, comme la carte
            animation: false,
            // Les points suivent chaque rendu du graphique, sa copie pour l'export comprise
            ...(live && {
                events: {
                    render(this: Highcharts.Chart) {
                        renderScatterPoints(this, model.points, radius);
                    },
                },
            }),
        },
        title: { ...COMPACT_TITLE, text: model.title },
        subtitle: subtitle(model.subtitle),
        credits: { enabled: false },
        // Pas de légende : les couleurs sont celles de la carte, dont la légende est à l'écran
        legend: { enabled: false },
        // Le téléchargement est déclenché par le bouton de la carte du graphique ; l'image a la
        // taille d'un graphique de diagnostic, plus lisible que celle de la colonne, et cite ses sources
        exporting: {
            enabled: false,
            fallbackToExportServer: false,
            filename: model.filename,
            sourceWidth: 640,
            sourceHeight: 480,
            chartOptions: { chart: { spacingBottom: EXPORT_BOTTOM_SPACING }, credits: { enabled: true, text: EXPORT_CREDITS } },
        },
        accessibility: { description: model.description, point: { valueDescriptionFormat: '{point.name} : {point.spokenText}' } },
        xAxis: axisOptions(model.x),
        yAxis: axisOptions(model.y),
        // Dessinée hors du graphique : ses deux lignes sont plus larges que la colonne
        tooltip: { headerFormat: '', pointFormat: '<b>{point.name}</b><br/>{point.valueText}', outside: true, style: { zIndex: TOOLTIP_Z_INDEX } },
        plotOptions: {
            scatter: {
                animation: false,
                // Des points en objets : au-delà de mille, Highcharts n'accepte sinon que des nombres
                turboThreshold: 0,
                // Le point survolé est le plus proche du pointeur : il n'a pas à être touché
                stickyTracking: true,
                // Dans la colonne, le calque dessine les points : Highcharts ne garde que la marque du
                // point survolé. Sous deux cents points, son module d'accessibilité ajoute de
                // lui-même un élément invisible par point, que les lecteurs d'écran parcourent.
                marker: {
                    enabled: !live,
                    symbol: 'circle',
                    radius,
                    lineWidth: outlineWidthOf(radius),
                    lineColor: OUTLINE_COLOR,
                    states: { hover: { radiusPlus: 3, lineWidthPlus: 1.5, lineColor: HOVER_OUTLINE } },
                },
                states: { hover: { halo: { size: 0 } }, inactive: { opacity: 1 } },
                ...(live && { point: { events: live.pointEvents } }),
            },
        },
        series: [
            {
                type: 'scatter',
                name: 'Territoires',
                // L'identifiant du territoire désigne son point, pour le mettre en avant quand la carte
                // le survole. `spokenText` : le texte de l'infobulle, sans son saut de ligne, pour
                // les lecteurs d'écran.
                data: model.points.map(({ land_id: id, name, x, y, color, valueText }) => ({ id, name, x, y, color, valueText, spokenText: valueText.replace(/<br\/>/g, ', ') })),
            },
        ],
    };
};

type DataTable = { headers: string[]; rows: { name: string; data: string[] }[] };

const rateText = (rate: number, decimals: number): string => formatNumber({ number: rate, decimals });

const byName = (a: ScatterPoint, b: ScatterPoint): number => a.name.localeCompare(b.name, 'fr');

// Tableau de données du nuage : les deux taux de chaque territoire placé, par ordre alphabétique.
// Les taux y sont écrits en toutes lettres, avec les décimales de l'infobulle : le tableau des
// diagnostics arrondirait des nombres à deux décimales.
export const scatterTable = ({ x, y, points }: ScatterModel): DataTable => ({
    headers: ['Territoire', `${y.label} (${y.unit})`, `${x.label} (${x.unit})`],
    rows: [...points].sort(byName).map(({ name, consoRate, indicRate }) => ({
        name,
        data: [name, rateText(consoRate, CONSO_RATE_DECIMALS), rateText(indicRate, INDIC_RATE_DECIMALS)],
    })),
});
