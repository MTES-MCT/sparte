type SourceType = "geojson" | "vector" | "raster" | "raster-dem";

interface BaseSourceOptions {
    id: string;
    type: SourceType;
    attribution?: string;
    minzoom?: number;
    maxzoom?: number;
}

export abstract class BaseSource {
    constructor(readonly options: BaseSourceOptions) {}

    abstract getOptions(): Record<string, any>;
}
