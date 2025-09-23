import { BaseSource } from "./baseSource";
import type { FeatureCollection } from "geojson";

export class EmpriseSource extends BaseSource {
    constructor(private readonly data: FeatureCollection) {
        super({
            id: "emprise-source",
            type: "geojson",
        });
    }

    getOptions() {
        return {
            ...this.options,
            data: this.data,
        };
    }
}
