export const APP_DEFAULTS = {
  ZOOM: 15,
  DURATION: 2000,
  FIT_OPTIONS: {
    padding: { top: 50, bottom: 50, left: 50, right: 50 },
    speed: 0.1,
  },
} as const;

export const ORTHOPHOTO_TILES_URL = "https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=HR.ORTHOIMAGERY.ORTHOPHOTOS&tilematrixset=PM&TileMatrix={z}&TileCol={x}&TileRow={y}&format=image%2Fjpeg&style=normal";