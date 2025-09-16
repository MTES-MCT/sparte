import { useRef, useState, useCallback, useEffect } from "react";
import maplibregl from "maplibre-gl";
import type { GeoJSONSource } from "maplibre-gl";
import { Protocol } from "pmtiles";
import { MapConfig, ControlRefs } from "../types/index";
import { APP_DEFAULTS } from "../../constants/config";


let PMTILES_PROTOCOL_REGISTERED = false;

export const useMap = (config: MapConfig) => {
    const mapRef = useRef<maplibregl.Map | null>(null);
    const controlsRef = useRef<ControlRefs>({});
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const hasInitializedRef = useRef(false);

    const initializeMap = useCallback((container: HTMLElement) => {
        if (!PMTILES_PROTOCOL_REGISTERED) {
            const protocol = new Protocol();
            maplibregl.addProtocol("pmtiles", protocol.tile);
            PMTILES_PROTOCOL_REGISTERED = true;
        }

        mapRef.current = new maplibregl.Map({
            container,
            style: config.style,
            bounds: config.bounds,
            maxBounds: config.maxBounds,
            fitBoundsOptions: APP_DEFAULTS.FIT_OPTIONS,
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


        mapRef.current.on("load", () => {
            setIsMapLoaded(true);
        });
    }, [config]);


    const updateControls = useCallback(() => {
        const map = mapRef.current;
        if (!map) return;

        const scrollZoom = map.scrollZoom;
        config.controls?.scrollZoom ? scrollZoom.enable() : scrollZoom.disable();

        if (config.controls?.navigationControl) {
            if (!controlsRef.current.navigationControl) {
                const nav = new maplibregl.NavigationControl();
                controlsRef.current.navigationControl = nav;
                map.addControl(nav, "top-right");
            }
        } else if (controlsRef.current.navigationControl) {
            map.removeControl(controlsRef.current.navigationControl);
            controlsRef.current.navigationControl = undefined;
        }

        if (config.controls?.fullscreenControl) {
            if (!controlsRef.current.fullscreenControl) {
                const fs = new maplibregl.FullscreenControl();
                controlsRef.current.fullscreenControl = fs;
                map.addControl(fs, "top-right");
            }
        } else if (controlsRef.current.fullscreenControl) {
            map.removeControl(controlsRef.current.fullscreenControl);
            controlsRef.current.fullscreenControl = undefined;
        }
    }, [config.controls]);

    const updateSourcesAndLayers = useCallback(() => {
        const map = mapRef.current;
        if (!map) return;

        if (!hasInitializedRef.current) {
            map.fitBounds(config.bounds, APP_DEFAULTS.FIT_OPTIONS);
            hasInitializedRef.current = true;
        }

        config.sources?.forEach(({ id, source }: { id: string; source: any }) => {
            const existing = map.getSource(id);
            if (!existing) {
                map.addSource(id, source);
            } else if (source.type === 'geojson') {
                try {
                    (existing as GeoJSONSource).setData((source as any).data);
                } catch (error) {
                    console.warn(`Erreur lors de la mise à jour de la source ${id}:`, error);
                }
            }
        });

        config.layers?.forEach(({ id, layer }: { id: string; layer: any }) => {
            if (!map.getLayer(id)) {
                map.addLayer(layer);
            }
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
