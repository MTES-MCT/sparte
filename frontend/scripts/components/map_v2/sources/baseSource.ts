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

export abstract class BaseSource {
    readonly options: BaseSourceOptions;
    loaded = false;

    constructor(options: BaseSourceOptions) {
        this.options = { ...options };
    }

    async load(): Promise<void> {
        this.loaded = true;
    }

    abstract getOptions(): Record<string, any>;
}
