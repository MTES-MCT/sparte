import { BaseDiffCentroidClusterLayer } from "./baseDiffCentroidClusterLayer";
import { createImpermeabilisationDonutChart } from "../utils/donutChart";

export class ImpermeabilisationDiffCentroidClusterLayer extends BaseDiffCentroidClusterLayer {
    constructor() {
        super(
            "impermeabilisation-diff-centroid-cluster",
            "impermeabilisation-diff-centroid-source"
        );
    }

    protected getSourceId(): string {
        return "impermeabilisation-diff-centroid-source";
    }

    protected createDonutElement(properties: Record<string, any>): HTMLElement {
        return createImpermeabilisationDonutChart({
            impermeabilisation_count: properties.impermeabilisation_count || 0,
            desimpermeabilisation_count: properties.desimpermeabilisation_count || 0
        });
    }
}

