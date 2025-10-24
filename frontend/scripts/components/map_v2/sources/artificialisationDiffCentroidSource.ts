import { BaseDiffCentroidSource } from "./baseDiffCentroidSource";
import { ARTIFICIALISATION_FIELD, DESARTIFICIALISATION_FIELD } from "../constants/config";
import { LandDetailResultType } from "@services/types/land";

export class ArtificialisationDiffCentroidSource extends BaseDiffCentroidSource {
    constructor(landData: LandDetailResultType) {
        super("artificialisation-diff-centroid-source", landData);
    }

    protected getPositiveField(): string {
        return ARTIFICIALISATION_FIELD;
    }

    protected getNegativeField(): string {
        return DESARTIFICIALISATION_FIELD;
    }

    protected getPositiveCountPropertyName(): string {
        return 'artificialisation_count';
    }

    protected getNegativeCountPropertyName(): string {
        return 'desartificialisation_count';
    }
}
