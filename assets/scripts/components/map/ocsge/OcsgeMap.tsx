import { Protocol } from "pmtiles";
import React, { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
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

const LoaderWrapper = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  position: absolute;
  z-index: 1000;
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
  readonly setYear: (year: number) => void;
  readonly year: number;
  readonly departement?: string;
  readonly availableMillesimes: number[];
  readonly emprise: any;
  readonly bounds: [number, number, number, number];
  readonly maxBounds: [number, number, number, number];
  readonly vectorTilesLocation: string;
}

export function OcsgeMap({
  selection,
  setSelection,
  setUserFilters,
  setYear,
  userFilters,
  departement,
  availableMillesimes,
  year,
  emprise,
  bounds,
  maxBounds,
  vectorTilesLocation,
}: OcsgeMapProps) {
  const [clickedFeatureId, setClickedFeatureId] = React.useState(null);
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

  const filters = getMaplibreFilters(selection.matrix, userFilters);
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
      "line-color": "#000",
      "line-width": 3,
      "line-opacity": 0.5,
    },
    layout: {
      "line-cap": "round",
    },
  };

  const ocsgeSourceId = `ocsge`;
  const ocsgeSource: maplibregl.VectorSourceSpecification = {
    type: "vector",
    url: getOcsgeVectorTilesURL({
      tilesLocation: vectorTilesLocation,
      year: year,
      departement: departement,
    }),
    promoteId: "id",
  };
  const sourceLayer = `occupation_du_sol_${year}_${departement}`;
  const ocsgeLayerId = `ocsge`;
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
  };

  const orthophotoSourceId = `orthophoto`;
  const orthophotoSource: maplibregl.RasterSourceSpecification = {
    type: "raster",
    tiles: [getOrthophotoURL(year)],
    tileSize: 128,
  };
  const orthophotoLayer: maplibregl.RasterLayerSpecification = {
    id: "orthophoto",
    source: orthophotoSourceId,
    type: "raster",
    paint: {
      "raster-opacity": 0.7,
    },
  };

  const updateStats = (selection: Selection) => {
    map.current.once("idle", () => {
      const features = map.current.queryRenderedFeatures({
        validate: false,
        layers: [ocsgeLayerId],
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
      style: {
        version: 8,
        sources: {
          [ocsgeSourceId]: ocsgeSource,
          [orthophotoSourceId]: orthophotoSource,
          [empriseSourceId]: empriseSource,
        },
        layers: [orthophotoLayer, ocsgeLayer, empriseLayer],
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
    map.current.on("click", ocsgeLayerId, (e: any) => {
      const noFeatureUnderCursor = e.features.length === 0;
      if (noFeatureUnderCursor) {
        return setClickedFeatureId(null);
      }
      const firstFeature = e.features[0] as maplibregl.Feature;
      setClickedFeatureId(firstFeature.id);
      const { code_cs, code_us, surface, is_artificial, is_impermeable } =
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
              isImpermeable={is_impermeable}
            />
          )
        )
        .addTo(map.current);
    });

    map.current.on("load", () => {
      if (map.current.loaded()) {
        setInitialLoaded(true);
      }
    });
  }, [vectorTilesLocation]);

  // Met à jour l'état "clicked" des features
  useEffect(() => {
    if (clickedFeatureId === null) {
      return;
    }

    map.current.setFeatureState(
      {
        source: ocsgeSourceId,
        sourceLayer: sourceLayer,
        id: clickedFeatureId,
      },
      { clicked: true }
    );
    return () => {
      map.current.setFeatureState(
        {
          source: ocsgeSourceId,
          sourceLayer: sourceLayer,
          id: clickedFeatureId,
        },
        { clicked: false }
      );
    };
  }, [clickedFeatureId]);

  // Met à jour les filtres, les styles et les contrôles de la carte
  useEffect(() => {
    if (
      selection &&
      selection.matrix.length > 0 &&
      initialLoaded &&
      !!map.current
    ) {
      map.current.setFilter(ocsgeLayerId, ["any", ...filters]);
      map.current.setPaintProperty(ocsgeLayerId, "fill-color", paint);

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
          setYear={setYear}
          year={year}
          userFilters={userFilters}
          setUserFilters={setUserFilters}
        />
      );
    }
  }, [selection, initialLoaded, userFilters, year]);

  // Met à jour les sources et les layers de la carte
  useEffect(() => {
    if (initialLoaded) {
      // Orthophoto
      map.current.removeLayer(orthophotoLayer.id);
      map.current.removeSource(orthophotoSourceId);
      map.current.addSource(orthophotoSourceId, orthophotoSource);
      map.current.addLayer(orthophotoLayer);

      // Ocsge
      map.current.removeLayer(ocsgeLayerId);
      map.current.removeSource(ocsgeSourceId);
      map.current.addSource(ocsgeSourceId, ocsgeSource);
      map.current.addLayer(ocsgeLayer);

      // Emprise
      map.current.removeLayer(empriseLayer.id);
      map.current.removeSource(empriseSourceId);
      map.current.addSource(empriseSourceId, empriseSource);
      map.current.addLayer(empriseLayer);
    }
  }, [year]);

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
