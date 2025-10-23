import { BaseDiffCentroidClusterLayer } from "./baseDiffCentroidClusterLayer";
import { createArtificialisationDonutChart } from "../utils/donutChart";

export class ArtificialisationDiffCentroidClusterLayer extends BaseDiffCentroidClusterLayer {
    constructor() {
        super(
            "artificialisation-diff-centroid-cluster",
            "artificialisation-diff-centroid-source",
            "Clusters d'artificialisation (donut charts)",
            "Affiche les clusters sous forme de donut charts"
        );
    }

    protected getSourceId(): string {
        return "artificialisation-diff-centroid-source";
    }

    protected createDonutElement(properties: Record<string, any>): HTMLElement {
        return createArtificialisationDonutChart({
            artificialisation_count: properties.artificialisation_count || 0,
            desartificialisation_count: properties.desartificialisation_count || 0
        });
    }
}
