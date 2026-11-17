// Carte par territoire (Highcharts) : ce que la scène lui donne et ce qu'elle lui applique en
// place. Une identité d'options vaut une création du graphique : tout ce qui change sans que la
// carte change (survol, classe mise en avant, taille des symboles, territoire lu) est appliqué au
// graphique existant, et ses gestionnaires ne changent jamais d'identité.
import { Dispatch, MutableRefObject, RefObject, SetStateAction, useEffect, useLayoutEffect, useMemo } from 'react';
import type * as Highcharts from 'highcharts';
import type HighchartsReact from 'highcharts-react-official';
import type { HoveredLand } from '../../ClassLegend';
import type { LandPoint, MapFrame } from '../../domain/frame/types';
import type { LandHighlight } from '../../domain/landHighlight';
import { useHeld } from '../../hooks/useHeld';
import { PointHandlers, READ_POINT_CLASS, applySymbolMaxSize, buildChartOptions, outlineLand } from './territoryOptions';

// Opacité des territoires hors de la classe survolée dans la légende
const DIMMED_OPACITY = 0.2;

type ChartRef = RefObject<HighchartsReact.RefObject>;

type HoveredPoint = Parameters<PointHandlers['onLandHover']>[0];

// Point d'un territoire sur le graphique affiché, s'il y est
const landPointOf = (chart: Highcharts.Chart | undefined, landId: string | null): Highcharts.Point | undefined =>
    landId === null ? undefined : chart?.series?.[0]?.points.find((point) => (point.options as unknown as LandPoint).land_id === landId);

// Territoire survolé, tel que la légende le lit. Le même objet tant que le territoire est le même :
// un pointeur qui bouge au-dessus de lui ne demande aucun rendu.
const hoveredLandOf = (current: HoveredLand | null, point: HoveredPoint): HoveredLand | null => {
    if (!point) return null;
    const classIndex = point.legendKey ?? null;
    if (current?.name === point.name && current.classIndex === classIndex) return current;
    return { name: point.name, valueText: point.valueText.replace(/<br\/>/g, ', '), classIndex };
};

type LivePage = {
    // La vue demandée charge : la carte montre encore la précédente
    pending: boolean;
    onZoneChange?: (zone: string, name?: string) => void;
    highlight?: LandHighlight;
};

// Gestionnaires des territoires de la carte. Ils lisent dans `live` ce qui vaut au moment où ils
// sont appelés, et ne changent jamais d'identité : un chargement ou un survol ne recrée pas le
// graphique.
export const usePointHandlers = (
    live: MutableRefObject<LivePage>,
    touching: () => boolean,
    onLandRead: (landId: string | null) => void,
    setHoveredLand: Dispatch<SetStateAction<HoveredLand | null>>,
): PointHandlers =>
    useMemo<PointHandlers>(
        () => ({
            // Pendant un chargement, la carte montre encore la vue précédente : le clic est ignoré
            // pour ne pas ouvrir un autre territoire que celui attendu
            onLandClick: (zone, name) => {
                if (!live.current.pending) live.current.onZoneChange?.(zone, name);
            },
            touching,
            onLandRead,
            onLandHover: (point) => {
                live.current.highlight?.publish('map', point?.land_id ?? null);
                setHoveredLand((current) => hoveredLandOf(current, point));
            },
        }),
        [live, touching, onLandRead, setHoveredLand],
    );

// Territoire survolé dans le nuage de points : la carte le cerne comme sous le pointeur
export const useHighlightedLand = (chartRef: ChartRef, highlight: LandHighlight | undefined): void => {
    useEffect(() => {
        let shown: string | null = null;
        return highlight?.subscribe('map', (landId) => {
            landPointOf(chartRef.current?.chart, shown)?.setState('');
            shown = landId;
            landPointOf(chartRef.current?.chart, landId)?.setState('hover');
        });
    }, [highlight, chartRef]);
};

// Les territoires des autres lignes de la légende s'estompent
const dimOtherLands = (chart: Highcharts.Chart | undefined, dimKey: number | null): void => {
    chart?.series?.[0]?.points.forEach((point) => {
        const key = (point.options as unknown as LandPoint).legendKey;
        const dimmed = dimKey !== null && key !== dimKey;
        point.graphic?.attr({ 'fill-opacity': dimmed ? DIMMED_OPACITY : 1 });
    });
};

type ChartStage = {
    // Petite carte : des numéros à la place des noms des territoires d'outre-mer
    numberedInsets: boolean;
    // Diamètre du plus grand symbole proportionnel ; null : la carte n'en dessine pas
    symbolSize: number | null;
    // Carte masquée (onglet Informations sur mobile)
    hidden: boolean;
    // Ligne de légende mise en avant ; null : aucune
    dimKey: number | null;
    // Territoire lu au doigt ; null : aucun
    readLand: string | null;
};

// Options du graphique à afficher, null sans vue ; le graphique reçoit en place tout le reste
export const useTerritoryChart = (
    chartRef: ChartRef,
    frame: MapFrame | null,
    handlers: PointHandlers,
    { numberedInsets, symbolSize, hidden, dimKey, readLand }: ChartStage,
): Highcharts.Options | null => {
    // Une identité d'options vaut une création du graphique : elles ne dépendent que du cadre
    // affiché et des numéros d'outre-mer. Le diamètre des symboles proportionnels n'est pas une
    // dépendance, à dessein : il suit la taille de la scène, qui change sans que la carte change.
    // Le graphique le reçoit à sa création, puis en place.
    const options = useMemo<Highcharts.Options | null>(
        () => frame && buildChartOptions(frame, { numberedInsets, symbolMaxSize: symbolSize }, handlers),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [frame, numberedInsets, handlers],
    );
    // Tant que la carte est masquée (onglet Informations sur mobile), le graphique garde ses
    // options : en changer le recréerait dans un conteneur sans taille, à chaque choix fait dans le
    // menu. À son retour, il reçoit celles de la vue affichée, pour une seule création.
    const chartOptions = useHeld(options, hidden);
    useLayoutEffect(() => {
        const chart = chartRef.current?.chart;
        // Masqué, le graphique est encore celui d'une vue précédente : ses symboles ne sont pas retaillés
        if (chart && symbolSize !== null && !hidden) applySymbolMaxSize(chart, symbolSize);
    }, [symbolSize, chartOptions, hidden, chartRef]);

    // Ligne de légende mise en avant : les territoires des autres lignes s'estompent. Appliqué avant
    // la peinture, pour qu'une carte neuve ne soit jamais vue sans l'estompage que montre sa légende.
    useLayoutEffect(() => dimOtherLands(chartRef.current?.chart, dimKey), [dimKey, chartOptions, chartRef]);

    // Le territoire lu au doigt reste cerné sur la carte tant que sa fiche est ouverte, comme sous
    // le pointeur ; un graphique recréé sous la fiche le cerne de nouveau
    useEffect(() => {
        const point = landPointOf(chartRef.current?.chart, readLand);
        // Par une classe qui lui est propre, et non par l'état de survol de Highcharts, levé peu
        // après l'appui ; avec le liseré clair du territoire survolé
        const dropHalo = outlineLand(point);
        point?.graphic?.addClass(READ_POINT_CLASS);
        return () => {
            dropHalo();
            // Le graphique peut avoir été recréé entre-temps : son ancien point n'a plus de dessin
            point?.graphic?.removeClass(READ_POINT_CLASS);
        };
    }, [readLand, chartOptions, chartRef]);

    return chartOptions;
};
