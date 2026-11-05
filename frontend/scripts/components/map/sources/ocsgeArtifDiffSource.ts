import { BaseOcsgeDiffVectorSource } from "./baseOcsgeDiffVectorSource";
import type { LandDetailResultType } from "@services/types/land";

export class OcsgeArtifDiffSource extends BaseOcsgeDiffVectorSource {
    constructor(landData: LandDetailResultType) {
        super("ocsge-artif-diff-source", landData, "artif_diff");
    }
}
