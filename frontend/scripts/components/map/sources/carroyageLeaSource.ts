import { BaseSource } from "./baseSource";
import type { SourceSpecification } from "maplibre-gl";

export class CarroyageLeaSource extends BaseSource {
    constructor() {
        super({
            id: "carroyage-lea-source",
            type: "vector",
        });
    }

    getOptions(): SourceSpecification {
        return {
            type: this.options.type as 'vector',
            url: `pmtiles://${this.vectorTilesUrl}carroyage_lea.pmtiles`,
        } as SourceSpecification;
    }
}
