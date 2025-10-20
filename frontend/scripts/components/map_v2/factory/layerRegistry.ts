import { BaseLayer } from "../layers/baseLayer";
import { EmpriseLayer } from "../layers/empriseLayer";
import { OrthophotoLayer } from "../layers/orthophotoLayer";
import { ImpermeabilisationLayer } from "../layers/impermeabilisationLayer";
import { ArtificialisationLayer } from "../layers/artificialisationLayer";
import { ImpermeabilisationDiffLayer } from "../layers/impermeabilisationDiffLayer";
import { OcsgeDiffCentroidClusterLayer } from "../layers/ocsgeDiffCentroidClusterLayer";
import { OcsgeDiffCentroidClusterCountLayer } from "../layers/ocsgeDiffCentroidClusterCountLayer";

type LayerFactory = (config: any) => BaseLayer;

const layerRegistry: Record<string, LayerFactory> = {
    emprise: () => new EmpriseLayer(),
    orthophoto: () => new OrthophotoLayer(),
    impermeabilisation: (cfg) => new ImpermeabilisationLayer(cfg.millesimeIndex, cfg.departement, cfg.nomenclature ?? "couverture", cfg.millesimes ?? []),
    artificialisation: (cfg) => new ArtificialisationLayer(cfg.millesimeIndex, cfg.departement, cfg.nomenclature ?? "couverture", cfg.millesimes ?? []),
    "impermeabilisation-diff": (cfg) => new ImpermeabilisationDiffLayer(cfg.startMillesimeIndex, cfg.endMillesimeIndex, cfg.departement),
    "ocsge-diff-centroid-cluster": () => new OcsgeDiffCentroidClusterLayer(),
    "ocsge-diff-centroid-cluster-count": () => new OcsgeDiffCentroidClusterCountLayer(),
};

export function createLayer(cfg: any): BaseLayer {
    const factory = layerRegistry[cfg.type];
    if (!factory) throw new Error(`Unknown layer type: ${cfg?.type}`);
    return factory(cfg);
}
