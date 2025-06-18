import { useRef, useState, useCallback, useEffect } from "react";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { MapConfig, ControlRefs } from "../types";
import ReactDOMClient from "react-dom/client";
import { renderToString } from "react-dom/server";

const FIT_OPTIONS = {
    padding: { top: 50, bottom: 50, left: 50, right: 50 },
    speed: 0.1,
};

export const useMap = (config: MapConfig) => {
    const mapRef = useRef<maplibregl.Map | null>(null);
    const controlsRef = useRef<ControlRefs>({});
    const popupRef = useRef<maplibregl.Popup | null>(null);
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
            locale: {
                'AttributionControl.ToggleAttribution': 'Ouvrir les crédits',
                'AttributionControl.MapFeedback': 'Signaler une erreur cartographique',
                'FullscreenControl.Enter': 'Entrer en plein écran',
                'FullscreenControl.Exit': 'Quitter le plein écran',
                'GeolocateControl.FindMyLocation': 'Trouver ma position',
                'GeolocateControl.LocationNotAvailable': 'Localisation non disponible',
                'LogoControl.Title': 'MapLibre logo',
                'Map.Title': 'Carte',
                'Marker.Title': 'Marqueur',
                'NavigationControl.ResetBearing': 'Réinitialiser l\'orientation',
                'NavigationControl.ZoomIn': 'Zoomer',
                'NavigationControl.ZoomOut': 'Dézoomer',
                'Popup.Close': 'Fermer la fenêtre',
                'ScaleControl.Meters': 'm',
                'ScaleControl.Kilometers': 'km',
                'GlobeControl.Enable': 'Activer le mode globe',
                'GlobeControl.Disable': 'Désactiver le mode globe',
                'TerrainControl.Enable': 'Activer le mode terrain',
                'TerrainControl.Disable': 'Désactiver le mode terrain',
                'CooperativeGesturesHandler.WindowsHelpText': 'Utilisez Ctrl + défilement pour zoomer la carte',
                'CooperativeGesturesHandler.MacHelpText': 'Utilisez ⌘ + défilement pour zoomer la carte',
                'CooperativeGesturesHandler.MobileHelpText': 'Pincer pour zoomer la carte',
            },
        });

        popupRef.current = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            maxWidth: '400px'
        });

        mapRef.current.on("load", () => {
            setIsMapLoaded(true);
        });
    }, [config]);

    const setupPopups = useCallback(() => {
        if (!mapRef.current || !popupRef.current || !config.popups) return;

        config.popups.forEach((popupConfig) => {
            const { layerId, renderContent } = popupConfig;

            mapRef.current!.on('mouseenter', layerId, () => {
                mapRef.current!.getCanvas().style.cursor = 'pointer';
            });

            mapRef.current!.on('mouseleave', layerId, () => {
                mapRef.current!.getCanvas().style.cursor = '';
                popupRef.current!.remove();
            });

            mapRef.current!.on('mousemove', layerId, (e) => {
                const feature = e.features?.[0];
                if (feature) {
                    const content = renderContent(feature, e);
                    const htmlContent = typeof content === 'string' ? content : renderToString(content);
                    
                    popupRef.current!
                        .setLngLat(e.lngLat)
                        .setHTML(htmlContent)
                        .addTo(mapRef.current!);
                }
            });
        });
    }, [config.popups]);

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
            if (popupRef.current) {
                popupRef.current.remove();
                popupRef.current = null;
            }
        };
    }, []);

    return {
        mapRef,
        isMapLoaded,
        initializeMap,
        updateControls,
        updateSourcesAndLayers,
        setupPopups,
    };
};
