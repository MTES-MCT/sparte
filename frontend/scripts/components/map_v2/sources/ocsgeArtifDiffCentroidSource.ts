import { BaseSource } from "./baseSource";
import { OCSGE_GEOJSON_BASE_URL } from "../constants/config";
import { LandDetailResultType } from "@services/types/land";
import { getLastMillesimeIndex, getStartMillesimeIndex, getFirstDepartement } from "../utils/ocsge";
import type { FilterSpecification } from "maplibre-gl";

export class OcsgeArtifDiffCentroidSource extends BaseSource {
    private readonly startMillesimeIndex: number;
    private readonly endMillesimeIndex: number;
    private readonly departement: string;

    constructor(landData: LandDetailResultType) {
        super({
            id: "ocsge-artif-diff-centroid-source",
            type: "geojson",
        });

        this.endMillesimeIndex = getLastMillesimeIndex(landData.millesimes);
        this.startMillesimeIndex = getStartMillesimeIndex(landData.millesimes);
        this.departement = getFirstDepartement(landData.departements);
    }

    getOptions() {
        const url = `${OCSGE_GEOJSON_BASE_URL}artif_diff_centroid_${this.startMillesimeIndex}_${this.endMillesimeIndex}_${this.departement}.geojson.gz`;

        const increaseFilter = ["==", ["get", "new_is_artificial"], true] as FilterSpecification;
        const decreaseFilter = ["==", ["get", "new_not_artificial"], true] as FilterSpecification;

        return {
            type: this.options.type,
            data: url,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 100,
            clusterMinPoints: 2,
            clusterProperties: {
                artificialisation_count: ['+', ['case', increaseFilter, ['get', 'surface'], 0]],
                desartificialisation_count: ['+', ['case', decreaseFilter, ['get', 'surface'], 0]]
            }
        };
    }
}

