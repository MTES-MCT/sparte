import { BaseOcsgeDiffSource } from "./baseOcsgeDiffSource";
import { OCSGE_GEOJSON_BASE_URL } from "../constants/config";
import type { LandDetailResultType } from "@services/types/land";
import { getTerritoryFilter } from "../utils/ocsge";
import type { FilterSpecification, LayerSpecification } from "maplibre-gl";

export class OcsgeArtifDiffCentroidSource extends BaseOcsgeDiffSource {
    private extraSourceIds: string[] = [];

    constructor(landData: LandDetailResultType) {
        super({
            id: "ocsge-artif-diff-centroid-source",
            type: "geojson",
        }, landData);
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

        const territoryFilter = getTerritoryFilter(this.landData);
        const increaseFilter = ["==", ["get", "new_is_artificial"], true] as FilterSpecification;
        const decreaseFilter = ["==", ["get", "new_not_artificial"], true] as FilterSpecification;
        const dataFilter = ["any", increaseFilter, decreaseFilter] as FilterSpecification;
        const finalFilter = territoryFilter ? ["all", territoryFilter, dataFilter] : dataFilter;

        for (const dept of deptsForPair) {
            const extraSourceId = `${this.sourceId}-dept-${dept}`;
            const url = `${OCSGE_GEOJSON_BASE_URL}artif_diff_centroid_${this.startMillesimeIndex}_${this.endMillesimeIndex}_${dept}.geojson.gz`;

            this.map.addSource(extraSourceId, {
                type: 'geojson',
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
            } as any);

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

