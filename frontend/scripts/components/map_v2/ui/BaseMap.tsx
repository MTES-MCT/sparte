import React, { useRef, useEffect, useMemo, useCallback, useState } from "react";
import styled from "styled-components";
import maplibregl from "maplibre-gl";
import { useMaplibre } from "../hooks/useMaplibre";
import { initMapFromConfig } from "../factory/initMapFromConfig";
import { ControlsPanel } from "./controls/ControlsPanel";
import { ControlsManager } from "../controls/ControlsManager";
import type { MapConfig } from "../types/builder";

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
    config?: MapConfig;
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
    const [controlsManager, setControlsManager] = useState<ControlsManager | null>(null);
    
    const memoizedConfig = useMemo(() => config, [JSON.stringify(config)]);

    const {
        mapRef,
        isMapLoaded,
        initializeMap,
        updateControls,
    } = useMaplibre(bounds, maxBounds);

    const handleMapLoad = useCallback(async (map: maplibregl.Map) => {
        if (memoizedConfig && !isInitialized.current) {
            try {
                await initMapFromConfig(memoizedConfig, map);
                
                // Initialiser le gestionnaire de contrôles si des groupes sont définis
                if (memoizedConfig.controlGroups?.length > 0) {
                    const manager = new ControlsManager(map, memoizedConfig.controlGroups);
                    setControlsManager(manager);
                }
                
                isInitialized.current = true;
            } catch (error) {
                console.error('Erreur lors de l\'initialisation de la carte:', error);
            }
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
    }, [isMapLoaded, updateControls]);

    return (
        <MapWrapper id={`${id}-wrapper`}>
            <MapContainer
                id={id}
                ref={mapDiv}
                $isLoaded={isMapLoaded}
            />
            {children}
            {controlsManager && memoizedConfig?.controlGroups && memoizedConfig.controlGroups.length > 0 && (
                <ControlsPanel
                    config={{
                        groups: memoizedConfig.controlGroups
                    }}
                    manager={controlsManager}
                />
            )}
        </MapWrapper>
    );
};
