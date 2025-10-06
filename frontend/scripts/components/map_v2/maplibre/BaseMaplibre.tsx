import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import { MapLibreMapper } from "./mappers";
import { LayerOrchestrator } from "../LayerOrchestrator";
import { LayerVisibility } from "../types";
import { useMaplibre } from "./hooks/useMaplibre";
import { Controls } from "../controls/Controls";

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
}

export const BaseMaplibre: React.FC<BaseMaplibreProps> = ({
    id = "map",
    onMapLoad,
    children,
    mapper: externalMapper,
    orchestrator: externalOrchestrator,
    bounds,
    maxBounds,
}) => {
    const mapDiv = useRef<HTMLDivElement>(null);
    const defaultMapper = useRef(new MapLibreMapper());
    const defaultOrchestrator = useRef(new LayerOrchestrator());
    
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
            const all = orchestrator.getAllLayers().map(l => orchestrator.getLayerUIState(l.options.id)).filter((s): s is LayerVisibility => !!s) as LayerVisibility[];
            setLayerVisibility(all);
        };
        const cb = () => { forceUpdate({}); refresh(); };
        orchestrator.setOnChangeCallback(cb);
        refresh();
        return () => {
            // rétablir un callback vide pour éviter undefined
            orchestrator.setOnChangeCallback(() => {});
        };
    }, [orchestrator]);

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
        const all = orchestrator.getAllLayers().map(l => orchestrator.getLayerUIState(l.options.id)).filter((s): s is LayerVisibility => !!s) as LayerVisibility[];
        setLayerVisibility(all);
    }, [isMapLoaded, updateControls, updateSourcesAndLayers]);


    return (
        <MapWrapper>
            <MapContainer
                id={id}
                ref={mapDiv}
                $isLoaded={isMapLoaded}
            />
            {children}
            <Controls
                layers={layerVisibility}
                config={{ showControls: true }}
                orchestrator={orchestrator}
            />
        </MapWrapper>
    );
};
