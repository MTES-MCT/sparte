// Cartes MapLibre de la scène : la carte de mailles et celle de toutes les communes du pays.
// Chacune reçoit sa vue affichée, ou celle qui se prépare sous la carte affichée, et annonce son
// état : une carte dessinée alors que sa vue se prépare peut remplacer la carte affichée.
import { MutableRefObject, useCallback, useEffect, useMemo, useState } from 'react';
import type { StageMapStatus } from '../components/stage/mapLibre';
import { ExportLegend, MapImageInfo, exportInfoOf, exportLegendOf } from '../domain/frame/exportImage';
import type { ReportedStage } from '../domain/frame/gridLegend';
import type { CommunesRender, FrameRender, GridRender, MapFrame } from '../domain/frame/types';
import type { GridStage } from '../domain/grid/cells';

const IDLE_STATUS: StageMapStatus = { ready: false, loading: false, notice: null };

// Vue que dessine un moteur : la vue affichée si elle est la sienne, sinon celle qui se prépare
const frameDrawnBy = (engine: FrameRender['renderer'], shown: MapFrame | null, staged: MapFrame | null): MapFrame | null =>
    [shown, staged].find((candidate) => candidate?.render.renderer === engine) ?? null;

type StagedView = {
    staged: MapFrame | null;
    onStagedPainted?: (frameKey: string) => void;
};

type StagedConfirmation = (engine: FrameRender['renderer'], status: StageMapStatus) => void;

// État d'une carte MapLibre. Si elle s'annonce dessinée alors que sa vue se prépare, elle peut
// remplacer la carte affichée. La vue en préparation est lue à cet instant : l'annonce vaut
// pour ce que la carte vient de recevoir, pas pour un rendu passé, et pour son moteur seul.
export const useStagedConfirmation = (live: MutableRefObject<StagedView>): StagedConfirmation =>
    useCallback(
        (engine, status) => {
            const preparing = live.current.staged;
            if (status.ready && preparing?.render.renderer === engine) live.current.onStagedPainted?.(preparing.key);
        },
        [live],
    );

export type GridEngine = {
    // Vue que dessine la carte de mailles, affichée ou en préparation ; null : la carte n'est pas montée
    frame: MapFrame | null;
    render: GridRender | null;
    status: StageMapStatus;
    // La carte de mailles dessine, aux grands zooms, les objets réels à la place de ses mailles :
    // sa dernière annonce ; null tant qu'elle n'a rien annoncé
    reportedStage: ReportedStage | null;
    reportStatus: (status: StageMapStatus) => void;
    reportStage: (stage: GridStage, imageKey: string | null) => void;
};

export const useGridEngine = (shown: MapFrame | null, staged: MapFrame | null, confirmStaged: StagedConfirmation): GridEngine => {
    const frame = frameDrawnBy('grid', shown, staged);
    const render = frame?.render.renderer === 'grid' ? frame.render : null;
    const mounted = render !== null;
    const [status, setStatus] = useState<StageMapStatus>(IDLE_STATUS);
    const [reportedStage, setReportedStage] = useState<ReportedStage | null>(null);
    const reportStage = useCallback((stage: GridStage, imageKey: string | null) => setReportedStage({ stage, imageKey }), []);
    const reportStatus = useCallback(
        (next: StageMapStatus) => {
            setStatus(next);
            confirmStaged('grid', next);
        },
        [confirmStaged],
    );
    // Démontée, la carte n'a plus d'état : la suivante part de rien
    useEffect(() => {
        if (mounted) return;
        setStatus(IDLE_STATUS);
        setReportedStage(null);
    }, [mounted]);

    return { frame, render, status, reportedStage, reportStatus, reportStage };
};

export type CommunesEngine = {
    // Vue que dessine la carte de toutes les communes du pays, affichée ou en préparation ; null :
    // la carte n'est pas montée
    frame: MapFrame | null;
    render: CommunesRender | null;
    // Textes et légende de son image exportée
    exported: { info: MapImageInfo; legend: ExportLegend } | null;
    status: StageMapStatus;
    // La vue se prépare sous la carte affichée : ses tuiles chargent
    preparing: boolean;
    reportStatus: (status: StageMapStatus) => void;
};

export const useCommunesEngine = (shown: MapFrame | null, staged: MapFrame | null, confirmStaged: StagedConfirmation): CommunesEngine => {
    const frame = frameDrawnBy('communes', shown, staged);
    const render = frame?.render.renderer === 'communes' ? frame.render : null;
    const exported = useMemo(() => (frame ? { info: exportInfoOf(frame.exportMeta), legend: exportLegendOf(frame.legend) } : null), [frame]);
    const mounted = render !== null;
    const [status, setStatus] = useState<StageMapStatus>(IDLE_STATUS);
    const reportStatus = useCallback(
        (next: StageMapStatus) => {
            setStatus(next);
            confirmStaged('communes', next);
        },
        [confirmStaged],
    );
    useEffect(() => {
        if (!mounted) setStatus(IDLE_STATUS);
    }, [mounted]);

    return { frame, render, exported, status, preparing: mounted && shown?.render.renderer !== 'communes', reportStatus };
};

// État de la carte MapLibre affichée ; null : la carte affichée est une carte par territoire, ou
// rien n'est affiché
export const shownMapLibreStatus = (shown: MapFrame | null, grid: GridEngine, communes: CommunesEngine): StageMapStatus | null => {
    const renderer = shown?.render.renderer;
    if (renderer === 'grid') return grid.status;
    return renderer === 'communes' ? communes.status : null;
};
