import { BaseSource } from "./baseSource";
import { CARROYAGE_LEA_TILES_URL } from "../constants/config";
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
            url: `pmtiles://${CARROYAGE_LEA_TILES_URL}`,
        } as SourceSpecification;
    }
}
