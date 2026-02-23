import React, { useRef, useCallback, useState, useMemo } from "react";
import type maplibregl from "maplibre-gl";
import type { GeoJSONSource } from "maplibre-gl";
import { BaseMap } from "./BaseMap";
import { defineMapConfig } from "../types/builder";
import { LandDetailResultType } from "@services/types/land";
import { BASE_SOURCES, BASE_LAYERS, BASE_CONTROLS } from "../constants/presets";
import { getLastMillesimeIndex, getFirstDepartement } from "../utils/ocsge";
import { OCSGE_LAYER_NOMENCLATURES } from "../constants/ocsge_nomenclatures";
import { NomenclatureType } from "../types/ocsge";
import { bbox } from "@turf/turf";
import type { ZonageUrbanismeMode } from "../layers/zonageUrbanismeLayer";
import { MODE_CONFIG } from "../constants/modeConfig";
import { OcsgeObjectSidePanel } from "./sidePanel";

const OCSGE_HIGHLIGHT_SOURCE = "ocsge-highlight-source";
const OCSGE_HIGHLIGHT_LAYER = "ocsge-highlight-layer";
const emptyFC: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };

interface OcsgeObjectMapProps {
	landData: LandDetailResultType;
	mode: ZonageUrbanismeMode;
	onMapReady?: (map: maplibregl.Map) => void;
}

export const OcsgeObjectMap: React.FC<OcsgeObjectMapProps> = ({
	landData,
	mode,
	onMapReady,
}) => {
	const nomenclature: NomenclatureType = "couverture";
	const lastMillesimeIndex = getLastMillesimeIndex(landData.millesimes);
	const firstDepartement = getFirstDepartement(landData.departements);
	const mapRef = useRef<maplibregl.Map | null>(null);
	const [hoveredFeature, setHoveredFeature] = useState<maplibregl.MapGeoJSONFeature | null>(null);
	const [lockedFeature, setLockedFeature] = useState<maplibregl.MapGeoJSONFeature | null>(null);
	const lockedOcsgeFeatureRef = useRef<maplibregl.MapGeoJSONFeature | null>(null);
	const { layerType, ocsgeLabel, ocsgeDescription } = MODE_CONFIG[mode];

	const updateOcsgeHighlight = useCallback((map: maplibregl.Map, hovered: maplibregl.MapGeoJSONFeature | null) => {
		const source = map.getSource(OCSGE_HIGHLIGHT_SOURCE) as GeoJSONSource | undefined;
		if (!source) return;
		const locked = lockedOcsgeFeatureRef.current;
		const features: GeoJSON.Feature[] = [];
		if (locked) features.push({ type: "Feature", geometry: locked.geometry, properties: {} });
		if (hovered && hovered !== locked) features.push({ type: "Feature", geometry: hovered.geometry, properties: {} });
		source.setData({ type: "FeatureCollection", features });
	}, []);

	const handleMapLoad = useCallback((map: maplibregl.Map) => {
		mapRef.current = map;
		onMapReady?.(map);

		// Offset the map center to account for the side panel
		requestAnimationFrame(() => {
			const containerWidth = map.getContainer().clientWidth;
			const remInPx = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
			const sidePanelWidth = Math.round(containerWidth * 0.33 + 1.5 * remInPx);
			map.setPadding({ top: 0, bottom: 0, left: 0, right: sidePanelWidth });
			if (landData.bounds) {
				map.fitBounds(landData.bounds, {
					padding: { top: 120, bottom: 120, left: 60, right: 60 }, animate: false,
				});
			}
		});

		// GeoJSON highlight source/layer for OCS GE features
		map.addSource(OCSGE_HIGHLIGHT_SOURCE, { type: "geojson", data: emptyFC });
		map.addLayer({
			id: OCSGE_HIGHLIGHT_LAYER,
			type: "line",
			source: OCSGE_HIGHLIGHT_SOURCE,
			paint: {
				"line-color": "#000000",
				"line-width": 3,
				"line-opacity": 1,
			},
		});

		const ocsgeLayerPrefix = `${layerType}-layer`;

		const getOcsgeLayers = (): string[] => {
			const style = map.getStyle();
			if (!style) return [];
			return style.layers
				.filter(l => l.id.startsWith(ocsgeLayerPrefix))
				.map(l => l.id);
		};

		const queryOcsgeFeatures = (point: maplibregl.PointLike): maplibregl.MapGeoJSONFeature[] => {
			const layers = getOcsgeLayers();
			if (layers.length === 0) return [];
			return map.queryRenderedFeatures(point, { layers });
		};

		map.on("mousemove", (e) => {
			const features = queryOcsgeFeatures(e.point);
			if (features.length > 0) {
				map.getCanvas().style.cursor = "pointer";
				setHoveredFeature(features[0]);
				updateOcsgeHighlight(map, features[0]);
			} else {
				map.getCanvas().style.cursor = "";
				setHoveredFeature(null);
				updateOcsgeHighlight(map, null);
			}
		});

		map.on("click", (e) => {
			const features = queryOcsgeFeatures(e.point);
			if (features.length > 0) {
				const feature = features[0];
				lockedOcsgeFeatureRef.current = feature;
				setLockedFeature(feature);
				const bounds = bbox(feature) as [number, number, number, number];
				map.fitBounds(bounds, { padding: { top: 120, bottom: 120, left: 60, right: 60 }, maxZoom: 17 });
				updateOcsgeHighlight(map, feature);
			} else {
				lockedOcsgeFeatureRef.current = null;
				setLockedFeature(null);
				updateOcsgeHighlight(map, null);
			}
		});
	}, [landData.bounds, updateOcsgeHighlight, onMapReady, mode]);


	const config = useMemo(() => defineMapConfig({
		sources: [
			...BASE_SOURCES,
			{ type: "ocsge" },
		],
		layers: [
			...BASE_LAYERS,
			{ type: layerType, nomenclature, stats: true },
		],
		controlGroups: [
			...BASE_CONTROLS,
			{
				id: `${layerType}-group`,
				label: ocsgeLabel,
				description: ocsgeDescription,
				controls: [
					{
						id: `${layerType}-visibility`,
						type: "visibility",
						targetLayers: [`${layerType}-layer`],
						defaultValue: true,
					},
					{
						id: `${layerType}-opacity`,
						type: "opacity",
						targetLayers: [`${layerType}-layer`],
						defaultValue: 0.7,
					},
					{
						id: `${layerType}-millesime`,
						type: "ocsge-millesime-index",
						targetLayers: [`${layerType}-layer`],
						sourceId: "ocsge-source",
						defaultValue: `${lastMillesimeIndex}_${firstDepartement}`,
						addControlsAboveMap: true,
					},
					{
						id: `${layerType}-nomenclature`,
						type: "ocsge-nomenclature",
						targetLayers: [`${layerType}-layer`],
						linkedFilterId: `${layerType}-filter`,
						defaultValue: nomenclature,
						addControlsAboveMap: true,
					},
					{
						id: `${layerType}-filter`,
						type: "ocsge-nomenclature-filter",
						targetLayers: [`${layerType}-layer`],
						defaultValue: OCSGE_LAYER_NOMENCLATURES[layerType][nomenclature],
					},
				],
			},
		],
		infoPanels: [],
	}), [layerType, nomenclature, ocsgeLabel, ocsgeDescription, lastMillesimeIndex, firstDepartement]);

	const displayedFeature = lockedFeature ?? hoveredFeature;

	return (
		<BaseMap
			id={`ocsge-object-${mode}-map`}
			config={config}
			landData={landData}
			onMapLoad={handleMapLoad}
			sidePanel={
				<OcsgeObjectSidePanel
					feature={displayedFeature}
					isLocked={!!lockedFeature}
					onClose={() => {
						lockedOcsgeFeatureRef.current = null;
						setLockedFeature(null);
						if (mapRef.current) {
							updateOcsgeHighlight(mapRef.current, null);
						}
					}}
					mode={mode}
					landData={landData}
				/>
			}
		/>
	);
};
