import { BaseLayer } from "../layers/baseLayer";
import { EmpriseLayer } from "../layers/empriseLayer";
import { OrthophotoLayer } from "../layers/orthophotoLayer";
import { ImpermeabilisationLayer } from "../layers/impermeabilisationLayer";
import { ArtificialisationLayer } from "../layers/artificialisationLayer";
import { ImpermeabilisationDiffLayer } from "../layers/impermeabilisationDiffLayer";
import { ImpermeabilisationDiffCentroidClusterLayer } from "../layers/impermeabilisationDiffCentroidClusterLayer";
import { ImpermeabilisationDiffCentroidClusterCountLayer } from "../layers/impermeabilisationDiffCentroidClusterCountLayer";
import { ArtificialisationDiffCentroidClusterLayer } from "../layers/artificialisationDiffCentroidClusterLayer";
import type { LayerConfig, ImpermeabilisationLayerConfig, ArtificialisationLayerConfig } from "../types/builder";
import type { LandDetailResultType } from "@services/types/land";
import { getLastMillesimeIndex, getStartMillesimeIndex, getFirstDepartement, getAvailableMillesimes } from "../utils/ocsge";

type LayerFactory = (config: LayerConfig, landData: LandDetailResultType) => BaseLayer;

const layerRegistry: Record<string, LayerFactory> = {
    emprise: () => new EmpriseLayer(),
    orthophoto: () => new OrthophotoLayer(),
    impermeabilisation: (cfg, landData) => {
        const config = cfg as ImpermeabilisationLayerConfig;
        const millesimeIndex = getLastMillesimeIndex(landData.millesimes);
        const departement = getFirstDepartement(landData.departements);
        const millesimes = getAvailableMillesimes(landData.millesimes);
        return new ImpermeabilisationLayer(
            millesimeIndex,
            departement,
            config.nomenclature ?? "couverture",
            millesimes
        );
    },
    artificialisation: (cfg, landData) => {
        const config = cfg as ArtificialisationLayerConfig;
        const millesimeIndex = getLastMillesimeIndex(landData.millesimes);
        const departement = getFirstDepartement(landData.departements);
        const millesimes = getAvailableMillesimes(landData.millesimes);
        return new ArtificialisationLayer(
            millesimeIndex,
            departement,
            config.nomenclature ?? "couverture",
            millesimes
        );
    },
    "impermeabilisation-diff": (cfg, landData) => {
        const startMillesimeIndex = getStartMillesimeIndex(landData.millesimes);
        const endMillesimeIndex = getLastMillesimeIndex(landData.millesimes);
        const departement = getFirstDepartement(landData.departements);
        return new ImpermeabilisationDiffLayer(
            startMillesimeIndex,
            endMillesimeIndex,
            departement
        );
    },
    "impermeabilisation-diff-centroid-cluster": () => new ImpermeabilisationDiffCentroidClusterLayer(),
    "impermeabilisation-diff-centroid-cluster-count": () => new ImpermeabilisationDiffCentroidClusterCountLayer(),
    "artificialisation-diff-centroid-cluster": () => new ArtificialisationDiffCentroidClusterLayer(),
};

export function createLayer(cfg: LayerConfig, landData: LandDetailResultType): BaseLayer {
    const factory = layerRegistry[cfg.type];
    if (!factory) throw new Error(`Unknown layer type: ${cfg.type}`);
    return factory(cfg, landData);
}
