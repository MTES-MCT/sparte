import { BaseLayer } from "./baseLayer";
import type { StatCategory, LayerType } from "../types/layer";

export abstract class BaseOcsgeDiffLayer extends BaseLayer {
    protected startMillesimeIndex: number;
    protected endMillesimeIndex: number;
    protected departement: string;

    constructor(
        options: {
            id: string;
            type: LayerType;
            source: string;
            visible?: boolean;
            opacity?: number;
            label: string;
            description: string;
        },
        startMillesimeIndex: number,
        endMillesimeIndex: number,
        departement: string
    ) {
        super(options);
        this.startMillesimeIndex = startMillesimeIndex;
        this.endMillesimeIndex = endMillesimeIndex;
        this.departement = departement;
    }

    protected getSourceLayerName(): string {
        return `occupation_du_sol_diff_${this.startMillesimeIndex}_${this.endMillesimeIndex}_${this.departement}`;
    }

    async setMillesimes(newStartIndex: number, newEndIndex: number): Promise<void> {
        if (!this.map || !this.map.getLayer(this.options.id)) {
            return;
        }

        this.startMillesimeIndex = newStartIndex;
        this.endMillesimeIndex = newEndIndex;

        this.map.setLayoutProperty(this.options.id, "source-layer", this.getSourceLayerName());
    }

    getStartMillesimeIndex(): number {
        return this.startMillesimeIndex;
    }

    getEndMillesimeIndex(): number {
        return this.endMillesimeIndex;
    }

    getDepartement(): string {
        return this.departement;
    }

    abstract extractStats(features: maplibregl.MapGeoJSONFeature[]): StatCategory[];
}
