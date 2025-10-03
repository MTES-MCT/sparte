import { BaseLayer } from "../layers/baseLayer";
import { EmpriseLayer } from "../layers/empriseLayer";
import { OrthophotoLayer } from "../layers/orthophotoLayer";
import { ImpermeabilisationLayer } from "../layers/impermeabilisationLayer";
import { ArtificialisationLayer } from "../layers/artificialisationLayer";

type LayerFactory = (config: any) => BaseLayer;

const layerRegistry: Record<string, LayerFactory> = {
    emprise: () => new EmpriseLayer(),
    orthophoto: () => new OrthophotoLayer(),
    impermeabilisation: (cfg) => new ImpermeabilisationLayer(cfg.millesimeIndex, cfg.departement, cfg.nomenclature ?? "couverture", cfg.millesimes ?? []),
    artificialisation: (cfg) => new ArtificialisationLayer(cfg.millesimeIndex, cfg.departement, cfg.nomenclature ?? "couverture", cfg.millesimes ?? []),
};

export function createLayer(cfg: any): BaseLayer {
    const factory = layerRegistry[cfg.type];
    if (!factory) throw new Error(`Unknown layer type: ${cfg?.type}`);
    return factory(cfg);
}
