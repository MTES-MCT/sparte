import { BaseSource } from "./baseSource";
import type { LandDetailResultType } from "@services/types/land";

export class FrichesCentroidSource extends BaseSource {
    private readonly land_type: string;
    private readonly land_id: string;

    constructor(landData: LandDetailResultType) {
        super({
            id: "friches-centroid-source",
            type: "geojson",
        });

        this.land_type = landData.land_type;
        this.land_id = landData.land_id;
    }

    getOptions() {
        return {
            type: this.options.type,
            data: `/api/landfrichecentroid/?land_type=${this.land_type}&land_id=${this.land_id}`,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 100,
            clusterMinPoints: 2,
        };
    }
}

