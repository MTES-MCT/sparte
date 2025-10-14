import { BaseSource } from "./baseSource";
import type { FeatureCollection } from "geojson";
import { fetchLandGeom } from "@services/fetchers";

export class EmpriseSource extends BaseSource {
    private data: FeatureCollection = { type: "FeatureCollection", features: [] };

    constructor(
        private readonly land_type: string,
        private readonly land_id: string
    ) {
        super({
            id: "emprise-source",
            type: "geojson",
        });
    }

    async load(): Promise<void> {
        const { simple_geom } = await fetchLandGeom(this.land_type, this.land_id);
        this.data = simple_geom;
        this.loaded = true;
    }

    getOptions() {
        return {
            type: this.options.type,
            data: this.data
        };
    }

    updateData(data: FeatureCollection) {
        this.data = data;
    }
}
