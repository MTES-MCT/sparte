import { BaseOcsgeSource } from "./baseOcsgeSource";
import type { LayerSpecification, SourceSpecification } from "maplibre-gl";

/**
 * Source dont les données sont découpées par département : un territoire à
 * cheval sur plusieurs départements charge une source principale pour le
 * premier, puis une source « supplémentaire » par autre département, avec un
 * clone de chaque couche de la source principale.
 *
 * Les sous-classes indiquent le département et le millésime courants, et
 * construisent les options de source pour un département donné.
 */
export abstract class BaseMultiDepartementSource extends BaseOcsgeSource {
    private extraSourceIds: string[] = [];

    protected abstract getCurrentDepartement(): string;

    /** Index de millésime qui détermine les départements disponibles. */
    protected abstract getCurrentMillesimeIndex(): number;

    protected abstract buildOptions(departement: string): SourceSpecification;

    /** Adapte le `source-layer` d'une couche clonée au département donné (sources vectorielles). */
    protected sourceLayerForDepartement(sourceLayer: string, _departement: string): string {
        return sourceLayer;
    }

    /** Appelé une fois les sources supplémentaires ajoutées. */
    protected onExtraDepartmentSourcesAdded(): void {}

    protected pmtilesOptions(tileName: string): SourceSpecification {
        return {
            type: "vector",
            url: `pmtiles://${this.vectorTilesUrl}${tileName}.pmtiles`,
        };
    }

    getOptions(): SourceSpecification {
        return this.buildOptions(this.getCurrentDepartement());
    }

    protected updateSourceLayer(sourceLayer: string): string {
        return this.sourceLayerForDepartement(sourceLayer, this.getCurrentDepartement());
    }

    addExtraDepartmentSourcesOnInit(): void {
        this.addExtraDepartmentSources();
    }

    protected async reloadSource(): Promise<void> {
        if (!this.map || !this.sourceId) return;
        this.removeExtraSources();
        await super.reloadSource();
        this.addExtraDepartmentSources();
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

    private addExtraDepartmentSources(): void {
        if (!this.map || !this.sourceId) return;

        const currentDepartement = this.getCurrentDepartement();
        const currentIndex = this.getCurrentMillesimeIndex();
        const extraDepartements = this.millesimes
            .filter(m => m.index === currentIndex)
            .map(m => m.departement)
            .filter(d => d !== currentDepartement);

        if (extraDepartements.length === 0) return;

        const style = this.map.getStyle();
        const primaryLayers = style.layers.filter((l: LayerSpecification) =>
            'source' in l && (l as { source?: string }).source === this.sourceId
        );

        for (const dept of extraDepartements) {
            const extraSourceId = `${this.sourceId}-dept-${dept}`;
            this.map.addSource(extraSourceId, this.buildOptions(dept));
            this.extraSourceIds.push(extraSourceId);

            for (const primaryLayer of primaryLayers) {
                const sourceLayer = 'source-layer' in primaryLayer
                    ? (primaryLayer as { 'source-layer'?: string })['source-layer']
                    : undefined;
                const updatedSourceLayer = sourceLayer && this.sourceLayerForDepartement(sourceLayer, dept);

                const clonedSpec: LayerSpecification = {
                    ...primaryLayer,
                    id: `${primaryLayer.id}-dept-${dept}`,
                    source: extraSourceId,
                    ...(updatedSourceLayer && { 'source-layer': updatedSourceLayer }),
                } as LayerSpecification;

                this.map.addLayer(clonedSpec);
            }
        }

        this.onExtraDepartmentSourcesAdded();
    }
}
