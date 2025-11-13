import { BaseLayer } from "./baseLayer";
import type { LayerSpecification } from "maplibre-gl";
import { FRICHE_RECONVERTIE_COLOR, FRICHE_AVEC_PROJET_COLOR, FRICHE_SANS_PROJET_COLOR, FRICHE_DEFAULT_COLOR } from "../constants/config";

export class FrichesLayer extends BaseLayer {
    constructor() {
        super({
            id: "friches-layer",
            type: "fill",
            source: "friches-source",
            visible: true,
            opacity: 0.5,
            hoverHighlight: {
                enabled: true,
                propertyField: "site_id",
                hoverOpacity: 0
            },
        });
    }

    getOptions(): LayerSpecification[] {
        const colorExpression = [
            "match",
            ["get", "friche_statut"],
            "friche reconvertie", FRICHE_RECONVERTIE_COLOR,
            "friche avec projet", FRICHE_AVEC_PROJET_COLOR,
            "friche sans projet", FRICHE_SANS_PROJET_COLOR,
            FRICHE_DEFAULT_COLOR
        ];

        return [
            {
                id: this.options.id,
                type: "fill",
                source: this.options.source,
                layout: {
                    visibility: this.options.visible ? "visible" : "none"
                },
                paint: {
                    "fill-color": colorExpression,
                    "fill-opacity": this.options.opacity ?? 0.5,
                },
            } as LayerSpecification
        ];
    }
}

