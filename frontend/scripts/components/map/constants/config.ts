export const APP_DEFAULTS = {
	ZOOM: 15,
	DURATION: 2000,
	FIT_OPTIONS: {
		padding: { top: 50, bottom: 50, left: 50, right: 50 },
		speed: 0.1,
	},
} as const;

export const ORTHOPHOTO_TILES_URL = "https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=HR.ORTHOIMAGERY.ORTHOPHOTOS&tilematrixset=PM&TileMatrix={z}&TileCol={x}&TileRow={y}&format=image%2Fjpeg&style=normal";

export const OSM_TILES_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

// Bornes des colonnes conso_<année> présentes dans les tuiles carroyage LEA.
// Millésime 2011-2025 du Cerema : conso_2011 … conso_2024.
export const CARROYAGE_FIRST_YEAR = 2011;
export const CARROYAGE_LAST_YEAR = 2024;

// Zoom à partir duquel la carte de différence OCS GE passe du mode « bilan »
// (donuts de clusters) au mode « objets » (polygones). Le fondu entre les deux
// se fait sur le niveau de zoom qui précède.
export const OCSGE_DIFF_OBJECTS_MIN_ZOOM = 13;

// Au clic sur un donut, la carte cadre l'étendue de ses objets sans dépasser ce zoom.
export const OCSGE_DIFF_DONUT_CLICK_MAX_ZOOM = 17;

// Les donuts restent affichés au-dessus des objets et s'effacent en zoom
// rapproché : fondu sur le niveau qui précède ce zoom, disparition à ce zoom.
export const OCSGE_DIFF_DONUTS_FADE_OUT_ZOOM = 15;

// Regroupement des objets sous le seuil : par commune tant qu'au moins deux
// communes sont visibles à l'écran, par proximité sinon (rayon en pixels).
export const OCSGE_DIFF_MIN_COMMUNES_FOR_COMMUNE_MODE = 2;
export const OCSGE_DIFF_PROXIMITY_CLUSTER_RADIUS_PX = 60;

// Au survol d'un donut : la zone couverte par ses objets (enveloppe convexe
// tamponnée) et le contour pulsant de chacun de ses polygones.
export const OCSGE_DIFF_CLUSTER_HOVER_MAX_LEAVES = 500; // garde-fou
export const OCSGE_DIFF_CLUSTER_HOVER_COLOR = "#444444";
export const OCSGE_DIFF_CLUSTER_ZONE_FILL_OPACITY = 0.12;
export const OCSGE_DIFF_CLUSTER_ZONE_PADDING_PX = 12;
export const OCSGE_DIFF_HOVER_OUTLINE_MIN_WIDTH = 1;
export const OCSGE_DIFF_HOVER_OUTLINE_MAX_WIDTH = 3;
export const OCSGE_DIFF_HOVER_OUTLINE_PULSE_PERIOD_MS = 1200;

// Les tuiles de polygones sont chargées dès ce zoom (invisibles avant le seuil)
// pour pouvoir retrouver les polygones d'un cluster survolé.
export const OCSGE_DIFF_TILES_MIN_ZOOM = 9;

// Contour pulsant permanent des objets, une fois les donuts effacés : apparaît
// en fondu pendant que les donuts s'estompent, puis reste à tous les zooms.
// Tant que les donuts sont visibles, seul le survol d'un donut fait pulser ses objets.
export const OCSGE_DIFF_OUTLINE_COLOR = "#333333";
export const OCSGE_DIFF_OUTLINE_PULSE_PERIOD_MS = 1800;
export const OCSGE_DIFF_OUTLINE_MIN_WIDTH = 0.5;
export const OCSGE_DIFF_OUTLINE_MAX_WIDTH = 2.5;

export const ARTIFICIALISATION_COLOR = "#FA4B42"
export const DESARTIFICIALISATION_COLOR = "#00ce67"
export const IMPERMEABILISATION_COLOR = "#FA4B42"
export const DESIMPERMEABILISATION_COLOR = "#00ce67"

export const FRICHE_RECONVERTIE_COLOR = "#18753C"
export const FRICHE_AVEC_PROJET_COLOR = "#0063CB"
export const FRICHE_SANS_PROJET_COLOR = "#B34000"
export const FRICHE_DEFAULT_COLOR = "#FFFFFF"

export const IMPERMEABILISATION_FIELD = "new_is_impermeable";
export const DESIMPERMEABILISATION_FIELD = "new_not_impermeable";
export const ARTIFICIALISATION_FIELD = "new_is_artificial";
export const DESARTIFICIALISATION_FIELD = "new_not_artificial";

export const DIFF_FIELDS = {
	impermeabilisation: {
		positive: IMPERMEABILISATION_FIELD,
		negative: DESIMPERMEABILISATION_FIELD,
		positiveColor: IMPERMEABILISATION_COLOR,
		negativeColor: DESIMPERMEABILISATION_COLOR,
		positiveLabel: 'Imperméabilisation',
		negativeLabel: 'Désimperméabilisation',
		positiveCode: 'impermeabilisation',
		negativeCode: 'desimpermeabilisation',
	},
	artificialisation: {
		positive: ARTIFICIALISATION_FIELD,
		negative: DESARTIFICIALISATION_FIELD,
		positiveColor: ARTIFICIALISATION_COLOR,
		negativeColor: DESARTIFICIALISATION_COLOR,
		positiveLabel: 'Artificialisation',
		negativeLabel: 'Désartificialisation',
		positiveCode: 'artificialisation',
		negativeCode: 'desartificialisation',
	}
} as const;

export const DONUT_CHART_CONFIGS = {
	impermeabilisation: {
		positiveKey: 'impermeabilisation_count',
		negativeKey: 'desimpermeabilisation_count',
		positiveColor: IMPERMEABILISATION_COLOR,
		negativeColor: DESIMPERMEABILISATION_COLOR,
	},
	artificialisation: {
		positiveKey: 'artificialisation_count',
		negativeKey: 'desartificialisation_count',
		positiveColor: ARTIFICIALISATION_COLOR,
		negativeColor: DESARTIFICIALISATION_COLOR,
	}
} as const;

export const DEFAULT_MAP_STYLE = {
	version: 8 as const,
	name: "Empty",
	metadata: { "mapbox:autocomposite": true },
	sources: {},
	glyphs: '/static/carto/fonts/{fontstack}/{range}.pbf',
	layers: [
		{
			id: "background",
			type: "background" as const,
			paint: { "background-color": "#DDDDDD" },
		},
	],
};

export const FRENCH_LOCALE = {
	'AttributionControl.ToggleAttribution': 'Ouvrir les crédits',
	'AttributionControl.MapFeedback': 'Signaler une erreur cartographique',
	'FullscreenControl.Enter': 'Entrer en plein écran',
	'FullscreenControl.Exit': 'Quitter le plein écran',
	'GeolocateControl.FindMyLocation': 'Trouver ma position',
	'GeolocateControl.LocationNotAvailable': 'Localisation non disponible',
	'LogoControl.Title': 'MapLibre logo',
	'Map.Title': 'Carte',
	'Marker.Title': 'Marqueur',
	'NavigationControl.ResetBearing': 'Réinitialiser l\'orientation',
	'NavigationControl.ZoomIn': 'Zoomer',
	'NavigationControl.ZoomOut': 'Dézoomer',
	'Popup.Close': 'Fermer la fenêtre',
	'ScaleControl.Meters': 'm',
	'ScaleControl.Kilometers': 'km',
	'GlobeControl.Enable': 'Activer le mode globe',
	'GlobeControl.Disable': 'Désactiver le mode globe',
	'TerrainControl.Enable': 'Activer le mode terrain',
	'TerrainControl.Disable': 'Désactiver le mode terrain',
	'CooperativeGesturesHandler.WindowsHelpText': 'Utilisez Ctrl + défilement pour zoomer la carte',
	'CooperativeGesturesHandler.MacHelpText': 'Utilisez ⌘ + défilement pour zoomer la carte',
	'CooperativeGesturesHandler.MobileHelpText': 'Pincer pour zoomer la carte',
};
