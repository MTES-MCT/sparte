import { BaseSource } from "./baseSource";
import { OCSGE_GEOJSON_CENTROIDS_URL, ARTIFICIALISATION_FIELD, DESARTIFICIALISATION_FIELD } from "../constants/config";
import { LandDetailResultType } from "@services/types/land";
import { getLastMillesimeIndex, getStartMillesimeIndex, getFirstDepartement } from "../utils/ocsge";

export class ArtificialisationDiffCentroidSource extends BaseSource {
    private readonly startMillesimeIndex: number;
    private readonly endMillesimeIndex: number;
    private readonly departement: string;

    constructor(landData: LandDetailResultType) {
        super({
            id: "artificialisation-diff-centroid-source",
            type: "geojson",
        });

        this.endMillesimeIndex = getLastMillesimeIndex(landData.millesimes);
        this.startMillesimeIndex = getStartMillesimeIndex(landData.millesimes);
        this.departement = getFirstDepartement(landData.departements);
    }

    getOptions() {
        const url = `${OCSGE_GEOJSON_CENTROIDS_URL}${this.startMillesimeIndex}_${this.endMillesimeIndex}_${this.departement}.geojson.gz`;

        const isArtificialisation = ["==", ["get", ARTIFICIALISATION_FIELD], true];
        const isDesartificialisation = ["==", ["get", DESARTIFICIALISATION_FIELD], true];

        return {
            type: this.options.type,
            data: url,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 100,
            clusterMinPoints: 2,
            filter: [
                "any",
                isArtificialisation,
                isDesartificialisation
            ],
            clusterProperties: {
                // Compter les points d'artificialisation dans chaque cluster
                'artificialisation_count': ['+', ['case', isArtificialisation, 1, 0]],
                // Compter les points de désartificialisation dans chaque cluster
                'desartificialisation_count': ['+', ['case', isDesartificialisation, 1, 0]]
            }
        };
    }
}
