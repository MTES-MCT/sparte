import { BaseDiffCentroidClusterLayer } from "./baseDiffCentroidClusterLayer";
import { createDiffDonutChart } from "../utils/donutChart";
import { DONUT_CHART_CONFIGS } from "../constants/config";

export class ArtificialisationDiffCentroidClusterLayer extends BaseDiffCentroidClusterLayer {
    constructor() {
        super(
            "artificialisation-diff-centroid-cluster",
            "artificialisation-diff-centroid-source"
        );
    }

    protected getSourceId(): string {
        return "artificialisation-diff-centroid-source";
    }

    protected createDonutElement(properties: Record<string, any>): HTMLElement {
        return createDiffDonutChart(properties, DONUT_CHART_CONFIGS.artificialisation);
    }
}
