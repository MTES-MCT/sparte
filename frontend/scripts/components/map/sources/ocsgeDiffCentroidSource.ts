import { BaseOcsgeDiffCentroidSource } from "./baseOcsgeDiffCentroidSource";
import type { LandDetailResultType } from "@services/types/land";

export class OcsgeDiffCentroidSource extends BaseOcsgeDiffCentroidSource {
    constructor(landData: LandDetailResultType) {
        super(landData, {
            sourceId: "ocsge-diff-centroid-source",
            geojsonPrefix: "occupation_du_sol_diff_centroid",
            increaseProperty: "new_is_impermeable",
            decreaseProperty: "new_not_impermeable",
            increaseCountProperty: "impermeabilisation_count",
            decreaseCountProperty: "desimpermeabilisation_count",
        });
    }
}
