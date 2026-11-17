// Cadrage de la vue dense : la carte MapLibre des communes montre la même emprise que la carte par
// département dont elle emprunte le fond. Le fond est en coordonnées projetées (EPSG:3857), les
// tuiles des communes en longitudes et latitudes.
import { Bounds, extendBounds, mercatorToLngLat } from '../../gridded';
import type { FrameBase } from '../frame/types';

// [xmin, ymin, xmax, ymax], en mètres
export type Extent = [number, number, number, number];

// Emprise de la zone affichée : ses départements et, sur la France entière, les cartouches des
// territoires d'outre-mer rapprochés de l'Hexagone et la ligne qui les en sépare. null sans territoire.
export const zoneExtent = ({ features, insets, separation }: Pick<FrameBase, 'features' | 'insets' | 'separation'>): Extent | null => {
    const extent = [Infinity, Infinity, -Infinity, -Infinity];
    features.forEach((feature) => extendBounds(feature.geometry.coordinates, extent));
    insets.forEach(({ bbox: [xmin, ymin, xmax, ymax] }) => extendBounds([[xmin, ymin], [xmax, ymax]], extent));
    extendBounds(separation, extent);
    return Number.isFinite(extent[0]) ? (extent as Extent) : null;
};

// La même emprise pour MapLibre : [[ouest, sud], [est, nord]]
export const extentToLngLat = ([xmin, ymin, xmax, ymax]: Extent): Bounds => [mercatorToLngLat([xmin, ymin]), mercatorToLngLat([xmax, ymax])];
