import { BaseSource } from "../sources/baseSource";
import { EmpriseSource } from "../sources/empriseSource";
import { OrthophotoSource } from "../sources/orthophotoSource";
import { OcsgeSource } from "../sources/ocsgeSource";
import { OcsgeDiffSource } from "../sources/ocsgeDiffSource";
import { OcsgeDiffCentroidSource } from "../sources/ocsgeDiffCentroidSource";
import type {
    SourceConfig,
    EmpriseSourceConfig,
    OcsgeSourceConfig,
    OcsgeDiffSourceConfig,
    OcsgeDiffCentroidSourceConfig
} from "../types/registry";

type SourceFactory = (config: SourceConfig) => BaseSource;

const sourceRegistry: Record<string, SourceFactory> = {
    emprise: (cfg) => {
        const empriseConfig = cfg as EmpriseSourceConfig;
        return new EmpriseSource(empriseConfig.land_type, empriseConfig.land_id);
    },
    orthophoto: () => new OrthophotoSource(),
    ocsge: (cfg) => {
        const ocsgeConfig = cfg as OcsgeSourceConfig;
        return new OcsgeSource(ocsgeConfig.millesimes, ocsgeConfig.departements, ocsgeConfig.millesimeIndex);
    },
    "ocsge-diff": (cfg) => {
        const diffConfig = cfg as OcsgeDiffSourceConfig;
        return new OcsgeDiffSource(diffConfig.millesimes, diffConfig.departements, diffConfig.startMillesimeIndex, diffConfig.endMillesimeIndex);
    },
    "ocsge-diff-centroid": (cfg) => {
        const centroidConfig = cfg as OcsgeDiffCentroidSourceConfig;
        return new OcsgeDiffCentroidSource(centroidConfig.startMillesimeIndex, centroidConfig.endMillesimeIndex, centroidConfig.departement);
    },
};

export function createSource(cfg: SourceConfig): BaseSource {
    const factory = sourceRegistry[cfg.type];
    if (!factory) throw new Error(`Unknown source type: ${cfg.type}`);
    return factory(cfg);
}
