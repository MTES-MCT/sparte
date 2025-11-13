import React, { useRef, useEffect, useMemo, useCallback, useState } from "react";
import styled from "styled-components";
import maplibregl from "maplibre-gl";
import { useMap } from "../hooks/useMap";
import { initMapFromConfig } from "../factory/initMapFromConfig";
import { ControlsPanel } from "./controls/ControlsPanel";
import { ControlsManager } from "../controls/ControlsManager";
import { InfoPanelManager } from "../infoPanel/InfoPanelManager";
import { InfoPanel } from "./infoPanel/InfoPanel";
import { StatsBar } from "./stats/StatsBar";
import { StatsManager } from "../stats/StatsManager";
import type { MapConfig } from "../types/builder";
import type { InfoPanelState } from "../types/infoPanel";
import type { StatsState } from "../stats/StatsStateManager";
import type { LandDetailResultType } from "@services/types/land";
import type { LayerId } from "../types/registry";
import type { BaseSource } from "../sources/baseSource";
import type { BaseLayer } from "../layers/baseLayer";

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
	height: 65vh;
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
    config?: MapConfig;
    landData: LandDetailResultType;
    center?: [number, number] | null;
    onMapLoad?: (map: maplibregl.Map) => void;
}

export const BaseMap: React.FC<BaseMapProps> = ({
    id = "map",
    children,
    config,
    landData,
    center,
    onMapLoad,
}) => {
    const mapDiv = useRef<HTMLDivElement>(null);
    const isInitialized = useRef(false);
    const [controlsManager, setControlsManager] = useState<ControlsManager | null>(null);
    const [infoPanelManager, setInfoPanelManager] = useState<InfoPanelManager | null>(null);
    const [statsManager, setStatsManager] = useState<StatsManager | null>(null);
    const [infoPanelState, setInfoPanelState] = useState<InfoPanelState>({
        layers: []
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
    } = useMap(landData);

    const initializeStatsManager = useCallback((
        map: maplibregl.Map,
        layers: Map<string, BaseLayer>,
        layerConfigs: MapConfig['layers']
    ): StatsManager | undefined => {
        if (!layerConfigs?.some(l => l.stats)) {
            return undefined;
        }

        const statsMgr = new StatsManager(map);
        
        for (const layerConfig of layerConfigs) {
            if (!layerConfig.stats) continue;
            
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

        statsMgr.subscribe(setStatsState);
        return statsMgr;
    }, []);

    const initializeControlsManager = useCallback(async (
        controlGroups: MapConfig['controlGroups'],
        sources: Map<string, BaseSource>,
        layers: Map<string, BaseLayer>,
        statsMgr?: StatsManager
    ): Promise<ControlsManager | undefined> => {
        if (!controlGroups || controlGroups.length === 0) {
            return undefined;
        }

        const manager = new ControlsManager(controlGroups, sources, layers, statsMgr);
        await manager.applyDefaultValues();
        return manager;
    }, []);

    const initializeInfoPanelManager = useCallback((
        map: maplibregl.Map,
        infoPanels: MapConfig['infoPanels']
    ): InfoPanelManager | undefined => {
        if (!infoPanels || infoPanels.length === 0) {
            return undefined;
        }

        const infoPanelMgr = new InfoPanelManager(map);
        
        for (const infoPanelConfig of infoPanels) {
            infoPanelMgr.registerInfo(infoPanelConfig);
        }

        infoPanelMgr.subscribe(setInfoPanelState);
        return infoPanelMgr;
    }, []);

    const handleMapLoad = useCallback(async (map: maplibregl.Map) => {
        if (!memoizedConfig || isInitialized.current) {
            return;
        }

        // Initialiser la carte et récupérer les instances de sources/layers
        const { sources, layers } = await initMapFromConfig(memoizedConfig, map, landData);
        
        // Initialiser le gestionnaire de stats si des layers en ont besoin
        const statsMgr = initializeStatsManager(map, layers, memoizedConfig.layers);
        if (statsMgr) {
            setStatsManager(statsMgr);
        }

        // Initialiser le gestionnaire de contrôles si des groupes sont définis
        const controlsMgr = await initializeControlsManager(
            memoizedConfig.controlGroups,
            sources,
            layers,
            statsMgr
        );
        if (controlsMgr) {
            setControlsManager(controlsMgr);
        }

        // Initialiser le gestionnaire d'info panels si des info panels sont définis
        const infoPanelMgr = initializeInfoPanelManager(map, memoizedConfig.infoPanels);
        if (infoPanelMgr) {
            setInfoPanelManager(infoPanelMgr);
        }

        isInitialized.current = true;
        onMapLoad?.(map);
    }, [memoizedConfig, landData, onMapLoad, id, initializeStatsManager, initializeControlsManager, initializeInfoPanelManager]);

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
            if (infoPanelManager) {
                infoPanelManager.destroy();
            }
            if (statsManager) {
                statsManager.destroy();
            }
        };
    }, [infoPanelManager, statsManager]);

    useEffect(() => {
        if (center && mapRef.current && isMapLoaded) {
            mapRef.current.flyTo({
                center,
                zoom: 15,
                duration: 2000
            });
        }
    }, [center, isMapLoaded]);

    const infoPanelConfigs = useMemo(() => {
        if (!memoizedConfig?.infoPanels) return new Map();
        return new Map(memoizedConfig.infoPanels.map(config => [config.layerId, config]));
    }, [memoizedConfig?.infoPanels]);

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
            <InfoPanel
                state={infoPanelState}
                configs={infoPanelConfigs}
            />
            {statsState.isVisible && statsState.categories.length > 0 && (
                <StatsBar 
                    categories={statsState.categories}
                />
            )}
        </MapWrapper>
    );
};
