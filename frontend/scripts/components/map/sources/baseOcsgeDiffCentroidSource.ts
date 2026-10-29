import { BaseOcsgeDiffSource } from "./baseOcsgeDiffSource";
import type { LandDetailResultType } from "@services/types/land";
import { getTerritoryFilter } from "../utils/ocsge";
import type { ExpressionSpecification, GeoJSONSourceSpecification } from "maplibre-gl";

export interface OcsgeDiffCentroidConfig {
    sourceId: string;
    /** Préfixe des fichiers GeoJSON : `${prefix}_${start}_${end}_${departement}.geojson.gz` */
    geojsonPrefix: string;
    /** Propriété vraie quand le sol a gagné l'état suivi (ex. `new_is_impermeable`). */
    increaseProperty: string;
    /** Propriété vraie quand le sol a perdu l'état suivi (ex. `new_not_impermeable`). */
    decreaseProperty: string;
    /** Noms des surfaces cumulées par cluster, lus par les couches de centroïdes. */
    increaseCountProperty: string;
    decreaseCountProperty: string;
    /** Rayon de regroupement par proximité, en pixels (100 par défaut). */
    clusterRadius?: number;
    /** Dernier zoom où les points sont regroupés (14 par défaut). */
    clusterMaxZoom?: number;
}

/**
 * Source GeoJSON clusterisée des centroïdes de différence OCS GE entre deux
 * millésimes. Les sous-classes ne font que choisir les propriétés suivies
 * (imperméabilisation ou artificialisation).
 */
export abstract class BaseOcsgeDiffCentroidSource extends BaseOcsgeDiffSource {
    private readonly centroidConfig: OcsgeDiffCentroidConfig;

    constructor(landData: LandDetailResultType, centroidConfig: OcsgeDiffCentroidConfig) {
        super({
            id: centroidConfig.sourceId,
            type: "geojson",
        }, landData);
        this.centroidConfig = centroidConfig;
    }

    protected buildOptions(departement: string): GeoJSONSourceSpecification {
        const { geojsonPrefix, increaseProperty, decreaseProperty, increaseCountProperty, decreaseCountProperty, clusterRadius, clusterMaxZoom } = this.centroidConfig;
        const url = `${this.geojsonUrl}${geojsonPrefix}_${this.startMillesimeIndex}_${this.endMillesimeIndex}_${departement}.geojson.gz`;

        const territoryFilter = getTerritoryFilter(this.landData);
        const increaseFilter: ExpressionSpecification = ["==", ["get", increaseProperty], true];
        const decreaseFilter: ExpressionSpecification = ["==", ["get", decreaseProperty], true];

        const dataFilter: ExpressionSpecification = ["any", increaseFilter, decreaseFilter];
        const finalFilter: ExpressionSpecification = territoryFilter ? ["all", territoryFilter, dataFilter] : dataFilter;

        return {
            type: "geojson",
            data: url,
            cluster: true,
            clusterMaxZoom: clusterMaxZoom ?? 14,
            clusterRadius: clusterRadius ?? 100,
            clusterMinPoints: 2,
            filter: finalFilter,
            clusterProperties: {
                [increaseCountProperty]: ['+', ['case', increaseFilter, ['get', 'surface'], 0]],
                [decreaseCountProperty]: ['+', ['case', decreaseFilter, ['get', 'surface'], 0]]
            }
        };
    }

    /** Force le recalcul des clusters une fois les sources supplémentaires ajoutées. */
    protected onExtraDepartmentSourcesAdded(): void {
        this.map?.fire('moveend');
    }
}
