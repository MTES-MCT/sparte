import React, { useRef, useCallback, useState, useMemo, useEffect } from "react";
import styled from "styled-components";
import type maplibregl from "maplibre-gl";
import { BaseMap } from "./BaseMap";
import { defineMapConfig } from "../types/builder";
import { LandDetailResultType } from "@services/types/land";

import { getLastMillesimeIndex, getFirstDepartement, getCouvertureLabel, getUsageLabel } from "../utils/ocsge";
import { OCSGE_LAYER_NOMENCLATURES, COUVERTURE_COLORS, USAGE_COLORS } from "../constants/ocsge_nomenclatures";
import { NomenclatureType } from "../types/ocsge";

import type { ZonageUrbanismeMode } from "../layers/zonageUrbanismeLayer";
import type { ControlsManager } from "../controls/ControlsManager";
import { MODE_CONFIG } from "../constants/modeConfig";
import ChartDetails from "@components/charts/ChartDetails";
import { ZonageUrbanismeSidePanel, type SurfaceUnit } from "./sidePanel";

const OcsgeTooltip = styled.div`
	position: absolute;
	pointer-events: none;
	background: rgba(0, 0, 0, 0.8);
	color: #fff;
	padding: 4px 8px;
	border-radius: 4px;
	font-size: 0.75rem;
	white-space: nowrap;
	z-index: 10;
	transform: translate(12px, -50%);
`;

interface ZonageUrbanismeMapProps {
	landData: LandDetailResultType;
	mode: ZonageUrbanismeMode;
	initialChecksum?: string;
	onMapReady?: (map: maplibregl.Map) => void;
}

export const ZonageUrbanismeMap: React.FC<ZonageUrbanismeMapProps> = ({
	landData,
	mode,
	initialChecksum,
	onMapReady,
}) => {
	const [nomenclature, setNomenclature] = useState<NomenclatureType>("couverture");
	const [unit, setUnit] = useState<SurfaceUnit>("ha");
	const lastMillesimeIndex = getLastMillesimeIndex(landData.millesimes);
	const firstDepartement = getFirstDepartement(landData.departements);
	const mapRef = useRef<maplibregl.Map | null>(null);

	const [hoveredFeature, setHoveredFeature] = useState<maplibregl.MapGeoJSONFeature | null>(null);
	const [lockedFeature, setLockedFeature] = useState<maplibregl.MapGeoJSONFeature | null>(null);
	const lockedChecksumRef = useRef<string | null>(null);
	const {
		layerType, mapLabel, mapDescription, ocsgeLabel, ocsgeDescription,
		nonArtifLabel, chartDescription,
	} = MODE_CONFIG[mode];
	const nomenclatureControlId = `${layerType}-nomenclature`;
	const controlsManagerRef = useRef<ControlsManager | null>(null);
	const nomenclatureRef = useRef<NomenclatureType>(nomenclature);
	const tooltipRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		nomenclatureRef.current = nomenclature;
	}, [nomenclature]);

	const handleControlsReady = useCallback((manager: ControlsManager) => {
		controlsManagerRef.current = manager;
		const unsub = manager.subscribe(() => {
			const val = manager.getControlValue(nomenclatureControlId) as NomenclatureType;
			if (val) setNomenclature(val);
		});
		return unsub;
	}, [nomenclatureControlId]);

	const label = mapLabel;
	const description = mapDescription;

	const updateOutline = useCallback((map: maplibregl.Map, hoveredChecksum: string | null) => {
		const locked = lockedChecksumRef.current;

		const style = map.getStyle();
		if (!style) return;

		// Update highlight outline layers (only for locked/selected)
		const highlightFilter: maplibregl.FilterSpecification = locked
			? ["==", ["get", "checksum"], locked]
			: ["==", ["get", "checksum"], ""];
		const highlightLayers = style.layers
			.filter(l => l.id.startsWith("zonage-urbanisme-layer-highlight"))
			.map(l => l.id);
		for (const layerId of highlightLayers) {
			map.setFilter(layerId, highlightFilter);
		}

		// Set fill opacity: 0% on selected, 50% on hovered
		for (const layerId of style.layers.filter(l => l.id === "zonage-urbanisme-layer").map(l => l.id)) {
			if (locked && hoveredChecksum && hoveredChecksum !== locked) {
				map.setPaintProperty(layerId, "fill-opacity", [
					"case",
					["==", ["get", "checksum"], locked],
					0,
					["==", ["get", "checksum"], hoveredChecksum],
					0.5,
					1,
				]);
			} else if (locked) {
				map.setPaintProperty(layerId, "fill-opacity", [
					"case",
					["==", ["get", "checksum"], locked],
					0,
					1,
				]);
			} else if (hoveredChecksum) {
				map.setPaintProperty(layerId, "fill-opacity", [
					"case",
					["==", ["get", "checksum"], hoveredChecksum],
					0.5,
					1,
				]);
			} else {
				map.setPaintProperty(layerId, "fill-opacity", 1);
			}
		}

	}, []);

	const getFeatureExtent = (feature: maplibregl.MapGeoJSONFeature | GeoJSON.Feature): [number, number, number, number] | null => {
		const extent = feature.properties?.extent as string | undefined;
		if (!extent) {
			console.error("[getFeatureExtent] Missing extent property", feature.properties);
			return null;
		}
		// Format: "BOX(xmin ymin,xmax ymax)"
		const match = extent.match(/BOX\(([^ ]+) ([^,]+),([^ ]+) ([^)]+)\)/);
		if (!match) {
			console.error("[getFeatureExtent] Invalid extent format", extent);
			return null;
		}
		return [Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4])];
	};

	const handleMapLoad = useCallback((map: maplibregl.Map) => {
		mapRef.current = map;
		onMapReady?.(map);

		// Offset the map center to account for the side panel (33% on the right)
		requestAnimationFrame(() => {
			const containerWidth = map.getContainer().clientWidth;
			const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
			const sidePanelWidth = Math.round(containerWidth * 0.33 + 1.5 * remInPx);
			map.setPadding({ top: 0, bottom: 0, left: 0, right: sidePanelWidth });
			if (landData.bounds) {
				map.fitBounds(landData.bounds as [number, number, number, number], {
					padding: { top: 120, bottom: 120, left: 60, right: 60 }, animate: false,
				});
			}
		});

		const zonageLayerPrefix = "zonage-urbanisme-layer";
		let hoveredChecksum: string | null = null;
		let lastMoveTime = 0;

		const getZonageLayers = (): string[] => {
			const style = map.getStyle();
			if (!style) return [];
			return style.layers
				.filter(l => l.id.startsWith(zonageLayerPrefix) && !l.id.includes("outline") && !l.id.includes("highlight"))
				.map(l => l.id);
		};

		const queryZonageFeatures = (point: maplibregl.PointLike): maplibregl.MapGeoJSONFeature[] => {
			const layers = getZonageLayers();
			if (layers.length === 0) return [];
			return map.queryRenderedFeatures(point, { layers });
		};

		const queryAllZonageRendered = (): maplibregl.MapGeoJSONFeature[] => {
			const layers = getZonageLayers();
			if (layers.length === 0) return [];
			return map.queryRenderedFeatures(undefined, { layers });
		};

		const ocsgeLayerId = `${layerType}-layer`;
		const queryOcsgeFeatures = (point: maplibregl.PointLike): maplibregl.MapGeoJSONFeature[] => {
			const style = map.getStyle();
			if (!style) return [];
			const layers = style.layers.filter(l => l.id === ocsgeLayerId).map(l => l.id);
			if (layers.length === 0) return [];
			return map.queryRenderedFeatures(point, { layers });
		};

		const showTooltip = (x: number, y: number, text: string, color?: string) => {
			const el = tooltipRef.current;
			if (!el) return;
			if (color) {
				el.innerHTML = `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${color};margin-right:6px;vertical-align:middle"></span>${text}`;
			} else {
				el.textContent = text;
			}
			el.style.left = `${x}px`;
			el.style.top = `${y}px`;
			el.style.display = "block";
		};

		const hideTooltip = () => {
			const el = tooltipRef.current;
			if (el) el.style.display = "none";
		};

		map.on("mousemove", (e) => {
			const now = performance.now();
			if (now - lastMoveTime < 10) return;
			lastMoveTime = now;

			const lowZoom = map.getZoom() < 10;

			const features = queryZonageFeatures(e.point);
			if (features.length > 0) {
				map.getCanvas().style.cursor = "pointer";
				const feature = features[0];
				const checksum = feature.properties?.checksum ?? null;
				if (checksum !== hoveredChecksum) {
					hoveredChecksum = checksum;
					setHoveredFeature(feature);
					if (!lowZoom) {
						updateOutline(map, checksum);
					}
				}
			} else if (hoveredChecksum !== null) {
				map.getCanvas().style.cursor = "";
				hoveredChecksum = null;
				setHoveredFeature(null);
				if (!lowZoom) {
					updateOutline(map, null);
				}
			}

			if (lowZoom) {
				if (tooltipRef.current) tooltipRef.current.style.display = "none";
				return;
			}

			// OCSGE tooltip when a zonage is selected
			if (lockedChecksumRef.current) {
				// Only show tooltip if the topmost zonage at cursor IS the selected one
				const topZonage = features.length > 0 ? features[0] : null;
				const topIsLocked = topZonage?.properties?.checksum === lockedChecksumRef.current;

				if (topIsLocked) {
					const ocsgeFeatures = queryOcsgeFeatures(e.point);
					if (ocsgeFeatures.length > 0) {
						const props = ocsgeFeatures[0].properties;
						const nom = nomenclatureRef.current;
						const code = nom === "couverture" ? props?.code_cs : props?.code_us;
						const colorMap = nom === "couverture" ? COUVERTURE_COLORS : USAGE_COLORS;
						const color = code ? (colorMap as Record<string, string>)[code] : undefined;
						const label = code
							? (nom === "couverture" ? getCouvertureLabel(code) : getUsageLabel(code))
							: null;
						showTooltip(e.point.x, e.point.y, label || nonArtifLabel, color);
					} else {
						showTooltip(e.point.x, e.point.y, nonArtifLabel);
					}
				} else {
					hideTooltip();
				}
			} else {
				hideTooltip();
			}
		});

		map.on("click", (e) => {
			const features = queryZonageFeatures(e.point);
			if (features.length > 0) {
				const feature = features[0];
				const checksum = feature.properties?.checksum ?? null;
				lockedChecksumRef.current = checksum;
				setLockedFeature(feature);
				const bounds = getFeatureExtent(feature);
				if (bounds) map.fitBounds(bounds, { padding: { top: 120, bottom: 120, left: 60, right: 60 }, maxZoom: 17 });
				updateOutline(map, checksum);
			} else {
				lockedChecksumRef.current = null;
				setLockedFeature(null);
				updateOutline(map, null);
				if (landData.bounds) {
					map.fitBounds(landData.bounds as [number, number, number, number], { padding: 60 });
				}
			}
		});

		map.on("sourcedata", (e) => {
			const checksum = lockedChecksumRef.current;
			if (!checksum || !e.isSourceLoaded) return;
			const rendered = queryAllZonageRendered();
			const match = rendered.find(f => f.properties?.checksum === checksum);
			if (match) {
				setLockedFeature(match);
			}
		});

		if (initialChecksum) {
			const selectZonageByChecksum = () => {
				// Query all zonage sources (primary + extra department sources)
				const style = map.getStyle();
				const zonageSources = style ? Object.keys(style.sources).filter(s => s.startsWith("zonage-urbanisme-source")) : [];
				for (const sourceId of zonageSources) {
					const sourceLayers = style!.layers
						.filter((l: any) => l.source === sourceId && 'source-layer' in l)
						.map((l: any) => l['source-layer'] as string)
						.filter((v, i, a) => a.indexOf(v) === i);
					for (const sourceLayer of sourceLayers) {
						const features = map.querySourceFeatures(sourceId, {
							sourceLayer,
							filter: ["==", ["get", "checksum"], initialChecksum],
						});
						if (features.length > 0) {
							const feature = features[0];
							lockedChecksumRef.current = initialChecksum;
							setLockedFeature(feature as unknown as maplibregl.MapGeoJSONFeature);
							const bounds = getFeatureExtent(feature);
							if (bounds) map.fitBounds(bounds, { padding: { top: 120, bottom: 120, left: 60, right: 60 }, maxZoom: 17 });
							updateOutline(map, initialChecksum);
							return true;
						}
					}
				}
				return false;
			};

			if (!selectZonageByChecksum()) {
				const onSourceData = () => {
					if (selectZonageByChecksum()) {
						map.off("sourcedata", onSourceData);
					}
				};
				map.on("sourcedata", onSourceData);
			}
		}
	}, [landData.bounds, updateOutline, onMapReady, mode, initialChecksum, lastMillesimeIndex, firstDepartement]);


	const config = useMemo(() => defineMapConfig({
		sources: [
			{ type: "orthophoto" },
			{ type: "emprise" },
			{ type: "ocsge" },
			{ type: "zonage-urbanisme" },
		],
		layers: [
			{ type: "orthophoto" },
			{ type: "emprise" },
			{ type: layerType, nomenclature },
			{ type: "zonage-urbanisme", mode },
		],
		controlGroups: [
			{
				id: "orthophoto-group",
				label: "Fond de carte",
				description: "Image aérienne du territoire",
				controls: [
					{
						id: "orthophoto-visibility",
						type: "visibility",
						targetLayers: ["orthophoto-layer"],
						defaultValue: true,
					},
					{
						id: "orthophoto-opacity",
						type: "opacity",
						targetLayers: ["orthophoto-layer"],
						defaultValue: 1,
					},
				],
			},
			{
				id: "emprise-group",
				label: "Emprise du territoire",
				description: "Contour géographique du territoire",
				controls: [
					{
						id: "emprise-visibility",
						type: "visibility",
						targetLayers: ["emprise-layer"],
						defaultValue: true,
					},
					{
						id: "emprise-opacity",
						type: "opacity",
						targetLayers: ["emprise-layer"],
						defaultValue: 1,
					},
				],
			},
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
						defaultValue: 1,
					},
					{
						id: `${layerType}-millesime`,
						type: "ocsge-millesime-index",
						targetLayers: [`${layerType}-layer`],
						sourceId: "ocsge-source",
						defaultValue: `${lastMillesimeIndex}_${firstDepartement}`,
						linkedMillesimeIds: ["zonage-urbanisme-millesime"],
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
			{
				id: "zonage-urbanisme-group",
				label,
				description,
				controls: [
					{
						id: "zonage-urbanisme-visibility",
						type: "visibility",
						targetLayers: ["zonage-urbanisme-layer", "zonage-urbanisme-layer-outline", "zonage-urbanisme-layer-highlight"],
						defaultValue: true,
					},
					{
						id: "zonage-urbanisme-opacity",
						type: "opacity",
						targetLayers: ["zonage-urbanisme-layer-outline"],
						defaultValue: 0.7,
					},
					{
						id: "zonage-urbanisme-millesime",
						type: "ocsge-millesime-index",
						targetLayers: ["zonage-urbanisme-layer"],
						sourceId: "zonage-urbanisme-source",
						defaultValue: `${lastMillesimeIndex}_${firstDepartement}`,
						linkedMillesimeIds: [`${layerType}-millesime`],
					},
				],
			},
		],
		infoPanels: [],
	}), [layerType, nomenclature, mode, ocsgeLabel, ocsgeDescription, label, description, lastMillesimeIndex, firstDepartement]);


	const displayedFeature = lockedFeature ?? hoveredFeature;

	return (
		<>
		<BaseMap
			id={`zonage-urbanisme-${mode}-map`}
			config={config}
			landData={landData}
			onMapLoad={handleMapLoad}
			onControlsReady={handleControlsReady}
			sidePanel={
				<ZonageUrbanismeSidePanel
					feature={displayedFeature}
					isLocked={!!lockedFeature}
					onClose={() => {
						lockedChecksumRef.current = null;
						setLockedFeature(null);
						if (mapRef.current) {
							updateOutline(mapRef.current, null);
							if (landData.bounds) {
								mapRef.current.fitBounds(landData.bounds as [number, number, number, number], { padding: 60 });
							}
						}
					}}
					nomenclature={nomenclature}
					unit={unit}
					onUnitChange={setUnit}
					mode={mode}
					landData={landData}
				/>
			}
		>
			<OcsgeTooltip ref={tooltipRef} style={{ display: "none" }} />
		</BaseMap>
		<ChartDetails
			sources={['ocsge', 'gpu']}
			chartId={`zonage-urbanisme-${mode}-map-details`}
		>
			<div>
				<h3 className="fr-mb-0">Calcul</h3>
				<p className="fr-text--sm">
					{chartDescription}
				</p>
			</div>
		</ChartDetails>
		</>
	);
};
