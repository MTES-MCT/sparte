import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import styled from "styled-components";
import { MapLibreMapper } from "./mappers";
import { LayerOrchestrator } from "../LayerOrchestrator";
import { useMaplibre } from "./hooks/useMaplibre";
import { initMapFromConfig } from "../factory/initMapFromConfig";

const MapWrapper = styled.div`
	position: relative;
	border-radius: 3px;
	overflow: hidden;
    z-index: 0;
	
	&:-webkit-full-screen {
		height: 100vh !important;
		width: 100vw !important;
	}
	
	&:-moz-full-screen {
		height: 100vh !important;
		width: 100vw !important;
	}
	
	&:fullscreen {
		height: 100vh !important;
		width: 100vw !important;
	}
`;

const MapContainer = styled.div<{ $isLoaded: boolean }>`
	height: 75vh;
	width: 100%;
	opacity: ${({ $isLoaded }) => ($isLoaded ? 1 : 0)};
	transition: opacity 0.3s ease-in-out;
        
    ${MapWrapper}:-webkit-full-screen & {
        height: 100vh !important;
    }
    
    ${MapWrapper}:-moz-full-screen & {
        height: 100vh !important;
    }
    
    ${MapWrapper}:fullscreen & {
        height: 100vh !important;
    }
`;

interface BaseMaplibreProps {
    id?: string;
    children?: React.ReactNode;
    mapper?: MapLibreMapper;
    orchestrator?: LayerOrchestrator;
    bounds?: [number, number, number, number];
    maxBounds?: [number, number, number, number];
    config?: any;
}

export const BaseMaplibre: React.FC<BaseMaplibreProps> = ({
    id = "map",
    children,
    mapper: externalMapper,
    orchestrator: externalOrchestrator,
    bounds,
    maxBounds,
    config,
}) => {
    const mapDiv = useRef<HTMLDivElement>(null);
    const defaultMapper = useRef(new MapLibreMapper());
    const defaultOrchestrator = useRef(new LayerOrchestrator());
    const isInitialized = useRef(false);
    
    const mapper = externalMapper || defaultMapper.current;
    const orchestrator = externalOrchestrator || defaultOrchestrator.current;
    
    orchestrator.setMapper(mapper);
    
    const memoizedConfig = useMemo(() => config, [config]);

    const {
        mapRef,
        isMapLoaded,
        initializeMap,
        updateControls,
        updateSourcesAndLayers,
    } = useMaplibre(mapper, bounds, maxBounds);

    const handleMapLoad = useCallback(async (map: any) => {
        if (memoizedConfig && !isInitialized.current) {
            await initMapFromConfig(memoizedConfig, orchestrator);
            isInitialized.current = true;
        }
    }, [memoizedConfig, orchestrator]);

    useEffect(() => {
        if (mapDiv.current && !mapRef.current) {
            const map = initializeMap(mapDiv.current);
            if (map) {
                map.on('load', () => {
                    handleMapLoad(map);
                });
            }
        }
    }, [initializeMap, handleMapLoad]);

    useEffect(() => {
        if (!isMapLoaded) return;
        updateControls();
        updateSourcesAndLayers();
    }, [isMapLoaded, updateControls, updateSourcesAndLayers]);

    return (
        <MapWrapper id={`${id}-wrapper`}>
            <MapContainer
                id={id}
                ref={mapDiv}
                $isLoaded={isMapLoaded}
            />
            {children}
        </MapWrapper>
    );
};
