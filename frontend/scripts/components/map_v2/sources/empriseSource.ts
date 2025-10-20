import { BaseSource } from "./baseSource";
import type { FeatureCollection } from "geojson";
import { fetchLandGeom } from "@services/fetchers";
import { LandDetailResultType } from "@services/types/land";

export class EmpriseSource extends BaseSource {
    private data: FeatureCollection = { type: "FeatureCollection", features: [] };
    private readonly land_type: string;
    private readonly land_id: string;

    constructor(landData: LandDetailResultType) {
        super({
            id: "emprise-source",
            type: "geojson",
        });

        this.land_type = landData.land_type;
        this.land_id = landData.land_id;
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
