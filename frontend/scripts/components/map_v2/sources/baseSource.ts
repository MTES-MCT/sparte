import type { BaseSourceOptions } from "../types/source";
import type maplibregl from "maplibre-gl";
import type { SourceSpecification } from "maplibre-gl";

export abstract class BaseSource {
    readonly options: BaseSourceOptions;
    loaded = false;
    protected map?: maplibregl.Map;
    protected sourceId?: string;

    constructor(options: BaseSourceOptions) {
        this.options = { ...options };
    }

    // Injection des dépendances: map, sourceId
    attach(map: maplibregl.Map, sourceId: string): void {
        this.map = map;
        this.sourceId = sourceId;
    }

    async load(): Promise<void> {
        this.loaded = true;
    }

    abstract getOptions(): SourceSpecification;
}
