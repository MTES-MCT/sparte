import type { FilterSpecification } from 'maplibre-gl';

export type LayerType =
    | "fill"
    | "line"
    | "symbol"
    | "circle"
    | "heatmap"
    | "fill-extrusion"
    | "raster"
    | "hillshade"
    | "background";

export interface StatCategory {
    code: string;
    label: string;
    color: string;
    value: number;
    percent: number;
}

export interface HoverHighlightOptions {
    enabled: boolean;
    propertyField: string;
    hoverOpacity?: number;
}

export interface BaseLayerOptions {
    id: string;
    type: LayerType;
    source: string;
    visible?: boolean;
    opacity?: number;
    filters?: FilterSpecification[];
    hoverHighlight?: HoverHighlightOptions;
}
