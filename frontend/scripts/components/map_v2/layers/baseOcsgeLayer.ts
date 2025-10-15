import { BaseLayer } from "./baseLayer";
import type { BaseLayerOptions } from "../types/layer";
import { NomenclatureType, Couverture, Usage } from "../types/ocsge";
import { COUVERTURE_COLORS, USAGE_COLORS } from "../constants/ocsge_nomenclatures";

export abstract class BaseOcsgeLayer extends BaseLayer {
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

        // Initialiser le filtre avec tous les codes autorisés pour la nomenclature actuelle
        this.currentFilter = this.nomenclature === "couverture"
            ? this.allowedCodes.couverture
            : this.allowedCodes.usage;
    }

    protected abstract getBaseFilter(): any[];

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
        const colorValues = Object.values(colors).map((color: [number, number, number]) =>
            `rgba(${color.join(", ")}, 0.7)`
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

    protected buildFillOptions(filter: any[]) {
        const field = this.nomenclature === "couverture" ? "code_cs" : "code_us";
        const allowed = this.nomenclature === "couverture" ? this.allowedCodes.couverture : this.allowedCodes.usage;
        const nomenclatureExpr = allowed.length > 0
            ? ["in", ["get", field], ["literal", allowed]]
            : null;
        const finalFilter = nomenclatureExpr ? ["all", filter, nomenclatureExpr] : filter;
        return {
            id: this.options.id,
            type: this.options.type,
            source: this.options.source,
            "source-layer": this.getSourceLayerName(),
            filter: finalFilter,
            layout: {
                visibility: this.options.visible ? "visible" : "none",
            },
            paint: {
                "fill-color": this.getColorExpression(),
                "fill-opacity": this.options.opacity ?? 0.7,
                "fill-outline-color": "rgba(0, 0, 0, 0.3)",
            },
        };
    }

    abstract getOptions(): Record<string, any>;

    setNomenclature(newNomenclature: NomenclatureType): void {
        if (!this.map) return;

        const layerId = this.getId();
        if (!this.map.getLayer(layerId)) return;

        this.nomenclature = newNomenclature;

        this.map.setPaintProperty(layerId, 'fill-color', this.getColorExpression());

        const newAllowedCodes = newNomenclature === "couverture"
            ? this.allowedCodes.couverture
            : this.allowedCodes.usage;
        this.setFilter(newAllowedCodes);
    }


    getCurrentMillesime(): number {
        return this.millesimeIndex;
    }

    getAvailableMillesimes(): Array<{ value: number; label: string }> {
        return this.availableMillesimes.map(m => ({
            value: m.index,
            label: m.year ? `${m.year}` : `Index ${m.index}`
        }));
    }

    getCurrentNomenclature(): NomenclatureType {
        return this.nomenclature;
    }

    getLayerNomenclature(): { couverture: Couverture[]; usage: Usage[] } {
        return this.allowedCodes;
    }

    setFilter(selectedCodes: string[]): void {
        if (!this.map) return;

        const layerId = this.getId();
        if (!this.map.getLayer(layerId)) return;

        this.currentFilter = selectedCodes;

        const field = this.nomenclature === "couverture" ? "code_cs" : "code_us";
        const filter = this.buildFilterExpression(selectedCodes, field);

        this.map.setFilter(layerId, filter as any);
    }

    getCurrentFilter(): string[] {
        return this.currentFilter;
    }

    private buildFilterExpression(selectedCodes: string[], field: string): any[] {
        if (selectedCodes.length === 0) {
            // Aucun code sélectionné = masquer tout
            return ["==", ["get", field], ""];
        }

        if (selectedCodes.length === 1) {
            // Un seul code sélectionné
            return ["==", ["get", field], selectedCodes[0]];
        }

        // Plusieurs codes sélectionnés
        return ["in", ["get", field], ["literal", selectedCodes]];
    }

}
