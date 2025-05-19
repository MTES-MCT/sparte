import { Protocol } from "pmtiles";
import React, { useRef, useEffect } from "react";
import maplibregl, { FilterSpecification } from "maplibre-gl";
import ReactDOMClient from "react-dom/client";
import { renderToString } from "react-dom/server";
import { UserFilter, Selection } from "./constants/selections";
import { OcsgeLeftPanelControl } from "./controls/OcsgeLeftPanelControl";
import { getOrthophotoURL, getOcsgeVectorTilesURL } from "./sources";

import "maplibre-gl/dist/maplibre-gl.css";
import { Popup } from "./Popup";
import { getMaplibrePaint } from "./utils/getMaplibrePaint";
import { getMaplibreFilters } from "./utils/getMaplibreFilters";
import { OcsgeMapLeftPanel } from "./OcsgeMapLeftPanel";
import Loader from "@components/ui/Loader";
import { getStats, Stat } from "./utils/getStats";
import styled from "styled-components";
import { OcgeMapStats } from "./OcsgeMapStats";
import { OcsgeTileFeatureProperties } from "./VectorTileFeature";
import { Millesime, MillesimeByIndex } from "@services/types/land";

const LoaderWrapper = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  position: absolute;
`;

const MapWrapper = styled.div`
  position: relative;
  border-radius: 6px;
  overflow: hidden;
`;

interface OcsgeMapProps {
  readonly selection: Selection;
  readonly userFilters: any;
  readonly setSelection: (selection: Selection) => void;
  readonly setUserFilters: (filters: UserFilter[]) => void;
  readonly globalFilter: any;
  readonly setIndex: (index: number) => void;
  readonly index: number;
  readonly departements?: string[];
  readonly availableMillesimes: Millesime[];
  readonly availableMillesimesByIndex: MillesimeByIndex[];
  readonly emprise: any;
  readonly bounds: [number, number, number, number];
  readonly maxBounds: [number, number, number, number];
  readonly vectorTilesLocation: string;
}

export function OcsgeMap({
  selection,
  setSelection,
  setUserFilters,
  setIndex,
  userFilters,
  globalFilter,
  departements,
  availableMillesimes,
  availableMillesimesByIndex,
  index,
  emprise,
  bounds,
  maxBounds,
  vectorTilesLocation,
}: OcsgeMapProps) {
  const [mapMovedEvent, setMapMovedEvent] = React.useState(null);
  const [controls, setControls] = React.useState([]);
  const [initialLoaded, setInitialLoaded] = React.useState(false);
  const [stats, setStats] = React.useState([] as Stat[]);

  const mapDiv = useRef(null);
  const map = useRef<maplibregl.Map>(null);
  const popup = useRef<maplibregl.Popup>(null);

  const initialPadding = {
    left: 300,
    top: 200,
    bottom: 100,
    right: 100,
  };

  const paddingAfterAnimation = {
    left: initialPadding.left,
    top: initialPadding.top / 2,
    bottom: initialPadding.bottom / 2,
    right: initialPadding.right / 2,
  };

  const filters = getMaplibreFilters(selection.matrix, userFilters, globalFilter) as FilterSpecification
  const paint = getMaplibrePaint(selection.matrix);

  const leftPanelControlElementId = "ocsge-matrix-selector";

  const empriseSourceId = "emprise";
  const empriseSource: maplibregl.GeoJSONSourceSpecification = {
    type: "geojson",
    data: emprise,
  };
  const empriseLayer: maplibregl.LineLayerSpecification = {
    id: "emprise",
    source: empriseSourceId,
    type: "line",
    paint: {
      "line-color": "black",
      "line-width": 3,
      "line-opacity": 0.5,
    },
    layout: {
      "line-cap": "round",
    },
  };

  const ocsgeLayers : {
    ocsgeSourceId: string;
    ocsgeSource: maplibregl.VectorSourceSpecification;
    sourceLayer: string;
    ocsgeLayer: maplibregl.FillLayerSpecification;
    ocsgeLayerId: string;
  }[] = []

  for (const departement of departements) {
    const ocsgeSourceId = `ocsge-${departement}`;

    const ocsgeSource: maplibregl.VectorSourceSpecification = {
      type: "vector",
      url: getOcsgeVectorTilesURL({
        tilesLocation: vectorTilesLocation,
        index,
        departement,
      }),
      promoteId: "id",
    };
    const sourceLayer = `occupation_du_sol_${index}_${departement}`;
    const ocsgeLayerId = `ocsge-${departement}`;
    const ocsgeLayer: maplibregl.FillLayerSpecification = {
      id: ocsgeLayerId,
      source: ocsgeSourceId,
      "source-layer": sourceLayer,
      type: "fill",
      paint: {
        "fill-color": paint,
        "fill-opacity": [
          "case",
          ["boolean", ["feature-state", "clicked"], false],
          1,
          0.8,
        ],
      },
      filter: filters,
    };

    ocsgeLayers.push({ ocsgeSourceId, ocsgeSource, sourceLayer, ocsgeLayer, ocsgeLayerId })
  }

  const orthophotoSourceId = `orthophoto`;
  const orthophotoSource: maplibregl.RasterSourceSpecification = {
    type: "raster",
    tiles: [getOrthophotoURL(2021)],
    tileSize: 256,
  };
  const orthophotoLayer: maplibregl.RasterLayerSpecification = {
    id: "orthophoto",
    source: orthophotoSourceId,
    type: "raster",
    paint: {
      "raster-opacity": 0.8,
    },
  };

  const updateStats = (selection: Selection) => {
    map.current.once("idle", () => {
      const features = map.current.queryRenderedFeatures({
        validate: false,
        layers: ocsgeLayers.map(({ ocsgeLayerId }) => ocsgeLayerId),
      });
  
      if (features.length === 0) {
        return setStats([]);
      }
  
      setStats(getStats(selection, features));
    });
  };

  /*

  Le UseEffect ci-dessous définit l'initialisation de la carte.
  Il n'est appelé qu'une seule fois, lors du premier rendu.
 
  Les event listeners sont uniquement ajoutés lors de l'initialisation, 
  et ne peuvent pas avoir de dépendances. Si des dépendances sont
  nécessaires, il faut passer par un UseEffect différent (voir plus bas
  pour l'event listener de "moveend").

  Si la fonctionnalité est statique (ne dépend pas des variables d'état),
  ou si elle nécessite d'accéder à des variables maplibre complexes (comme
  l'argument e d'un event listener), il est possible de laisser le listener
  dans ce UseEffect (voir plus bas pour l'event listener de "click").

  */

  useEffect(() => {
    if (map.current) return;
    if (!vectorTilesLocation) return;

    map.current = new maplibregl.Map({
      container: mapDiv.current,
      cooperativeGestures: true,
      maplibreLogo: false,
      attributionControl: false,
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
      style: {
        version: 8,
        sources: {
          ...ocsgeLayers.reduce((acc, { ocsgeSourceId, ocsgeSource }) => {
            acc[ocsgeSourceId] = ocsgeSource;
            return acc;
          }, {} as { [key: string]: maplibregl.VectorSourceSpecification }),
          [orthophotoSourceId]: orthophotoSource,
          [empriseSourceId]: empriseSource,
        },
        layers: [orthophotoLayer, ...ocsgeLayers.map(({ ocsgeLayer }) => ocsgeLayer) , empriseLayer],

      },
      bounds: bounds,
      maxBounds: maxBounds,
      fitBoundsOptions: {
        padding: initialPadding,
      },
    });
    map.current.getCanvas().style.cursor = "pointer";
    maplibregl.addProtocol("pmtiles", new Protocol().tile);

    popup.current = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: false,
    });

    map.current.on("moveend", setMapMovedEvent);
    for (const ocsgeLayer of ocsgeLayers) {
      map.current.on("click", ocsgeLayer.ocsgeLayerId, (e: any) => {
        const firstFeature = e.features[0] as maplibregl.Feature;
        const { code_cs, code_us, surface, is_artificial, is_impermeable, critere_seuil } =
          firstFeature.properties as OcsgeTileFeatureProperties;

        popup.current
          .setLngLat(e.lngLat)
          .setHTML(
            renderToString(
              <Popup
                couverture={code_cs}
                usage={code_us}
                surface={surface}
                isArtificial={is_artificial}
                critereSeuil={critere_seuil}
                isImpermeable={is_impermeable}
              />
            )
          )
          .addTo(map.current);
      });
    }

    map.current.on("load", () => {
      if (map.current.loaded()) {
        setInitialLoaded(true);
      }
    });
  }, [vectorTilesLocation]);


  // Met à jour les filtres, les styles et les contrôles de la carte
  useEffect(() => {
    if (
      selection &&
      selection.matrix.length > 0 &&
      initialLoaded &&
      !!map.current
    ) {
      for (const ocsgeLayer of ocsgeLayers) {
        map.current.setFilter(ocsgeLayer.ocsgeLayerId, filters);
        map.current.setPaintProperty(ocsgeLayer.ocsgeLayerId, "fill-color", paint);
      }


      controls.forEach((control) => map.current.removeControl(control));

      const matrixSelectorControl = new OcsgeLeftPanelControl(
        leftPanelControlElementId
      );
      const fullScreenControl = new maplibregl.FullscreenControl();
      const navigationControl = new maplibregl.NavigationControl();
      map.current.addControl(matrixSelectorControl, "top-left");
      map.current.addControl(fullScreenControl, "top-right");
      map.current.addControl(navigationControl, "top-right");
      setControls([
        matrixSelectorControl,
        fullScreenControl,
        navigationControl,
      ]);

      const leftPanelRoot = ReactDOMClient.createRoot(
        document.getElementById(leftPanelControlElementId)
      );
      leftPanelRoot.render(
        <OcsgeMapLeftPanel
          setSelection={setSelection}
          selection={selection}
          availableMillesimes={availableMillesimes}
          availableMillesimesByIndex={availableMillesimesByIndex}
          setIndex={setIndex}
          index={index}
          userFilters={userFilters}
          setUserFilters={setUserFilters}
        />
      );
    }
  }, [selection, initialLoaded, userFilters, index]);

  // Met à jour les sources et les layers de la carte
  useEffect(() => {
    if (initialLoaded) {
      // Orthophoto
      map.current.removeLayer(orthophotoLayer.id);
      map.current.removeSource(orthophotoSourceId);
      map.current.addSource(orthophotoSourceId, orthophotoSource);
      map.current.addLayer(orthophotoLayer);

      // Ocsge
      for (const ocsgeLayer of ocsgeLayers) {
      map.current.removeLayer(ocsgeLayer.ocsgeLayerId);
      map.current.removeSource(ocsgeLayer.ocsgeSourceId);
      map.current.addSource(ocsgeLayer.ocsgeSourceId, ocsgeLayer.ocsgeSource);
      map.current.addLayer(ocsgeLayer.ocsgeLayer);
      map.current.setFilter(ocsgeLayer.ocsgeLayerId, filters);
      }
      

      // Emprise
      map.current.removeLayer(empriseLayer.id);
      map.current.removeSource(empriseSourceId);
      map.current.addSource(empriseSourceId, empriseSource);
      map.current.addLayer(empriseLayer);
    }
  }, [index]);

  // Met à jour les stats de la carte
  useEffect(() => {
    if (initialLoaded) {
      updateStats(selection);
    }
  }, [mapMovedEvent, selection, initialLoaded, userFilters]);

  // Léger zoom de la carte lors de l'affichage initial
  useEffect(() => {
    if (initialLoaded) {
      map.current.fitBounds(bounds, {
        speed: 0.1,
        padding: paddingAfterAnimation,
      });
    }
  }, [initialLoaded]);

  /*

  Le style de la carte est défini ici en tant qu'objet JS
  car styled-components ne fonctionne pas cet élément (mauvais affichage).

  */
  const mapStyle = {
    height: "75vh",
    width: "100%",
    opacity: initialLoaded ? 1 : 0,
    zIndex: 0,
  };

  return (
    <MapWrapper>
      {!initialLoaded && (
        <LoaderWrapper>
          <Loader />
        </LoaderWrapper>
      )}
      <div style={mapStyle} ref={mapDiv} className="map" />
      <OcgeMapStats stats={stats} />
    </MapWrapper>
  );
}
