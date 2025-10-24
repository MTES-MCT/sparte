import type maplibregl from "maplibre-gl";
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

export interface BaseLayerOptions {
    id: string;
    type: LayerType;
    source: string;
    visible?: boolean;
    opacity?: number;
    filters?: FilterSpecification[];
    options?: Record<string, unknown>;
    onClick?: (event: maplibregl.MapMouseEvent) => void;
    legend?: {
        title: string;
        items: Array<{ color: string; label: string }>;
    };
    label?: string;
    description?: string;
    stats?: boolean;
}
