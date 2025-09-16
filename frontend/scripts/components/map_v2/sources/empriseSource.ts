import { MapSource, FeatureCollection } from "../types";

export const empriseSource = (empriseData: FeatureCollection): MapSource => ({
  id: "emprise",
  type: "geojson",
  data: empriseData,
});
