import type { NationalMapBaseMap, NationalMapInset, NationalMapParent } from '@services/api';
import { getLandTypeLabel } from '@utils/landUtils';
import { mercatorToLngLat } from '../../gridded';
import { ZONE_FRANCE, ZoneNames, filterByZone, zoneLabel, zonePath, zoneToLand } from '../../zones';
import { parentBoundaryOf } from '../parentBoundary';
import type { FrameBase, ZoneHeading } from './types';

// Titre, nature et chemin d'une zone. Sans le fond de la zone (`parent`), un département ou un
// EPCI est nommé par les noms déjà rencontrés, à défaut par son identifiant.
export const zoneHeading = (zone: string, parent: NationalMapParent | null, names?: ZoneNames): ZoneHeading => {
    const land = zoneToLand(zone);
    return {
        title: zoneLabel(zone, parent, names),
        typeLabel: land ? getLandTypeLabel(land.land_type) : '',
        path: zonePath(zone, parent, names),
    };
};

// Étiquette d'un territoire d'outre-mer rapproché de l'Hexagone, et son point d'ancrage en coordonnées projetées
type InsetLabel = { text: string; position: [number, number] };

// Nom de chaque territoire d'outre-mer, ancré juste au-dessus de lui ; sur une petite carte
// (`numbered`), son numéro, ancré à sa gauche
export const insetLabels = (insets: NationalMapInset[], numbered: boolean): InsetLabel[] =>
    insets.map(({ name, bbox: [xmin, ymin, xmax, ymax] }, index) =>
        numbered ? { text: String(index + 1), position: [xmin, (ymin + ymax) / 2] } : { text: name, position: [(xmin + xmax) / 2, ymax] },
    );

// Les mêmes étiquettes pour une carte MapLibre : leur ancrage en longitude et latitude, et le côté
// de l'étiquette posé sur ce point
export const insetMapLabels = (insets: NationalMapInset[], numbered: boolean): { text: string; position: [number, number]; anchor: 'bottom' | 'right' }[] =>
    insetLabels(insets, numbered).map(({ text, position }) => ({ text, position: mercatorToLngLat(position), anchor: numbered ? 'right' : 'bottom' }));

// Un fond sert plusieurs zones (France entière et Hexagone) et plusieurs cartes : chaque couple
// fond-zone n'est décrit qu'une fois, pour que les territoires gardent leur identité d'une carte à l'autre
const bases = new WeakMap<NationalMapBaseMap, Map<string, FrameBase>>();

const describeBase = (zone: string, baseMap: NationalMapBaseMap): FrameBase => {
    const wholeFrance = zone === ZONE_FRANCE;
    return {
        ...zoneHeading(zone, baseMap.parent),
        key: `${zone}|${baseMap.scale}`,
        zone,
        scale: baseMap.scale,
        baseMap,
        parent: baseMap.parent,
        features: filterByZone(baseMap.geojson.features, zone),
        insets: wholeFrance ? baseMap.insets : [],
        separation: wholeFrance ? baseMap.separation : [],
        parentBoundary: parentBoundaryOf(baseMap),
        wholeFrance,
        clickable: baseMap.scale !== 'COMM',
    };
};

// Fond d'une zone : ses territoires, ses cartouches d'outre-mer, son titre et son chemin
export const buildBase = (zone: string, baseMap: NationalMapBaseMap): FrameBase => {
    const byZone = bases.get(baseMap) ?? new Map<string, FrameBase>();
    bases.set(baseMap, byZone);
    const base = byZone.get(zone) ?? describeBase(zone, baseMap);
    byZone.set(zone, base);
    return base;
};
