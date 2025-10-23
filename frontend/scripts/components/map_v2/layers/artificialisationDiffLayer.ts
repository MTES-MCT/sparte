import { BaseOcsgeDiffLayer } from "./baseOcsgeDiffLayer";
import {
    ARTIFICIALISATION_COLOR,
    DESARTIFICIALISATION_COLOR,
    ARTIFICIALISATION_FIELD,
    DESARTIFICIALISATION_FIELD,
    DIFF_FIELDS
} from "../constants/config";
import type { LayerSpecification, FilterSpecification } from 'maplibre-gl';

export class ArtificialisationDiffLayer extends BaseOcsgeDiffLayer {
    constructor(startMillesimeIndex: number, endMillesimeIndex: number, departement: string) {
        super({
            id: "artificialisation-diff-layer",
            type: "fill",
            source: "ocsge-diff-source",
            visible: true,
            opacity: 0.7,
            label: "Différence d'artificialisation",
            description: "Différence d'artificialisation entre deux millésimes consécutifs. Vert = désartificialisation, Rouge = artificialisation.",
        }, startMillesimeIndex, endMillesimeIndex, departement);
    }

    protected getPositiveField(): string {
        return DIFF_FIELDS.artificialisation.positive;
    }

    protected getNegativeField(): string {
        return DIFF_FIELDS.artificialisation.negative;
    }

    protected getPositiveColor(): string {
        return DIFF_FIELDS.artificialisation.positiveColor;
    }

    protected getNegativeColor(): string {
        return DIFF_FIELDS.artificialisation.negativeColor;
    }

    protected getPositiveLabel(): string {
        return DIFF_FIELDS.artificialisation.positiveLabel;
    }

    protected getNegativeLabel(): string {
        return DIFF_FIELDS.artificialisation.negativeLabel;
    }

    protected getPositiveCode(): string {
        return DIFF_FIELDS.artificialisation.positiveCode;
    }

    protected getNegativeCode(): string {
        return DIFF_FIELDS.artificialisation.negativeCode;
    }

    getOptions(): LayerSpecification {
        return {
            id: this.options.id,
            type: this.options.type as 'fill',
            source: this.options.source,
            "source-layer": this.getSourceLayerName(),
            filter: [
                "any",
                ["==", ["get", ARTIFICIALISATION_FIELD], true],
                ["==", ["get", DESARTIFICIALISATION_FIELD], true]
            ] as FilterSpecification,
            layout: {
                visibility: this.options.visible ? "visible" : "none",
            },
            paint: {
                "fill-color": [
                    "case",
                    ["==", ["get", ARTIFICIALISATION_FIELD], true],
                    ARTIFICIALISATION_COLOR,
                    ["==", ["get", DESARTIFICIALISATION_FIELD], true],
                    DESARTIFICIALISATION_COLOR,
                    "#fff"
                ],
                "fill-opacity": this.options.opacity ?? 0.7,
            },
        } as LayerSpecification;
    }
}
