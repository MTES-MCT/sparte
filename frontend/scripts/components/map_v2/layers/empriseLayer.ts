import { LineMapLayer } from "../types";
import { MAPLIBRE_STYLES } from "../constants/configMaplibre";

export const empriseLayer: LineMapLayer = {
    id: "emprise",
    type: "line",
    source: "emprise",
    style: MAPLIBRE_STYLES.EMPRISE,
};
