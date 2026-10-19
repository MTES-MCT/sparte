import { BaseOcsgeDiffVectorSource } from "./baseOcsgeDiffVectorSource";
import type { LandDetailResultType } from "@services/types/land";

export class OcsgeDiffSource extends BaseOcsgeDiffVectorSource {
    constructor(landData: LandDetailResultType) {
        super("ocsge-diff-source", landData, "occupation_du_sol_diff");
    }
}
