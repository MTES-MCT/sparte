import { BaseLayer } from "./baseLayer";
import type { LayerSpecification, FilterSpecification } from 'maplibre-gl';
import type { LayerInterface } from "../types/layerInterface";
import { ARTIFICIALISATION_COLOR } from "../constants/config";

export class OcsgeFrichesArtificialLayer extends BaseLayer implements LayerInterface {
    private readonly millesimeIndex: number;
    private readonly fricheSiteIds: string[] = [];

    constructor(millesimeIndex: number, fricheSiteIds?: string[]) {
        super({
            id: "ocsge-friches-artificial-layer",
            type: "fill",
            source: "ocsge-friches-source",
            visible: true,
            opacity: 0.7,
        });

        this.millesimeIndex = millesimeIndex;
        this.fricheSiteIds = fricheSiteIds || [];
    }

    protected getSourceLayerName(): string {
        return `occupation_du_sol_friche_${this.millesimeIndex}_national`;
    }

    getColorExpression() {
        return ARTIFICIALISATION_COLOR;
    }

    protected getFricheSiteIdFilter(): FilterSpecification | null {
        if (this.fricheSiteIds.length === 0) {
            return ["==", ["get", "friche_site_id"], "___NO_MATCH___"] as FilterSpecification;
        }
        return ["in", ["get", "friche_site_id"], ["literal", this.fricheSiteIds]] as FilterSpecification;
    }

    private buildCompleteFilter(): FilterSpecification {
        const artificialFilter: FilterSpecification = ["==", ["get", "is_artificial"], true];
        const frichesFilter = this.getFricheSiteIdFilter();

        if (frichesFilter) {
            return ["all", frichesFilter, artificialFilter] as FilterSpecification;
        }
        return artificialFilter;
    }

    getCurrentNomenclature(): "couverture" {
        return "couverture";
    }

    getLayerNomenclature(): { couverture: any[]; usage: any[] } {
        return {
            couverture: [],
            usage: []
        };
    }

    getCurrentFilter(): string[] {
        return [];
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
            },
        } as LayerSpecification];
    }
}

