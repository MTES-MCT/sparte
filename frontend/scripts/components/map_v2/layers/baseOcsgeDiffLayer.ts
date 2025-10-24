import { BaseLayer } from "./baseLayer";
import type { StatCategory, LayerType } from "../types/layer";
import { area } from '@turf/turf';

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

    protected abstract getPositiveField(): string;

    protected abstract getNegativeField(): string;

    protected abstract getPositiveColor(): string;

    protected abstract getNegativeColor(): string;

    protected abstract getPositiveLabel(): string;

    protected abstract getNegativeLabel(): string;

    protected abstract getPositiveCode(): string;

    protected abstract getNegativeCode(): string;

    protected getSourceLayerName(): string {
        return `occupation_du_sol_diff_${this.startMillesimeIndex}_${this.endMillesimeIndex}_${this.departement}`;
    }

    async setMillesimes(newStartIndex: number, newEndIndex: number): Promise<void> {
        if (!this.map?.getLayer(this.options.id)) {
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

    /**
     * Extraction générique des stats pour les layers de différence
     * Compte les surfaces positives et négatives
     */
    extractStats(features: maplibregl.MapGeoJSONFeature[]): StatCategory[] {
        if (features.length === 0) {
            return [];
        }

        // Calculer les surfaces pour chaque catégorie
        let positiveSurface = 0;
        let negativeSurface = 0;

        for (const feature of features) {
            const properties = feature.properties;
            const featureArea = area(feature.geometry);

            if (properties && properties[this.getPositiveField()] === true) {
                positiveSurface += featureArea;
            } else if (properties && properties[this.getNegativeField()] === true) {
                negativeSurface += featureArea;
            }
        }

        const totalSurface = positiveSurface + negativeSurface;

        if (totalSurface === 0) {
            return [];
        }

        // Calculer les pourcentages
        const positivePercent = (positiveSurface / totalSurface) * 100;
        const negativePercent = (negativeSurface / totalSurface) * 100;

        return [
            {
                code: this.getPositiveCode(),
                label: this.getPositiveLabel(),
                color: this.getPositiveColor(),
                value: positiveSurface,
                percent: positivePercent
            },
            {
                code: this.getNegativeCode(),
                label: this.getNegativeLabel(),
                color: this.getNegativeColor(),
                value: negativeSurface,
                percent: negativePercent
            }
        ].filter(cat => cat.percent > 0);
    }
}
