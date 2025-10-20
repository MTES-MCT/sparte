import { BaseSource } from "./baseSource";
import { OCSGE_DIFF_CENTROID_URL } from "../constants/config";
import { LandDetailResultType } from "@services/types/land";
import { getLastMillesimeIndex, getStartMillesimeIndex, getFirstDepartement } from "../utils/ocsge";

export class OcsgeDiffCentroidSource extends BaseSource {
    private readonly startMillesimeIndex: number;
    private readonly endMillesimeIndex: number;
    private readonly departement: string;

    constructor(landData: LandDetailResultType) {
        super({
            id: "ocsge-diff-centroid-source",
            type: "geojson",
        });

        this.endMillesimeIndex = getLastMillesimeIndex(landData.millesimes);
        this.startMillesimeIndex = getStartMillesimeIndex(landData.millesimes);
        this.departement = getFirstDepartement(landData.departements);
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

