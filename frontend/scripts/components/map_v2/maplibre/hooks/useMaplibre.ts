import { useRef, useState, useCallback, useEffect } from "react";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { MapLibreMapper } from "../mappers";
import { DEFAULT_MAP_STYLE, FRENCH_LOCALE } from "../constants/config";

let PMTILES_PROTOCOL_REGISTERED = false;

export const useMaplibre = (mapper: MapLibreMapper, bounds?: [number, number, number, number], maxBounds?: [number, number, number, number]) => {
    const mapRef = useRef<maplibregl.Map | null>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const controlsRef = useRef<{ [key: string]: any }>({});

    const initializeMap = useCallback((container: HTMLElement) => {
        if (!PMTILES_PROTOCOL_REGISTERED) {
            const protocol = new Protocol();
            maplibregl.addProtocol("pmtiles", protocol.tile);
            PMTILES_PROTOCOL_REGISTERED = true;
        }

        mapRef.current = new maplibregl.Map({
            container,
            style: DEFAULT_MAP_STYLE,
            bounds: bounds,
            maxBounds: maxBounds,
            maplibreLogo: false,
            attributionControl: false,
            fadeDuration: 0,
            cooperativeGestures: true,
            locale: FRENCH_LOCALE,
        });

        mapRef.current.on("load", () => {
            setIsMapLoaded(true);
        });

        mapper.setMap(mapRef.current);

        return mapRef.current;
    }, [bounds, maxBounds]);

    const addControl = useCallback((control: any, id: string) => {
        if (!mapRef.current || controlsRef.current[id]) return;

        controlsRef.current[id] = control;
        mapRef.current.addControl(control, "top-right");
    }, []);

    const addNavigationControl = useCallback(() => {
        addControl(new maplibregl.NavigationControl(), 'navigationControl');
    }, [addControl]);

    const addFullscreenControl = useCallback(() => {
        const mapContainer = mapRef.current?.getContainer();
        const mapWrapper = mapContainer?.parentElement;

        if (mapWrapper && mapWrapper.id) {
            addControl(new maplibregl.FullscreenControl({ container: mapWrapper }), 'fullscreenControl');
        } else {
            addControl(new maplibregl.FullscreenControl(), 'fullscreenControl');
        }
    }, [addControl]);

    const removeControls = useCallback(() => {
        if (!mapRef.current) return;

        Object.values(controlsRef.current).forEach(control => {
            mapRef.current!.removeControl(control);
        });
        controlsRef.current = {};
    }, []);

    const updateControls = useCallback(() => {
        addNavigationControl();
        addFullscreenControl();
    }, [addNavigationControl, addFullscreenControl]);

    const fitBounds = useCallback((bounds: [number, number, number, number], options?: any) => {
        if (mapRef.current) mapRef.current.fitBounds(bounds, options);
    }, []);

    const flyTo = useCallback((center: [number, number], zoom?: number, options?: any) => {
        if (mapRef.current) mapRef.current.flyTo({ center, zoom, ...options });
    }, []);

    const updateSourcesAndLayers = useCallback(() => {
        const map = mapRef.current;
        if (!map) return;
    }, []);

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
        addNavigationControl,
        addFullscreenControl,
        removeControls,
        fitBounds,
        flyTo,
    };
};
