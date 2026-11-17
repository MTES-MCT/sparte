// Options Highcharts de la carte par territoire : fonction pure du cadre affiché, de la taille de
// la scène et de gestionnaires reçus tels quels. Une identité d'options vaut une création du
// graphique : rien d'autre que ces trois arguments ne doit y entrer. Ce qui change sans que la
// carte change s'applique au graphique déjà créé (voir applySymbolMaxSize).
import type * as Highcharts from 'highcharts';
import { insetLabels } from '../../domain/frame/base';
import type { FrameBase, LandPoint, MapFrame } from '../../domain/frame/types';
import { landSwatch } from '../../domain/landReading';
import { PARENT_BOUNDARY_STYLE } from '../../domain/parentBoundary';
import { pressOutcome, tipOf } from '../../domain/tip';
import { NO_DATA_COLOR, SYMBOL_MIN_SIZE, ValueClass, symbolMaxSize as symbolMaxSizeOf } from '../../values';
import { renderRings, resizeRings } from './ringsLayer';
import { TIP_OFFSET_PX, tipMarkup } from './tipView';

// Couleur des noms et des numéros des territoires d'outre-mer
export const TERRITORY_COLOR = '#000091';
export const SEPARATION_COLOR = '#8f8fb8';
// Cartes en cercles ou en anneaux proportionnels : contour des territoires, sur leur fond neutre
const SYMBOL_BASE_BORDER = '#c3c3dd';

// Série des cercles proportionnels
const SYMBOL_SERIES_TYPE = 'mapbubble';

// Marge du graphique autour de la zone de tracé, en pixels
const CHART_SPACING = 8;
// Marges de la vue autour des territoires (haut, droite, bas, gauche), dans la zone de tracé. Les
// noms et les numéros des territoires d'outre-mer y sont découpés : la marge du graphique ne leur
// sert pas, toute leur place est ici. Les noms, posés au-dessus de cartouches placés en haut à
// gauche, débordent de la carte en haut et à gauche ; les numéros, posés à gauche des cartouches,
// à gauche seulement (15 px). Un nom garde sa largeur quand la carte rétrécit : c'est sur la plus
// petite carte qui porte des noms qu'il déborde le plus, de 13 px pour « Guadeloupe ». Relevé à
// l'écran de 360 à 2 560 px de fenêtre : ces marges laissent au moins 3 px autour d'un numéro
// comme d'un nom.
const MAP_PADDING = [4, 4, 4, 4];
const NAMED_INSETS_PADDING = [12, 4, 4, 16];
const NUMBERED_INSETS_PADDING = [4, 4, 4, 18];

// Marges de la vue d'un fond, selon qu'il porte des territoires d'outre-mer et la façon de les désigner
const viewPadding = ({ insets }: Pick<FrameBase, 'insets'>, numberedInsets: boolean): number[] => {
    if (insets.length === 0) return MAP_PADDING;
    return numberedInsets ? NUMBERED_INSETS_PADDING : NAMED_INSETS_PADDING;
};

type StagePadding = { top: number; right: number; bottom: number; left: number };

// Les mêmes marges comptées depuis le bord de la scène, marge du graphique comprise : une carte
// d'un autre moteur cadrée avec elles montre les territoires à la même place que celle-ci
export const stagePadding = (base: Pick<FrameBase, 'insets'>, numberedInsets: boolean): StagePadding => {
    const [top, right, bottom, left] = viewPadding(base, numberedInsets).map((padding) => padding + CHART_SPACING);
    return { top, right, bottom, left };
};

const NO_CLASSES: ValueClass[] = [];
const NO_HALO = (): void => undefined;

// Ce que la carte dit d'un territoire ou d'un cercle survolé
type HoveredPoint = Pick<LandPoint, 'land_id' | 'name' | 'valueText' | 'legendKey'>;

export type PointHandlers = {
    // Clic sur un territoire ou sur son cercle, quand il ouvre sa zone : jamais appelé pour des
    // communes, ni pour un appui du doigt
    onLandClick: (zone: string, name: string) => void;
    // Territoire ou cercle survolé ; null quand le pointeur le quitte
    onLandHover: (point: HoveredPoint | null) => void;
    // Le dernier geste a-t-il été fait au doigt ? Lu à chaque clic et à chaque infobulle
    touching: () => boolean;
    // Appui du doigt : l'identifiant du territoire à lire, null pour un appui hors des territoires
    onLandRead: (landId: string | null) => void;
};

// Territoire ou cercle survolé, ou touché tant que sa fiche est ouverte : un trait sombre bordé
// d'un liseré clair, comme l'élément survolé des cartes MapLibre (voir hoverOutline). Le liseré
// détache le trait des teintes foncées voisines. Highcharts dessine les territoires dans un groupe
// mis à l'échelle de la carte : ce que la page y ajoute s'écrit en pixels d'écran
// (`vector-effect`), une ombre portée y serait réduite à rien.
export const HOVER_COLOR = '#1a1a1a';
const HOVER_WIDTH_PX = 2;
const HOVER_HALO_WIDTH_PX = 5;
const LAND_HALO_CLASS = 'national-map-land-halo';
// Classe du territoire lu au doigt, cerné tant que sa fiche est ouverte : l'état de survol de
// Highcharts ne tient pas sur un écran tactile, où il est levé peu après l'appui
export const READ_POINT_CLASS = 'national-map-read-point';
// Classe des séries de la limite de la zone. Highcharts ne suit pas le pointeur sur elles
// (enableMouseTracking), mais leur tracé, posé sur les territoires, l'arrêterait quand même : le
// territoire survolé serait quitté chaque fois que le pointeur franchit la limite.
export const PARENT_BOUNDARY_CLASS = 'national-map-parent-boundary';
export const HOVERED_POINT_STYLE = `
    .${LAND_HALO_CLASS} {
        fill: none;
        stroke: #ffffff;
        stroke-width: ${HOVER_HALO_WIDTH_PX}px;
        stroke-linejoin: round;
        vector-effect: non-scaling-stroke;
        pointer-events: none;
    }

    .${READ_POINT_CLASS} {
        stroke: ${HOVER_COLOR};
        stroke-width: ${HOVER_WIDTH_PX}px;
        vector-effect: non-scaling-stroke;
    }

    .highcharts-mapbubble-series .highcharts-point-hover {
        filter: drop-shadow(0 0 1px #ffffff) drop-shadow(0 0 1px #ffffff);
    }

    .${PARENT_BOUNDARY_CLASS} {
        pointer-events: none;
    }
`;

// Cerne un territoire : il passe devant ses voisins, qui, dessinés après lui, couvriraient la
// moitié de son contour, et une copie de son tracé, glissée sous lui, lui fait un liseré clair.
// Rend de quoi retirer le liseré. Sans effet sur un point qui n'a pas de tracé.
export const outlineLand = (point: Highcharts.Point | undefined): (() => void) => {
    const element = point?.graphic?.element;
    if (!element?.parentNode) return () => undefined;
    point.graphic.toFront();
    const halo = element.cloneNode(false) as SVGElement;
    halo.setAttribute('class', LAND_HALO_CLASS);
    halo.removeAttribute('style');
    element.parentNode.insertBefore(halo, element);
    return () => halo.remove();
};

// Ce que fait un clic sur un territoire qu'il ouvre, en dernière ligne de son infobulle
export const OPEN_HINT = 'Cliquer pour ouvrir ce territoire';

// Délai avant d'effacer l'infobulle quand le pointeur quitte un territoire, en millisecondes :
// elle ne clignote pas en passant d'un territoire à son voisin, et ne traîne pas hors de la carte
const TIP_HIDE_DELAY_MS = 80;

export type StageOptions = {
    // Petite carte : les territoires d'outre-mer sont désignés par des numéros
    numberedInsets: boolean;
    // Diamètre du plus grand symbole proportionnel (cercle ou anneau) à la création du graphique,
    // en pixels ; null pour une carte sans symboles
    symbolMaxSize: number | null;
};

// Limite de la zone, par-dessus les territoires qui débordent d'elle (EPCI à cheval sur plusieurs
// départements) et sous les cercles et les noms : un liseré clair, puis le tireté (voir
// PARENT_BOUNDARY_STYLE). Aucune série pour un fond sans limite : les autres vues gardent les leurs.
// Sourde au pointeur (voir PARENT_BOUNDARY_CLASS), elle ne masque ni le survol ni le clic des
// territoires qu'elle traverse ; tracée sur leurs contours, elle ne change rien au cadrage, ce que
// `affectsMapView` garantit.
const parentBoundarySeries = ({ parentBoundary, title }: Pick<FrameBase, 'parentBoundary' | 'title'>): Highcharts.SeriesOptionsType[] => {
    if (parentBoundary.length === 0) return [];
    const { color, widthPx, casingColor, casingWidthPx, highchartsDash } = PARENT_BOUNDARY_STYLE;
    const line = (stroke: string, lineWidth: number, dashStyle?: Highcharts.DashStyleValue) => ({
        type: 'mapline',
        name: `Limite : ${title}`,
        className: PARENT_BOUNDARY_CLASS,
        data: [{ geometry: { type: 'MultiLineString', coordinates: parentBoundary } }],
        // Un point sans valeur est tracé avec nullColor : il faut la définir aussi
        color: stroke,
        nullColor: stroke,
        lineWidth,
        ...(dashStyle && { dashStyle }),
        affectsMapView: false,
        enableMouseTracking: false,
        states: { inactive: { opacity: 1 } },
        showInLegend: false,
    });
    return [line(casingColor, casingWidthPx), line(color, widthPx, highchartsDash)] as Highcharts.SeriesOptionsType[];
};

// null pour un cadre carroyé, que Highcharts ne dessine pas
export const buildChartOptions =(frame: MapFrame, { numberedInsets, symbolMaxSize }: StageOptions, handlers: PointHandlers): Highcharts.Options | null => {
    if (frame.render.renderer !== 'territory') return null;
    const { base, indicator, exportMeta } = frame;
    const territory = frame.render;
    const { clickable } = base;
    const classes = territory.mode === 'choropleth' ? territory.classes : NO_CLASSES;
    const symbols = territory.mode === 'symbols' ? territory : null;
    const rings = territory.mode === 'rings' ? territory : null;
    // Diamètre du plus grand anneau d'une grande carte : celui de l'image exportée, dont la taille
    // est fixe, quelle que soit celle de la scène
    const fullRingSize = symbolMaxSizeOf(base.features.length);

    // Liseré du territoire survolé sur ce graphique, à retirer quand le pointeur le quitte
    let dropHalo = NO_HALO;
    // Survol et clic, communs aux territoires et aux cercles proportionnels
    const pointEvents = {
        // À la souris, un clic sur un territoire en fait la zone affichée ; au doigt, l'appui le
        // lit, et c'est sa fiche qui l'ouvre
        click: (event: Highcharts.PointClickEventObject) => {
            const { zone: target, name, land_id: landId } = event.point.options as { zone?: string; name?: string; land_id?: string };
            const outcome = pressOutcome(handlers.touching(), clickable && Boolean(target));
            if (outcome === 'read') handlers.onLandRead(landId ?? null);
            if (outcome === 'open') handlers.onLandClick(target, name);
        },
        // Le survol d'un territoire alimente la légende ; Highcharts passe le point en cible de l'événement
        mouseOver: (event: Event) => {
            const point = event.target as unknown as Highcharts.Point;
            dropHalo();
            // Un cercle a son propre liseré : seul un territoire reçoit celui-ci
            dropHalo = point.series?.type === 'map' ? outlineLand(point) : NO_HALO;
            handlers.onLandHover(point.options as unknown as HoveredPoint);
        },
        mouseOut: () => {
            dropHalo();
            dropHalo = NO_HALO;
            handlers.onLandHover(null);
        },
    };
    // Infobulle : le contenu et l'apparence de toutes les cartes (voir tipView). Au doigt, elle
    // n'est pas dessinée : la fiche de lecture en tient lieu.
    function tooltipFormatter(this: Highcharts.TooltipFormatterContextObject): string | false {
        if (handlers.touching()) return false;
        const point = this.point.options as unknown as LandPoint;
        return tipMarkup(tipOf({ name: point.name, valueText: point.valueText, swatch: landSwatch(territory, point) }), clickable ? OPEN_HINT : '');
    }

    return {
        chart: {
            map: { type: 'FeatureCollection', features: base.features } as unknown as Highcharts.GeoJSON,
            backgroundColor: 'transparent',
            animation: false,
            spacing: [CHART_SPACING, CHART_SPACING, CHART_SPACING, CHART_SPACING],
            // Vue fixe : ni zoom ni déplacement, la carte reste ajustée à son conteneur
            panning: { enabled: false },
            events: {
                // Un appui du doigt hors des territoires ferme la fiche de lecture
                click: () => {
                    if (handlers.touching()) handlers.onLandRead(null);
                },
                // Les anneaux suivent chaque rendu du graphique, sa copie pour l'export comprise
                ...(rings && {
                    render(this: Highcharts.Chart) {
                        renderRings(this, rings, this.renderer.forExport ? fullRingSize : (symbolMaxSize ?? fullRingSize));
                    },
                }),
            },
        },
        title: { text: undefined },
        credits: { enabled: false },
        // Pas de menu d'export sur la carte : le téléchargement est déclenché par le panneau (exportPng).
        // L'image exportée reçoit un titre, un sous-titre et la légende des classes dessinée par Highcharts.
        exporting: {
            enabled: false,
            fallbackToExportServer: false,
            filename: exportMeta.filename,
            sourceWidth: 1400,
            sourceHeight: 900,
            chartOptions: {
                chart: { backgroundColor: '#ffffff', spacing: [24, 24, 24, 24] },
                title: { text: exportMeta.title, align: 'left', style: { fontSize: '20px', fontWeight: '600' } },
                subtitle: { text: exportMeta.subtitle, align: 'left', style: { fontSize: '14px' } },
                legend: {
                    enabled: classes.length > 0,
                    align: 'right',
                    verticalAlign: 'middle',
                    layout: 'vertical',
                    title: { text: exportMeta.unitLabel },
                    itemStyle: { fontSize: '13px', fontWeight: '400' },
                },
                credits: { enabled: true, text: exportMeta.credits },
            },
        },
        accessibility: {
            description: frame.ariaLabel,
            point: { valueDescriptionFormat: '{point.name} : {point.valueText}' },
        },
        mapNavigation: { enabled: false },
        mapView: { padding: viewPadding(base, numberedInsets) },
        // Classes de couleurs des aplats ; les bivariées et les cartes en cercles colorent chaque point directement
        colorAxis: classes.length > 0 ? { dataClasses: classes, dataClassColor: 'category' } : undefined,
        // La légende de la page est dessinée en HTML par le composant de la carte ; celle de
        // Highcharts ne sert qu'à l'image exportée (voir exporting.chartOptions)
        legend: { enabled: false },
        tooltip: {
            useHTML: true,
            formatter: tooltipFormatter,
            // Highcharts place la bulle, sans y dessiner son cadre : il est celui du gabarit
            backgroundColor: 'transparent',
            borderWidth: 0,
            shadow: false,
            padding: 0,
            // Au-dessus du pointeur, qu'elle suit sans retard, et retournée près d'un bord
            followPointer: true,
            distance: TIP_OFFSET_PX,
            animation: false,
            hideDelay: TIP_HIDE_DELAY_MS,
        },
        plotOptions: {
            series: { animation: false },
            map: { point: { events: pointEvents } },
            [SYMBOL_SERIES_TYPE]: { point: { events: pointEvents } },
        },
        series: [
            {
                type: 'map',
                name: 'Territoires',
                joinBy: 'land_id',
                data: territory.points,
                nullColor: NO_DATA_COLOR,
                borderColor: symbols || rings ? SYMBOL_BASE_BORDER : '#ffffff',
                borderWidth: 0.6,
                cursor: clickable ? 'pointer' : 'default',
                // Au survol, la couleur de la donnée reste visible : seul le contour s'épaissit, d'un
                // trait sombre bordé d'un liseré clair (voir outlineLand)
                states: {
                    hover: { brightness: 0, borderColor: HOVER_COLOR, borderWidth: HOVER_WIDTH_PX },
                    inactive: { opacity: 1 },
                },
            },
            {
                // Ligne séparant les territoires d'outre-mer déplacés du reste de la carte
                type: 'mapline',
                name: "Séparation des territoires d'outre-mer",
                data: [{ geometry: { type: 'LineString', coordinates: base.separation } }],
                // Un point sans valeur est tracé avec nullColor : il faut la définir aussi
                color: SEPARATION_COLOR,
                nullColor: SEPARATION_COLOR,
                lineWidth: 1,
                enableMouseTracking: false,
                states: { inactive: { opacity: 1 } },
                showInLegend: false,
            },
            ...parentBoundarySeries(base),
            ...(symbols
                ? [
                      {
                          // Cercles proportionnels, centrés sur chaque territoire : la surface du cercle porte la valeur
                          type: SYMBOL_SERIES_TYPE,
                          name: indicator.label,
                          joinBy: 'land_id',
                          data: symbols.symbols,
                          color: symbols.color,
                          zMin: 0,
                          zMax: symbols.maxValue,
                          minSize: SYMBOL_MIN_SIZE,
                          maxSize: symbolMaxSize,
                          sizeBy: 'area',
                          cursor: clickable ? 'pointer' : 'default',
                          // Remplissage translucide et liseré blanc : les cercles qui se chevauchent restent lisibles
                          marker: { fillOpacity: 0.55, lineColor: '#ffffff', lineWidth: 1 },
                          states: {
                              hover: { halo: { size: 0 }, marker: { lineColor: HOVER_COLOR, lineWidth: HOVER_WIDTH_PX } },
                              inactive: { opacity: 1 },
                          },
                          showInLegend: false,
                      },
                  ]
                : []),
            {
                // Nom de chaque territoire d'outre-mer déplacé, juste au-dessus de lui ;
                // sur une petite carte, son numéro, à sa gauche
                type: 'mappoint',
                name: "Noms des territoires d'outre-mer",
                data: insetLabels(base.insets, numberedInsets).map(({ text, position }) => ({ name: text, geometry: { type: 'Point', coordinates: position } })),
                marker: { enabled: false },
                dataLabels: {
                    enabled: true,
                    format: '{point.name}',
                    ...(numberedInsets
                        ? { align: 'right', verticalAlign: 'middle', x: -3, y: 0, allowOverlap: true }
                        : { verticalAlign: 'bottom', y: -2 }),
                    style: { color: TERRITORY_COLOR, fontWeight: '600', fontSize: '0.8rem', textOutline: 'none' },
                },
                // Les noms ne s'estompent pas au survol d'un territoire
                states: { inactive: { opacity: 1 } },
                enableMouseTracking: false,
                showInLegend: false,
            },
        ] as Highcharts.SeriesOptionsType[],
    };
};

// Donne aux cercles ou aux anneaux d'un graphique déjà créé le diamètre que demande la scène. Ce
// diamètre suit la taille de la scène, qui change sans que la carte change : les symboles sont
// redessinés en place, le graphique n'est pas recréé.
export const applySymbolMaxSize = (chart: Highcharts.Chart, maxSize: number): void => {
    resizeRings(chart, maxSize);
    const circles = chart.series.find((series) => series.type === SYMBOL_SERIES_TYPE);
    if (!circles || (circles.options as Highcharts.SeriesMapbubbleOptions).maxSize === maxSize) return;
    circles.update({ type: SYMBOL_SERIES_TYPE, maxSize });
};
