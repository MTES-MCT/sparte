export const APP_DEFAULTS = {
	ZOOM: 15,
	DURATION: 2000,
	FIT_OPTIONS: {
		padding: { top: 50, bottom: 50, left: 50, right: 50 },
		speed: 0.1,
	},
} as const;

export const ORTHOPHOTO_TILES_URL = "https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=HR.ORTHOIMAGERY.ORTHOPHOTOS&tilematrixset=PM&TileMatrix={z}&TileCol={x}&TileRow={y}&format=image%2Fjpeg&style=normal";

export const OCSGE_TILES_URL = "https://airflow-staging.s3.fr-par.scw.cloud/vector_tiles/occupation_du_sol_{millesime}_{departement}.pmtiles";

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
