import { LayerSpecification } from "maplibre-gl";
import { MapLayer } from "../../types";

const layerMappers = {
  line: (mapLayer: Extract<MapLayer, { type: "line" }>) => ({
    id: mapLayer.id,
    source: mapLayer.source,
    type: "line" as const,
    paint: {
      "line-color": mapLayer.style?.color,
      "line-width": mapLayer.style?.width,
      "line-opacity": mapLayer.style?.opacity,
    },
    layout: {
      "line-cap": mapLayer.style?.lineCap,
      "line-join": "round" as const,
    },
  }),
  raster: (mapLayer: Extract<MapLayer, { type: "raster" }>) => ({
    id: mapLayer.id,
    source: mapLayer.source,
    type: "raster" as const,
    paint: {
      "raster-opacity": mapLayer.style?.opacity ?? 1,
    },
  }),
} as const;

export const toMapLibreLayer = (mapLayer: MapLayer): LayerSpecification => {
  const mapper = layerMappers[mapLayer.type];
  if (!mapper) {
    throw new Error(`Type de layer non supporté: ${(mapLayer as any).type}. Types supportés: line, raster`);
  }
  return mapper(mapLayer as any);
};

export const toMapLibreLayers = (mapLayers: MapLayer[]): Array<{
  id: string;
  layer: LayerSpecification;
}> => {
  return mapLayers.map(mapLayer => ({
    id: mapLayer.id,
    layer: toMapLibreLayer(mapLayer)
  }));
};