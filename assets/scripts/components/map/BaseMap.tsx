import React, { useRef, useEffect, useState } from "react";
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

const ZoomIndicator = styled.div`
	position: absolute;
	top: 10px;
	left: 10px;
	background: rgba(0, 0, 0, 0.7);
	color: white;
	padding: 5px 10px;
	border-radius: 4px;
	z-index: 10;
	font-size: 12px;
	font-family: monospace;
	pointer-events: none;
`;

const defaultStyle: StyleSpecification = {
	version: 8,
	name: "Empty",
	metadata: { "mapbox:autocomposite": true },
	sources: {},
	glyphs: '/static/carto/fonts/{fontstack}/{range}.pbf',
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
	showZoomIndicator = false,
}) => {
	const mapDiv = useRef<HTMLDivElement>(null);
	const [currentZoom, setCurrentZoom] = useState<number>(0);
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
			
			if (showZoomIndicator) {
				setCurrentZoom(mapRef.current.getZoom());
				mapRef.current.on('zoom', () => {
					setCurrentZoom(mapRef.current!.getZoom());
				});
			}
			
			onMapLoad?.(mapRef.current);
		}
	}, [isMapLoaded, updateControls, updateSourcesAndLayers, onMapLoad, showZoomIndicator]);

	return (
		<MapWrapper>
			{showZoomIndicator && (
				<ZoomIndicator>
					Zoom: {currentZoom.toFixed(2)}
				</ZoomIndicator>
			)}
			<MapContainer
				id={id}
				ref={mapDiv}
				$isLoaded={isMapLoaded}
			/>
		</MapWrapper>
	);
};