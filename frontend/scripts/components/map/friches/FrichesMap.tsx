import React, { useEffect, useRef } from "react";
import { BaseMap } from "../BaseMap";
import { orthophoto } from "../layers/orthophoto";
import { createEmpriseLayer } from "../layers/emprise";
import { createFrichesLayer } from "../layers/friches";
import { createFrichesCentroidLayer } from "../layers/frichesCentroid";
import { MapControls, PopupConfig } from "../types";
import { Map } from "maplibre-gl";
import { FrichesPopup } from "./FrichesPopup";
import { LandDetailResultType } from "@services/types/land";
import { useGetLandGeomQuery } from "@services/api";

interface FrichesMapProps {
	landData: LandDetailResultType;
	controls?: MapControls;
	center?: [number, number] | null;
}

export const FrichesMap: React.FC<FrichesMapProps> = ({
	landData,
	controls = {
		scrollZoom: true,
		navigationControl: true,
		fullscreenControl: true,
		cooperativeGestures: true,
	},
	center
}) => {
	const mapRef = useRef<Map | null>(null);
	const { land_type, land_id, bounds, max_bounds } = landData;
	const { data: geom_data } = useGetLandGeomQuery({ land_type, land_id });
	const { simple_geom } = geom_data || {};
	const empriseLayer = createEmpriseLayer(simple_geom);
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