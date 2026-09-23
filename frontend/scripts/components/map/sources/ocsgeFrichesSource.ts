import { BaseOcsgeSource } from "./baseOcsgeSource";
import type { LandDetailResultType } from "@services/types/land";
import type { SourceSpecification } from "maplibre-gl";
import { getLastMillesimeIndex } from "../utils/ocsge";

export class OcsgeFrichesSource extends BaseOcsgeSource {
    private readonly millesimeIndex: number;

    constructor(landData: LandDetailResultType) {
        super({
            id: "ocsge-friches-source",
            type: "vector",
        }, landData);

        this.millesimeIndex = getLastMillesimeIndex(this.millesimes);
    }

    getOptions(): SourceSpecification {
        const tilesUrl = `${this.vectorTilesUrl}occupation_du_sol_friche_${this.millesimeIndex}_national.pmtiles`;

        return {
            type: this.options.type as 'vector',
            url: `pmtiles://${tilesUrl}`,
        } as SourceSpecification;
    }

    protected updateSourceLayer(sourceLayer: string): string {
        if (sourceLayer.startsWith('occupation_du_sol_friche_')) {
            return `occupation_du_sol_friche_${this.millesimeIndex}_national`;
        }
        return sourceLayer;
    }
}

