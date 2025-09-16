import React, { useRef, useEffect, useMemo, useCallback } from "react";
import styled from "styled-components";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { useMaplibre } from "./hooks/useMaplibre";
import { initMapFromConfig } from "./factory/initMapFromConfig";

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

interface BaseMapProps {
    id?: string;
    children?: React.ReactNode;
    bounds?: [number, number, number, number];
    maxBounds?: [number, number, number, number];
    config?: any;
}

export const BaseMap: React.FC<BaseMapProps> = ({
    id = "map",
    children,
    bounds,
    maxBounds,
    config,
}) => {
    const mapDiv = useRef<HTMLDivElement>(null);
    const isInitialized = useRef(false);
    
    const memoizedConfig = useMemo(() => config, [config]);

    const {
        mapRef,
        isMapLoaded,
        initializeMap,
        updateControls,
        updateSourcesAndLayers,
    } = useMaplibre(bounds, maxBounds);

    const handleMapLoad = useCallback(async (map: any) => {
        if (memoizedConfig && !isInitialized.current) {
            await initMapFromConfig(memoizedConfig, map);
            isInitialized.current = true;
        }
    }, [memoizedConfig]);

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
