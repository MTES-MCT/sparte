import React, { useEffect, useRef } from "react";
import { BaseMap } from "../BaseMap";
import { empriseLayer } from "../../layers/empriseLayer";
import { orthophotoLayer } from "../../layers/orthophotoLayer";
import { MapControls } from "../types";
import { Map } from "maplibre-gl";
import { LandDetailResultType } from "@services/types/land";
import { useGetLandGeomQuery } from "@services/api";
import { toMapLibreSources, toMapLibreLayers } from "../mappers";
import { empriseSource as getEmpriseSource } from "../../sources/empriseSource";
import { orthophotoSource } from "../../sources/orthophotoSource";
import { APP_DEFAULTS } from "../../constants/config";
import { LayerControlsConfig } from "../../types";

interface ImpermeabilisationMapProps {
	landData: LandDetailResultType;
	controls?: MapControls;
	center?: [number, number] | null;
	layerControls?: LayerControlsConfig;
}

export const ImpermeabilisationMap: React.FC<ImpermeabilisationMapProps> = ({
	landData,
	controls = {
		scrollZoom: true,
		navigationControl: true,
		fullscreenControl: true,
		cooperativeGestures: true,
	},
	center,
	layerControls = {
		showControls: true,
		layers: [
			{ id: 'orthophoto', name: 'Orthophoto', visible: true, opacity: 1 },
			{ id: 'emprise', name: 'Emprise', visible: true, opacity: 0.7 },
		],
	}
}) => {
	const mapRef = useRef<Map | null>(null);
	const { land_type, land_id, bounds, max_bounds } = landData;
	const { data: geom_data } = useGetLandGeomQuery({ land_type, land_id });
	const { simple_geom } = geom_data || {};
	
	const empriseSource = getEmpriseSource(simple_geom || { type: "FeatureCollection", features: [] });
	const mapLibreSources = toMapLibreSources([orthophotoSource, empriseSource]);
	const mapLibreLayers = toMapLibreLayers([orthophotoLayer, empriseLayer]);

	const flyToCenter = (map: Map) => {
		if (center) {
			map.flyTo({
				center,
				zoom: APP_DEFAULTS.ZOOM,
				duration: APP_DEFAULTS.DURATION
			});
		}
	};

	useEffect(() => {
		if (center && mapRef.current) {
			flyToCenter(mapRef.current);
		}
	}, [center]);

	return (
		<BaseMap
			id="impermeabilisation-map"
			bounds={bounds}
			maxBounds={max_bounds}
			controls={controls}
			sources={mapLibreSources}
			layers={mapLibreLayers}
			showZoomIndicator={true}
			onMapLoad={(map) => {
				mapRef.current = map;
				flyToCenter(map);
			}}
			layerControls={layerControls}
		/>
	);
};