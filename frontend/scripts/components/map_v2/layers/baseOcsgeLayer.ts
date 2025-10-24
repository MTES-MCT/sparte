import { BaseLayer } from "./baseLayer";
import type { BaseLayerOptions, StatCategory } from "../types/layer";
import type { LayerInterface } from "../types/layerInterface";
import { NomenclatureType, Couverture, Usage } from "../types/ocsge";
import { COUVERTURE_COLORS, USAGE_COLORS, COUVERTURE_LABELS, USAGE_LABELS } from "../constants/ocsge_nomenclatures";
import { area } from '@turf/turf';
import type { FilterSpecification, LayerSpecification } from 'maplibre-gl';

export abstract class BaseOcsgeLayer extends BaseLayer implements LayerInterface {
    protected millesimeIndex: number;
    protected departement: string;
    protected nomenclature: NomenclatureType;
    protected allowedCodes: { couverture: Couverture[]; usage: Usage[] };
    protected availableMillesimes: Array<{ index: number; year?: number }>;
    protected currentFilter: string[] = [];

    constructor(options: BaseLayerOptions, millesimeIndex: number, departement: string, nomenclature: NomenclatureType = "couverture", availableMillesimes: Array<{ index: number; year?: number }> = []) {
        super(options);
        this.millesimeIndex = millesimeIndex;
        this.departement = departement;
        this.nomenclature = nomenclature;
        this.availableMillesimes = availableMillesimes && availableMillesimes.length > 0 ? availableMillesimes : [{ index: millesimeIndex }];

        this.allowedCodes = this.getLayerNomenclature();

        this.currentFilter = this.nomenclature === "couverture"
            ? this.allowedCodes.couverture
            : this.allowedCodes.usage;
    }

    protected abstract getBaseFilter(): FilterSpecification;

    getColorExpression() {
        const field = this.nomenclature === "couverture" ? "code_cs" : "code_us";
        const allowed = this.nomenclature === "couverture" ? this.allowedCodes.couverture : this.allowedCodes.usage;
        const allColors = this.nomenclature === "couverture" ? COUVERTURE_COLORS : USAGE_COLORS;

        const colors = Object.fromEntries(
            Object.entries(allColors).filter(([key]) => (allowed as string[]).includes(key))
        ) as typeof allColors;

        const cases = Object.entries(colors).map(([key]) => [
            "==", ["get", field], key
        ]);
        const colorValues = Object.values(colors).map((color: string) =>
            color.replace('rgb(', 'rgba(').replace(')', ', 0.7)')
        );

        return [
            "case",
            ...cases.flatMap((case_, index) => [case_, colorValues[index]]),
            "rgba(200, 200, 200, 0.7)"
        ];
    }

    protected getSourceLayerName() {
        return `occupation_du_sol_${this.millesimeIndex}_${this.departement}`;
    }

    protected buildFillOptions(baseFilter: FilterSpecification): LayerSpecification {
        return {
            id: this.options.id,
            type: this.options.type as 'fill',
            source: this.options.source,
            "source-layer": this.getSourceLayerName(),
            filter: this.buildCompleteFilter(baseFilter),
            layout: {
                visibility: this.options.visible ? "visible" : "none",
            },
            paint: {
                "fill-color": this.getColorExpression(),
                "fill-opacity": this.options.opacity ?? 0.7,
                "fill-outline-color": "rgba(0, 0, 0, 0.3)",
            },
        } as LayerSpecification;
    }

    private buildCompleteFilter(baseFilter: FilterSpecification, selectedCodes?: string[]): FilterSpecification {
        const field = this.nomenclature === "couverture" ? "code_cs" : "code_us";
        const codes = selectedCodes || this.currentFilter;

        const codesExpr = this.buildCodesFilterExpression(codes, field);
        return ["all", baseFilter, codesExpr] as FilterSpecification;
    }

    abstract getOptions(): LayerSpecification;


    getCurrentMillesime(): number {
        return this.millesimeIndex;
    }

    getCurrentDepartement(): string {
        return this.departement;
    }

    getAvailableMillesimes(): Array<{ value: string; label: string }> {
        return this.availableMillesimes.map(m => ({
            value: `${m.index}_${m.departement}`,
            label: m.year ? `${m.year}` : `Index ${m.index}`
        }));
    }

    getCurrentNomenclature(): NomenclatureType {
        return this.nomenclature;
    }

    getLayerNomenclature(): { couverture: Couverture[]; usage: Usage[] } {
        return this.allowedCodes;
    }


    getCurrentFilter(): string[] {
        return this.currentFilter;
    }

    private buildCodesFilterExpression(codes: string[], field: string): FilterSpecification {
        if (codes.length === 0) {
            return ["==", ["get", field], ""] as FilterSpecification;
        }

        if (codes.length === 1) {
            return ["==", ["get", field], codes[0]] as FilterSpecification;
        }

        return ["in", ["get", field], ["literal", codes]] as FilterSpecification;
    }

    async setNomenclature(newNomenclature: NomenclatureType): Promise<void> {
        if (!this.map) return;

        const layerId = this.getId();
        if (!this.map.getLayer(layerId)) return;

        this.nomenclature = newNomenclature;

        this.map.setPaintProperty(layerId, 'fill-color', this.getColorExpression());

        const allowedCodes = newNomenclature === "couverture"
            ? this.allowedCodes.couverture
            : this.allowedCodes.usage;

        this.currentFilter = allowedCodes;

        const filter = this.buildCompleteFilter(this.getBaseFilter());
        this.map.setFilter(layerId, filter);
    }

    async setFilter(selectedCodes: string[]): Promise<void> {
        if (!this.map) return;

        const layerId = this.getId();
        if (!this.map.getLayer(layerId)) return;

        this.currentFilter = selectedCodes;

        const filter = this.buildCompleteFilter(this.getBaseFilter());
        this.map.setFilter(layerId, filter);
    }

    extractStats(features: maplibregl.MapGeoJSONFeature[], filterProperty: string): StatCategory[] {
        if (features.length === 0) {
            return [];
        }

        const field = this.nomenclature === 'couverture' ? 'code_cs' : 'code_us';
        const colors = this.nomenclature === 'couverture' ? COUVERTURE_COLORS : USAGE_COLORS;
        const labels = this.nomenclature === 'couverture' ? COUVERTURE_LABELS : USAGE_LABELS;

        // Aggréger les surfaces par code
        const surfaces: Record<string, number> = {};

        for (const feature of features) {
            const properties = feature.properties;
            if (!properties) continue;

            const code = properties[field] as string;

            if (code && properties[filterProperty] === true) {
                const featureArea = area(feature.geometry);
                surfaces[code] = (surfaces[code] || 0) + featureArea;
            }
        }

        // Calculer le total
        const totalSurface = Object.values(surfaces).reduce((acc, val) => acc + val, 0);

        if (totalSurface === 0) {
            return [];
        }

        // Créer les catégories de stats
        const categories: StatCategory[] = Object.entries(surfaces)
            .map(([code, surface]) => {
                const label = this.nomenclature === 'couverture'
                    ? (labels as Record<Couverture, string>)[code as Couverture]
                    : (labels as Record<Usage, string>)[code as Usage];
                const color = this.nomenclature === 'couverture'
                    ? (colors as Record<Couverture, string>)[code as Couverture]
                    : (colors as Record<Usage, string>)[code as Usage];

                return {
                    code,
                    label: label || code,
                    color: color || "rgb(200, 200, 200)",
                    value: surface,
                    percent: (surface / totalSurface) * 100
                };
            })
            .filter(cat => cat.percent > 0)
            .sort((a, b) => b.percent - a.percent);

        return categories;
    }
}
