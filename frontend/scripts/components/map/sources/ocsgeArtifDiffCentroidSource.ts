import { BaseOcsgeDiffCentroidSource } from "./baseOcsgeDiffCentroidSource";
import type { LandDetailResultType } from "@services/types/land";

export class OcsgeArtifDiffCentroidSource extends BaseOcsgeDiffCentroidSource {
    constructor(landData: LandDetailResultType) {
        super(landData, {
            sourceId: "ocsge-artif-diff-centroid-source",
            geojsonPrefix: "artif_diff_centroid",
            increaseProperty: "new_is_artificial",
            decreaseProperty: "new_not_artificial",
            increaseCountProperty: "artificialisation_count",
            decreaseCountProperty: "desartificialisation_count",
        });
    }
}
