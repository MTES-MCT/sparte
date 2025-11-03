import { BaseLayer } from "./baseLayer";
import type { LayerSpecification, FilterSpecification } from 'maplibre-gl';
import { COUVERTURE_COLORS } from "../constants/ocsge_nomenclatures";

export class OcsgeFrichesLayer extends BaseLayer {
    private millesimeIndex: number;
    private fricheSiteIds: string[] = [];

    constructor(millesimeIndex: number, fricheSiteIds?: string[]) {
        super({
            id: "ocsge-friches-layer",
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
        const field = "code_cs";

        const cases = Object.entries(COUVERTURE_COLORS).map(([key]) => [
            "==", ["get", field], key
        ]);
        const colorValues = Object.values(COUVERTURE_COLORS).map((color: string) =>
            color.replace('rgb(', 'rgba(').replace(')', ', 0.7)')
        );

        return [
            "case",
            ...cases.flatMap((case_, index) => [case_, colorValues[index]]),
            "rgba(200, 200, 200, 0.7)"
        ];
    }

    protected getFricheSiteIdFilter(): FilterSpecification | null {
        if (this.fricheSiteIds.length === 0) {
            return ["==", ["get", "friche_site_id"], "___NO_MATCH___"] as FilterSpecification;
        }
        return ["in", ["get", "friche_site_id"], ["literal", this.fricheSiteIds]] as FilterSpecification;
    }

    getOptions(): LayerSpecification[] {
        const frichesFilter = this.getFricheSiteIdFilter();

        return [{
            id: this.options.id,
            type: this.options.type as 'fill',
            source: this.options.source,
            "source-layer": this.getSourceLayerName(),
            filter: frichesFilter || undefined,
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

