import React, { useRef, useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import { useMap } from "./hooks/useMap";
import { useLayerVisibility } from "./hooks/useLayerVisibility";
import { LayerControls } from "./controls/LayerControls";
import { BaseMapProps } from "./types/";
import { StyleSpecification, Map as MapLibreMap } from "maplibre-gl";
import { MAPLIBRE_CONTROLS } from "../constants/configMaplibre";

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
	background: #FFFFFF;
	color: #181818;
	padding: 0.2em 0.6em;
	border-radius: 4px;
	z-index: 10;
	font-size: 0.75em;
	pointer-events: none;
	font-weight: 600;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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


export const BaseMap: React.FC<BaseMapProps> = ({
	id,
	bounds,
	maxBounds,
	sources = [],
	layers = [],
	style = defaultStyle,
	controls = MAPLIBRE_CONTROLS,
	onMapLoad,
	showZoomIndicator = false,
	layerControls,
}) => {
	const mapDiv = useRef<HTMLDivElement>(null);
	const [currentZoom, setCurrentZoom] = useState<number>(0);
	const zoomHandlerRef = useRef<(() => void) | null>(null);
	
	const mapConfig = {
		style, 
		bounds, 
		maxBounds, 
		controls, 
		sources, 
		layers
	};
	
	const {
		mapRef,
		isMapLoaded,
		initializeMap,
		updateControls,
		updateSourcesAndLayers,
	} = useMap(mapConfig);

	const [mapInstance, setMapInstance] = useState<MapLibreMap | null>(null);
	
	const { layers: layerVisibility, toggleLayer, setLayerOpacity } = useLayerVisibility(
		mapInstance,
		layerControls?.layers || []
	);

	const handleMapInit = useCallback(() => {
		if (mapDiv.current && !mapRef.current) {
			initializeMap(mapDiv.current);
		}
	}, [initializeMap]);

	useEffect(() => {
		handleMapInit();
	}, [handleMapInit]);

	useEffect(() => {
		if (mapInstance && layerControls?.layers) {
			layerControls.layers.forEach(layer => {
				if (layer.visible) {
					mapInstance.setLayoutProperty(layer.id, 'visibility', 'visible');
				} else {
					mapInstance.setLayoutProperty(layer.id, 'visibility', 'none');
				}
				
				if (layer.opacity !== undefined) {
					const mapLayer = mapInstance.getLayer(layer.id);
					if (mapLayer) {
						if (mapLayer.type === 'raster') {
							mapInstance.setPaintProperty(layer.id, 'raster-opacity', layer.opacity);
						} else if (mapLayer.type === 'line') {
							mapInstance.setPaintProperty(layer.id, 'line-opacity', layer.opacity);
						}
					}
				}
			});
		}
	}, [mapInstance, layerControls?.layers]);

	useEffect(() => {
		if (isMapLoaded && mapRef.current) {
			updateControls();
			updateSourcesAndLayers();

			const map = mapRef.current;
			if (showZoomIndicator && map) {
				setCurrentZoom(map.getZoom());
				const handler = () => {
					const z = map.getZoom();
					setCurrentZoom(z);
				};
				zoomHandlerRef.current = handler;
				map.on('zoom', handler);
			} else if (!showZoomIndicator && map && zoomHandlerRef.current) {
				map.off('zoom', zoomHandlerRef.current);
				zoomHandlerRef.current = null;
			}

			onMapLoad?.(mapRef.current);
			setMapInstance(mapRef.current);
		}

		return () => {
			if (mapRef.current && zoomHandlerRef.current) {
				mapRef.current.off('zoom', zoomHandlerRef.current);
				zoomHandlerRef.current = null;
			}
		};
	}, [isMapLoaded, updateControls, updateSourcesAndLayers, onMapLoad, showZoomIndicator]);

	return (
		<MapWrapper>
			{showZoomIndicator && (
				<ZoomIndicator>
					Zoom: {currentZoom.toFixed(1)}
				</ZoomIndicator>
			)}
			<MapContainer
				id={id}
				ref={mapDiv}
				$isLoaded={isMapLoaded}
			/>
			{layerControls && (
				<LayerControls
					layers={layerVisibility}
					config={layerControls}
					onLayerToggle={toggleLayer}
					onOpacityChange={setLayerOpacity}
				/>
			)}
		</MapWrapper>
	);
};