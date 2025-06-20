import React, { useEffect, useRef } from "react";
import { BaseMap } from "../BaseMap";
import { orthophoto } from "../layers/orthophoto";
import { createEmpriseLayer } from "../layers/emprise";
import { createFrichesLayer } from "../layers/friches";
import { createFrichesCentroidLayer } from "../layers/frichesCentroid";
import { MapControls, PopupConfig } from "../types";
import { ProjectDetailResultType } from "@services/types/project";
import { Map } from "maplibre-gl";
import { FrichesPopup } from "./FrichesPopup";

interface FrichesMapProps {
	projectData: ProjectDetailResultType;
	controls?: MapControls;
	center?: [number, number] | null;
}

export const FrichesMap: React.FC<FrichesMapProps> = ({
	projectData,
	controls = {
		scrollZoom: true,
		navigationControl: true,
		fullscreenControl: true,
		cooperativeGestures: true,
	},
	center
}) => {
	const mapRef = useRef<Map | null>(null);
	const { bounds, max_bounds, emprise, land_type, land_id } = projectData;
	const empriseLayer = createEmpriseLayer(emprise);
	const frichesLayer = createFrichesLayer(land_type, land_id);
	const frichesCentroidLayer = createFrichesCentroidLayer(land_type, land_id);

	const popupConfigs: PopupConfig[] = [
		{
			layerId: frichesLayer.layer.id,
			renderContent: (feature) => <FrichesPopup feature={feature} />,
		}
	];

	useEffect(() => {
		if (center && mapRef.current) {
			mapRef.current.flyTo({
				center,
				zoom: 15,
				duration: 2000
			});
		}
	}, [center]);

	return (
		<BaseMap
			id="friches-map"
			bounds={bounds}
			maxBounds={max_bounds}
			controls={controls}
			sources={[orthophoto.source, empriseLayer.source, frichesLayer.source, frichesCentroidLayer.source]}
			layers={[
				orthophoto.layer, 
				empriseLayer.layer, 
				frichesLayer.layer, 
				...frichesCentroidLayer.layers
			]}
			popups={popupConfigs}
			showZoomIndicator={true}
			onMapLoad={(map) => {
				mapRef.current = map;
			}}
		/>
	);
};