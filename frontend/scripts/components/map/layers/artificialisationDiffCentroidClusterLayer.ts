import { BaseDiffCentroidClusterLayer } from "./baseDiffCentroidClusterLayer";
import { createDiffDonutChart } from "../utils/donutChart";
import { DONUT_CHART_CONFIGS, OCSGE_DIFF_OBJECTS_MIN_ZOOM, OCSGE_DIFF_DONUTS_FADE_OUT_ZOOM } from "../constants/config";
import type { LandDetailResultType } from "@services/types/land";

export class ArtificialisationDiffCentroidClusterLayer extends BaseDiffCentroidClusterLayer {
    constructor(landData?: LandDetailResultType) {
        super("artificialisation-diff-centroid-cluster", "ocsge-artif-diff-centroid-source", {
            objectsMinZoom: OCSGE_DIFF_OBJECTS_MIN_ZOOM,
            donutsFadeOutZoom: OCSGE_DIFF_DONUTS_FADE_OUT_ZOOM,
            objectsLayerId: "artificialisation-diff-layer",
            communeGrouping: {
                communeProperty: "COMM",
                increaseProperty: "new_is_artificial",
                decreaseProperty: "new_not_artificial",
                increaseCountProperty: DONUT_CHART_CONFIGS.artificialisation.positiveKey,
                decreaseCountProperty: DONUT_CHART_CONFIGS.artificialisation.negativeKey,
            },
            landData,
        });
    }

    protected getSourceId(): string {
        return "ocsge-artif-diff-centroid-source";
    }

    protected createDonutElement(properties: Record<string, any>): HTMLElement {
        return createDiffDonutChart(properties, DONUT_CHART_CONFIGS.artificialisation);
    }
}
