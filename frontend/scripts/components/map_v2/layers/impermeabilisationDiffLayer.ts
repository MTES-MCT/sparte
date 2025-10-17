import { BaseLayer } from "./baseLayer";
import { IMPERMEABILISATION_COLOR, DESIMPERMEABILISATION_COLOR } from "../constants/config";

const IMPERMEABILISATION_FIELD = "new_is_impermeable";
const DESIMPERMEABILISATION_FIELD = "new_not_impermeable";

export class ImpermeabilisationDiffLayer extends BaseLayer {
    private startMillesimeIndex: number;
    private endMillesimeIndex: number;
    private departement: string;

    constructor(startMillesimeIndex: number, endMillesimeIndex: number, departement: string) {
        super({
            id: "impermeabilisation-diff-layer",
            type: "fill",
            source: "ocsge-diff-source",
            visible: true,
            opacity: 0.7,
            label: "Différence d'imperméabilisation",
            description: "Différence d'imperméabilisation entre deux millésimes consécutifs. Vert = désimperméabilisation, Rouge = imperméabilisation.",
        });

        this.startMillesimeIndex = startMillesimeIndex;
        this.endMillesimeIndex = endMillesimeIndex;
        this.departement = departement;
    }

    getOptions() {
        return {
            id: this.options.id,
            type: this.options.type,
            source: this.options.source,
            "source-layer": this.getSourceLayerName(),
            filter: [
                "any",
                ["==", ["get", IMPERMEABILISATION_FIELD], true],
                ["==", ["get", DESIMPERMEABILISATION_FIELD], true]
            ],
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
            },
        };
    }

    private getSourceLayerName(): string {
        return `occupation_du_sol_diff_${this.startMillesimeIndex}_${this.endMillesimeIndex}_${this.departement}`;
    }

    async setMillesimes(newStartIndex: number, newEndIndex: number): Promise<void> {
        if (!this.map || !this.map.getLayer(this.options.id)) {
            return;
        }

        this.startMillesimeIndex = newStartIndex;
        this.endMillesimeIndex = newEndIndex;

        this.map.setLayoutProperty(this.options.id, "source-layer", this.getSourceLayerName());
    }

    getStartMillesimeIndex(): number {
        return this.startMillesimeIndex;
    }

    getEndMillesimeIndex(): number {
        return this.endMillesimeIndex;
    }

    getDepartement(): string {
        return this.departement;
    }
}
