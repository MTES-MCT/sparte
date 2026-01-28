import { BaseLayer } from "./baseLayer";
import type { LayerSpecification, FilterSpecification } from "maplibre-gl";
import type { LandDetailResultType } from "@services/types/land";

export class CarroyageLeaOutlineLayer extends BaseLayer {
    private readonly landData: LandDetailResultType;

    constructor(landData: LandDetailResultType) {
        super({
            id: "carroyage-lea-layer-outline",
            type: "line",
            source: "carroyage-lea-source",
            visible: true,
            opacity: 0.5,
        });
        this.landData = landData;
    }

    private getTerritoryFilter(): FilterSpecification | null {
        if (!this.landData?.land_type || !this.landData?.land_id) {
            return null;
        }
        // Les champs territoire sont des arrays dans le carroyage
        return ["in", this.landData.land_id, ["get", this.landData.land_type]] as FilterSpecification;
    }

    getOptions(): LayerSpecification[] {
        const territoryFilter = this.getTerritoryFilter();

        return [
            {
                id: this.options.id,
                type: "line",
                source: this.options.source,
                "source-layer": "carroyage_lea",
                ...(territoryFilter && { filter: territoryFilter }),
                layout: {
                    visibility: this.options.visible ? "visible" : "none"
                },
                paint: {
                    "line-color": "#000000",
                    "line-width": 1,
                    "line-opacity": this.options.opacity ?? 0.8,
                },
            } as LayerSpecification
        ];
    }
}
