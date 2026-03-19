import React, { useRef, useCallback, useState, useMemo } from "react";
import type maplibregl from "maplibre-gl";
import type { GeoJSONSource } from "maplibre-gl";
import { BaseMap } from "./BaseMap";
import { defineMapConfig } from "../types/builder";
import { LandDetailResultType } from "@services/types/land";
import { BASE_SOURCES, BASE_LAYERS, BASE_CONTROLS } from "../constants/presets";
import { getStartMillesimeIndex, getLastMillesimeIndex } from "../utils/ocsge";
import { bbox } from "@turf/turf";
import { ImpermeabilisationDiffSidePanel } from "./sidePanel";

const HIGHLIGHT_SOURCE = "imper-diff-highlight-source";
const HIGHLIGHT_LAYER = "imper-diff-highlight-layer";
const emptyFC: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };

interface ImpermeabilisationMapProps {
	landData: LandDetailResultType;
}

export const ImpermeabilisationDiffMap: React.FC<ImpermeabilisationMapProps> = ({
  	landData,
}) => {
	const startMillesimeIndex = getStartMillesimeIndex(landData.millesimes);
	const endMillesimeIndex = getLastMillesimeIndex(landData.millesimes);
	const endMillesime = landData.millesimes.find(m => m.index === endMillesimeIndex);
	const defaultDepartement = endMillesime?.departement || landData.departements[0];

	const mapRef = useRef<maplibregl.Map | null>(null);
	const [hoveredFeature, setHoveredFeature] = useState<maplibregl.MapGeoJSONFeature | null>(null);
	const [lockedFeature, setLockedFeature] = useState<maplibregl.MapGeoJSONFeature | null>(null);
	const lockedFeatureRef = useRef<maplibregl.MapGeoJSONFeature | null>(null);

	const updateHighlight = useCallback((map: maplibregl.Map, hovered: maplibregl.MapGeoJSONFeature | null) => {
		const source = map.getSource(HIGHLIGHT_SOURCE) as GeoJSONSource | undefined;
		if (!source) return;
		const locked = lockedFeatureRef.current;
		const features: GeoJSON.Feature[] = [];
		if (locked) features.push({ type: "Feature", geometry: locked.geometry, properties: {} });
		if (hovered && hovered !== locked) features.push({ type: "Feature", geometry: hovered.geometry, properties: {} });
		source.setData({ type: "FeatureCollection", features });
	}, []);

	const handleMapLoad = useCallback((map: maplibregl.Map) => {
		mapRef.current = map;

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

		map.addSource(HIGHLIGHT_SOURCE, { type: "geojson", data: emptyFC });
		map.addLayer({
			id: HIGHLIGHT_LAYER,
			type: "line",
			source: HIGHLIGHT_SOURCE,
			paint: {
				"line-color": "#000000",
				"line-width": 3,
				"line-opacity": 1,
			},
		});

		const getImperDiffLayers = (): string[] => {
			const style = map.getStyle();
			if (!style?.layers) return [];
			return style.layers
				.filter(l => l.id.startsWith("impermeabilisation-diff-layer"))
				.map(l => l.id);
		};

		const queryFeatures = (point: maplibregl.PointLike): maplibregl.MapGeoJSONFeature[] => {
			const layers = getImperDiffLayers();
			if (layers.length === 0) return [];
			return map.queryRenderedFeatures(point, { layers });
		};

		map.on("mousemove", (e) => {
			const features = queryFeatures(e.point);
			if (features.length > 0) {
				map.getCanvas().style.cursor = "pointer";
				setHoveredFeature(features[0]);
				updateHighlight(map, features[0]);
			} else {
				map.getCanvas().style.cursor = "";
				setHoveredFeature(null);
				updateHighlight(map, null);
			}
		});

		map.on("click", (e) => {
			const features = queryFeatures(e.point);
			if (features.length > 0) {
				const feature = features[0];
				lockedFeatureRef.current = feature;
				setLockedFeature(feature);
				const bounds = bbox(feature) as [number, number, number, number];
				map.fitBounds(bounds, { padding: { top: 120, bottom: 120, left: 60, right: 60 }, maxZoom: 17 });
				updateHighlight(map, feature);
			} else {
				lockedFeatureRef.current = null;
				setLockedFeature(null);
				updateHighlight(map, null);
			}
		});
	}, [landData.bounds, updateHighlight]);

	const config = useMemo(() => defineMapConfig({
		sources: [
			...BASE_SOURCES,
			{ type: "ocsge-diff" },
			{ type: "ocsge-diff-centroid" },
		],
		layers: [
			...BASE_LAYERS,
			{ type: "impermeabilisation-diff", stats: true },
			{ type: "impermeabilisation-diff-centroid-cluster" },
		],
		controlGroups: [
			...BASE_CONTROLS,
			{
				id: "impermeabilisation-diff-group",
				label: "Imperméabilisation",
				description: "La mesure de l'imperméabilisation d'un territoire repose sur la donnée OCS GE (Occupation du Sol à Grande Echelle). Ce calque permet de visualiser les surfaces imperméabilisées entre deux millésimes.",
				controls: [
					{
						id: "impermeabilisation-diff-visibility",
						type: "visibility",
						targetLayers: ["impermeabilisation-diff-layer", "impermeabilisation-diff-centroid-cluster"],
						defaultValue: true
					},
					{
						id: "impermeabilisation-diff-opacity",
						type: "opacity",
						targetLayers: ["impermeabilisation-diff-layer"],
						defaultValue: 0.7
					},
					{
						id: "impermeabilisation-diff-millesime",
						type: "ocsge-diff-millesime",
						targetLayers: ["impermeabilisation-diff-layer", "impermeabilisation-diff-centroid-cluster"],
						sourceId: "ocsge-diff-source",
						defaultValue: `${startMillesimeIndex}_${endMillesimeIndex}_${defaultDepartement}`
					}
				]
			}
		],
		infoPanels: [],
	}), [startMillesimeIndex, endMillesimeIndex, defaultDepartement]);

	const displayedFeature = lockedFeature ?? hoveredFeature;

	return (
		<BaseMap
			id="impermeabilisation-diff-map"
			config={config}
			landData={landData}
			onMapLoad={handleMapLoad}
			sidePanel={
				<ImpermeabilisationDiffSidePanel
					feature={displayedFeature}
					isLocked={!!lockedFeature}
					onClose={() => {
						lockedFeatureRef.current = null;
						setLockedFeature(null);
						if (mapRef.current) {
							updateHighlight(mapRef.current, null);
						}
					}}
				/>
			}
		/>
	);
};
