import { BaseSource } from "../sources/baseSource";
import { EmpriseSource } from "../sources/empriseSource";
import { OrthophotoSource } from "../sources/orthophotoSource";
import { OcsgeSource } from "../sources/ocsgeSource";
import { OcsgeDiffSource } from "../sources/ocsgeDiffSource";

type SourceFactory = (config: any) => BaseSource;

const sourceRegistry: Record<string, SourceFactory> = {
    emprise: (cfg) => new EmpriseSource(cfg.land_type, cfg.land_id),
    orthophoto: () => new OrthophotoSource(),
    ocsge: (cfg) => new OcsgeSource(cfg.millesimes, cfg.departements, cfg.millesimeIndex),
    "ocsge-diff": (cfg) => new OcsgeDiffSource(cfg.millesimes, cfg.departements, cfg.startMillesimeIndex, cfg.endMillesimeIndex),
};

export function createSource(cfg: any): BaseSource {
    const factory = sourceRegistry[cfg.type];
    if (!factory) throw new Error(`Unknown source type: ${cfg.type}`);
    return factory(cfg);
}
