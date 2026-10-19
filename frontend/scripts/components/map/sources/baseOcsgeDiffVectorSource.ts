import { BaseOcsgeDiffSource } from "./baseOcsgeDiffSource";
import type { LandDetailResultType } from "@services/types/land";
import type { SourceSpecification } from "maplibre-gl";

/**
 * Source de tuiles vectorielles de différence entre deux millésimes OCS GE,
 * nommées `<préfixe>_<millésime début>_<millésime fin>_<département>`.
 */
export abstract class BaseOcsgeDiffVectorSource extends BaseOcsgeDiffSource {
    private readonly tilesPrefix: string;

    constructor(id: string, landData: LandDetailResultType, tilesPrefix: string) {
        super({ id, type: "vector" }, landData);
        this.tilesPrefix = tilesPrefix;
    }

    private tileName(departement: string): string {
        return `${this.tilesPrefix}_${this.startMillesimeIndex}_${this.endMillesimeIndex}_${departement}`;
    }

    protected buildOptions(departement: string): SourceSpecification {
        return this.pmtilesOptions(this.tileName(departement));
    }

    protected sourceLayerForDepartement(sourceLayer: string, departement: string): string {
        return sourceLayer.startsWith(`${this.tilesPrefix}_`) ? this.tileName(departement) : sourceLayer;
    }
}
