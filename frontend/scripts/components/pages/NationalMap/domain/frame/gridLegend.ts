// Légende d'une carte de mailles, d'après ce qu'elle dessine à cet instant : ses mailles, l'image
// qui les remplace, ou les objets réels des grands zooms. La légende de la page, la ligne mise en
// avant et l'image exportée se lisent ici, pour dire toutes la même chose.
import type { GridStage } from '../grid/cells';
import { ExportLegend, MapImageInfo, exportInfoOf, exportLegendOf } from './exportImage';
import type { GridLegendBody, GridRender, LegendModel, MapFrame } from './types';

type GridLegend = Extract<LegendModel, { kind: 'grid' }>;

// Dernière étape annoncée par la carte de mailles, avec l'image pour laquelle elle vaut
export type ReportedStage = { stage: GridStage; imageKey: string | null };

export type GridLegendView = {
    // Ce que la carte de mailles dessine
    stage: GridStage;
    // Légende de la carte de mailles affichée ; null : la carte affichée n'en est pas une
    legend: GridLegend | null;
    // Légende de ce qui a pris la place des mailles, image ou objets ; null : la carte affichée
    // dessine ses mailles
    replacement: (GridLegendBody & { title: string }) | null;
    // Ligne de ce que la carte laisse sans maille ; null : rien à signaler
    noData: { label: string; color: string } | null;
};

// Une carte qui a une image la montre d'emblée : tant que la carte n'a rien annoncé pour elle,
// la légende est celle de l'image, pas celle des mailles. Une annonce faite pour une autre image
// ne vaut plus.
export const gridStageOf = (render: Pick<GridRender, 'image'> | null, reported: ReportedStage | null): GridStage => {
    const imageKey = render?.image?.key ?? null;
    if (reported?.imageKey === imageKey) return reported.stage;
    return imageKey ? 'image' : 'cells';
};

const replacementOf = (legend: GridLegend | null, stage: GridStage): GridLegendView['replacement'] => {
    if (!legend) return null;
    return { cells: null, image: legend.image, objects: legend.detail }[stage];
};

const noDataOf = (legend: GridLegend | null, stage: GridStage): GridLegendView['noData'] => {
    const noData = legend?.noData ?? null;
    // Sous l'image, la ligne « pas de donnée » a la couleur de son fond
    if (noData && stage === 'image' && legend.image) return { ...noData, color: legend.image.noDataColor };
    return noData;
};

// `shown` : la vue affichée ; `render` : ce que dessine la carte de mailles, qui peut être celui
// d'une vue qui se prépare sous la carte affichée ; `reported` : sa dernière annonce
export const gridLegendViewOf = (shown: Pick<MapFrame, 'render' | 'legend'> | null, render: Pick<GridRender, 'image'> | null, reported: ReportedStage | null): GridLegendView => {
    const legend = shown?.render.renderer === 'grid' && shown.legend.kind === 'grid' ? shown.legend : null;
    const stage = gridStageOf(render, reported);
    return { stage, legend, replacement: replacementOf(legend, stage), noData: noDataOf(legend, stage) };
};

// Ce pour quoi vaut une ligne de légende mise en avant : la légende affichée. Celle d'une image ou
// d'objets n'est pas celle des mailles qu'ils remplacent, bien que la carte soit la même.
export const legendScopeOf = (legend: LegendModel | undefined, { replacement, stage }: GridLegendView): string | null => {
    if (!legend) return null;
    return replacement ? `${legend.signature}|${stage}` : legend.signature;
};

// Textes et légende de l'image exportée d'une carte de mailles : ceux de ce qu'elle dessine, ses
// mailles, l'image ou les objets
export const gridExportOf = (
    frame: Pick<MapFrame, 'exportMeta' | 'legend'>,
    { stage, legend, replacement, noData }: GridLegendView,
): { info: MapImageInfo; legend: ExportLegend } => ({
    info: exportInfoOf(frame.exportMeta, stage),
    legend: exportLegendOf(frame.legend, legend && { classes: (replacement ?? legend).classes, noData }),
});
