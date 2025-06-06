import React, { useCallback } from "react";
import { BaseMap } from "../BaseMap";
import { orthophoto } from "../layers/orthophoto";
import { createEmpriseLayer } from "../layers/emprise";
import { MapControls } from "../types";
import maplibregl from "maplibre-gl";
import { ProjectDetailResultType } from "@services/types/project";

interface FrichesMapProps {
	projectData: ProjectDetailResultType;
	controls?: MapControls;
}

export const FrichesMap: React.FC<FrichesMapProps> = ({
	projectData,
	controls = {
		scrollZoom: true,
		navigationControl: true,
		fullscreenControl: true,
		cooperativeGestures: true,
	},
}) => {
	const { bounds, max_bounds, emprise } = projectData;
	const empriseLayer = createEmpriseLayer(emprise);

	const handleMapLoad = useCallback((map: maplibregl.Map) => {
		console.log("Map loaded:", map);
		// Future interactions here
	}, []);

	return (
		<BaseMap
			id="friches-map"
			bounds={bounds}
			maxBounds={max_bounds}
			controls={controls}
			sources={[orthophoto.source, empriseLayer.source]}
			layers={[orthophoto.layer, empriseLayer.layer]}
			onMapLoad={handleMapLoad}
		/>
	);
};