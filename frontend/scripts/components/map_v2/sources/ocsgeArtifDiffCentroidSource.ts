import { BaseSource } from "./baseSource";
import { OCSGE_GEOJSON_BASE_URL } from "../constants/config";
import { LandDetailResultType, Millesime } from "@services/types/land";
import { getLastMillesimeIndex, getStartMillesimeIndex, getFirstDepartement, getTerritoryFilter, getAvailableMillesimePairs } from "../utils/ocsge";
import type { FilterSpecification } from "maplibre-gl";
import type { SourceInterface } from "../types/sourceInterface";

export class OcsgeArtifDiffCentroidSource extends BaseSource implements SourceInterface {
    private startMillesimeIndex: number;
    private endMillesimeIndex: number;
    private departement: string;
    private readonly landData: LandDetailResultType;
    private readonly millesimes: Millesime[];

    constructor(landData: LandDetailResultType) {
        super({
            id: "ocsge-artif-diff-centroid-source",
            type: "geojson",
        });

        this.landData = landData;
        this.millesimes = landData.millesimes || [];
        this.endMillesimeIndex = getLastMillesimeIndex(landData.millesimes);
        this.startMillesimeIndex = getStartMillesimeIndex(landData.millesimes);
        this.departement = getFirstDepartement(landData.departements);
    }

    getOptions() {
        const url = `${OCSGE_GEOJSON_BASE_URL}artif_diff_centroid_${this.startMillesimeIndex}_${this.endMillesimeIndex}_${this.departement}.geojson.gz`;

        const territoryFilter = getTerritoryFilter(this.landData);
        const increaseFilter = ["==", ["get", "new_is_artificial"], true] as FilterSpecification;
        const decreaseFilter = ["==", ["get", "new_not_artificial"], true] as FilterSpecification;

        const dataFilter = ["any", increaseFilter, decreaseFilter] as FilterSpecification;
        const finalFilter = territoryFilter ? ["all", territoryFilter, dataFilter] : dataFilter;

        return {
            type: this.options.type,
            data: url,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 100,
            clusterMinPoints: 2,
            filter: finalFilter,
            clusterProperties: {
                artificialisation_count: ['+', ['case', increaseFilter, ['get', 'surface'], 0]],
                desartificialisation_count: ['+', ['case', decreaseFilter, ['get', 'surface'], 0]]
            }
        };
    }

    async setMillesimes(newStartIndex: number, newEndIndex: number, newDepartement?: string): Promise<void> {
        if (!this.map || !this.sourceId) {
            console.warn('OcsgeArtifDiffCentroidSource: map ou sourceId non attaché');
            return;
        }

        if (newEndIndex - newStartIndex !== 1) {
            throw new Error("Les millésimes doivent être consécutifs pour la source de différence centroid artif");
        }

        const targetDepartement = newDepartement || this.departement;

        if (this.startMillesimeIndex === newStartIndex &&
            this.endMillesimeIndex === newEndIndex &&
            this.departement === targetDepartement) {
            return;
        }

        this.startMillesimeIndex = newStartIndex;
        this.endMillesimeIndex = newEndIndex;
        this.departement = targetDepartement;

        await this.reloadSource();
    }

    getAvailableMillesimePairs(): Array<{ startIndex: number; endIndex: number; startYear?: number; endYear?: number; departement?: string; departementName?: string }> {
        return getAvailableMillesimePairs(this.landData);
    }

    getId(): string {
        return this.options.id;
    }
}

