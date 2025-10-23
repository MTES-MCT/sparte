import React, { useRef, useEffect, useMemo, useCallback, useState } from "react";
import styled from "styled-components";
import maplibregl from "maplibre-gl";
import { useMap } from "../hooks/useMap";
import { initMapFromConfig } from "../factory/initMapFromConfig";
import { ControlsPanel } from "./controls/ControlsPanel";
import { ControlsManager } from "../controls/ControlsManager";
import { PopupManager } from "../popup/PopupManager";
import { PopupPanel } from "./popup/PopupPanel";
import { StatsBar } from "./stats/StatsBar";
import { StatsManager } from "../stats/StatsManager";
import type { MapConfig } from "../types/builder";
import type { PopupState } from "../types/popup";
import type { StatsState } from "../stats/StatsStateManager";
import type { LandDetailResultType } from "@services/types/land";
import type { LayerId } from "../types/registry";

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
    landData: LandDetailResultType;
}

export const BaseMap: React.FC<BaseMapProps> = ({
    id = "map",
    children,
    bounds,
    maxBounds,
    config,
    landData,
}) => {
    const mapDiv = useRef<HTMLDivElement>(null);
    const isInitialized = useRef(false);
    const [controlsManager, setControlsManager] = useState<ControlsManager | null>(null);
    const [popupManager, setPopupManager] = useState<PopupManager | null>(null);
    const [statsManager, setStatsManager] = useState<StatsManager | null>(null);
    const [popupState, setPopupState] = useState<PopupState>({
        isVisible: false,
        feature: null,
        event: null,
        position: { x: 0, y: 0 },
        layerId: null
    });
    const [statsState, setStatsState] = useState<StatsState>({
        layerId: null,
        categories: [],
        isVisible: false
    });
    
    const memoizedConfig = useMemo(() => config, [JSON.stringify(config)]);

    const {
        mapRef,
        isMapLoaded,
        initializeMap,
        updateControls,
    } = useMap(bounds, maxBounds);

    const handleMapLoad = useCallback(async (map: maplibregl.Map) => {
        if (memoizedConfig && !isInitialized.current) {
            // Initialiser la carte et récupérer les instances de sources/layers
            const { sources, layers } = await initMapFromConfig(memoizedConfig, map, landData);
            
            // Initialiser le gestionnaire de stats si des layers en ont besoin
            let statsMgr: StatsManager | undefined;
            if (memoizedConfig.layers && memoizedConfig.layers.some(l => l.stats)) {
                statsMgr = new StatsManager(map);
                
                memoizedConfig.layers.forEach(layerConfig => {
                    if (layerConfig.stats) {
                        const layerId = `${layerConfig.type}-layer` as LayerId;
                        const layer = layers.get(layerId);
                        if (layer && 'extractStats' in layer && typeof layer.extractStats === 'function') {
                            statsMgr.registerStats(
                                layerId,
                                (features: maplibregl.MapGeoJSONFeature[]) => (layer as any).extractStats(features)
                            );
                            statsMgr.enableStats(layerId);
                        }
                    }
                });

                statsMgr.subscribe(setStatsState);
                
                setStatsManager(statsMgr);
            }

            // Initialiser le gestionnaire de contrôles si des groupes sont définis
            if (memoizedConfig.controlGroups?.length > 0) {
                const manager = new ControlsManager(
                    memoizedConfig.controlGroups,
                    sources,
                    layers,
                    statsMgr
                );
                
                // Appliquer les valeurs par défaut aux layers
                // C'est ici que la configuration "descend" vers les layers
                await manager.applyDefaultValues();
                
                setControlsManager(manager);
            }

            // Initialiser le gestionnaire de popups si des popups sont définis
            if (memoizedConfig.popups?.length > 0) {
                const popupMgr = new PopupManager(map);
                
                memoizedConfig.popups.forEach(popupConfig => {
                    popupMgr.registerPopup(popupConfig);
                });

                popupMgr.subscribe(setPopupState);
                
                setPopupManager(popupMgr);
            }
            
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
    }, [isMapLoaded, updateControls]);

    useEffect(() => {
        return () => {
            if (popupManager) {
                popupManager.destroy();
            }
            if (statsManager) {
                statsManager.destroy();
            }
        };
    }, [popupManager, statsManager]);

    const handleClosePopup = useCallback(() => {
        if (popupManager) {
            popupManager.hidePopup();
        }
    }, [popupManager]);

    const currentPopupConfig = useMemo(() => {
        if (!popupState.layerId || !memoizedConfig?.popups) return null;
        return memoizedConfig.popups.find(p => p.layerId === popupState.layerId) || null;
    }, [popupState.layerId, memoizedConfig?.popups]);

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
            {popupState.isVisible && currentPopupConfig && (
                <PopupPanel
                    popupState={popupState}
                    popupConfig={currentPopupConfig}
                    onClose={handleClosePopup}
                    mapContainer={mapDiv.current}
                />
            )}
            {statsState.isVisible && statsState.categories.length > 0 && (
                <StatsBar 
                    categories={statsState.categories}
                />
            )}
        </MapWrapper>
    );
};
