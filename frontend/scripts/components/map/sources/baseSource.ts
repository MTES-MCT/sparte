import type { BaseSourceOptions } from "../types/source";
import type maplibregl from "maplibre-gl";
import type { SourceSpecification, LayerSpecification, StyleSpecification } from "maplibre-gl";

export abstract class BaseSource {
    readonly options: BaseSourceOptions;
    loaded = false;
    protected map?: maplibregl.Map;
    protected sourceId?: string;

    constructor(options: BaseSourceOptions) {
        this.options = { ...options };
    }

    // Injection des dépendances: map, sourceId
    attach(map: maplibregl.Map, sourceId: string): void {
        this.map = map;
        this.sourceId = sourceId;
    }

    async load(): Promise<void> {
        this.loaded = true;
    }

    abstract getOptions(): SourceSpecification;

    protected async reloadSource(): Promise<void> {
        if (!this.map || !this.sourceId) {
            console.warn('BaseSource: map ou sourceId non attaché');
            return;
        }

        // 1. Sauvegarder les specs des layers
        const style = this.map.getStyle();
        const layerSpecs = this.collectLayerSpecs(style);

        // 2. Supprimer les layers
        for (const { id } of layerSpecs) {
            if (this.map!.getLayer(id)) {
                this.map!.removeLayer(id);
            }
        }

        // 3. Supprimer la source
        if (this.map.getSource(this.sourceId)) {
            this.map.removeSource(this.sourceId);
        }

        // 4. Recréer la source avec les nouvelles options
        const newOptions = this.getOptions();
        this.map.addSource(this.sourceId, newOptions);

        // 5. Recréer les layers avec leurs specs mis à jour
        for (const layerSpec of layerSpecs) {
            this.map!.addLayer(layerSpec);
        }

        // 6. Attendre que la source soit chargée et forcer le rafraîchissement des clusters
        await this.waitForSourceLoad();

        // Forcer la mise à jour des markers en déclenchant un événement moveend
        // Cela force le recalcul des clusters et la mise à jour des markers
        this.map.fire('moveend');
    }

    private async waitForSourceLoad(): Promise<void> {
        if (!this.map || !this.sourceId) return;

        return new Promise((resolve) => {
            const source = this.map!.getSource(this.sourceId);
            if (!source) {
                resolve();
                return;
            }

            const checkLoaded = () => {
                if (this.map!.isSourceLoaded(this.sourceId)) {
                    this.map!.off('sourcedata', checkLoaded);
                    resolve();
                }
            };

            if (this.map.isSourceLoaded(this.sourceId)) {
                resolve();
            } else {
                this.map.on('sourcedata', checkLoaded);
            }
        });
    }

    private collectLayerSpecs(style: StyleSpecification): LayerSpecification[] {
        return style.layers
            .filter((l: LayerSpecification): l is LayerSpecification => {
                if (!('source' in l)) return false;
                const layerSource = (l as { source?: string }).source;
                return layerSource === this.sourceId;
            })
            .map((l: LayerSpecification) => this.cloneLayerSpec(l));
    }

    private cloneLayerSpec(layer: LayerSpecification): LayerSpecification {
        const { id, type, minzoom, maxzoom, layout, paint } = layer;
        const source = (layer as { source?: string }).source;
        const filter = (layer as { filter?: unknown }).filter;
        const sourceLayer = 'source-layer' in layer ? layer['source-layer'] : undefined;

        // Mettre à jour le source-layer si nécessaire
        let updatedSourceLayer = sourceLayer;
        if (sourceLayer && typeof sourceLayer === 'string') {
            updatedSourceLayer = this.updateSourceLayer(sourceLayer);
        }

        return {
            id,
            type,
            source,
            ...(updatedSourceLayer && { 'source-layer': updatedSourceLayer }),
            ...(minzoom !== undefined && { minzoom }),
            ...(maxzoom !== undefined && { maxzoom }),
            ...(filter && { filter }),
            ...(layout && { layout }),
            ...(paint && { paint })
        } as LayerSpecification;
    }

    protected updateSourceLayer(sourceLayer: string): string {
        return sourceLayer;
    }
}
