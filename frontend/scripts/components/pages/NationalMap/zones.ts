// Zones d'affichage de la carte nationale : la France entière, l'Hexagone (métropole sans
// la Corse) ou n'importe quel territoire (région, département, EPCI), codé `TYPE_identifiant`.
// La carte montre les territoires d'une maille plus fine que la zone.
import { landTypeCodeToSlug } from '@utils/landUtils';

export const ZONE_FRANCE = 'FRANCE';
export const ZONE_HEXAGONE = 'HEXAGONE';

export type LandRef = { land_type: string; land_id: string };
type ParentInfo = LandRef & { name: string; ancestors: (LandRef & { name: string })[] };

// Niveaux emboîtés, du plus large au plus fin (mêmes codes que le backend)
export const LEVELS = ['NATION', 'REGION', 'DEPART', 'EPCI', 'COMM'];

export const SCALE_LABELS: Record<string, string> = {
    REGION: 'Région',
    DEPART: 'Département',
    EPCI: 'EPCI',
    COMM: 'Commune',
};

// Codes INSEE des régions : propriété `region` des territoires renvoyés par l'endpoint du fond de carte
export const REGIONS: { code: string; label: string }[] = [
    { code: '84', label: 'Auvergne-Rhône-Alpes' },
    { code: '27', label: 'Bourgogne-Franche-Comté' },
    { code: '53', label: 'Bretagne' },
    { code: '24', label: 'Centre-Val de Loire' },
    { code: '94', label: 'Corse' },
    { code: '44', label: 'Grand Est' },
    { code: '01', label: 'Guadeloupe' },
    { code: '03', label: 'Guyane' },
    { code: '32', label: 'Hauts-de-France' },
    { code: '11', label: 'Île-de-France' },
    { code: '04', label: 'La Réunion' },
    { code: '02', label: 'Martinique' },
    { code: '06', label: 'Mayotte' },
    { code: '28', label: 'Normandie' },
    { code: '75', label: 'Nouvelle-Aquitaine' },
    { code: '76', label: 'Occitanie' },
    { code: '52', label: 'Pays de la Loire' },
    { code: '93', label: "Provence-Alpes-Côte d'Azur" },
];

// Régions hors Hexagone : la Corse et les régions d'outre-mer
const REGIONS_OUTSIDE_HEXAGONE = new Set(['94', '01', '02', '03', '04', '06']);

export const isRegionInHexagone = (regionCode: string): boolean => !REGIONS_OUTSIDE_HEXAGONE.has(regionCode);

// Un territoire dont on ne connaît que la région fait-il partie d'une zone nationale ? Toujours
// pour la France entière ; pour l'Hexagone, s'il n'est ni en Corse ni outre-mer.
export const isRegionInZone = (regionCode: string | null, zone: string): boolean =>
    zone !== ZONE_HEXAGONE || (regionCode !== null && isRegionInHexagone(regionCode));

export const zoneToLand = (zone: string): LandRef | null => {
    if (zone === ZONE_FRANCE || zone === ZONE_HEXAGONE) return null;
    const separator = zone.indexOf('_');
    if (separator < 0) return null;
    return { land_type: zone.slice(0, separator), land_id: zone.slice(separator + 1) };
};

export const landToZone = (land: LandRef): string => `${land.land_type}_${land.land_id}`;

const NATION: LandRef = { land_type: 'NATION', land_id: 'NATION' };

// Territoire des graphiques complémentaires d'une zone. La France entière et l'Hexagone ne sont
// pas des territoires en base : les graphiques de la nation les remplacent.
export const chartsLandOf = (zone: string): LandRef => zoneToLand(zone) ?? NATION;

export const isValidZone = (zone: string): boolean => {
    if (zone === ZONE_FRANCE || zone === ZONE_HEXAGONE) return true;
    const land = zoneToLand(zone);
    return land !== null && ['REGION', 'DEPART', 'EPCI'].includes(land.land_type) && land.land_id.length > 0;
};

export const zoneLevel = (zone: string): string => zoneToLand(zone)?.land_type ?? 'NATION';

// Mailles affichables pour une zone : toutes celles qui sont strictement plus fines qu'elle, la
// commune comprise pour la France entière et l'Hexagone
export const availableScales = (zone: string): string[] => LEVELS.slice(LEVELS.indexOf(zoneLevel(zone)) + 1);

// Maille à l'ouverture d'une zone : le niveau juste en dessous, sauf pour les zones nationales, qui
// s'ouvrent par EPCI, maille assez fine pour montrer les contrastes locaux à l'échelle du pays
const NATIONAL_DEFAULT_SCALE = 'EPCI';

export const defaultScale = (zone: string): string => (zoneLevel(zone) === 'NATION' ? NATIONAL_DEFAULT_SCALE : availableScales(zone)[0]);

// Maille à laquelle une carte s'ouvre sur une zone : la sienne pour ce niveau de zone si elle en
// déclare une (`openingScales` du catalogue) et que la zone la propose ; null sinon
export const ownOpeningScale = (zone: string, openingScales: Record<string, string> | undefined): string | null => {
    const own = openingScales?.[zoneLevel(zone)];
    return own && availableScales(zone).includes(own) ? own : null;
};

export const regionLabel = (code: string): string => REGIONS.find((region) => region.code === code)?.label ?? code;

// Noms de territoires déjà connus (zone -> nom), pour nommer une zone avant que son fond de carte soit chargé
export type ZoneNames = Record<string, string>;

export const zoneLabel = (zone: string, parent?: ParentInfo | null, names?: ZoneNames): string => {
    if (zone === ZONE_FRANCE) return 'France entière';
    if (zone === ZONE_HEXAGONE) return 'Hexagone';
    const land = zoneToLand(zone);
    if (!land) return zone;
    if (land.land_type === 'REGION') return regionLabel(land.land_id);
    if (parent?.land_type === land.land_type && parent?.land_id === land.land_id) return parent.name;
    return names?.[zone] ?? land.land_id;
};

// URL du diagnostic de la zone : Django redirige l'identifiant seul vers l'adresse canonique
// (identifiant-nom) ; la France entière et l'Hexagone renvoient au diagnostic national
export const diagnosticUrl = (zone: string): string => {
    const land = zoneToLand(zone);
    if (!land) return '/diagnostic/nation/france';
    return `/diagnostic/${landTypeCodeToSlug(land.land_type)}/${land.land_id}`;
};

// Territoires du fond de carte appartenant à la zone : seul l'Hexagone demande un filtre,
// les autres zones reçoivent un fond déjà limité au parent
export const filterByZone = <T extends { properties: { zone: string } }>(features: T[], zone: string): T[] =>
    zone === ZONE_HEXAGONE ? features.filter((f) => f.properties.zone === ZONE_HEXAGONE) : features;

// Chemin d'une zone depuis la France entière, pour le fil d'Ariane
export const zonePath = (zone: string, parent?: ParentInfo | null, names?: ZoneNames): { zone: string; label: string }[] => {
    const path = [{ zone: ZONE_FRANCE, label: zoneLabel(ZONE_FRANCE) }];
    if (zone === ZONE_FRANCE) return path;
    if (zone === ZONE_HEXAGONE) return [...path, { zone: ZONE_HEXAGONE, label: zoneLabel(ZONE_HEXAGONE) }];
    const land = zoneToLand(zone);
    if (!land) return path;
    const ancestors = parent?.land_type === land.land_type && parent?.land_id === land.land_id ? parent.ancestors : [];
    const regionCode = land.land_type === 'REGION' ? land.land_id : ancestors.find((a) => a.land_type === 'REGION')?.land_id;
    if (regionCode && isRegionInHexagone(regionCode)) path.push({ zone: ZONE_HEXAGONE, label: zoneLabel(ZONE_HEXAGONE) });
    ancestors.forEach((ancestor) => path.push({ zone: landToZone(ancestor), label: ancestor.name }));
    path.push({ zone, label: zoneLabel(zone, parent, names) });
    return path;
};
