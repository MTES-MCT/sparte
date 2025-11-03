import { BaseOcsgeDiffLayer } from "./baseOcsgeDiffLayer";
import {
    IMPERMEABILISATION_COLOR,
    DESIMPERMEABILISATION_COLOR,
    IMPERMEABILISATION_FIELD,
    DESIMPERMEABILISATION_FIELD,
    DIFF_FIELDS
} from "../constants/config";
import type { LayerSpecification, FilterSpecification } from 'maplibre-gl';

import type { LandDetailResultType } from "@services/types/land";

export class ImpermeabilisationDiffLayer extends BaseOcsgeDiffLayer {

    constructor(startMillesimeIndex: number, endMillesimeIndex: number, departement: string, landData?: LandDetailResultType) {
        super({
            id: "impermeabilisation-diff-layer",
            type: "fill",
            source: "ocsge-diff-source",
            visible: true,
            opacity: 0.7,
        }, startMillesimeIndex, endMillesimeIndex, departement, landData);
    }

    protected getPositiveField(): string {
        return DIFF_FIELDS.impermeabilisation.positive;
    }

    protected getNegativeField(): string {
        return DIFF_FIELDS.impermeabilisation.negative;
    }

    protected getPositiveColor(): string {
        return DIFF_FIELDS.impermeabilisation.positiveColor;
    }

    protected getNegativeColor(): string {
        return DIFF_FIELDS.impermeabilisation.negativeColor;
    }

    protected getPositiveLabel(): string {
        return DIFF_FIELDS.impermeabilisation.positiveLabel;
    }

    protected getNegativeLabel(): string {
        return DIFF_FIELDS.impermeabilisation.negativeLabel;
    }

    protected getPositiveCode(): string {
        return DIFF_FIELDS.impermeabilisation.positiveCode;
    }

    protected getNegativeCode(): string {
        return DIFF_FIELDS.impermeabilisation.negativeCode;
    }

    getOptions(): LayerSpecification {
        const territoryFilter = this.getTerritoryFilter();

        const dataFilter = [
            "any",
            ["==", ["get", IMPERMEABILISATION_FIELD], true],
            ["==", ["get", DESIMPERMEABILISATION_FIELD], true]
        ] as FilterSpecification;

        const finalFilter = territoryFilter
            ? ["all", territoryFilter, dataFilter] as FilterSpecification
            : dataFilter;

        return {
            id: this.options.id,
            type: this.options.type as 'fill',
            source: this.options.source,
            "source-layer": this.getSourceLayerName(),
            filter: finalFilter,
            layout: {
                visibility: this.options.visible ? "visible" : "none",
            },
            paint: {
                "fill-color": [
                    "case",
                    ["==", ["get", IMPERMEABILISATION_FIELD], true],
                    IMPERMEABILISATION_COLOR,
                    ["==", ["get", DESIMPERMEABILISATION_FIELD], true],
                    DESIMPERMEABILISATION_COLOR,
                    "#fff"
                ],
                "fill-opacity": this.options.opacity ?? 0.7,
                "fill-outline-color": "#000",
            },
        } as LayerSpecification;
    }
}
