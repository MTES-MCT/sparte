import { BaseOcsgeDiffSource } from "./baseOcsgeDiffSource";
import type { LandDetailResultType } from "@services/types/land";
import type { SourceSpecification } from "maplibre-gl";

const TILES_PREFIX = "occupation_du_sol_diff";

export class OcsgeDiffSource extends BaseOcsgeDiffSource {
    constructor(landData: LandDetailResultType) {
        super({
            id: "ocsge-diff-source",
            type: "vector",
        }, landData);
    }

    private tileName(departement: string): string {
        return `${TILES_PREFIX}_${this.startMillesimeIndex}_${this.endMillesimeIndex}_${departement}`;
    }

    protected buildOptions(departement: string): SourceSpecification {
        return this.pmtilesOptions(this.tileName(departement));
    }

    protected sourceLayerForDepartement(sourceLayer: string, departement: string): string {
        return sourceLayer.startsWith(`${TILES_PREFIX}_`) ? this.tileName(departement) : sourceLayer;
    }
}
