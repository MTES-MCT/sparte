import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import { useMap } from "./hooks/useMap";
import { BaseMapProps } from "./types";
import { StyleSpecification } from "maplibre-gl";

const MapWrapper = styled.div`
	position: relative;
	border-radius: 3px;
	overflow: hidden;
	z-index: 0;
`;

const MapContainer = styled.div<{ $isLoaded: boolean }>`
	height: 75vh;
	width: 100%;
	opacity: ${({ $isLoaded }) => ($isLoaded ? 1 : 0)};
	transition: opacity 0.3s ease-in-out;
`;

const defaultStyle: StyleSpecification = {
	version: 8,
	name: "Empty",
	metadata: { "mapbox:autocomposite": true },
	sources: {},
	layers: [
		{
			id: "background",
			type: "background",
			paint: { "background-color": "#DDDDDD" },
		},
	],
};

const DEFAULT_CONTROLS = {
	scrollZoom: true,
	navigationControl: true,
	fullscreenControl: true,
	cooperativeGestures: true,
} as const;

export const BaseMap: React.FC<BaseMapProps> = ({
	id,
	bounds,
	maxBounds,
	sources = [],
	layers = [],
	style = defaultStyle,
	controls = DEFAULT_CONTROLS,
	onMapLoad,
}) => {
	const mapDiv = useRef<HTMLDivElement>(null);
	const mapConfig = { style, bounds, maxBounds, controls, sources, layers };
	const {
		mapRef,
		isMapLoaded,
		initializeMap,
		updateControls,
		updateSourcesAndLayers,
	} = useMap(mapConfig);

	useEffect(() => {
		if (mapDiv.current && !mapRef.current) {
			initializeMap(mapDiv.current);
		}
	}, [initializeMap]);

	useEffect(() => {
		if (isMapLoaded && mapRef.current) {
			updateControls();
			updateSourcesAndLayers();
			onMapLoad?.(mapRef.current);
		}
	}, [isMapLoaded, updateControls, updateSourcesAndLayers, onMapLoad]);

	return (
		<MapWrapper>
			<MapContainer
				id={id}
				ref={mapDiv}
				$isLoaded={isMapLoaded}
			/>
		</MapWrapper>
	);
};