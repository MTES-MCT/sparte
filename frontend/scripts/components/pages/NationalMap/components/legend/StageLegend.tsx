import React from 'react';
import ClassLegend, { HoveredLand } from '../../ClassLegend';
import GridLegend from '../../GridLegend';
import MapLegendOverlay from '../../MapLegendOverlay';
import SymbolLegend, { SymbolReference } from '../../SymbolLegend';
import type { GridLegendView } from '../../domain/frame/gridLegend';
import type { LegendModel, MapFrame } from '../../domain/frame/types';
import { parentBoundaryKey } from '../../domain/parentBoundary';
import type { LegendPlacement } from '../../domain/stage';
import type { useLegendFocus } from '../../hooks/useLegendFocus';
import BivariateLegendBody from './BivariateLegendBody';
import BoundaryKey from './BoundaryKey';

type LegendFocus = ReturnType<typeof useLegendFocus>;

interface LegendBodyProps {
    legend: LegendModel;
    // Ligne mise en avant : celle survolée dans la légende, celle du territoire survolé sur la
    // carte, ou la ligne épinglée
    activeKey: number | null;
    focus: LegendFocus;
    // Ce qu'une carte de mailles dessine : sa légende est celle de ses mailles, ou de ce qui les remplace
    gridView: GridLegendView;
    // Symboles de référence d'une carte en symboles proportionnels, à l'échelle de ceux de la carte
    symbolReferences: SymbolReference[];
}

// Contenu de la légende, selon la représentation de la carte
const LegendBody: React.FC<LegendBodyProps> = ({ legend, activeKey, focus, gridView, symbolReferences }) => {
    switch (legend.kind) {
        case 'classes':
            return (
                <ClassLegend
                    indicatorLabel={legend.title}
                    classes={legend.classes}
                    counts={legend.counts}
                    noDataCount={legend.noDataCount}
                    landTypeLabel={legend.landTypeLabel}
                    method={legend.method}
                    activeClass={activeKey}
                    pinnedClass={focus.pinned}
                    onHover={focus.hoverLegend}
                    onTogglePin={focus.togglePin}
                />
            );
        case 'symbols':
            return (
                <SymbolLegend
                    indicatorLabel={legend.title}
                    shape={legend.shape}
                    references={symbolReferences}
                    colors={legend.colors}
                    note={legend.note}
                    noDataCount={legend.noDataCount}
                    method={legend.method}
                />
            );
        case 'bivariate':
            return (
                <BivariateLegendBody
                    indicatorLabel={legend.title}
                    description={legend.props}
                    activeCell={activeKey}
                    pinnedCell={focus.pinned}
                    onHover={focus.hoverLegend}
                    onTogglePin={focus.togglePin}
                />
            );
        case 'grid': {
            const body = gridView.replacement ?? legend;
            return (
                <GridLegend
                    indicatorLabel={body.title}
                    basis={body.basis}
                    classes={body.classes}
                    method={body.method}
                    noData={gridView.noData}
                    activeClass={activeKey}
                    pinnedClass={focus.pinned}
                    onTogglePin={focus.togglePin}
                />
            );
        }
        default:
            return null;
    }
};

interface StageLegendProps extends Omit<LegendBodyProps, 'legend' | 'activeKey'> {
    // Vue affichée ; null tant qu'aucune ne l'est : la scène n'a pas encore de légende
    frame: MapFrame | null;
    // Place que la scène donne à la légende ouverte
    placement: LegendPlacement;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // La légende décrit encore la carte précédente : la suivante charge, ou n'a pas pu être chargée
    stale: boolean;
    // La carte suivante charge
    busy: boolean;
    // Territoire survolé sur la carte : sa ligne est mise en avant
    hoveredLand: HoveredLand | null;
}

// Emplacement unique de la légende posée sur la carte : seul son contenu change d'une carte à l'autre
const StageLegend: React.FC<StageLegendProps> = ({ frame, placement, open, onOpenChange, stale, busy, hoveredLand, focus, gridView, symbolReferences }) => {
    const legend = frame?.legend;
    if (!legend) return null;
    // Ce que la légende dit du trait de la limite de la zone, quand la carte le dessine
    const boundaryKey = parentBoundaryKey(frame.base.parentBoundary, frame.base.parent?.land_type);
    const activeKey = focus.hovered ?? hoveredLand?.classIndex ?? focus.pinned ?? null;

    return (
        <MapLegendOverlay placement={placement} open={open} onOpenChange={onOpenChange} stale={stale} busy={busy}>
            <LegendBody legend={legend} activeKey={activeKey} focus={focus} gridView={gridView} symbolReferences={symbolReferences} />
            {boundaryKey && <BoundaryKey label={boundaryKey} />}
        </MapLegendOverlay>
    );
};

export default StageLegend;
