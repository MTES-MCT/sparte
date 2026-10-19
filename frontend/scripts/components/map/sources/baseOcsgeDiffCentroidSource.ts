import { BaseOcsgeDiffSource } from "./baseOcsgeDiffSource";
import type { LandDetailResultType } from "@services/types/land";
import { getTerritoryFilter } from "../utils/ocsge";
import type { ExpressionSpecification, GeoJSONSourceSpecification, LayerSpecification } from "maplibre-gl";

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
}

/**
 * Source GeoJSON clusterisée des centroïdes de différence OCS GE entre deux
 * millésimes. Les sous-classes ne font que choisir les propriétés suivies
 * (imperméabilisation ou artificialisation).
 */
export abstract class BaseOcsgeDiffCentroidSource extends BaseOcsgeDiffSource {
    private extraSourceIds: string[] = [];
    private readonly centroidConfig: OcsgeDiffCentroidConfig;

    constructor(landData: LandDetailResultType, centroidConfig: OcsgeDiffCentroidConfig) {
        super({
            id: centroidConfig.sourceId,
            type: "geojson",
        }, landData);
        this.centroidConfig = centroidConfig;
    }

    getOptions(): GeoJSONSourceSpecification {
        return this.buildOptions(this.departement);
    }

    private buildOptions(departement: string): GeoJSONSourceSpecification {
        const { geojsonPrefix, increaseProperty, decreaseProperty, increaseCountProperty, decreaseCountProperty } = this.centroidConfig;
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
            clusterMaxZoom: 14,
            clusterRadius: 100,
            clusterMinPoints: 2,
            filter: finalFilter,
            clusterProperties: {
                [increaseCountProperty]: ['+', ['case', increaseFilter, ['get', 'surface'], 0]],
                [decreaseCountProperty]: ['+', ['case', decreaseFilter, ['get', 'surface'], 0]]
            }
        };
    }

    async addExtraDepartmentSourcesOnInit(): Promise<void> {
        await this.addExtraDepartmentSources();
    }

    protected async reloadSource(): Promise<void> {
        if (!this.map || !this.sourceId) return;
        this.removeExtraSources();
        await super.reloadSource();
        await this.addExtraDepartmentSources();
    }

    private removeExtraSources(): void {
        if (!this.map) return;

        for (const extraSourceId of this.extraSourceIds) {
            const style = this.map.getStyle();
            if (style) {
                const layersToRemove = style.layers.filter((l: LayerSpecification) =>
                    'source' in l && (l as { source?: string }).source === extraSourceId
                );
                for (const layer of layersToRemove) {
                    if (this.map.getLayer(layer.id)) {
                        this.map.removeLayer(layer.id);
                    }
                }
            }
            if (this.map.getSource(extraSourceId)) {
                this.map.removeSource(extraSourceId);
            }
        }
        this.extraSourceIds = [];
    }

    private async addExtraDepartmentSources(): Promise<void> {
        if (!this.map || !this.sourceId) return;

        const deptsForPair = this.millesimes
            .filter(m => m.index === this.endMillesimeIndex)
            .map(m => m.departement)
            .filter(d => d !== this.departement);

        if (deptsForPair.length === 0) return;

        const style = this.map.getStyle();
        const primaryLayers = style.layers.filter((l: LayerSpecification) =>
            'source' in l && (l as { source?: string }).source === this.sourceId
        );

        for (const dept of deptsForPair) {
            const extraSourceId = `${this.sourceId}-dept-${dept}`;
            this.map.addSource(extraSourceId, this.buildOptions(dept));
            this.extraSourceIds.push(extraSourceId);

            for (const primaryLayer of primaryLayers) {
                const clonedSpec: LayerSpecification = {
                    ...primaryLayer,
                    id: `${primaryLayer.id}-dept-${dept}`,
                    source: extraSourceId,
                } as LayerSpecification;

                this.map.addLayer(clonedSpec);
            }
        }

        this.map.fire('moveend');
    }
}
