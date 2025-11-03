import { BaseDiffCentroidClusterLayer } from "./baseDiffCentroidClusterLayer";
import { createDiffDonutChart } from "../utils/donutChart";
import { DONUT_CHART_CONFIGS } from "../constants/config";

export class ImpermeabilisationDiffCentroidClusterLayer extends BaseDiffCentroidClusterLayer {
    constructor() {
        super(
            "impermeabilisation-diff-centroid-cluster",
            "ocsge-diff-centroid-source"
        );
    }

    protected getSourceId(): string {
        return "ocsge-diff-centroid-source";
    }

    protected createDonutElement(properties: Record<string, any>): HTMLElement {
        return createDiffDonutChart(properties, DONUT_CHART_CONFIGS.impermeabilisation);
    }
}

