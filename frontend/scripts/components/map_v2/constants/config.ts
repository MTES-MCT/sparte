export const APP_DEFAULTS = {
	ZOOM: 15,
	DURATION: 2000,
	FIT_OPTIONS: {
		padding: { top: 50, bottom: 50, left: 50, right: 50 },
		speed: 0.1,
	},
} as const;

export const ORTHOPHOTO_TILES_URL = "https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=HR.ORTHOIMAGERY.ORTHOPHOTOS&tilematrixset=PM&TileMatrix={z}&TileCol={x}&TileRow={y}&format=image%2Fjpeg&style=normal";

export const OCSGE_TILES_URL = "https://airflow-staging.s3.fr-par.scw.cloud/vector_tiles/";
export const OCSGE_GEOJSON_CENTROIDS_URL = "https://airflow-staging.s3.fr-par.scw.cloud/geojson/occupation_du_sol_diff_centroid_";
export const OCSGE_GEOJSON_BASE_URL = "https://airflow-staging.s3.fr-par.scw.cloud/geojson/";

export const ARTIFICIALISATION_COLOR = "#FA4B42"
export const DESARTIFICIALISATION_COLOR = "#00E272"
export const IMPERMEABILISATION_COLOR = "#FA4B42"
export const DESIMPERMEABILISATION_COLOR = "#00E272"

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
