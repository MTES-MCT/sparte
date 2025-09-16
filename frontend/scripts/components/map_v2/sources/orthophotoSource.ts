import { MapSource } from "../types";
import { TILES_URL } from "../constants/config";

export const orthophotoSource: MapSource = {
  id: "orthophoto",
  type: "raster",
  tiles: [TILES_URL.ORTHOPHOTO],
  tileSize: 256,
};
