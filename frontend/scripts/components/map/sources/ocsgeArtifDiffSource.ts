import { BaseOcsgeDiffSource } from "./baseOcsgeDiffSource";
import { OCSGE_TILES_URL } from "../constants/config";
import type { LandDetailResultType } from "@services/types/land";
import type { SourceSpecification } from "maplibre-gl";

export class OcsgeArtifDiffSource extends BaseOcsgeDiffSource {

    constructor(landData: LandDetailResultType) {
        super({
            id: "ocsge-artif-diff-source",
            type: "vector",
        }, landData);
    }

    getOptions(): SourceSpecification {
        const tilesUrl = `${OCSGE_TILES_URL}artif_diff_${this.startMillesimeIndex}_${this.endMillesimeIndex}_${this.departement}.pmtiles`;

        return {
            type: this.options.type as 'vector',
            url: `pmtiles://${tilesUrl}`,
        } as SourceSpecification;
    }


    protected updateSourceLayer(sourceLayer: string): string {
        return `artif_diff_${this.startMillesimeIndex}_${this.endMillesimeIndex}_${this.departement}`;
    }

}

