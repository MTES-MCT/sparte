import { BaseLayer } from "./baseLayer";
import type { LayerSpecification, FilterSpecification } from 'maplibre-gl';
import type { LayerInterface } from "../types/layerInterface";
import type { Couverture } from "../types/ocsge";
import { COUVERTURE_COLORS, OCSGE_LAYER_NOMENCLATURES } from "../constants/ocsge_nomenclatures";

export class OcsgeFrichesImpermeableLayer extends BaseLayer implements LayerInterface {
    private readonly millesimeIndex: number;
    private readonly fricheSiteIds: string[] = [];
    private readonly impermeableCodes: Couverture[] = [...OCSGE_LAYER_NOMENCLATURES.impermeabilisation.couverture];
    private currentFilter: Couverture[] = [...OCSGE_LAYER_NOMENCLATURES.impermeabilisation.couverture];

    constructor(millesimeIndex: number, fricheSiteIds?: string[]) {
        super({
            id: "ocsge-friches-impermeable-layer",
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
    }

    protected getSourceLayerName(): string {
        return `occupation_du_sol_friche_${this.millesimeIndex}_national`;
    }

    getColorExpression() {
        const cases = this.impermeableCodes.map((code) => [
            "==", ["get", "code_cs"], code
        ]);
        const colorValues = this.impermeableCodes.map((code) => COUVERTURE_COLORS[code]);

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

    private buildCodesFilterExpression(codes: string[]): FilterSpecification {
        if (codes.length === 0) {
            return ["==", ["get", "code_cs"], ""] as FilterSpecification;
        }
        if (codes.length === 1) {
            return ["==", ["get", "code_cs"], codes[0]] as FilterSpecification;
        }
        return ["in", ["get", "code_cs"], ["literal", codes]] as FilterSpecification;
    }

    private buildCompleteFilter(): FilterSpecification {
        const codesFilter = this.buildCodesFilterExpression(this.currentFilter);
        const frichesFilter = this.getFricheSiteIdFilter();

        if (frichesFilter) {
            return ["all", frichesFilter, codesFilter] as FilterSpecification;
        }
        return codesFilter;
    }

    getCurrentNomenclature(): "couverture" {
        return "couverture";
    }

    getLayerNomenclature(): { couverture: Couverture[]; usage: never[] } {
        return {
            couverture: this.impermeableCodes,
            usage: []
        };
    }

    getCurrentFilter(): string[] {
        return this.currentFilter;
    }

    async setFilter(selectedCodes: string[]): Promise<void> {
        if (!this.map) return;

        const layerId = this.getId();
        if (!this.map.getLayer(layerId)) return;

        // Filtrer pour ne garder que les codes imperméables valides
        this.currentFilter = selectedCodes.filter(
            code => this.impermeableCodes.includes(code as Couverture)
        ) as Couverture[];

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

