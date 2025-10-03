import type { LayerType } from "../../../components/map_v2/layers/baseLayer";

export type FillPaint = 'fill-color' | 'fill-opacity' | 'fill-outline-color';
export type LinePaint = 'line-color' | 'line-width' | 'line-opacity';
export type RasterPaint = 'raster-opacity';
export type LayoutVisibility = 'visibility';

export type PaintPropertyByType = {
    fill: FillPaint;
    line: LinePaint;
    raster: RasterPaint;
    symbol: never;
    circle: never;
    heatmap: never;
    'fill-extrusion': never;
    hillshade: never;
    background: never;
};

export type LayoutPropertyByType = {
    fill: LayoutVisibility;
    line: LayoutVisibility;
    raster: LayoutVisibility;
    symbol: LayoutVisibility;
    circle: LayoutVisibility;
    heatmap: LayoutVisibility;
    'fill-extrusion': LayoutVisibility;
    hillshade: LayoutVisibility;
    background: LayoutVisibility;
};

export type StyleDiff<T extends LayerType> = {
    layout?: Partial<Record<LayoutPropertyByType[T], any>>;
    paint?: Partial<Record<PaintPropertyByType[T], any>>;
    filter?: any[];
};


