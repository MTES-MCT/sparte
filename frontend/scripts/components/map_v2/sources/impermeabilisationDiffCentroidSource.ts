import { BaseSource } from "./baseSource";
import { OCSGE_GEOJSON_CENTROIDS_URL, IMPERMEABILISATION_FIELD, DESIMPERMEABILISATION_FIELD } from "../constants/config";
import { LandDetailResultType } from "@services/types/land";
import { getLastMillesimeIndex, getStartMillesimeIndex, getFirstDepartement } from "../utils/ocsge";

export class ImpermeabilisationDiffCentroidSource extends BaseSource {
    private readonly startMillesimeIndex: number;
    private readonly endMillesimeIndex: number;
    private readonly departement: string;

    constructor(landData: LandDetailResultType) {
        super({
            id: "impermeabilisation-diff-centroid-source",
            type: "geojson",
        });

        this.endMillesimeIndex = getLastMillesimeIndex(landData.millesimes);
        this.startMillesimeIndex = getStartMillesimeIndex(landData.millesimes);
        this.departement = getFirstDepartement(landData.departements);
    }

    getOptions() {
        const url = `${OCSGE_GEOJSON_CENTROIDS_URL}${this.startMillesimeIndex}_${this.endMillesimeIndex}_${this.departement}.geojson.gz`;

        const isImpermeabilisation = ["==", ["get", IMPERMEABILISATION_FIELD], true];
        const isDesimpermeabilisation = ["==", ["get", DESIMPERMEABILISATION_FIELD], true];

        return {
            type: this.options.type,
            data: url,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 100,
            clusterMinPoints: 2,
            filter: [
                "any",
                isImpermeabilisation,
                isDesimpermeabilisation
            ],
            clusterProperties: {
                // Compter les points d'imperméabilisation dans chaque cluster
                'impermeabilisation_count': ['+', ['case', isImpermeabilisation, 1, 0]],
                // Compter les points de désimperméabilisation dans chaque cluster
                'desimpermeabilisation_count': ['+', ['case', isDesimpermeabilisation, 1, 0]]
            }
        };
    }
}

