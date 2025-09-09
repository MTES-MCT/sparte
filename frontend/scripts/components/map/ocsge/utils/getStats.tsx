import { Couverture, couvertures, Usage, usages } from "../constants/cs_and_us";
import { area } from "@turf/turf";
import { Selection, SelectionName } from "../constants/selections";
import { OcsgeTileFeatureProperties } from "../VectorTileFeature";


export type Stat = {
  code: Couverture | Usage;
  percent: number;
};

export type OcsgeStats = {
  couvertures: Stat[];
  usages: Stat[];
};
export const getStats = (selection: Selection, features: maplibregl.MapGeoJSONFeature[]) => {
    if (selection.croisement) {
        // Ne pas afficher les stats pour les croisements
        return []
    }

    // Collecte les stats en hashmap
    const rawStats = features.reduce((acc, feature) => {
      const { code_cs, code_us } = feature.properties as OcsgeTileFeatureProperties;

      if (selection.name === SelectionName.COUVERTURES) {
        if (!acc[code_cs]) {
            acc[code_cs] = 0;    
        }
        acc[code_cs] += area(feature.geometry);
      } else if (selection.name === SelectionName.USAGES) {
        if (!acc[code_us]) {
            acc[code_us] = 0;
        }
        acc[code_us] += area(feature.geometry);
      }
      return acc;
    
    }, {} as any);

    // Formatte les stats en tableau
    const totalSurface = Object.values(rawStats)
      .filter((surface: number) => !isNaN(surface))
      .reduce((acc: number, surface: number) => acc + surface, 0) as number

    
    const stats: Stat[] = []

    if (selection.name === SelectionName.COUVERTURES) {
        couvertures.forEach((couverture) => {
            const surface = rawStats[couverture] || 0;
            const percent = (surface / totalSurface) * 100;
            stats.push({ code: couverture, percent });
        });
    } else if (selection.name === SelectionName.USAGES) {
        usages.forEach((usage) => {
            const surface = rawStats[usage] || 0;
            const percent = (surface / totalSurface) * 100;
            stats.push({ code: usage, percent });
        });
    }
    return stats
  };
