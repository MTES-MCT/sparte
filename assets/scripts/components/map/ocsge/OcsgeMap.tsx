import { Protocol } from "pmtiles";
import React, { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import ReactDOMClient from "react-dom/client";
import { renderToString } from "react-dom/server";
import { UserFilter, Selection } from "./constants/selections";
import { OcsgeLeftPanelControl } from "./controls/OcsgeLeftPanelControl";
import { getOrthophotoURL, getOcsgeVectorTilesURL } from "./sources";

import "maplibre-gl/dist/maplibre-gl.css";
import { Couverture, couvertures, Usage, usages } from "./constants/cs_and_us";
import { Popup } from "./Popup";
import { getMaplibrePaint } from "./utils/getMaplibrePaint";
import { getMaplibreFilters } from "./utils/getMaplibreFilters";
import { OcsgeMapLeftPanel } from "./OcsgeMapLeftPanel";
import { getCouvertureColorAsRGBString, getCouvertureOrUsageAsRGBString } from "./constants/colors";
import { area } from "@turf/turf";
import { couvertureLabels, getCouvertureOrUsageLabel } from "./constants/labels";
import { OcsgeStatsBar } from "./OcsgeStatsBar";

type RawOcsgeStats = {
  couvertures: { [key in Couverture]: number };
  usages: { [key in Usage]: number };
};

type Stat = {
  code: Couverture | Usage;
  percent: number;
}

type OcsgeStats = {
  couvertures: Stat[];
  usages: Stat[];
};

const getEmptyStats = () => {
  const emptyStats = {
    couvertures: {},
    usages: {},
  } as RawOcsgeStats;

  for (const couverture of couvertures) {
    emptyStats.couvertures[couverture] = 0;
  }

  for (const usage of usages) {
    emptyStats.usages[usage] = 0;
  }
  return emptyStats;
};

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
}: OcsgeMapProps) {
  const [controls, setControls] = React.useState([]);
  const [stats, setStats] = React.useState({
    couvertures: [] as Stat[],
    usages: [] as Stat[],
  } as OcsgeStats);
  const mapDiv = useRef(null);
  const map = useRef<maplibregl.Map>(null);

  const [initialLoaded, setInitialLoaded] = React.useState(false);

  const filters = getMaplibreFilters(selection.matrix, userFilters);
  const paint = getMaplibrePaint(selection.matrix);

  useEffect(() => {
    maplibregl.addProtocol("pmtiles", new Protocol().tile);
    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  const matrixSelectorId = `ocsge-matrix-selector-${year}`;

  const empriseSourceId = `emprise`;
  const empriseSource = {
    type: "geojson",
    data: emprise,
  } as maplibregl.GeoJSONSourceSpecification;
  const empriseLayer = {
    id: "emprise",
    source: empriseSourceId,
    type: "line",
    paint: {
      "line-color": "#000",
      "line-width": 3,
    },
  } as maplibregl.LineLayerSpecification;

  const ocsgeSourceId = `ocsge`;
  const ocsgeSource = {
    type: "vector",
    url: getOcsgeVectorTilesURL(year, departement),
    promoteId: "id",
  } as maplibregl.VectorSourceSpecification;
  const sourceLayer = `occupation_du_sol_${year}_${departement}`;
  const ocsgeLayerId = `ocsge`;
  const ocsgeLayer: any = {
    id: ocsgeLayerId,
    source: ocsgeSourceId,
    "source-layer": sourceLayer,
    type: "fill",
    paint: {
      "fill-color": paint,
      "fill-opacity": 0.7,
    },
  };

  const orthophotoSourceId = `orthophoto`;
  const orthophotoSource = {
    type: "raster",
    tiles: [getOrthophotoURL(year)],
  } as maplibregl.RasterSourceSpecification;
  const orthophotoLayer = {
    id: "orthophoto",
    source: orthophotoSourceId,
    type: "raster",
    paint: {
      "raster-opacity": 0.7,
    },
  } as maplibregl.RasterLayerSpecification;

  const updateStats = () => {
    const features = map.current.queryRenderedFeatures();
    if (features.length > 0) {
      const rawStats = features.reduce((acc, feature) => {
        const { code_cs, code_us } = feature.properties as {
          code_cs: Couverture;
          code_us: Usage;
          surface: number;
        };
        acc.couvertures[code_cs] += area(feature.geometry);
        acc.usages[code_us] += area(feature.geometry);

        return acc;
      }, getEmptyStats());

      const stats = {
        couvertures: [],
        usages: [],
      } as OcsgeStats;

      const totalSurface = Object.values(rawStats.couvertures)
        .filter((surface) => !isNaN(surface))
        .reduce((acc, surface) => acc + surface, 0);

      for (const couverture of couvertures) {
        const couverturePercent =
          (rawStats.couvertures[couverture] / totalSurface) * 100;
        stats.couvertures.push({
          code: couverture,
          percent: couverturePercent,
        })
      }
      for (const usage of usages) {
        const usagePercent = (rawStats.usages[usage] / totalSurface) * 100;
        stats.usages.push({
          code: usage,
          percent: usagePercent,
        })
      }

      setStats(stats);
    }
  };

  useEffect(() => {
    if (map.current) return; // stops map from intializing more than once

    const mapOptions = {
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
        padding: {
          left: 200,
          top: 100,
          bottom: 50,
          right: 50,
        },
      },
    } as maplibregl.MapOptions;

    map.current = new maplibregl.Map(mapOptions);

    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    map.current.on("moveend", updateStats);
    map.current.on("mousemove", ocsgeLayerId, (e: any) => {
      if (e.features.length === 0) {
        popup.remove();
        return;
      }

      map.current.getCanvas().style.cursor = "pointer";
      const firstFeature = e.features[0];
      const { code_cs, code_us, surface, is_artificial, is_impermeable } =
        firstFeature.properties as {
          code_cs: Couverture;
          code_us: Usage;
          surface: number;
          is_artificial: boolean;
          is_impermeable: boolean;
        };

      popup
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
    map.current.on("mouseleave", ocsgeLayerId, () => {
      map.current.getCanvas().style.cursor = "";
      popup.remove();
    });

    map.current.on("idle", () => {
      if (!initialLoaded) {
        setInitialLoaded(true);
        updateStats();
      }
    });

    map.current.addControl(new maplibregl.FullscreenControl(), "top-right");
  });

  useEffect(() => {
    if (
      selection &&
      selection.matrix.length > 0 &&
      initialLoaded &&
      !!map.current
    ) {
      // Change le style et les filtres
      map.current.setFilter(ocsgeLayerId, ["any", ...filters]);
      map.current.setPaintProperty(ocsgeLayerId, "fill-color", paint);

      // Supprime et réajoute les contrôles
      controls.forEach((control) => map.current.removeControl(control));

      const matrixSelectorControl = new OcsgeLeftPanelControl(matrixSelectorId);
      map.current.addControl(matrixSelectorControl, "top-left");
      setControls([matrixSelectorControl]);
      const matrixSelectorRoot = ReactDOMClient.createRoot(
        document.getElementById(matrixSelectorId)
      );
      if (matrixSelectorControl) {
        matrixSelectorRoot.render(
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
    }
  }, [selection, initialLoaded, userFilters, year]);

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

  const mapStyle = {
    height: "75vh",
    width: "100%",
  };

  return (
    <div className="map-wrap">
      <div style={mapStyle} ref={mapDiv} className="map" />
      <OcsgeStatsBar />
      <div style={{ display: "flex", flexDirection: "row" }}>
        {stats.couvertures.map(({ code, percent}) => (
          <div
            aria-describedby={`tooltip-${code}-percent`}
            key={`${code}-percent`}
            style={{
              height: "15px",
              width: `${percent}%`,
              backgroundColor: getCouvertureOrUsageAsRGBString(code),
            }}
          >
            <span
              className="fr-tooltip fr-placement"
              id={`tooltip-${code}-percent`}
              role="tooltip"
              aria-hidden="true"
            >
              <span className="fr-tooltip__content">
                <span>
                  {getCouvertureOrUsageLabel(code)} - ({code}) (
                  {Math.round(percent * 100) / 100}%)
                </span>
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
