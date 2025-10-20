import { BaseLayer } from "../layers/baseLayer";
import { EmpriseLayer } from "../layers/empriseLayer";
import { OrthophotoLayer } from "../layers/orthophotoLayer";
import { ImpermeabilisationLayer } from "../layers/impermeabilisationLayer";
import { ArtificialisationLayer } from "../layers/artificialisationLayer";
import { ImpermeabilisationDiffLayer } from "../layers/impermeabilisationDiffLayer";
import { OcsgeDiffCentroidClusterLayer } from "../layers/ocsgeDiffCentroidClusterLayer";
import { OcsgeDiffCentroidClusterCountLayer } from "../layers/ocsgeDiffCentroidClusterCountLayer";
import type { LayerConfig, OcsgeLayerConfig, OcsgeDiffLayerConfig } from "../types/registry";

type LayerFactory = (config: LayerConfig) => BaseLayer;

const layerRegistry: Record<string, LayerFactory> = {
    emprise: () => new EmpriseLayer(),
    orthophoto: () => new OrthophotoLayer(),
    impermeabilisation: (cfg) => {
        const ocsgeConfig = cfg as OcsgeLayerConfig;
        return new ImpermeabilisationLayer(
            ocsgeConfig.millesimeIndex,
            ocsgeConfig.departement,
            ocsgeConfig.nomenclature ?? "couverture",
            ocsgeConfig.millesimes ?? []
        );
    },
    artificialisation: (cfg) => {
        const ocsgeConfig = cfg as OcsgeLayerConfig;
        return new ArtificialisationLayer(
            ocsgeConfig.millesimeIndex,
            ocsgeConfig.departement,
            ocsgeConfig.nomenclature ?? "couverture",
            ocsgeConfig.millesimes ?? []
        );
    },
    "impermeabilisation-diff": (cfg) => {
        const diffConfig = cfg as OcsgeDiffLayerConfig;
        return new ImpermeabilisationDiffLayer(
            diffConfig.startMillesimeIndex,
            diffConfig.endMillesimeIndex,
            diffConfig.departement
        );
    },
    "ocsge-diff-centroid-cluster": () => new OcsgeDiffCentroidClusterLayer(),
    "ocsge-diff-centroid-cluster-count": () => new OcsgeDiffCentroidClusterCountLayer(),
};

export function createLayer(cfg: LayerConfig): BaseLayer {
    const factory = layerRegistry[cfg.type];
    if (!factory) throw new Error(`Unknown layer type: ${cfg.type}`);
    return factory(cfg);
}
