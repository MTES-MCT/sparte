import { BaseOcsgeDiffSource } from "./baseOcsgeDiffSource";
import { OCSGE_GEOJSON_CENTROIDS_URL } from "../constants/config";
import type { LandDetailResultType } from "@services/types/land";
import { getTerritoryFilter } from "../utils/ocsge";
import type { FilterSpecification } from "maplibre-gl";

export class OcsgeDiffCentroidSource extends BaseOcsgeDiffSource {

    constructor(landData: LandDetailResultType) {
        super({
            id: "ocsge-diff-centroid-source",
            type: "geojson",
        }, landData);
    }

    getOptions() {
        const url = `${OCSGE_GEOJSON_CENTROIDS_URL}${this.startMillesimeIndex}_${this.endMillesimeIndex}_${this.departement}.geojson.gz`;

        const territoryFilter = getTerritoryFilter(this.landData);
        const increaseFilter = ["==", ["get", "new_is_impermeable"], true] as FilterSpecification;
        const decreaseFilter = ["==", ["get", "new_not_impermeable"], true] as FilterSpecification;

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
                impermeabilisation_count: ['+', ['case', increaseFilter, ['get', 'surface'], 0]],
                desimpermeabilisation_count: ['+', ['case', decreaseFilter, ['get', 'surface'], 0]]
            }
        };
    }

}

