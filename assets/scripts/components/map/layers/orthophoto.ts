import { SourceSpecification, LayerSpecification } from "maplibre-gl";

export const orthophoto = {
	source: {
		id: "orthophoto",
		source: {
			type: "raster",
			tiles: ["https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=HR.ORTHOIMAGERY.ORTHOPHOTOS&tilematrixset=PM&TileMatrix={z}&TileCol={x}&TileRow={y}&format=image%2Fjpeg&style=normal"],
			tileSize: 256,
		} as SourceSpecification
	},
	layer: {
		id: "orthophoto",
		layer: {
			id: "orthophoto",
			type: "raster",
			source: "orthophoto",
			paint: {
				"raster-opacity": 0.8
			}
		} as LayerSpecification
	}
}; 