import { BaseSource } from "./baseSource";
import { OCSGE_GEOJSON_CENTROIDS_URL } from "../constants/config";
import { LandDetailResultType } from "@services/types/land";
import { getLastMillesimeIndex, getStartMillesimeIndex, getFirstDepartement } from "../utils/ocsge";
import type { SourceSpecification } from "maplibre-gl";

export abstract class BaseDiffCentroidSource extends BaseSource {
    protected readonly startMillesimeIndex: number;
    protected readonly endMillesimeIndex: number;
    protected readonly departement: string;

    constructor(sourceId: string, landData: LandDetailResultType) {
        super({
            id: sourceId,
            type: "geojson",
        });

        this.endMillesimeIndex = getLastMillesimeIndex(landData.millesimes);
        this.startMillesimeIndex = getStartMillesimeIndex(landData.millesimes);
        this.departement = getFirstDepartement(landData.departements);
    }

    protected abstract getPositiveField(): string;

    protected abstract getNegativeField(): string;

    protected abstract getPositiveCountPropertyName(): string;

    protected abstract getNegativeCountPropertyName(): string;

    getOptions(): SourceSpecification {
        const url = `${OCSGE_GEOJSON_CENTROIDS_URL}${this.startMillesimeIndex}_${this.endMillesimeIndex}_${this.departement}.geojson.gz`;

        const isPositive = ["==", ["get", this.getPositiveField()], true];
        const isNegative = ["==", ["get", this.getNegativeField()], true];

        return {
            type: this.options.type,
            data: url,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 100,
            clusterMinPoints: 2,
            filter: [
                "any",
                isPositive,
                isNegative
            ],
            clusterProperties: {
                // Somme des surfaces des points positifs dans chaque cluster
                [this.getPositiveCountPropertyName()]: ['+', ['case', isPositive, ['get', 'surface'], 0]],
                // Somme des surfaces des points négatifs dans chaque cluster
                [this.getNegativeCountPropertyName()]: ['+', ['case', isNegative, ['get', 'surface'], 0]]
            }
        };
    }
}

