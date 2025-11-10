import { BaseLayer } from "./baseLayer";
import type { LineLayerSpecification, ExpressionSpecification } from "maplibre-gl";
import { FRICHE_RECONVERTIE_COLOR, FRICHE_AVEC_PROJET_COLOR, FRICHE_SANS_PROJET_COLOR, FRICHE_DEFAULT_COLOR } from "../constants/config";

export class FrichesOutlineLayer extends BaseLayer {
    constructor() {
        super({
            id: "friches-layer-outline",
            type: "line",
            source: "friches-source",
            visible: true,
        });
    }

    getOptions(): LineLayerSpecification[] {
        const colorExpression: ExpressionSpecification = [
            "match",
            ["get", "friche_statut"],
            "friche reconvertie", FRICHE_RECONVERTIE_COLOR,
            "friche avec projet", FRICHE_AVEC_PROJET_COLOR,
            "friche sans projet", FRICHE_SANS_PROJET_COLOR,
            FRICHE_DEFAULT_COLOR
        ];

        const lineWidthExpression: ExpressionSpecification = [
            "interpolate",
            ["linear"],
            ["zoom"],
            0, 0.2,
            10, 0.5,
            15, 2,
            20, 3
        ];

        return [
            {
                id: this.options.id,
                type: "line",
                source: this.options.source,
                layout: {
                    visibility: this.options.visible ? "visible" : "none"
                },
                paint: {
                    "line-color": colorExpression,
                    "line-width": lineWidthExpression,
                    "line-opacity": 1,
                },
            }
        ];
    }
}

