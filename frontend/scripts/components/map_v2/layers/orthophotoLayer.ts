import { RasterMapLayer } from "../types";
import { MAPLIBRE_STYLES } from "../constants/configMaplibre";

export const orthophotoLayer: RasterMapLayer = {
    id: "orthophoto",
    type: "raster",
    source: "orthophoto",
    style: MAPLIBRE_STYLES.ORTHOPHOTO,
};
