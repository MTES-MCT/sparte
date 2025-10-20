import { BaseSource } from "./baseSource";
import { OCSGE_DIFF_CENTROID_URL } from "../constants/config";

export class OcsgeDiffCentroidSource extends BaseSource {
    constructor(
        private readonly startMillesimeIndex: number,
        private readonly endMillesimeIndex: number,
        private readonly departement: string
    ) {
        super({
            id: "ocsge-diff-centroid-source",
            type: "geojson",
        });
    }

    getOptions() {
        // const url = `${OCSGE_DIFF_CENTROID_URL}_${this.startMillesimeIndex}_${this.endMillesimeIndex}_${this.departement}.geojson`;
        const url = `/project/api/ocsge-diff-centroid/?start_millesime=${this.startMillesimeIndex}&end_millesime=${this.endMillesimeIndex}&departement=${this.departement}`;

        return {
            type: this.options.type,
            data: url,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 100,
            clusterMinPoints: 2,
        };
    }
}

