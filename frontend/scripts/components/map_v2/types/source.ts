export type SourceType =
    | "geojson"
    | "vector"
    | "raster";

export interface BaseSourceOptions {
    id: string;
    type: SourceType;
    attribution?: string;
    minzoom?: number;
    maxzoom?: number;
}
