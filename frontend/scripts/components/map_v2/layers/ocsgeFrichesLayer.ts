import { BaseLayer } from "./baseLayer";
import type { LayerSpecification, FilterSpecification } from 'maplibre-gl';
import type { LayerInterface } from "../types/layerInterface";
import type { NomenclatureType, Couverture, Usage } from "../types/ocsge";
import { COUVERTURE_COLORS, USAGE_COLORS, ALL_OCSGE_COUVERTURE_CODES, ALL_OCSGE_USAGE_CODES } from "../constants/ocsge_nomenclatures";

export class OcsgeFrichesLayer extends BaseLayer implements LayerInterface {
    private millesimeIndex: number;
    private fricheSiteIds: string[] = [];
    private nomenclature: NomenclatureType = "couverture";
    private currentFilter: string[] = ALL_OCSGE_COUVERTURE_CODES;

    constructor(millesimeIndex: number, fricheSiteIds?: string[], initialNomenclature?: NomenclatureType) {
        super({
            id: "ocsge-friches-layer",
            type: "fill",
            source: "ocsge-friches-source",
            visible: true,
            opacity: 0.7,
            hoverHighlight: {
                enabled: true,
                propertyField: "id",
                hoverOpacity: 0.4
            },
        });

        this.millesimeIndex = millesimeIndex;
        this.fricheSiteIds = fricheSiteIds || [];
        this.nomenclature = initialNomenclature || "couverture";
        this.currentFilter = initialNomenclature === "usage"
            ? ALL_OCSGE_USAGE_CODES
            : ALL_OCSGE_COUVERTURE_CODES;
    }

    protected getSourceLayerName(): string {
        return `occupation_du_sol_friche_${this.millesimeIndex}_national`;
    }

    getColorExpression() {
        const field = this.nomenclature === "couverture" ? "code_cs" : "code_us";
        const colors = this.nomenclature === "couverture" ? COUVERTURE_COLORS : USAGE_COLORS;

        const cases = Object.entries(colors).map(([key]) => [
            "==", ["get", field], key
        ]);
        const colorValues = Object.values(colors);

        return [
            "case",
            ...cases.flatMap((case_, index) => [case_, colorValues[index]]),
            "rgb(200, 200, 200)"
        ];
    }

    protected getFricheSiteIdFilter(): FilterSpecification | null {
        if (this.fricheSiteIds.length === 0) {
            return ["==", ["get", "friche_site_id"], "___NO_MATCH___"] as FilterSpecification;
        }
        return ["in", ["get", "friche_site_id"], ["literal", this.fricheSiteIds]] as FilterSpecification;
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

    private buildCompleteFilter(): FilterSpecification {
        const field = this.nomenclature === "couverture" ? "code_cs" : "code_us";
        const codesExpr = this.buildCodesFilterExpression(this.currentFilter, field);
        const frichesFilter = this.getFricheSiteIdFilter();

        if (frichesFilter) {
            return ["all", frichesFilter, codesExpr] as FilterSpecification;
        }
        return codesExpr;
    }

    getCurrentNomenclature(): NomenclatureType {
        return this.nomenclature;
    }

    getLayerNomenclature(): { couverture: Couverture[]; usage: Usage[] } {
        return {
            couverture: ALL_OCSGE_COUVERTURE_CODES,
            usage: ALL_OCSGE_USAGE_CODES
        };
    }

    getCurrentFilter(): string[] {
        return this.currentFilter;
    }

    async setNomenclature(newNomenclature: NomenclatureType): Promise<void> {
        if (!this.map) return;

        const layerId = this.getId();
        if (!this.map.getLayer(layerId)) return;

        this.nomenclature = newNomenclature;

        this.map.setPaintProperty(layerId, 'fill-color', this.getColorExpression());

        const allowedCodes = newNomenclature === "couverture"
            ? ALL_OCSGE_COUVERTURE_CODES
            : ALL_OCSGE_USAGE_CODES;

        this.currentFilter = allowedCodes;

        const filter = this.buildCompleteFilter();
        this.map.setFilter(layerId, filter);
    }

    async setFilter(selectedCodes: string[]): Promise<void> {
        if (!this.map) return;

        const layerId = this.getId();
        if (!this.map.getLayer(layerId)) return;

        this.currentFilter = selectedCodes;

        const filter = this.buildCompleteFilter();
        this.map.setFilter(layerId, filter);
    }

    getOptions(): LayerSpecification[] {
        return [{
            id: this.options.id,
            type: this.options.type as 'fill',
            source: this.options.source,
            "source-layer": this.getSourceLayerName(),
            filter: this.buildCompleteFilter(),
            layout: {
                visibility: this.options.visible ? "visible" : "none",
            },
            paint: {
                "fill-color": this.getColorExpression(),
                "fill-opacity": this.options.opacity ?? 0.7,
                "fill-outline-color": "rgba(0, 0, 0, 0.3)",
            },
        } as LayerSpecification];
    }
}

