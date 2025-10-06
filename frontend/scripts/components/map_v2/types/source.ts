export type SourceType =
    | "geojson"
    | "vector"
    | "raster"
    | "raster-dem";

export interface BaseSourceOptions {
    id: string;
    type: SourceType;
    attribution?: string;
    minzoom?: number;
    maxzoom?: number;
}
