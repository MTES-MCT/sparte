import { SourceSpecification } from "maplibre-gl";
import { MapSource } from "../../types";

const sourceMappers = {
  geojson: (mapSource: Extract<MapSource, { type: "geojson" }>) => ({
    type: "geojson" as const,
    data: mapSource.data,
  }),
  vector: (mapSource: Extract<MapSource, { type: "vector" }>) => ({
    type: "vector" as const,
    url: mapSource.url,
    tiles: mapSource.tiles,
  } as SourceSpecification),
  raster: (mapSource: Extract<MapSource, { type: "raster" }>) => ({
    type: "raster" as const,
    tiles: mapSource.tiles,
    tileSize: mapSource.tileSize,
  } as SourceSpecification),
} as const;

export const toMapLibreSource = (mapSource: MapSource): SourceSpecification => {
  const mapper = sourceMappers[mapSource.type];
  if (!mapper) {
    throw new Error(`Type de source non supporté: ${(mapSource as any).type}. Types supportés: geojson, vector, raster`);
  }
  return mapper(mapSource as any);
};

export const toMapLibreSources = (mapSources: MapSource[]): Array<{
  id: string;
  source: SourceSpecification;
}> => {
  return mapSources.map(mapSource => ({
    id: mapSource.id,
    source: toMapLibreSource(mapSource)
  }));
};
