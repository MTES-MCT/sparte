import { BaseSource } from "../sources/baseSource";
import { EmpriseSource } from "../sources/empriseSource";
import { OrthophotoSource } from "../sources/orthophotoSource";
import { OcsgeSource } from "../sources/ocsgeSource";
import { OcsgeDiffSource } from "../sources/ocsgeDiffSource";
import { OcsgeDiffCentroidSource } from "../sources/ocsgeDiffCentroidSource";
import { OcsgeArtifDiffSource } from "../sources/ocsgeArtifDiffSource";
import { OcsgeArtifDiffCentroidSource } from "../sources/ocsgeArtifDiffCentroidSource";
import { FrichesSource } from "../sources/frichesSource";
import { FrichesCentroidSource } from "../sources/frichesCentroidSource";
import { OcsgeFrichesSource } from "../sources/ocsgeFrichesSource";
import { CarroyageLeaSource } from "../sources/carroyageLeaSource";
import { OsmSource } from "../sources/osmSource";
import type { SourceConfig } from "../types/builder";
import type { LandDetailResultType } from "@services/types/land";

type SourceFactory = (landData: LandDetailResultType) => BaseSource;

const sourceRegistry: Record<string, SourceFactory> = {
    emprise: (landData) => new EmpriseSource(landData),
    orthophoto: () => new OrthophotoSource(),
    ocsge: (landData) => new OcsgeSource(landData),
    "ocsge-diff": (landData) => new OcsgeDiffSource(landData),
    "ocsge-diff-centroid": (landData) => new OcsgeDiffCentroidSource(landData),
    "ocsge-artif-diff": (landData) => new OcsgeArtifDiffSource(landData),
    "ocsge-artif-diff-centroid": (landData) => new OcsgeArtifDiffCentroidSource(landData),
    "friches": (landData) => new FrichesSource(landData),
    "friches-centroid": (landData) => new FrichesCentroidSource(landData),
    "ocsge-friches": (landData) => new OcsgeFrichesSource(landData),
    "carroyage-lea": () => new CarroyageLeaSource(),
    "osm": () => new OsmSource(),
};

export function createSource(cfg: SourceConfig, landData: LandDetailResultType): BaseSource {
    const factory = sourceRegistry[cfg.type];
    if (!factory) throw new Error(`Unknown source type: ${cfg.type}`);
    return factory(landData);
}
