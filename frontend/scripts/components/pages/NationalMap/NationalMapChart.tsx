import React, { ReactNode, forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMap from 'highcharts/modules/map';
import HighchartsAccessibility from 'highcharts/modules/accessibility';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsOfflineExporting from 'highcharts/modules/offline-exporting';
import { theme } from '@theme';
import BaseCard from '@components/ui/BaseCard';
import { downloadChartPng } from '@components/charts/downloadChartPng';
import type { NationalMapInset } from '@services/api';
import ClassLegend, { HoveredLand } from './ClassLegend';
import SymbolLegend from './SymbolLegend';
import GridLegend from './GridLegend';
import MapLegendOverlay from './MapLegendOverlay';
import GriddedMap, { GriddedMapHandle } from './GriddedMap';
import NationalMapFootnote from './components/NationalMapFootnote';
import NationalMapKeyFigures from './components/NationalMapKeyFigures';
import BivariateLegendBody from './components/legend/BivariateLegendBody';
import BoundaryKey from './components/legend/BoundaryKey';
import CommunesCanvas, { CommunesCanvasHandle } from './components/stage/CommunesCanvas';
import TipSheet from './components/stage/TipSheet';
import type { StageMapStatus } from './components/stage/mapLibre';
import {
    HOVERED_POINT_STYLE,
    PointHandlers,
    READ_POINT_CLASS,
    TERRITORY_COLOR,
    applySymbolMaxSize,
    buildChartOptions,
    outlineLand,
} from './components/stage/territoryOptions';
import { tipBubbleStyles } from './components/stage/tipView';
import { symbolMaxSize, symbolRadius } from './values';
import {
    ASIDE_WIDTH,
    MOBILE_BREAKPOINT,
    MOBILE_STAGE_ASPECT_RATIO,
    MOBILE_STAGE_MAX_HEIGHT,
    MOBILE_STAGE_MIN_HEIGHT,
    STACKED_STAGE_HEIGHT,
    STACK_BREAKPOINT,
} from './layoutStyles';
import type { ViewError } from './domain/frame/buildFrame';
import { exportInfoOf, exportLegendOf } from './domain/frame/exportImage';
import type { FrameRender, GridLegendBody, LandPoint, MapFrame } from './domain/frame/types';
import type { GridStage } from './domain/grid/cells';
import type { LandHighlight } from './domain/landHighlight';
import { landReadingOf } from './domain/landReading';
import { parentBoundaryKey } from './domain/parentBoundary';
import { legendOpenByDefault, legendReservation } from './domain/stage';
import { useHeld } from './hooks/useHeld';
import { useLegendFocus } from './hooks/useLegendFocus';
import { useStageSize } from './hooks/useStageSize';
import { useTouching } from './hooks/useTouching';

HighchartsMap(Highcharts);
HighchartsAccessibility(Highcharts);
HighchartsExporting(Highcharts);
HighchartsOfflineExporting(Highcharts);

// Opacité des territoires hors de la classe survolée dans la légende
const DIMMED_OPACITY = 0.2;

// Sur grand écran : la carte dans une carte blanche à gauche, sur toute la hauteur, et une
// colonne à droite (chiffres clés, note, graphiques) qui défile seule. Sur les écrans
// plus étroits : la colonne passe sous la carte, qui prend le premier écran.
const Row = styled.div`
    flex: 1;
    min-height: 0;
    display: flex;
    gap: ${theme.spacing.md};

    @media (max-width: ${STACK_BREAKPOINT}) {
        flex: none;
        flex-direction: column;
    }
`;

const MapCard = styled(BaseCard)`
    /* Repère de la fiche de lecture posée sur la carte (voir SheetSlot) */
    position: relative;
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;

    @media (max-width: ${STACK_BREAKPOINT}) {
        flex: none;
    }
`;

// Emplacement de la fiche de lecture des écrans tactiles (voir TipSheet), toujours présent : c'est
// lui que les lecteurs d'écran écoutent. Quand la page défile, il est sous la carte : la fiche ne
// masque ni l'élément touché, ni la légende, ni les boutons de zoom, et la carte garde sa taille.
// Sur un grand écran, la carte prend toute la hauteur : une fiche ajoutée dessous la
// redimensionnerait à chaque lecture. Elle y est posée sur son coin bas droit, au-dessus de la
// ligne où les cartes écrivent leurs indications.
const SheetSlot = styled.div`
    position: absolute;
    right: ${theme.spacing.sm};
    bottom: 3.25rem;
    z-index: 3;
    width: min(22rem, calc(100% - 2 * ${theme.spacing.sm}));
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radius.default};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.16);
    overflow: hidden;

    /* Vide, il ne se voit pas, mais reste dans la page pour annoncer la prochaine fiche */
    &:empty {
        border: none;
        box-shadow: none;
    }

    @media (max-width: ${STACK_BREAKPOINT}) {
        position: static;
        width: auto;
        border: none;
        border-radius: 0;
        box-shadow: none;

        &:not(:empty) {
            border-top: 1px solid ${theme.colors.border};
        }
    }
`;

// Scène : toute la carte blanche, c'est-à-dire la carte et, sous elle, la clé des numéros
// d'outre-mer. Sa taille ne dépend que de la mise en page, jamais de la vue affichée : c'est elle
// qui est mesurée, pour que deux vues soient dessinées de la même façon dans la même fenêtre.
const Stage = styled.div`
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;

    @media (max-width: ${STACK_BREAKPOINT}) {
        min-height: ${STACKED_STAGE_HEIGHT};
    }

    @media (max-width: ${MOBILE_BREAKPOINT}) {
        flex: none;
        aspect-ratio: ${MOBILE_STAGE_ASPECT_RATIO};
        min-height: ${MOBILE_STAGE_MIN_HEIGHT};
        max-height: ${MOBILE_STAGE_MAX_HEIGHT};
    }
`;

// Cadre que se partagent la carte et la légende posée sur elle
const Canvas = styled.div`
    flex: 1;
    min-height: 0;
    position: relative;
`;

// Calque des moteurs de rendu et de leurs messages, hors de la place réservée à la légende
// (une bande en haut de la scène ou une colonne à sa gauche) : la carte y est dessinée à la même
// place quelle que soit la légende affichée.
const MapLayers = styled.div<{ $top: number; $left: number }>`
    position: absolute;
    inset: 0;
    top: ${({ $top }) => $top}px;
    left: ${({ $left }) => $left}px;
`;

// Calque d'une carte MapLibre (carreaux, ou toutes les communes du pays). Tant qu'elle se prépare
// sous la carte affichée, elle se dessine sans être vue ni recevoir le pointeur. Ses boutons et
// ses infobulles s'empilent entre eux : ils restent sous la légende et les messages de la scène.
// Des boutons de zoom posés en haut à droite descendent sous celui de la légende repliée.
// `$under` : place de la légende sous laquelle la carte s'étend (une image y remplirait sinon une
// bande blanche) ; la carte cadre alors ses territoires hors de cette place.
const MapLibreLayer = styled.div<{ $staged: boolean; $belowLegendButton: boolean; $under?: { top: number; left: number } }>`
    position: absolute;
    inset: 0;
    top: ${({ $under }) => -($under?.top ?? 0)}px;
    left: ${({ $under }) => -($under?.left ?? 0)}px;
    isolation: isolate;
    opacity: ${({ $staged }) => ($staged ? 0 : 1)};
    pointer-events: ${({ $staged }) => ($staged ? 'none' : 'auto')};

    .maplibregl-ctrl-top-right {
        top: ${({ $belowLegendButton }) => ($belowLegendButton ? '2.5rem' : 0)};
    }
`;

// Calque de la carte Highcharts. Il porte l'atténuation de chargement à la place du conteneur du
// graphique, dont les props doivent garder leur identité : en changer recrée le graphique.
// Le conteneur Highcharts est positionné en absolu pour hériter d'une hauteur définie.
const ChartLayer = styled.div<{ $stale: boolean }>`
    position: absolute;
    inset: 0;
    opacity: ${({ $stale }) => ($stale ? 0.5 : 1)};
    transition: opacity 0.2s;

    > .national-map-canvas {
        position: absolute;
        inset: 0;
    }

    /* Infobulle : l'apparence de toutes les cartes (voir tipView) */
    ${tipBubbleStyles}

    /* Liseré clair du territoire ou du cercle survolé */
    ${HOVERED_POINT_STYLE}
`;

// Colonne à droite de la carte : chiffres clés, note puis graphiques complémentaires (la légende
// est posée sur la carte)
const Aside = styled.aside`
    width: ${ASIDE_WIDTH};
    flex-shrink: 0;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};
    /* Laisse l'ombre de la dernière carte visible */
    padding-bottom: ${theme.spacing.md};

    @media (max-width: ${STACK_BREAKPOINT}) {
        width: auto;
        overflow: visible;
        padding-bottom: 0;
    }
`;

const Message = styled.p`
    margin: auto;
    color: ${theme.colors.textMuted};
    font-size: ${theme.fontSize.md};
`;

// Avis d'une carte MapLibre, en haut du calque des cartes : hors de la place réservée à la légende
// ouverte, ou sous le bouton de la légende repliée. Il s'efface le temps qu'une légende est ouverte
// par-dessus la carte : elle le recouvrirait en partie.
const Banner = styled.p<{ $belowLegendButton: boolean }>`
    position: absolute;
    top: ${({ $belowLegendButton }) => ($belowLegendButton ? '3rem' : theme.spacing.md)};
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
    margin: 0;
    padding: 0.5rem 0.9rem;
    /* Largeur du texte, sans que le centrage (left: 50 %) la limite à la moitié du conteneur */
    width: max-content;
    max-width: 90%;
    background: ${theme.colors.warningBg};
    border: 1px solid ${theme.colors.warningBorder};
    border-radius: ${theme.radius.default};
    color: ${theme.colors.warning};
    font-size: ${theme.fontSize.sm};
`;

// Ce que la carte dit de ses objets quand elle les dessine : rien ne les distingue à l'œil de
// l'image qu'ils remplacent. En bas de la carte, entre les boutons de zoom et la mention de la
// source, là où aucune légende ne se pose.
const ObjectsHint = styled.p`
    position: absolute;
    bottom: ${theme.spacing.md};
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin: 0;
    padding: 0.3rem 0.75rem;
    width: max-content;
    max-width: calc(100% - 9rem);
    background: ${theme.colors.background};
    border: 1px solid ${theme.colors.border};
    border-radius: 999px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
    color: ${theme.colors.text};
    font-size: ${theme.fontSize.xs};
    line-height: 1.3;
    pointer-events: none;
`;

// Message posé au centre de la carte précédente, qui reste visible en transparence
const Notice = styled.p`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin: 0;
    padding: 0.6rem 1rem;
    width: max-content;
    max-width: 90%;
    background: ${theme.colors.background};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radius.default};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    color: ${theme.colors.text};
    font-size: ${theme.fontSize.sm};
`;

// Indicateur de chargement : le même message, précédé d'une roue
const Loading = styled(Notice)`
    &::before {
        content: '';
        width: 1rem;
        height: 1rem;
        flex-shrink: 0;
        border: 2px solid ${theme.colors.border};
        border-top-color: ${TERRITORY_COLOR};
        border-radius: 50%;
        animation: national-map-spin 0.8s linear infinite;
    }

    @keyframes national-map-spin {
        to {
            transform: rotate(360deg);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        &::before {
            animation: none;
        }
    }
`;

// Correspondance des numéros des territoires d'outre-mer, sous une carte étroite
const InsetKey = styled.p`
    margin: 0;
    padding: 0 ${theme.spacing.md} ${theme.spacing.sm};
    font-size: ${theme.fontSize.xs};
    color: ${theme.colors.text};

    b {
        color: ${TERRITORY_COLOR};
    }
`;

// Chiffres clés et note de la carte affichée. Pendant un chargement, ils restent les siens,
// atténués comme elle.
const AsideSlot = styled.div<{ $stale: boolean }>`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
    opacity: ${({ $stale }) => ($stale ? 0.6 : 1)};
    transition: opacity 0.2s;
`;

const IDLE_STATUS: StageMapStatus = { ready: false, loading: false, notice: null };
const NO_INSETS: NationalMapInset[] = [];

// Vue que dessine un moteur : la vue affichée si elle est la sienne, sinon celle qui se prépare
const frameDrawnBy = (engine: FrameRender['renderer'], shown: MapFrame | null, staged: MapFrame | null): MapFrame | null =>
    [shown, staged].find((candidate) => candidate?.render.renderer === engine) ?? null;

// Message affiché sur la carte de toutes les communes du pays tant que ses premières tuiles chargent
const COMMUNES_LOADING = 'Chargement des communes…';

const ERROR_MESSAGES: Record<ViewError, string> = {
    'base-map': "Le fond de carte n'a pas pu être chargé.",
    data: "Les données de la carte n'ont pas pu être chargées.",
};

// Props du conteneur du graphique, de même identité à chaque rendu (voir ChartLayer)
const CHART_CONTAINER_PROPS = { className: 'national-map-canvas' };

// Repère posé à chaque création du graphique Highcharts : le nombre de créations d'une navigation
// se lit dans le navigateur par performance.getEntriesByName('national-map:chart-create').length.
// Highcharts appelle aussi ce rappel pour la copie qu'il dessine le temps d'un export en image :
// elle ne compte pas, le graphique affiché n'est pas recréé.
const markChartCreated = (chart: Highcharts.Chart) => {
    if (!chart.renderer.forExport) performance.mark('national-map:chart-create');
};

interface NationalMapChartProps {
    // Vue affichée ; null tant qu'aucune n'a été complète
    frame: MapFrame | null;
    // Vue d'un moteur MapLibre qui se prépare sous la vue affichée, et qui la remplacera une fois dessinée
    staged: MapFrame | null;
    // La vue demandée n'est pas encore la vue affichée
    pending: boolean;
    error: ViewError | null;
    // Nom de la zone demandée, annoncé pendant son chargement
    targetName: string;
    // Appelé avec la zone et le nom du territoire cliqué
    onZoneChange?: (zone: string, name?: string) => void;
    // Appelé avec la clé de la vue en préparation quand elle est dessinée
    onStagedPainted?: (frameKey: string) => void;
    // Canal par lequel la carte par territoire et le nuage de points se désignent le territoire survolé
    highlight?: LandHighlight;
    // Graphiques complémentaires, sous les chiffres clés de la colonne de droite
    children?: ReactNode;
}

// Actions offertes au composant parent
export interface NationalMapChartHandle {
    // Télécharge la carte en PNG, avec son titre et sa légende ; sans effet sur la carte de toutes
    // les communes du pays, qui n'a pas encore d'export
    exportPng: () => void;
}

const NationalMapChart = forwardRef<NationalMapChartHandle, NationalMapChartProps>(({ frame, staged, pending, error, targetName, onZoneChange, onStagedPainted, highlight, children }, ref) => {
    const chartRef = useRef<HighchartsReact.RefObject>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    // La vue demandée charge : ce qui reste affiché de la précédente est annoncé comme occupé
    const viewLoading = pending && !error;

    // La carte ne dessine que la vue affichée : tout ce qu'elle lit vient du cadre
    const legend = frame?.legend;
    // Ce que la légende dit du trait de la limite de la zone, quand la carte le dessine
    const boundaryKey = frame ? parentBoundaryKey(frame.base.parentBoundary, frame.base.parent?.land_type) : null;
    // Moteur de la vue affichée : Highcharts pour une carte par territoire, MapLibre pour les
    // données carroyées et pour toutes les communes du pays
    const renderer = frame?.render.renderer ?? null;
    const gridded = renderer === 'grid';
    const dense = renderer === 'communes';
    // Chaque moteur MapLibre reçoit sa vue affichée, ou celle qui se prépare sous la carte affichée
    const gridFrame = frameDrawnBy('grid', frame, staged);
    const gridRender = gridFrame?.render.renderer === 'grid' ? gridFrame.render : null;
    const gridMounted = gridRender !== null;
    const gridRef = useRef<GriddedMapHandle>(null);
    const [gridStatus, setGridStatus] = useState<StageMapStatus>(IDLE_STATUS);
    // La carte de mailles dessine, aux grands zooms, les objets réels à la place de ses mailles
    // Dernière étape annoncée par la carte de mailles, avec l'image pour laquelle elle vaut
    const [reportedStage, setReportedStage] = useState<{ stage: GridStage; imageKey: string | null } | null>(null);
    const reportGridStage = useCallback((stage: GridStage, imageKey: string | null) => setReportedStage({ stage, imageKey }), []);
    const communesFrame = frameDrawnBy('communes', frame, staged);
    const communesRender = communesFrame?.render.renderer === 'communes' ? communesFrame.render : null;
    const communesRef = useRef<CommunesCanvasHandle>(null);
    // Textes et légende de son image exportée
    const communesExport = useMemo(
        () => (communesFrame ? { info: exportInfoOf(communesFrame.exportMeta), legend: exportLegendOf(communesFrame.legend) } : null),
        [communesFrame],
    );
    const communesMounted = communesRender !== null;
    const [communesStatus, setCommunesStatus] = useState<StageMapStatus>(IDLE_STATUS);
    // État de la carte MapLibre affichée, s'il y en a une
    const mapLibreStatus = (gridded && gridStatus) || (dense && communesStatus) || null;

    useImperativeHandle(
        ref,
        () => ({
            exportPng: () => {
                if (gridded) gridRef.current?.exportPng();
                else if (dense) communesRef.current?.exportPng();
                else downloadChartPng(chartRef.current?.chart);
            },
        }),
        [gridded, dense],
    );
    // Territoire survolé sur la carte
    const [hoveredLand, setHoveredLand] = useState<HoveredLand | null>(null);
    // Légende des objets d'une carte de mailles, quand ils ont pris la place des mailles
    const gridLegend = gridded && legend?.kind === 'grid' ? legend : null;
    // Une carte qui a une image la montre d'emblée : tant que la carte n'a rien annoncé pour elle,
    // la légende est celle de l'image, pas celle des mailles
    const gridImageKey = gridFrame?.render.renderer === 'grid' ? (gridFrame.render.image?.key ?? null) : null;
    let gridStage: GridStage = gridImageKey ? 'image' : 'cells';
    if (reportedStage && reportedStage.imageKey === gridImageKey) gridStage = reportedStage.stage;
    let detailLegend: (GridLegendBody & { title: string }) | null = null;
    if (gridLegend && gridStage === 'objects') detailLegend = gridLegend.detail;
    if (gridLegend && gridStage === 'image') detailLegend = gridLegend.image;
    // Sous l'image, la ligne « pas de donnée » a la couleur de son fond
    const gridNoData = gridLegend?.noData && gridStage === 'image' && gridLegend.image ? { ...gridLegend.noData, color: gridLegend.image.noDataColor } : (gridLegend?.noData ?? null);
    // Textes et légende de l'image exportée d'une carte de mailles : ceux de ce qu'elle dessine,
    // ses mailles, l'image ou les objets
    const gridExport = gridFrame && {
        info: exportInfoOf(gridFrame.exportMeta, gridStage),
        legend: exportLegendOf(gridFrame.legend, gridLegend && { classes: (detailLegend ?? gridLegend).classes, noData: gridNoData }),
    };
    // Ligne de légende mise en avant : elle ne vaut que pour la légende affichée
    const legendScope = legend && detailLegend ? `${legend.signature}|${gridStage}` : (legend?.signature ?? null);
    const focus = useLegendFocus(legendScope);
    const activeLegendKey = focus.hovered ?? hoveredLand?.classIndex ?? focus.pinned ?? null;

    // La scène change de taille avec la fenêtre et les onglets mobiles : on recale la carte
    const reflowChart = useCallback(() => chartRef.current?.chart?.reflow(), []);
    const stage = useStageSize(stageRef, reflowChart);

    // Légende ouverte ou repliée : le choix de l'utilisateur, qui vaut d'une carte à l'autre ;
    // sans choix, elle est repliée sur une scène où elle s'ouvrirait par-dessus la carte
    const [legendChoice, setLegendChoice] = useState<boolean | null>(null);
    const legendOpen = legendChoice ?? legendOpenByDefault(stage);
    // Tant que rien n'est affiché, la place réservée est celle de la légende de la vue qui se
    // prépare : sa carte naît à sa taille définitive, au lieu de se recadrer, et de charger
    // d'autres tuiles, quand sa légende arrive
    const reserved = legendReservation(stage, Boolean(legend ?? staged?.legend) && legendOpen);
    const legendHasItsPlace = reserved.top > 0 || reserved.left > 0;
    const legendCoversMap = Boolean(legend) && legendOpen && stage.legendPlacement === 'over';
    // La place réservée change celle laissée à la carte : celle-ci se recale avant la peinture
    useLayoutEffect(reflowChart, [reserved.top, reserved.left, reflowChart]);

    // Ce que les gestionnaires des cartes lisent au moment où ils sont appelés. Eux-mêmes ne
    // changent jamais d'identité : un chargement ou un survol ne recrée pas le graphique.
    const live = useRef({ pending, staged, onZoneChange, onStagedPainted, highlight });
    useLayoutEffect(() => {
        live.current = { pending, staged, onZoneChange, onStagedPainted, highlight };
    });
    // État d'une carte MapLibre. Si elle s'annonce dessinée alors que sa vue se prépare, elle peut
    // remplacer la carte affichée. La vue en préparation est lue à cet instant : l'annonce vaut
    // pour ce que la carte vient de recevoir, pas pour un rendu passé, et pour son moteur seul.
    const confirmStaged = useCallback((engine: FrameRender['renderer'], status: StageMapStatus) => {
        const preparing = live.current.staged;
        if (status.ready && preparing?.render.renderer === engine) live.current.onStagedPainted?.(preparing.key);
    }, []);
    const reportGridStatus = useCallback(
        (status: StageMapStatus) => {
            setGridStatus(status);
            confirmStaged('grid', status);
        },
        [confirmStaged],
    );
    const reportCommunesStatus = useCallback(
        (status: StageMapStatus) => {
            setCommunesStatus(status);
            confirmStaged('communes', status);
        },
        [confirmStaged],
    );
    // Écran tactile : l'appui lit, et la fiche de lecture ouvre (voir pressOutcome). La fiche est
    // rendue dans un emplacement de la page, que les cartes MapLibre reçoivent pour la leur.
    const touching = useTouching();
    const [sheetSlot, setSheetSlot] = useState<HTMLElement | null>(null);
    // Territoire lu au doigt sur la carte par territoire
    const [readLandId, setReadLandId] = useState<string | null>(null);
    const handlers = useMemo<PointHandlers>(
        () => ({
            // Pendant un chargement, la carte montre encore la vue précédente : le clic est ignoré
            // pour ne pas ouvrir un autre territoire que celui attendu
            onLandClick: (zone, name) => {
                if (!live.current.pending) live.current.onZoneChange?.(zone, name);
            },
            touching,
            onLandRead: setReadLandId,
            onLandHover: (point) => {
                live.current.highlight?.publish('map', point?.land_id ?? null);
                setHoveredLand((current) => {
                    if (!point) return null;
                    const classIndex = point.legendKey ?? null;
                    return current?.name === point.name && current.classIndex === classIndex
                        ? current
                        : { name: point.name, valueText: point.valueText.replace(/<br\/>/g, ', '), classIndex };
                });
            },
        }),
        [touching],
    );
    // Lecture du territoire touché : elle suit la carte affichée, et disparaît avec le territoire
    const landReading = useMemo(() => landReadingOf(frame, readLandId), [frame, readLandId]);
    const closeLandReading = useCallback(() => setReadLandId(null), []);
    const openReadLand = useCallback(() => {
        const opens = landReading?.opens;
        if (opens && !live.current.pending) live.current.onZoneChange?.(opens.zone, opens.name);
    }, [landReading]);
    // Le territoire lu désigne un territoire du fond quitté
    const baseKey = frame?.base.key ?? null;
    useEffect(() => setReadLandId(null), [baseKey]);
    // Territoire survolé dans le nuage de points : la carte le cerne comme sous le pointeur
    useEffect(() => {
        let shown: string | null = null;
        const landPoint = (landId: string | null) =>
            landId === null ? undefined : chartRef.current?.chart?.series[0]?.points.find((point) => (point.options as unknown as LandPoint).land_id === landId);
        return highlight?.subscribe('map', (landId) => {
            landPoint(shown)?.setState('');
            shown = landId;
            landPoint(landId)?.setState('hover');
        });
    }, [highlight]);

    // Échelle des symboles proportionnels, cercles ou anneaux : le diamètre du plus grand dépend du
    // nombre de territoires et de la taille de la carte à l'écran ; les symboles de référence de la
    // légende le suivent
    const symbolLegend = legend?.kind === 'symbols' ? legend : null;
    const symbolSize = symbolLegend ? symbolMaxSize(symbolLegend.landCount, stage.symbolFactor) : null;
    const symbolReferences = useMemo(
        () =>
            symbolLegend && symbolSize !== null
                ? symbolLegend.references.map(({ value, label }) => ({ radius: symbolRadius(value, symbolLegend.maxValue, symbolSize), label }))
                : [],
        [symbolLegend, symbolSize],
    );

    // Territoires d'outre-mer que la carte affichée rapproche de l'Hexagone ; une carte de mailles
    // en géographie réelle n'en a pas. Sur une petite carte, leurs noms ne tiennent pas : des
    // numéros les remplacent.
    const insets = (gridded ? gridRender?.insets : frame?.base.insets) ?? NO_INSETS;
    const numberedInsets = stage.compact && insets.length > 0;

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
    const chartOptions = useHeld(options, stage.hidden);
    useLayoutEffect(() => {
        const chart = chartRef.current?.chart;
        // Masqué, le graphique est encore celui d'une vue précédente : ses symboles ne sont pas retaillés
        if (chart && symbolSize !== null && !stage.hidden) applySymbolMaxSize(chart, symbolSize);
    }, [symbolSize, chartOptions, stage.hidden]);

    // Ligne de légende mise en avant : les territoires des autres lignes s'estompent. Appliqué avant
    // la peinture, pour qu'une carte neuve ne soit jamais vue sans l'estompage que montre sa légende.
    const { dimKey } = focus;
    useLayoutEffect(() => {
        const series = chartRef.current?.chart?.series?.[0];
        if (!series) return;
        series.points.forEach((point) => {
            const key = (point.options as unknown as LandPoint).legendKey;
            const dimmed = dimKey !== null && key !== dimKey;
            point.graphic?.attr({ 'fill-opacity': dimmed ? DIMMED_OPACITY : 1 });
        });
    }, [dimKey, chartOptions]);

    // Le territoire lu au doigt reste cerné sur la carte tant que sa fiche est ouverte, comme sous
    // le pointeur ; un graphique recréé sous la fiche le cerne de nouveau
    const readLand = landReading?.landId ?? null;
    useEffect(() => {
        const point =
            readLand === null ? undefined : chartRef.current?.chart?.series?.[0]?.points.find((candidate) => (candidate.options as unknown as LandPoint).land_id === readLand);
        // Par une classe qui lui est propre, et non par l'état de survol de Highcharts, levé peu
        // après l'appui ; avec le liseré clair du territoire survolé
        const dropHalo = outlineLand(point as unknown as Highcharts.Point | undefined);
        point?.graphic?.addClass(READ_POINT_CLASS);
        return () => {
            dropHalo();
            // Le graphique peut avoir été recréé entre-temps : son ancien point n'a plus de dessin
            point?.graphic?.removeClass(READ_POINT_CLASS);
        };
    }, [readLand, chartOptions]);

    useEffect(() => {
        if (gridMounted) return;
        setGridStatus(IDLE_STATUS);
        setReportedStage(null);
    }, [gridMounted]);
    useEffect(() => {
        if (!communesMounted) setCommunesStatus(IDLE_STATUS);
    }, [communesMounted]);
    // La vue de toutes les communes du pays se prépare sous la carte affichée : ses tuiles chargent
    const communesStaged = communesMounted && !dense;

    return (
        <Row>
            <MapCard>
                <Stage ref={stageRef}>
                    <Canvas>
                        {error && !frame && <Message>{ERROR_MESSAGES[error]}</Message>}
                        {!error && !frame && <Message role="status">Chargement de la carte…</Message>}
                        <MapLayers
                            $top={reserved.top}
                            $left={reserved.left}
                            data-legend-band={reserved.top > 0 ? reserved.top : undefined}
                            data-legend-side={reserved.left > 0 ? reserved.left : undefined}
                        >
                            {/* Messages centrés sur la carte, et non sur la scène, dont la légende occupe une part */}
                            {error && frame && <Notice role="status">{ERROR_MESSAGES[error]}</Notice>}
                            {!error && frame && pending && (
                                <Loading role="status">{communesStaged ? COMMUNES_LOADING : `Chargement de la carte : ${targetName}…`}</Loading>
                            )}
                            {!error && !pending && mapLibreStatus?.loading && (
                                <Loading role="status">{gridded && gridRender ? gridRender.cells.texts.loading : COMMUNES_LOADING}</Loading>
                            )}
                            {gridRender && (
                                <MapLibreLayer
                                    $staged={!gridded}
                                    $belowLegendButton={!legendHasItsPlace}
                                    $under={gridRender.image ? reserved : undefined}
                                    aria-hidden={gridded ? undefined : true}
                                >
                                    <GriddedMap
                                        ref={gridRef}
                                        zone={gridFrame.base.zone}
                                        render={gridRender}
                                        scale={gridFrame.base.scale}
                                        // Une image remplit toute la scène, sous la légende
                                        covered={gridRender.image ? reserved : undefined}
                                        numberedInsets={stage.compact}
                                        // La classe mise en avant est celle de la légende affichée : des mailles, ou des objets
                                        highlightedClass={gridded && !detailLegend ? dimKey : null}
                                        highlightedDetailClass={gridded && detailLegend ? dimKey : null}
                                        clickable={gridFrame.base.clickable}
                                        // En préparation, elle n'est pas atténuée : elle apparaîtra nette
                                        busy={gridded && pending}
                                        exportInfo={gridExport.info}
                                        exportLegend={gridExport.legend}
                                        ariaLabel={gridFrame.ariaLabel}
                                        onHover={setHoveredLand}
                                        touching={touching}
                                        sheetSlot={sheetSlot}
                                        onZoneChange={onZoneChange}
                                        onStatusChange={reportGridStatus}
                                        onStageChange={reportGridStage}
                                    />
                                </MapLibreLayer>
                            )}
                            {communesRender && (
                                <MapLibreLayer $staged={!dense} $belowLegendButton={!legendHasItsPlace} aria-hidden={dense ? undefined : true}>
                                    <CommunesCanvas
                                        ref={communesRef}
                                        exportInfo={communesExport.info}
                                        exportLegend={communesExport.legend}
                                        base={communesFrame.base}
                                        render={communesRender}
                                        // La classe mise en avant est celle de la légende affichée
                                        highlightedClass={dense ? dimKey : null}
                                        numberedInsets={stage.compact}
                                        // En préparation, elle n'est pas atténuée : elle apparaîtra nette
                                        busy={dense && pending}
                                        ariaLabel={communesFrame.ariaLabel}
                                        onHover={setHoveredLand}
                                        touching={touching}
                                        sheetSlot={sheetSlot}
                                        onZoneChange={onZoneChange}
                                        onStatusChange={reportCommunesStatus}
                                    />
                                </MapLibreLayer>
                            )}
                            {chartOptions && (
                                <ChartLayer $stale={pending}>
                                    <HighchartsReact
                                        ref={chartRef}
                                        highcharts={Highcharts}
                                        constructorType="mapChart"
                                        options={chartOptions}
                                        // Le fond et les classes changent avec la zone et l'indicateur : on recrée le graphique
                                        immutable
                                        containerProps={CHART_CONTAINER_PROPS}
                                        callback={markChartCreated}
                                    />
                                </ChartLayer>
                            )}
                            {mapLibreStatus?.notice && !legendCoversMap && (
                                <Banner role="status" $belowLegendButton={!legendHasItsPlace}>
                                    {mapLibreStatus.notice}
                                </Banner>
                            )}
                            {gridStage === 'objects' && gridLegend?.detail && (
                                <ObjectsHint role="status">
                                    <i className="bi bi-hand-index" aria-hidden="true" />
                                    {gridLegend.detail.hint}
                                </ObjectsHint>
                            )}
                        </MapLayers>
                        {/* Emplacement unique de la légende posée sur la carte : seul son contenu change d'une carte à l'autre */}
                        {legend && (
                            <MapLegendOverlay
                                placement={stage.legendPlacement}
                                open={legendOpen}
                                onOpenChange={setLegendChoice}
                                stale={pending}
                                busy={viewLoading}
                            >
                                {legend.kind === 'classes' && (
                                    <ClassLegend
                                        indicatorLabel={legend.title}
                                        classes={legend.classes}
                                        counts={legend.counts}
                                        noDataCount={legend.noDataCount}
                                        landTypeLabel={legend.landTypeLabel}
                                        method={legend.method}
                                        activeClass={activeLegendKey}
                                        pinnedClass={focus.pinned}
                                        onHover={focus.hoverLegend}
                                        onTogglePin={focus.togglePin}
                                    />
                                )}
                                {symbolLegend && (
                                    <SymbolLegend
                                        indicatorLabel={symbolLegend.title}
                                        shape={symbolLegend.shape}
                                        references={symbolReferences}
                                        colors={symbolLegend.colors}
                                        note={symbolLegend.note}
                                        noDataCount={symbolLegend.noDataCount}
                                        method={symbolLegend.method}
                                    />
                                )}
                                {legend.kind === 'bivariate' && (
                                    <BivariateLegendBody
                                        indicatorLabel={legend.title}
                                        description={legend.props}
                                        activeCell={activeLegendKey}
                                        pinnedCell={focus.pinned}
                                        onHover={focus.hoverLegend}
                                        onTogglePin={focus.togglePin}
                                    />
                                )}
                                {legend.kind === 'grid' && (
                                    <GridLegend
                                        indicatorLabel={detailLegend?.title ?? legend.title}
                                        basis={(detailLegend ?? legend).basis}
                                        classes={(detailLegend ?? legend).classes}
                                        method={(detailLegend ?? legend).method}
                                        noData={gridNoData}
                                        activeClass={activeLegendKey}
                                        pinnedClass={focus.pinned}
                                        onTogglePin={focus.togglePin}
                                    />
                                )}
                                {boundaryKey && <BoundaryKey label={boundaryKey} />}
                            </MapLegendOverlay>
                        )}
                    </Canvas>
                    {numberedInsets && (
                        <InsetKey>
                            {insets.map((inset, index) => (
                                <React.Fragment key={inset.zone}>
                                    {index > 0 && ' · '}
                                    <b>{index + 1}</b> {inset.name}
                                </React.Fragment>
                            ))}
                        </InsetKey>
                    )}
                </Stage>
                <SheetSlot ref={setSheetSlot} aria-live="polite" aria-atomic="true" />
                {landReading && !gridded && !dense && (
                    <TipSheet
                        slot={sheetSlot}
                        tip={landReading.tip}
                        action={landReading.opens && { label: 'Ouvrir ce territoire', onClick: openReadLand }}
                        onClose={closeLandReading}
                    />
                )}
            </MapCard>
            <Aside aria-label="Chiffres clés et graphiques">
                {frame && (
                    <AsideSlot aria-busy={viewLoading} $stale={pending}>
                        <NationalMapKeyFigures model={frame.keyFigures} />
                        {frame.footnote && <NationalMapFootnote text={frame.footnote} explainsMillesimes={frame.data.source === 'artif'} />}
                    </AsideSlot>
                )}
                {children}
            </Aside>
        </Row>
    );
});

NationalMapChart.displayName = 'NationalMapChart';

export default NationalMapChart;
