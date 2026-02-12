import { BaseLayer } from "./baseLayer";
import type { LayerSpecification, FilterSpecification, ExpressionSpecification } from "maplibre-gl";
import type { LandDetailResultType } from "@services/types/land";

type ExtendedLandData = LandDetailResultType & { startYear?: number; endYear?: number };

export class CarroyageLeaLayer extends BaseLayer {
    private readonly landData: ExtendedLandData;

    constructor(landData: LandDetailResultType) {
        super({
            id: "carroyage-lea-layer",
            type: "fill",
            source: "carroyage-lea-source",
            visible: true,
            opacity: 0.2,
        });
        this.landData = landData as ExtendedLandData;
    }

    private getTerritoryFilter(): FilterSpecification | null {
        if (!this.landData?.land_type || !this.landData?.land_id) {
            return null;
        }
        // Les champs territoire sont des arrays dans le carroyage
        return ["in", this.landData.land_id, ["get", this.landData.land_type]] as FilterSpecification;
    }

    private buildCumulativeExpression(): ExpressionSpecification {
        const startYear = this.landData.startYear || 2011;
        const endYear = this.landData.endYear || 2023;

        // Les données de carroyage commencent en 2011
        const minYear = Math.max(startYear, 2011);
        const maxYear = Math.min(endYear, 2023);

        // Construire la somme des années
        const yearFields: ExpressionSpecification[] = [];
        for (let year = minYear; year <= maxYear; year++) {
            yearFields.push(["coalesce", ["get", `conso_${year}`], 0] as ExpressionSpecification);
        }

        if (yearFields.length === 0) {
            return ["literal", 0] as ExpressionSpecification;
        }

        if (yearFields.length === 1) {
            return yearFields[0];
        }

        // Somme de tous les champs
        return ["+", ...yearFields] as ExpressionSpecification;
    }

    getOptions(): LayerSpecification[] {
        const cumulativeExpression = this.buildCumulativeExpression();

        // Gradient based on cumulative consumption
        const colorExpression = [
            "interpolate",
            ["linear"],
            cumulativeExpression,
            0, "#fee5d9",
            100, "#fcae91",
            500, "#fb6a4a",
            1000, "#de2d26",
            5000, "#a50f15"
        ];

        const territoryFilter = this.getTerritoryFilter();

        return [
            {
                id: this.options.id,
                type: "fill",
                source: this.options.source,
                "source-layer": "carroyage_lea",
                ...(territoryFilter && { filter: territoryFilter }),
                layout: {
                    visibility: this.options.visible ? "visible" : "none"
                },
                paint: {
                    "fill-color": colorExpression,
                    "fill-opacity": this.options.opacity ?? 0.7,
                },
            } as LayerSpecification
        ];
    }
}
