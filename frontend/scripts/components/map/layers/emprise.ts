import { MapSource, MapLayer } from "../types";

export const createEmpriseLayer = (emprise: any): { source: MapSource; layer: MapLayer } => {
	const empriseSourceId = "emprise";
	const empriseSource: MapSource = {
		id: empriseSourceId,
		source: {
			type: "geojson",
			data: emprise,
		},
	};

	const empriseLayer: MapLayer = {
		id: "emprise",
		layer: {
			id: "emprise",
			source: empriseSourceId,
			type: "line",
			paint: {
				"line-color": "black",
				"line-width": 1.7,
				"line-opacity": 0.7,
			},
			layout: {
				"line-cap": "round",
			},
		},
	};

	return { source: empriseSource, layer: empriseLayer };
}; 