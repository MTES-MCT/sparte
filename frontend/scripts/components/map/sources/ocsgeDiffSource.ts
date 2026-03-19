import { BaseOcsgeDiffSource } from "./baseOcsgeDiffSource";
import { OCSGE_TILES_URL } from "../constants/config";
import type { LandDetailResultType } from "@services/types/land";
import type { SourceSpecification, LayerSpecification } from "maplibre-gl";

export class OcsgeDiffSource extends BaseOcsgeDiffSource {
    private extraSourceIds: string[] = [];

    constructor(landData: LandDetailResultType) {
        super({
            id: "ocsge-diff-source",
            type: "vector",
        }, landData);
    }

    getOptions(): SourceSpecification {
        const tilesUrl = `${OCSGE_TILES_URL}occupation_du_sol_diff_${this.startMillesimeIndex}_${this.endMillesimeIndex}_${this.departement}.pmtiles`;

        return {
            type: this.options.type as 'vector',
            url: `pmtiles://${tilesUrl}`,
        } as SourceSpecification;
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
            const tilesUrl = `${OCSGE_TILES_URL}occupation_du_sol_diff_${this.startMillesimeIndex}_${this.endMillesimeIndex}_${dept}.pmtiles`;

            this.map.addSource(extraSourceId, {
                type: 'vector',
                url: `pmtiles://${tilesUrl}`,
            } as SourceSpecification);

            this.extraSourceIds.push(extraSourceId);

            for (const primaryLayer of primaryLayers) {
                const sourceLayer = 'source-layer' in primaryLayer
                    ? (primaryLayer as { 'source-layer'?: string })['source-layer']
                    : undefined;

                let updatedSourceLayer = sourceLayer;
                if (sourceLayer && sourceLayer.startsWith('occupation_du_sol_diff_')) {
                    updatedSourceLayer = `occupation_du_sol_diff_${this.startMillesimeIndex}_${this.endMillesimeIndex}_${dept}`;
                }

                const clonedSpec: LayerSpecification = {
                    ...primaryLayer,
                    id: `${primaryLayer.id}-dept-${dept}`,
                    source: extraSourceId,
                    ...(updatedSourceLayer && { 'source-layer': updatedSourceLayer }),
                } as LayerSpecification;

                this.map.addLayer(clonedSpec);
            }
        }
    }

    protected updateSourceLayer(sourceLayer: string): string {
        if (sourceLayer.startsWith('occupation_du_sol_diff_')) {
            return `occupation_du_sol_diff_${this.startMillesimeIndex}_${this.endMillesimeIndex}_${this.departement}`;
        }
        return sourceLayer;
    }

}
