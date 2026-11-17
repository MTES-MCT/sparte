// Limite de la zone sur une carte MapLibre : une source d'une seule entité et deux couches, le
// liseré puis le tireté, de l'aspect commun aux deux moteurs (voir PARENT_BOUNDARY_STYLE). Aucune
// de ces couches n'est interrogée par le survol ni par le clic : la limite ne capte rien.
import type { GeoJSONSource, LayerSpecification, Map as MapLibreMap } from 'maplibre-gl';
import { BoundaryLines, PARENT_BOUNDARY_STYLE, parentBoundaryFeature } from '../../domain/parentBoundary';

export const PARENT_BOUNDARY_SOURCE = 'national-map-parent-boundary';
export const PARENT_BOUNDARY_CASING = 'national-map-parent-boundary-casing';
export const PARENT_BOUNDARY_LINE = 'national-map-parent-boundary-line';

const { color, widthPx, casingColor, casingWidthPx, dash } = PARENT_BOUNDARY_STYLE;
const JOINED = { 'line-join': 'round' } as const;

export const PARENT_BOUNDARY_LAYERS: LayerSpecification[] = [
    { id: PARENT_BOUNDARY_CASING, type: 'line', source: PARENT_BOUNDARY_SOURCE, layout: JOINED, paint: { 'line-color': casingColor, 'line-width': casingWidthPx } },
    // Tirets à bouts droits : arrondis, ils déborderaient sur les intervalles
    { id: PARENT_BOUNDARY_LINE, type: 'line', source: PARENT_BOUNDARY_SOURCE, layout: JOINED, paint: { 'line-color': color, 'line-width': widthPx, 'line-dasharray': [...dash] } },
];

type BoundedMap = Pick<MapLibreMap, 'getSource' | 'addSource' | 'addLayer'>;

// Trace la limite, ou l'efface quand `lines` est vide. La source et ses couches sont posées au
// premier appel, même sans limite : au-dessus des couches déjà là (territoires, mailles, image,
// objets, tous glissés ensuite sous les limites administratives) et sous le contour de l'élément
// survolé, posé plus tard. Ensuite seules les données de la source changent.
export const drawParentBoundary = (map: BoundedMap, lines: BoundaryLines): void => {
    const data = parentBoundaryFeature(lines);
    const source = map.getSource(PARENT_BOUNDARY_SOURCE) as GeoJSONSource | undefined;
    if (source) {
        source.setData(data);
        return;
    }
    map.addSource(PARENT_BOUNDARY_SOURCE, { type: 'geojson', data });
    PARENT_BOUNDARY_LAYERS.forEach((layer) => map.addLayer(layer));
};
