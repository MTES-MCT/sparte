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
    filters?: any[];
    options?: Record<string, any>;
    onClick?: (event: any) => void;
    legend?: {
        title: string;
        items: Array<{ color: string; label: string }>;
    };
    label?: string;
    description?: string;
    stats?: boolean;
}
