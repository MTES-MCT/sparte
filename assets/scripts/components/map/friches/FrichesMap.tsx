import React from "react";
import { BaseMap } from "../BaseMap";
import { orthophoto } from "../layers/orthophoto";
import { createEmpriseLayer } from "../layers/emprise";
import { createFrichesLayer } from "../layers/friches";
import { MapControls } from "../types";
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
	const { bounds, max_bounds, emprise, land_type, land_id } = projectData;
	const empriseLayer = createEmpriseLayer(emprise);
	const frichesLayer = createFrichesLayer(land_type, land_id);

	return (
		<BaseMap
			id="friches-map"
			bounds={bounds}
			maxBounds={max_bounds}
			controls={controls}
			sources={[orthophoto.source, empriseLayer.source, frichesLayer.source]}
			layers={[orthophoto.layer, empriseLayer.layer, frichesLayer.layer]}
		/>
	);
};