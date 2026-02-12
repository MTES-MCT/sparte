import { BaseLayer } from "../layers/baseLayer";
import { EmpriseLayer } from "../layers/empriseLayer";
import { OrthophotoLayer } from "../layers/orthophotoLayer";
import { ImpermeabilisationLayer } from "../layers/impermeabilisationLayer";
import { ArtificialisationLayer } from "../layers/artificialisationLayer";
import { ImpermeabilisationDiffLayer } from "../layers/impermeabilisationDiffLayer";
import { ArtificialisationDiffLayer } from "../layers/artificialisationDiffLayer";
import { ImpermeabilisationDiffCentroidClusterLayer } from "../layers/impermeabilisationDiffCentroidClusterLayer";
import { ArtificialisationDiffCentroidClusterLayer } from "../layers/artificialisationDiffCentroidClusterLayer";
import { FrichesLayer } from "../layers/frichesLayer";
import { FrichesOutlineLayer } from "../layers/frichesOutlineLayer";
import { FrichesCentroidClusterLayer } from "../layers/frichesCentroidClusterLayer";
import { OcsgeFrichesLayer } from "../layers/ocsgeFrichesLayer";
import { OcsgeFrichesImpermeableLayer } from "../layers/ocsgeFrichesImpermeableLayer";
import { OcsgeFrichesArtificialLayer } from "../layers/ocsgeFrichesArtificialLayer";
import { CarroyageLeaLayer } from "../layers/carroyageLeaLayer";
import { CarroyageLeaOutlineLayer } from "../layers/carroyageLeaOutlineLayer";
import { OsmLayer } from "../layers/osmLayer";
import type { LayerConfig, ImpermeabilisationLayerConfig, ArtificialisationLayerConfig } from "../types/builder";
import type { LandDetailResultType } from "@services/types/land";
import { getLastMillesimeIndex, getStartMillesimeIndex, getFirstDepartement, getAvailableMillesimes } from "../utils/ocsge";

type LandDetailResultWithFricheSiteIds = LandDetailResultType & { fricheSiteIds?: string[] };

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
            millesimes,
            landData
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
            millesimes,
            landData
        );
    },
    "impermeabilisation-diff": (_cfg, landData) => {
        const startMillesimeIndex = getStartMillesimeIndex(landData.millesimes);
        const endMillesimeIndex = getLastMillesimeIndex(landData.millesimes);
        const departement = getFirstDepartement(landData.departements);
        return new ImpermeabilisationDiffLayer(
            startMillesimeIndex,
            endMillesimeIndex,
            departement,
            landData
        );
    },
    "artificialisation-diff": (_cfg, landData) => {
        const startMillesimeIndex = getStartMillesimeIndex(landData.millesimes);
        const endMillesimeIndex = getLastMillesimeIndex(landData.millesimes);
        const departement = getFirstDepartement(landData.departements);
        return new ArtificialisationDiffLayer(
            startMillesimeIndex,
            endMillesimeIndex,
            departement,
            landData
        );
    },
    "impermeabilisation-diff-centroid-cluster": () => new ImpermeabilisationDiffCentroidClusterLayer(),
    "artificialisation-diff-centroid-cluster": () => new ArtificialisationDiffCentroidClusterLayer(),
    "friches": () => new FrichesLayer(),
    "friches-outline": () => new FrichesOutlineLayer(),
    "friches-centroid-cluster": () => new FrichesCentroidClusterLayer(),
    "ocsge-friches": (cfg, landData) => {
        const config = cfg as { nomenclature?: "couverture" | "usage" };
        const millesimeIndex = getLastMillesimeIndex(landData.millesimes);
        const extendedLandData = landData as LandDetailResultWithFricheSiteIds;
        const fricheSiteIds = extendedLandData.fricheSiteIds;
        return new OcsgeFrichesLayer(millesimeIndex, fricheSiteIds, config.nomenclature);
    },
    "ocsge-friches-impermeable": (_cfg, landData) => {
        const millesimeIndex = getLastMillesimeIndex(landData.millesimes);
        const extendedLandData = landData as LandDetailResultWithFricheSiteIds;
        const fricheSiteIds = extendedLandData.fricheSiteIds;
        return new OcsgeFrichesImpermeableLayer(millesimeIndex, fricheSiteIds);
    },
    "ocsge-friches-artificial": (_cfg, landData) => {
        const millesimeIndex = getLastMillesimeIndex(landData.millesimes);
        const extendedLandData = landData as LandDetailResultWithFricheSiteIds;
        const fricheSiteIds = extendedLandData.fricheSiteIds;
        return new OcsgeFrichesArtificialLayer(millesimeIndex, fricheSiteIds);
    },
    "carroyage-lea": (_cfg, landData) => new CarroyageLeaLayer(landData),
    "carroyage-lea-outline": (_cfg, landData) => new CarroyageLeaOutlineLayer(landData),
    "osm": () => new OsmLayer(),
};

export function createLayer(cfg: LayerConfig, landData: LandDetailResultType): BaseLayer {
    const factory = layerRegistry[cfg.type];
    if (!factory) throw new Error(`Unknown layer type: ${cfg.type}`);
    return factory(cfg, landData);
}
