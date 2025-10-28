import { BaseSource } from "./baseSource";
import { OCSGE_GEOJSON_CENTROIDS_URL } from "../constants/config";
import { LandDetailResultType } from "@services/types/land";
import { getLastMillesimeIndex, getStartMillesimeIndex, getFirstDepartement, getTerritoryFilter } from "../utils/ocsge";
import type { SourceSpecification, FilterSpecification } from "maplibre-gl";

type DiffCentroidPreset = 'impermeabilisation' | 'artificialisation';

interface ImpermeabilisationConfig {
    type: 'impermeabilisation';
    filename: string;
    increaseField: string;
    decreaseField: string;
    increaseCountProperty: string;
    decreaseCountProperty: string;
}

interface ArtificialisationConfig {
    type: 'artificialisation';
    filename: string;
    increaseField: string;
    decreaseField: string;
    increaseCountProperty: string;
    decreaseCountProperty: string;
}

type DiffCentroidConfig = ImpermeabilisationConfig | ArtificialisationConfig;

const DIFF_CENTROID_CONFIGS: Record<DiffCentroidPreset, DiffCentroidConfig> = {
    impermeabilisation: {
        type: 'impermeabilisation',
        filename: '',
        increaseField: 'new_is_impermeable',
        decreaseField: 'new_not_impermeable',
        increaseCountProperty: 'impermeabilisation_count',
        decreaseCountProperty: 'desimpermeabilisation_count',
    },
    artificialisation: {
        type: 'artificialisation',
        filename: 'artif_',
        increaseField: 'new_is_artificial',
        decreaseField: 'new_not_artificial',
        increaseCountProperty: 'artificialisation_count',
        decreaseCountProperty: 'desartificialisation_count',
    }
};

export class DiffCentroidSource extends BaseSource {
    private readonly config: DiffCentroidConfig;
    private readonly landData: LandDetailResultType;
    private readonly startMillesimeIndex: number;
    private readonly endMillesimeIndex: number;
    private readonly departement: string;

    constructor(
        sourceId: string,
        landData: LandDetailResultType,
        preset: DiffCentroidPreset
    ) {
        super({
            id: sourceId,
            type: "geojson",
        });

        this.config = DIFF_CENTROID_CONFIGS[preset];
        this.landData = landData;
        this.endMillesimeIndex = getLastMillesimeIndex(landData.millesimes);
        this.startMillesimeIndex = getStartMillesimeIndex(landData.millesimes);
        this.departement = getFirstDepartement(landData.departements);
    }

    getOptions(): SourceSpecification {
        const url = `${OCSGE_GEOJSON_CENTROIDS_URL}${this.config.filename}${this.startMillesimeIndex}_${this.endMillesimeIndex}_${this.departement}.geojson.gz`;

        const territoryFilter = getTerritoryFilter(this.landData);
        const { increaseFilter, decreaseFilter } = this.getDataFilters();

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
            clusterProperties: this.getClusterProperties(increaseFilter, decreaseFilter)
        };
    }

    private getDataFilters(): { increaseFilter: FilterSpecification; decreaseFilter: FilterSpecification } {
        return {
            increaseFilter: ["==", ["get", this.config.increaseField], true] as FilterSpecification,
            decreaseFilter: ["==", ["get", this.config.decreaseField], true] as FilterSpecification,
        };
    }

    private getClusterProperties(increaseFilter: FilterSpecification, decreaseFilter: FilterSpecification): Record<string, any> {
        return {
            [this.config.increaseCountProperty]: ['+', ['case', increaseFilter, ['get', 'surface'], 0]],
            [this.config.decreaseCountProperty]: ['+', ['case', decreaseFilter, ['get', 'surface'], 0]]
        };
    }
}

