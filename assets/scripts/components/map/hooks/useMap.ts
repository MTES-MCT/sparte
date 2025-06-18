import { useRef, useState, useCallback, useEffect } from "react";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { MapConfig, ControlRefs } from "../types";

const FIT_OPTIONS = {
    padding: { top: 50, bottom: 50, left: 50, right: 50 },
    speed: 0.1,
};

export const useMap = (config: MapConfig) => {
    const mapRef = useRef<maplibregl.Map | null>(null);
    const controlsRef = useRef<ControlRefs>({});
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    const initializeMap = useCallback((container: HTMLElement) => {
        const protocol = new Protocol();
        maplibregl.addProtocol("pmtiles", protocol.tile);

        mapRef.current = new maplibregl.Map({
            container,
            style: config.style,
            bounds: config.bounds,
            maxBounds: config.maxBounds,
            fitBoundsOptions: FIT_OPTIONS,
            cooperativeGestures: config.controls?.cooperativeGestures,
            maplibreLogo: false,
            attributionControl: false,
            fadeDuration: 0,
        });

        mapRef.current.on("load", () => {
            setIsMapLoaded(true);
        });
    }, [config]);

    const updateControls = useCallback(() => {
        if (!mapRef.current) return;

        // Scroll zoom
        const scrollZoom = mapRef.current.scrollZoom;
        config.controls?.scrollZoom ? scrollZoom.enable() : scrollZoom.disable();

        // Navigation control
        if (config.controls?.navigationControl && !controlsRef.current.navigationControl) {
            const nav = new maplibregl.NavigationControl();
            controlsRef.current.navigationControl = nav;
            mapRef.current.addControl(nav, "top-right");
        }

        // Fullscreen control
        if (config.controls?.fullscreenControl && !controlsRef.current.fullscreenControl) {
            const fs = new maplibregl.FullscreenControl();
            controlsRef.current.fullscreenControl = fs;
            mapRef.current.addControl(fs, "top-right");
        }
    }, [config.controls]);

    const updateSourcesAndLayers = useCallback(() => {
        if (!mapRef.current) return;

        mapRef.current.fitBounds(config.bounds, FIT_OPTIONS);

        config.sources?.forEach(({ id, source }) => {
            if (!mapRef.current!.getSource(id)) {
                mapRef.current!.addSource(id, source);
            }
        });

        config.layers?.forEach(({ id, layer }) => {
            const map = mapRef.current!;
            if (map.getLayer(id)) {
                map.removeLayer(id);
            }
            map.addLayer(layer);
        });
    }, [config.bounds, config.layers, config.sources]);

    // Nettoyage de la carte lors du démontage du composant
    useEffect(() => {
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    return {
        mapRef,
        isMapLoaded,
        initializeMap,
        updateControls,
        updateSourcesAndLayers,
    };
};
