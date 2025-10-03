import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import { MapLibreMapper } from "./mappers";
import { LayerOrchestrator } from "../LayerOrchestrator";
import { LayerControlsConfig, LayerVisibility } from "../types";
import { useMaplibre } from "./hooks/useMaplibre";
import { Controls } from "../controls/Controls";
import { NomenclatureType } from "../types/ocsge";

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
    display: none;
`;

interface BaseMaplibreProps {
    id?: string;
    className?: string;
    style?: React.CSSProperties;
    onMapLoad?: (map: any) => void;
    children?: React.ReactNode;
    mapper?: MapLibreMapper;
    orchestrator?: LayerOrchestrator;
    bounds?: [number, number, number, number];
    maxBounds?: [number, number, number, number];
    showZoomIndicator?: boolean;
    layerControls?: LayerControlsConfig;
}

export const BaseMaplibre: React.FC<BaseMaplibreProps> = ({
    id = "map",
    onMapLoad,
    children,
    mapper: externalMapper,
    orchestrator: externalOrchestrator,
    bounds,
    maxBounds,
    showZoomIndicator = false,
    layerControls,
}) => {
    const mapDiv = useRef<HTMLDivElement>(null);
    const defaultMapper = useRef(new MapLibreMapper());
    const defaultOrchestrator = useRef(new LayerOrchestrator());
    const [currentZoom, setCurrentZoom] = useState<number>(0);
    
    const mapper = externalMapper || defaultMapper.current;
    const orchestrator = externalOrchestrator || defaultOrchestrator.current;
    
    orchestrator.setMapper(mapper);
    
    // Forcer le re-render quand les contrôles changent et rafraîchir la visibilité
    const [, forceUpdate] = useState({});

    const [layerVisibility, setLayerVisibility] = useState<LayerVisibility[]>([]);

    const {
        mapRef,
        isMapLoaded,
        initializeMap,
        updateControls,
        updateSourcesAndLayers,
    } = useMaplibre(mapper, bounds, maxBounds);

    useEffect(() => {
        const refresh = () => {
            if (layerControls?.layers && layerControls.layers.length > 0) {
                const updated = layerControls.layers
                    .map(layerConfig => orchestrator.getLayerUIState(layerConfig.id))
                    .filter((s): s is LayerVisibility => !!s) as LayerVisibility[];
                setLayerVisibility(updated);
            } else {
                const all = orchestrator.getAllLayers().map(l => orchestrator.getLayerUIState(l.options.id)).filter((s): s is LayerVisibility => !!s) as LayerVisibility[];
                setLayerVisibility(all);
            }
        };
        const cb = () => { forceUpdate({}); refresh(); };
        orchestrator.setOnChangeCallback(cb);
        refresh();
        return () => {
            // rétablir un callback vide pour éviter undefined
            orchestrator.setOnChangeCallback(() => {});
        };
    }, [orchestrator, layerControls]);

    useEffect(() => {
        if (mapDiv.current && !mapRef.current) {
            initializeMap(mapDiv.current);
        }
    }, [initializeMap]);

    useEffect(() => {
        if (isMapLoaded && onMapLoad && mapRef.current) {
            onMapLoad(mapRef.current);
        }
    }, [isMapLoaded, onMapLoad]);

    useEffect(() => {
        if (!isMapLoaded) return;
        updateControls();
        updateSourcesAndLayers();
        if (layerControls?.layers && layerControls.layers.length > 0) {
            const updated = layerControls.layers
                .map(layerConfig => orchestrator.getLayerUIState(layerConfig.id))
                .filter((s): s is LayerVisibility => !!s) as LayerVisibility[];
            setLayerVisibility(updated);
        } else {
            const all = orchestrator.getAllLayers().map(l => orchestrator.getLayerUIState(l.options.id)).filter((s): s is LayerVisibility => !!s) as LayerVisibility[];
            setLayerVisibility(all);
        }
    }, [isMapLoaded, updateControls, updateSourcesAndLayers, layerControls]);

    // Gestion du zoom indicator
    useEffect(() => {
        if (!isMapLoaded || !mapRef.current) return;

        const map = mapRef.current;
        
        if (showZoomIndicator) {
            setCurrentZoom(map.getZoom());
            const handleZoom = () => setCurrentZoom(map.getZoom());
            
            map.on('zoom', handleZoom);
            return () => {
                map.off('zoom', handleZoom);
            };
        }
    }, [isMapLoaded, showZoomIndicator]);

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
            {children}
            {layerControls?.showControls && (
                <Controls
                    layers={layerVisibility}
                    config={{ showControls: true }}
                    orchestrator={orchestrator}
                />
            )}
        </MapWrapper>
    );
};
