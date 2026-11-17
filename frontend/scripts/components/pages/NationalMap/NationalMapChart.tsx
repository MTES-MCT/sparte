import React, { ForwardedRef, ReactNode, RefObject, forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
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
import type { HoveredLand } from './ClassLegend';
import GriddedMap, { GriddedMapHandle } from './GriddedMap';
import NationalMapFootnote from './components/NationalMapFootnote';
import NationalMapKeyFigures from './components/NationalMapKeyFigures';
import StageLegend from './components/legend/StageLegend';
import CommunesCanvas, { CommunesCanvasHandle } from './components/stage/CommunesCanvas';
import TipSheet from './components/stage/TipSheet';
import type { StageMapStatus } from './components/stage/mapLibre';
import { HOVERED_POINT_STYLE, TERRITORY_COLOR } from './components/stage/territoryOptions';
import { tipBubbleStyles } from './components/stage/tipView';
import { useHighlightedLand, usePointHandlers, useTerritoryChart } from './components/stage/useTerritoryChart';
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
import { GridLegendView, gridExportOf, gridLegendViewOf, legendScopeOf } from './domain/frame/gridLegend';
import type { FrameRender, MapFrame } from './domain/frame/types';
import type { LandHighlight } from './domain/landHighlight';
import type { LandReading } from './domain/landReading';
import { useLandReading } from './hooks/useLandReading';
import { useLegendFocus } from './hooks/useLegendFocus';
import { useLive } from './hooks/useLive';
import { CommunesEngine, GridEngine, shownMapLibreStatus, useCommunesEngine, useGridEngine, useStagedConfirmation } from './hooks/useMapLibreEngines';
import { useStageLayout } from './hooks/useStageLayout';
import { useSymbolScale } from './hooks/useSymbolScale';
import { useTouching } from './hooks/useTouching';

HighchartsMap(Highcharts);
HighchartsAccessibility(Highcharts);
HighchartsExporting(Highcharts);
HighchartsOfflineExporting(Highcharts);

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

const NO_INSETS: NationalMapInset[] = [];

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

// Territoires d'outre-mer que la carte affichée rapproche de l'Hexagone ; une carte de mailles
// en géographie réelle n'en a pas
const insetsOf = (frame: MapFrame | null): NationalMapInset[] => {
    if (!frame) return NO_INSETS;
    const insets = frame.render.renderer === 'grid' ? frame.render.insets : frame.base.insets;
    return insets ?? NO_INSETS;
};

// Message du chargement des tuiles de la carte MapLibre affichée
const tilesLoadingText = ({ render }: MapFrame): string => (render.renderer === 'grid' ? render.cells.texts.loading : COMMUNES_LOADING);

// Place réservée à la légende, telle que la scène la publie : rien quand elle est nulle
const reservedPx = (size: number): number | undefined => (size > 0 ? size : undefined);

// Messages de la scène tant qu'aucune carte n'y est affichée
const EmptyStageMessages: React.FC<{ frame: MapFrame | null; error: ViewError | null }> = ({ frame, error }) => {
    if (frame) return null;
    return (
        <>
            {error && <Message>{ERROR_MESSAGES[error]}</Message>}
            {!error && <Message role="status">Chargement de la carte…</Message>}
        </>
    );
};

interface StageNoticesProps {
    // Vue affichée ; null : la scène porte elle-même ses messages (voir EmptyStageMessages)
    frame: MapFrame | null;
    error: ViewError | null;
    pending: boolean;
    // Nom de la zone demandée, annoncé pendant son chargement
    targetName: string;
    // La vue de toutes les communes du pays se prépare sous la carte affichée : ses tuiles chargent
    communesPreparing: boolean;
    // État de la carte MapLibre affichée, s'il y en a une
    mapLibreStatus: StageMapStatus | null;
}

// Messages centrés sur la carte, et non sur la scène, dont la légende occupe une part
const StageNotices: React.FC<StageNoticesProps> = ({ frame, error, pending, targetName, communesPreparing, mapLibreStatus }) => {
    if (!frame) return null;
    return (
        <>
            {error && <Notice role="status">{ERROR_MESSAGES[error]}</Notice>}
            {!error && pending && <Loading role="status">{communesPreparing ? COMMUNES_LOADING : `Chargement de la carte : ${targetName}…`}</Loading>}
            {!error && !pending && mapLibreStatus?.loading && <Loading role="status">{tilesLoadingText(frame)}</Loading>}
        </>
    );
};

// Ce que la scène donne à ses deux cartes MapLibre
type MapLibreScene = {
    // La vue demandée charge
    pending: boolean;
    // Ligne de la légende affichée mise en avant ; null : aucune
    dimKey: number | null;
    // Petite carte : des numéros à la place des noms des territoires d'outre-mer
    compact: boolean;
    // La légende a sa place à côté de la carte ; sinon son bouton est posé sur la carte
    legendHasItsPlace: boolean;
    touching: () => boolean;
    // Emplacement de la page où la fiche de lecture des écrans tactiles est rendue
    sheetSlot: HTMLElement | null;
    onHover: (land: HoveredLand | null) => void;
    onZoneChange?: (zone: string, name?: string) => void;
};

interface GridLayerProps {
    mapRef: RefObject<GriddedMapHandle>;
    engine: GridEngine;
    // La carte de mailles est la carte affichée ; sinon elle se prépare sous elle
    shown: boolean;
    // Légende de ce qu'elle dessine : ses mailles, ou ce qui les remplace
    view: GridLegendView;
    // Place réservée à la légende, en pixels
    reserved: { top: number; left: number };
    scene: MapLibreScene;
}

const GridLayer: React.FC<GridLayerProps> = ({ mapRef, engine, shown, view, reserved, scene }) => {
    const { frame, render } = engine;
    if (!render) return null;
    // Une image remplit toute la scène, sous la légende
    const covered = render.image ? reserved : undefined;
    // La classe mise en avant est celle de la légende affichée : des mailles, ou des objets
    const dimKey = shown ? scene.dimKey : null;
    const exported = gridExportOf(frame, view);

    return (
        <MapLibreLayer $staged={!shown} $belowLegendButton={!scene.legendHasItsPlace} $under={covered} aria-hidden={shown ? undefined : true}>
            <GriddedMap
                ref={mapRef}
                zone={frame.base.zone}
                render={render}
                scale={frame.base.scale}
                covered={covered}
                numberedInsets={scene.compact}
                highlightedClass={view.replacement ? null : dimKey}
                highlightedDetailClass={view.replacement ? dimKey : null}
                clickable={frame.base.clickable}
                // En préparation, elle n'est pas atténuée : elle apparaîtra nette
                busy={shown && scene.pending}
                exportInfo={exported.info}
                exportLegend={exported.legend}
                ariaLabel={frame.ariaLabel}
                onHover={scene.onHover}
                touching={scene.touching}
                sheetSlot={scene.sheetSlot}
                onZoneChange={scene.onZoneChange}
                onStatusChange={engine.reportStatus}
                onStageChange={engine.reportStage}
            />
        </MapLibreLayer>
    );
};

interface CommunesLayerProps {
    mapRef: RefObject<CommunesCanvasHandle>;
    engine: CommunesEngine;
    // La carte de toutes les communes du pays est la carte affichée ; sinon elle se prépare sous elle
    shown: boolean;
    scene: MapLibreScene;
}

const CommunesLayer: React.FC<CommunesLayerProps> = ({ mapRef, engine, shown, scene }) => {
    const { frame, render, exported } = engine;
    if (!render) return null;
    return (
        <MapLibreLayer $staged={!shown} $belowLegendButton={!scene.legendHasItsPlace} aria-hidden={shown ? undefined : true}>
            <CommunesCanvas
                ref={mapRef}
                exportInfo={exported.info}
                exportLegend={exported.legend}
                base={frame.base}
                render={render}
                // La classe mise en avant est celle de la légende affichée
                highlightedClass={shown ? scene.dimKey : null}
                numberedInsets={scene.compact}
                // En préparation, elle n'est pas atténuée : elle apparaîtra nette
                busy={shown && scene.pending}
                ariaLabel={frame.ariaLabel}
                onHover={scene.onHover}
                touching={scene.touching}
                sheetSlot={scene.sheetSlot}
                onZoneChange={scene.onZoneChange}
                onStatusChange={engine.reportStatus}
            />
        </MapLibreLayer>
    );
};

interface TerritoryLayerProps {
    chartRef: RefObject<HighchartsReact.RefObject>;
    // Options du graphique ; null : aucune vue n'est affichée
    options: Highcharts.Options | null;
    // La vue demandée charge : la carte montre encore la précédente
    stale: boolean;
}

const TerritoryLayer: React.FC<TerritoryLayerProps> = ({ chartRef, options, stale }) => {
    if (!options) return null;
    return (
        <ChartLayer $stale={stale}>
            <HighchartsReact
                ref={chartRef}
                highcharts={Highcharts}
                constructorType="mapChart"
                options={options}
                // Le fond et les classes changent avec la zone et l'indicateur : on recrée le graphique
                immutable
                containerProps={CHART_CONTAINER_PROPS}
                callback={markChartCreated}
            />
        </ChartLayer>
    );
};

interface MapLibreHintsProps {
    // État de la carte MapLibre affichée, s'il y en a une
    status: StageMapStatus | null;
    legendCoversMap: boolean;
    legendHasItsPlace: boolean;
    gridView: GridLegendView;
}

// Ce qu'une carte MapLibre écrit sur elle : son avis, et ce qu'elle dit de ses objets
const MapLibreHints: React.FC<MapLibreHintsProps> = ({ status, legendCoversMap, legendHasItsPlace, gridView }) => (
    <>
        {status?.notice && !legendCoversMap && (
            <Banner role="status" $belowLegendButton={!legendHasItsPlace}>
                {status.notice}
            </Banner>
        )}
        {gridView.stage === 'objects' && gridView.legend?.detail && (
            <ObjectsHint role="status">
                <i className="bi bi-hand-index" aria-hidden="true" />
                {gridView.legend.detail.hint}
            </ObjectsHint>
        )}
    </>
);

// Sur une petite carte, les noms des territoires d'outre-mer ne tiennent pas : des numéros les
// remplacent, et leur clé est écrite sous la carte
const InsetNumbers: React.FC<{ insets: NationalMapInset[] }> = ({ insets }) => (
    <InsetKey>
        {insets.map((inset, index) => (
            <React.Fragment key={inset.zone}>
                {index > 0 && ' · '}
                <b>{index + 1}</b> {inset.name}
            </React.Fragment>
        ))}
    </InsetKey>
);

interface LandSheetProps {
    slot: HTMLElement | null;
    // Lecture du territoire touché, qui n'existe que sur la carte par territoire (voir landReadingOf)
    reading: LandReading | null;
    onOpen: () => void;
    onClose: () => void;
}

// Fiche de lecture du territoire touché sur la carte par territoire
const LandSheet: React.FC<LandSheetProps> = ({ slot, reading, onOpen, onClose }) => {
    if (!reading) return null;
    return <TipSheet slot={slot} tip={reading.tip} action={reading.opens && { label: 'Ouvrir ce territoire', onClick: onOpen }} onClose={onClose} />;
};

interface FrameSummaryProps {
    frame: MapFrame | null;
    // La vue demandée n'est pas encore la vue affichée
    stale: boolean;
    // La vue demandée charge
    busy: boolean;
}

// Chiffres clés et note de la carte affichée
const FrameSummary: React.FC<FrameSummaryProps> = ({ frame, stale, busy }) => {
    if (!frame) return null;
    return (
        <AsideSlot aria-busy={busy} $stale={stale}>
            <NationalMapKeyFigures model={frame.keyFigures} />
            {frame.footnote && <NationalMapFootnote text={frame.footnote} explainsMillesimes={frame.data.source === 'artif'} />}
        </AsideSlot>
    );
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

type EngineRefs = {
    chart: RefObject<HighchartsReact.RefObject>;
    grid: RefObject<GriddedMapHandle>;
    communes: RefObject<CommunesCanvasHandle>;
};

// L'export est demandé au moteur de la vue affichée
const useExportHandle = (ref: ForwardedRef<NationalMapChartHandle>, renderer: FrameRender['renderer'] | undefined, { chart, grid, communes }: EngineRefs): void => {
    const gridded = renderer === 'grid';
    const dense = renderer === 'communes';
    useImperativeHandle(
        ref,
        () => ({
            exportPng: () => {
                if (gridded) grid.current?.exportPng();
                else if (dense) communes.current?.exportPng();
                else downloadChartPng(chart.current?.chart);
            },
        }),
        [gridded, dense, chart, grid, communes],
    );
};

const NationalMapChart = forwardRef<NationalMapChartHandle, NationalMapChartProps>(({ frame, staged, pending, error, targetName, onZoneChange, onStagedPainted, highlight, children }, ref) => {
    const chartRef = useRef<HighchartsReact.RefObject>(null);
    const gridRef = useRef<GriddedMapHandle>(null);
    const communesRef = useRef<CommunesCanvasHandle>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    // La vue demandée charge : ce qui reste affiché de la précédente est annoncé comme occupé
    const viewLoading = pending && !error;

    // La carte ne dessine que la vue affichée : tout ce qu'elle lit vient du cadre
    const legend = frame?.legend;
    // Moteur de la vue affichée : Highcharts pour une carte par territoire, MapLibre pour les
    // données carroyées et pour toutes les communes du pays
    const renderer = frame?.render.renderer;

    // Ce que les gestionnaires des cartes lisent au moment où ils sont appelés. Eux-mêmes ne
    // changent jamais d'identité : un chargement ou un survol ne recrée pas le graphique.
    const live = useLive({ pending, staged, onZoneChange, onStagedPainted, highlight });
    // Chaque moteur MapLibre reçoit sa vue affichée, ou celle qui se prépare sous la carte affichée
    const confirmStaged = useStagedConfirmation(live);
    const grid = useGridEngine(frame, staged, confirmStaged);
    const communes = useCommunesEngine(frame, staged, confirmStaged);
    const mapLibreStatus = shownMapLibreStatus(frame, grid, communes);
    useExportHandle(ref, renderer, { chart: chartRef, grid: gridRef, communes: communesRef });

    // Territoire survolé sur la carte
    const [hoveredLand, setHoveredLand] = useState<HoveredLand | null>(null);
    // Légende d'une carte de mailles : celle de ce qu'elle dessine, ses mailles, l'image ou les objets
    const gridView = gridLegendViewOf(frame, grid.render, grid.reportedStage);
    // Ligne de légende mise en avant : elle ne vaut que pour la légende affichée
    const focus = useLegendFocus(legendScopeOf(legend, gridView));

    // La scène change de taille avec la fenêtre et les onglets mobiles : on recale la carte
    const reflowChart = useCallback(() => chartRef.current?.chart?.reflow(), []);
    const { stage, legendOpen, setLegendOpen, reserved, legendHasItsPlace, legendCoversMap } = useStageLayout(stageRef, reflowChart, legend, staged?.legend);

    // Écran tactile : l'appui lit, et la fiche de lecture ouvre (voir pressOutcome). La fiche est
    // rendue dans un emplacement de la page, que les cartes MapLibre reçoivent pour la leur.
    const touching = useTouching();
    const [sheetSlot, setSheetSlot] = useState<HTMLElement | null>(null);
    const touched = useLandReading(frame, live);
    const handlers = usePointHandlers(live, touching, touched.read, setHoveredLand);
    useHighlightedLand(chartRef, highlight);

    const symbols = useSymbolScale(legend, stage.symbolFactor);
    // Sur une petite carte, les noms des territoires d'outre-mer ne tiennent pas : des numéros les
    // remplacent
    const insets = insetsOf(frame);
    const numberedInsets = stage.compact && insets.length > 0;
    const chartOptions = useTerritoryChart(chartRef, frame, handlers, {
        numberedInsets,
        symbolSize: symbols.size,
        hidden: stage.hidden,
        dimKey: focus.dimKey,
        readLand: touched.landId,
    });

    const scene: MapLibreScene = { pending, dimKey: focus.dimKey, compact: stage.compact, legendHasItsPlace, touching, sheetSlot, onHover: setHoveredLand, onZoneChange };

    return (
        <Row>
            <MapCard>
                <Stage ref={stageRef}>
                    <Canvas>
                        <EmptyStageMessages frame={frame} error={error} />
                        <MapLayers $top={reserved.top} $left={reserved.left} data-legend-band={reservedPx(reserved.top)} data-legend-side={reservedPx(reserved.left)}>
                            <StageNotices
                                frame={frame}
                                error={error}
                                pending={pending}
                                targetName={targetName}
                                communesPreparing={communes.preparing}
                                mapLibreStatus={mapLibreStatus}
                            />
                            <GridLayer mapRef={gridRef} engine={grid} shown={renderer === 'grid'} view={gridView} reserved={reserved} scene={scene} />
                            <CommunesLayer mapRef={communesRef} engine={communes} shown={renderer === 'communes'} scene={scene} />
                            <TerritoryLayer chartRef={chartRef} options={chartOptions} stale={pending} />
                            <MapLibreHints status={mapLibreStatus} legendCoversMap={legendCoversMap} legendHasItsPlace={legendHasItsPlace} gridView={gridView} />
                        </MapLayers>
                        <StageLegend
                            frame={frame}
                            placement={stage.legendPlacement}
                            open={legendOpen}
                            onOpenChange={setLegendOpen}
                            stale={pending}
                            busy={viewLoading}
                            hoveredLand={hoveredLand}
                            focus={focus}
                            gridView={gridView}
                            symbolReferences={symbols.references}
                        />
                    </Canvas>
                    {numberedInsets && <InsetNumbers insets={insets} />}
                </Stage>
                <SheetSlot ref={setSheetSlot} aria-live="polite" aria-atomic="true" />
                <LandSheet slot={sheetSlot} reading={touched.reading} onOpen={touched.open} onClose={touched.close} />
            </MapCard>
            <Aside aria-label="Chiffres clés et graphiques">
                <FrameSummary frame={frame} stale={pending} busy={viewLoading} />
                {children}
            </Aside>
        </Row>
    );
});

NationalMapChart.displayName = 'NationalMapChart';

export default NationalMapChart;
