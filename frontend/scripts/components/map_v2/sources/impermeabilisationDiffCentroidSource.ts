import { BaseDiffCentroidSource } from "./baseDiffCentroidSource";
import { IMPERMEABILISATION_FIELD, DESIMPERMEABILISATION_FIELD } from "../constants/config";
import { LandDetailResultType } from "@services/types/land";

export class ImpermeabilisationDiffCentroidSource extends BaseDiffCentroidSource {
    constructor(landData: LandDetailResultType) {
        super("impermeabilisation-diff-centroid-source", landData);
    }

    protected getPositiveField(): string {
        return IMPERMEABILISATION_FIELD;
    }

    protected getNegativeField(): string {
        return DESIMPERMEABILISATION_FIELD;
    }

    protected getPositiveCountPropertyName(): string {
        return 'impermeabilisation_count';
    }

    protected getNegativeCountPropertyName(): string {
        return 'desimpermeabilisation_count';
    }
}

