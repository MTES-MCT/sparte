import React, { useRef, useCallback, useState, useEffect } from "react";
import styled from "styled-components";
import type maplibregl from "maplibre-gl";
import type { GeoJSONSource } from "maplibre-gl";
import { BaseMap } from "./BaseMap";
import { defineMapConfig } from "../types/builder";
import { LandDetailResultType } from "@services/types/land";
import { BASE_SOURCES, BASE_LAYERS, BASE_CONTROLS } from "../constants/presets";
import { getLastMillesimeIndex, getFirstDepartement, getCouvertureLabel, getUsageLabel } from "../utils/ocsge";
import { OCSGE_LAYER_NOMENCLATURES, COUVERTURE_COLORS, USAGE_COLORS } from "../constants/ocsge_nomenclatures";
import { NomenclatureType } from "../types/ocsge";
import { ZonageType } from "scripts/types/ZonageType";
import { formatNumber } from "@utils/formatUtils";
import { bbox } from "@turf/turf";
import type { ZonageUrbanismeMode } from "../layers/zonageUrbanismeLayer";
import type { ControlsManager } from "../controls/ControlsManager";
import ChartDetails from "@components/charts/ChartDetails";
import { SegmentedControl } from "@codegouvfr/react-dsfr/SegmentedControl";

interface CompositionItem {
	code: string;
	surface: number;
}

const MapRow = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: stretch;
`;

const SidePanel = styled.div`
	position: relative;
	background: #f6f6f6;
	border-radius: 4px;
	padding: 1rem;
	font-size: 0.85rem;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	flex: 1;
`;

const SidePanelPlaceholder = styled.div`
	color: #666;
	font-style: italic;
	text-align: center;
	padding: 2rem 1rem;
`;

const CloseButton = styled.button`
	position: absolute;
	top: 8px;
	right: 8px;
	background: none;
	border: none;
	cursor: pointer;
	font-size: 1.1rem;
	color: #888;
	padding: 2px 6px;
	line-height: 1;
	border-radius: 3px;
	&:hover {
		color: #333;
		background: #e0e0e0;
	}
`;

const SidePanelHeader = styled.div`
	margin-bottom: 0.3rem;
	padding-bottom: 0.3rem;
	border-bottom: 1px solid #ddd;
`;

const ZoneTypeBadge = styled.span<{ $color: string }>`
	display: inline-block;
	padding: 2px 8px;
	border-radius: 3px;
	background-color: ${({ $color }) => $color};
	color: white;
	font-weight: 600;
	font-size: 0.8rem;
	margin-right: 8px;
`;

const InfoRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: baseline;
	padding: 1px 0;
	font-size: 0.75rem;
`;

const InfoLabel = styled.span`
	color: #666;
`;

const InfoValue = styled.span`
	font-weight: 600;
	text-align: right;
`;

const SectionTitle = styled.div`
	font-weight: 600;
	font-size: 0.8rem;
	color: #333;
	margin-top: 2px;
	margin-bottom: 4px;
`;

const Separator = styled.hr`
	border: none;
	border-top: 1px solid #e0e0e0;
	margin: 6px 0;
`;

const MetaText = styled.div`
	font-size: 0.72rem;
	color: #888;
	line-height: 1.4;
`;

const LibelleLong = styled.div`
	font-size: 0.72rem;
	color: #888;
	margin-top: 2px;
`;

const SidePanelContent = styled.div`
	display: flex;
	flex-direction: column;
	flex: 1;
	min-height: 0;
`;

const PieSection = styled.div`
	display: flex;
	flex-direction: column;
`;

const PieChartContainer = styled.div`
	display: flex;
	align-items: flex-start;
	gap: 8px;
	width: 100%;
`;

const PieSvgWrapper = styled.div`
	flex: 0 0 27%;
	max-width: 27%;
	aspect-ratio: 1;
`;

const LegendList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 3px;
	flex: 1;
	min-width: 0;
`;

const LegendItem = styled.div`
	display: flex;
	align-items: flex-start;
	gap: 6px;
	font-size: 0.72rem;
	line-height: 1.3;

	> span:last-child {
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}
`;

const LegendColor = styled.span<{ $color: string }>`
	display: inline-block;
	width: 10px;
	height: 10px;
	border-radius: 2px;
	background-color: ${({ $color }) => $color};
	flex-shrink: 0;
`;

const PercentBar = styled.div`
	margin-top: 2px;
	margin-bottom: 2px;
`;

const PercentBarTrack = styled.div`
	height: 8px;
	background: #e0e0e0;
	border-radius: 4px;
	overflow: hidden;
`;

const PercentBarFill = styled.div<{ $percent: number; $color: string }>`
	height: 100%;
	width: ${({ $percent }) => Math.min($percent, 100)}%;
	background-color: ${({ $color }) => $color};
	border-radius: 4px;
	transition: width 0.3s ease;
`;

const FluxLabel = styled.span<{ $positive?: boolean }>`
	font-size: 0.68rem;
	font-weight: 700;
	color: ${({ $positive }) => ($positive ? "#E63946" : "#2A9D8F")};
`;

type SurfaceUnit = "ha" | "m2";


const ZONE_TYPE_COLORS: Record<string, string> = {
	U: "#E63946",
	AU: "#F4A261",
	N: "#2A9D8F",
	A: "#E9C46A",
};

function parseComposition(raw: unknown): CompositionItem[] {
	if (!raw) return [];
	try {
		const data = typeof raw === "string" ? JSON.parse(raw) : raw;
		if (!Array.isArray(data)) return [];
		return data as CompositionItem[];
	} catch {
		return [];
	}
}

function PieChart({
	items,
	colorMap,
}: {
	items: Array<{ code: string; percent: number }>;
	colorMap: Record<string, string>;
}) {
	const viewBox = 100;
	const cx = viewBox / 2;
	const cy = viewBox / 2;
	const r = viewBox / 2 - 2;

	let cumulativePercent = 0;

	const slices = items.map((item) => {
		const startAngle = cumulativePercent * 3.6 * (Math.PI / 180);
		cumulativePercent += item.percent;
		const endAngle = cumulativePercent * 3.6 * (Math.PI / 180);

		const x1 = cx + r * Math.sin(startAngle);
		const y1 = cy - r * Math.cos(startAngle);
		const x2 = cx + r * Math.sin(endAngle);
		const y2 = cy - r * Math.cos(endAngle);

		const largeArc = item.percent > 50 ? 1 : 0;

		if (item.percent >= 99.9) {
			return (
				<circle
					key={item.code}
					cx={cx}
					cy={cy}
					r={r}
					fill={colorMap[item.code] || "#ccc"}
				/>
			);
		}

		const d = [
			`M ${cx} ${cy}`,
			`L ${x1} ${y1}`,
			`A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
			"Z",
		].join(" ");

		return (
			<path
				key={item.code}
				d={d}
				fill={colorMap[item.code] || "#ccc"}
			/>
		);
	});

	return (
		<svg viewBox={`0 0 ${viewBox} ${viewBox}`} style={{ width: "100%", height: "100%", maxWidth: "100%" }}>
			{slices}
		</svg>
	);
}

function renderPieChart(
	items: CompositionItem[],
	labelFn: (code: string) => string,
	colorMap: Record<string, string>,
	fluxItems?: CompositionItem[],
	surfaceUnit: SurfaceUnit = "ha",
): React.ReactNode {
	if (items.length === 0) return null;

	const totalSurface = items.reduce((acc, item) => acc + item.surface, 0);
	if (totalSurface === 0) return null;

	const fluxByCode = new Map<string, CompositionItem>();
	if (fluxItems) {
		for (const item of fluxItems) {
			fluxByCode.set(item.code, item);
		}
	}

	const withPercent = items
		.map((item) => ({
			code: item.code,
			percent: (item.surface / totalSurface) * 100,
		}))
		.filter((item) => item.percent >= 0.5);

	const stockCodes = new Set(withPercent.map((item) => item.code));
	const fluxOnlyCodes = fluxItems
		? fluxItems.filter((item) => !stockCodes.has(item.code) && item.surface !== 0)
		: [];

	const unitLabel = surfaceUnit === "ha" ? "ha" : "m²";

	return (
		<PieChartContainer>
			<PieSvgWrapper>
				<PieChart items={withPercent} colorMap={colorMap} />
			</PieSvgWrapper>
			<LegendList>
				{withPercent.map((item) => {
					const flux = fluxByCode.get(item.code);
					const fluxVal = flux ? (surfaceUnit === "ha" ? flux.surface / 10000 : flux.surface) : 0;
					return (
						<LegendItem key={item.code}>
							<LegendColor $color={colorMap[item.code] || "#ccc"} />
							<span>
								{formatNumber({ number: item.percent, decimals: 2 })}% {labelFn(item.code)}
								{fluxItems && fluxVal !== 0 && (
									<FluxLabel $positive={fluxVal > 0}> {fluxVal > 0 ? "+" : "-"}{formatNumber({ number: Math.abs(fluxVal), decimals: 2 })} {unitLabel}</FluxLabel>
								)}
							</span>
						</LegendItem>
					);
				})}
				{fluxOnlyCodes.map((item) => {
					const fluxVal = surfaceUnit === "ha" ? item.surface / 10000 : item.surface;
					return (
						<LegendItem key={item.code}>
							<LegendColor $color={colorMap[item.code] || "#ccc"} />
							<span>
								0% {labelFn(item.code)}
								<FluxLabel $positive={fluxVal > 0}> {fluxVal > 0 ? "+" : "-"}{formatNumber({ number: Math.abs(fluxVal), decimals: 2 })} {unitLabel}</FluxLabel>
							</span>
						</LegendItem>
					);
				})}
			</LegendList>
		</PieChartContainer>
	);
}

interface ZonageUrbanismeMapProps {
	landData: LandDetailResultType;
	mode: ZonageUrbanismeMode;
	noControl?: boolean;
	initialChecksum?: string;
	zonageTable?: React.ReactNode;
	onMapReady?: (map: maplibregl.Map) => void;
}

export const ZonageUrbanismeMap: React.FC<ZonageUrbanismeMapProps> = ({
	landData,
	mode,
	noControl = false,
	initialChecksum,
	zonageTable,
	onMapReady,
}) => {
	const [nomenclature, setNomenclature] = useState<NomenclatureType>("couverture");
	const [unit, setUnit] = useState<SurfaceUnit>("ha");
	const lastMillesimeIndex = getLastMillesimeIndex(landData.millesimes);
	const firstDepartement = getFirstDepartement(landData.departements);
	const mapRef = useRef<maplibregl.Map | null>(null);
	const leftColRef = useRef<HTMLDivElement>(null);
	const rightColRef = useRef<HTMLDivElement>(null);

	const updateSidePanelOffset = useCallback(() => {
		const leftCol = leftColRef.current;
		if (!leftCol || !rightColRef.current) return;
		const mapWrapper = leftCol.querySelector(`[id$="-wrapper"]`);
		if (!mapWrapper) return;
		const offset = mapWrapper.getBoundingClientRect().top - leftCol.getBoundingClientRect().top;
		rightColRef.current.style.paddingTop = `${offset}px`;
	}, []);

	useEffect(() => {
		// Use ResizeObserver to detect when the left column changes height (e.g. controls bar renders)
		const leftCol = leftColRef.current;
		if (!leftCol) return;

		updateSidePanelOffset();

		const observer = new ResizeObserver(() => {
			updateSidePanelOffset();
		});
		observer.observe(leftCol);

		return () => observer.disconnect();
	}, [updateSidePanelOffset]);

	const [hoveredFeature, setHoveredFeature] = useState<maplibregl.MapGeoJSONFeature | null>(null);
	const [lockedFeature, setLockedFeature] = useState<maplibregl.MapGeoJSONFeature | null>(null);
	const lockedChecksumRef = useRef<string | null>(null);
	const ocsgeLayerType = mode === "artif" ? "artificialisation" : "impermeabilisation";
	const nomenclatureControlId = `${ocsgeLayerType}-nomenclature`;
	const controlsManagerRef = useRef<ControlsManager | null>(null);

	const handleControlsReady = useCallback((manager: ControlsManager) => {
		controlsManagerRef.current = manager;
		const unsub = manager.subscribe(() => {
			const val = manager.getControlValue(nomenclatureControlId) as NomenclatureType;
			if (val) setNomenclature(val);
		});
		return unsub;
	}, [nomenclatureControlId]);

	const label = mode === "artif"
		? "Zonages d'urbanisme — Artificialisation"
		: "Zonages d'urbanisme — Imperméabilisation";

	const description = mode === "artif"
		? "Cette carte affiche les zonages d'urbanisme (PLU) avec l'occupation du sol artificialisée visible au survol."
		: "Cette carte affiche les zonages d'urbanisme (PLU) avec l'occupation du sol imperméable visible au survol.";

	const updateOutline = useCallback((map: maplibregl.Map, hoveredChecksum: string | null) => {
		const outlineId = "zonage-urbanisme-layer-outline";
		const locked = lockedChecksumRef.current;
		if (locked && hoveredChecksum && hoveredChecksum !== locked) {
			map.setPaintProperty(outlineId, "line-width", [
				"case",
				["==", ["get", "checksum"], locked], 3,
				["==", ["get", "checksum"], hoveredChecksum], 3,
				1,
			]);
		} else if (locked || hoveredChecksum) {
			const active = locked ?? hoveredChecksum;
			map.setPaintProperty(outlineId, "line-width", [
				"case",
				["==", ["get", "checksum"], active],
				3,
				1,
			]);
		} else {
			map.setPaintProperty(outlineId, "line-width", 1);
		}
	}, []);

	const handleMapLoad = useCallback((map: maplibregl.Map) => {
		mapRef.current = map;
		onMapReady?.(map);

		const layerId = "zonage-urbanisme-layer";

		// Zonage hover/click
		map.on("mousemove", layerId, (e) => {
			map.getCanvas().style.cursor = "pointer";
			if (e.features && e.features.length > 0) {
				const feature = e.features[0];
				setHoveredFeature(feature);
				updateOutline(map, feature.properties?.checksum ?? null);
			}
		});

		map.on("mouseleave", layerId, () => {
			map.getCanvas().style.cursor = "";
			setHoveredFeature(null);
			updateOutline(map, null);
		});

		map.on("click", layerId, (e) => {
			if (e.features && e.features.length > 0) {
				const feature = e.features[0];
				console.log("Zonage feature properties:", feature.properties);
				const checksum = feature.properties?.checksum ?? null;
				lockedChecksumRef.current = checksum;
				setLockedFeature(feature);
				const bounds = bbox(feature) as [number, number, number, number];
				map.fitBounds(bounds, { padding: 80, maxZoom: 17 });
				updateOutline(map, checksum);
			}
		});

		// Click on empty area
		map.on("click", (e) => {
			const zonageFeats = map.queryRenderedFeatures(e.point, { layers: [layerId] });
			if (!zonageFeats || zonageFeats.length === 0) {
				lockedChecksumRef.current = null;
				setLockedFeature(null);
				updateOutline(map, null);
				if (landData.bounds) {
					map.fitBounds(landData.bounds as [number, number, number, number], { padding: 80 });
				}
			}
		});

		// Re-query locked feature when tiles reload (e.g. after millésime change)
		map.on("sourcedata", () => {
			const checksum = lockedChecksumRef.current;
			if (!checksum) return;
			const rendered = map.queryRenderedFeatures(undefined, { layers: [layerId] });
			const match = rendered.find(f => f.properties?.checksum === checksum);
			if (match) {
				setLockedFeature(match);
			}
		});

		// Pre-select a zonage by checksum if provided
		if (initialChecksum) {
			const sourceLayer = `zonage_urbanisme_${lastMillesimeIndex}_${firstDepartement}`;
			const selectZonageByChecksum = () => {
				const features = map.querySourceFeatures("zonage-urbanisme-source", {
					sourceLayer,
					filter: ["==", ["get", "checksum"], initialChecksum],
				});
				if (features.length > 0) {
					const feature = features[0];
					lockedChecksumRef.current = initialChecksum;
					setLockedFeature(feature);
					const bounds = bbox(feature) as [number, number, number, number];
					map.fitBounds(bounds, { padding: 80, maxZoom: 17 });
					updateOutline(map, initialChecksum);
					return true;
				}
				return false;
			};

			// Try immediately, otherwise wait for tiles to load
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

	const ocsgeLabel = mode === "artif"
		? "Occupation du sol artificialisée"
		: "Occupation du sol imperméabilisée";

	const ocsgeDescription = mode === "artif"
		? "Ce calque affiche les objets OCS GE classés comme artificialisés, colorés selon la nomenclature sélectionnée."
		: "Ce calque affiche les objets OCS GE classés comme imperméables, colorés selon la nomenclature sélectionnée.";

	const config = defineMapConfig({
		sources: [
			...BASE_SOURCES,
			{ type: "ocsge" },
			{ type: "zonage-urbanisme" },
		],
		layers: [
			...BASE_LAYERS,
			{ type: ocsgeLayerType, nomenclature, stats: true },
			{ type: "zonage-urbanisme", mode },
		],
		controlGroups: [
			...BASE_CONTROLS,
			{
				id: `${ocsgeLayerType}-group`,
				label: ocsgeLabel,
				description: ocsgeDescription,
				controls: [
					{
						id: `${ocsgeLayerType}-visibility`,
						type: "visibility",
						targetLayers: [`${ocsgeLayerType}-layer`],
						defaultValue: true,
					},
					{
						id: `${ocsgeLayerType}-opacity`,
						type: "opacity",
						targetLayers: [`${ocsgeLayerType}-layer`],
						defaultValue: 0.7,
					},
					{
						id: `${ocsgeLayerType}-millesime`,
						type: "ocsge-millesime",
						targetLayers: [`${ocsgeLayerType}-layer`],
						sourceId: "ocsge-source",
						defaultValue: `${lastMillesimeIndex}_${firstDepartement}`,
						linkedMillesimeIds: ["zonage-urbanisme-millesime"],
						addControlsAboveMap: true,
					},
					{
						id: `${ocsgeLayerType}-nomenclature`,
						type: "ocsge-nomenclature",
						targetLayers: [`${ocsgeLayerType}-layer`],
						linkedFilterId: `${ocsgeLayerType}-filter`,
						defaultValue: nomenclature,
						addControlsAboveMap: true,
					},
					{
						id: `${ocsgeLayerType}-filter`,
						type: "ocsge-nomenclature-filter",
						targetLayers: [`${ocsgeLayerType}-layer`],
						defaultValue: OCSGE_LAYER_NOMENCLATURES[ocsgeLayerType][nomenclature],
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
						targetLayers: ["zonage-urbanisme-layer", "zonage-urbanisme-layer-outline"],
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
						type: "ocsge-millesime",
						targetLayers: ["zonage-urbanisme-layer"],
						sourceId: "zonage-urbanisme-source",
						defaultValue: `${lastMillesimeIndex}_${firstDepartement}`,
						linkedMillesimeIds: [`${ocsgeLayerType}-millesime`],
					},
				],
			},
		],
		infoPanels: [],
	});

	const gradientColor = mode === "artif" ? "#FA4B42" : "#3A7EC2";
	const modeLabel = mode === "artif" ? "artificialisation" : "imperméabilisation";

	const displayedFeature = lockedFeature ?? hoveredFeature;

	const renderSidePanelContent = () => {
		if (!displayedFeature) {
			return (
				<SidePanelPlaceholder>
					Survolez ou cliquez sur une zone pour afficher ses informations
				</SidePanelPlaceholder>
			);
		}

		const properties = displayedFeature.properties;
		if (!properties) return null;

		const typeZone = properties.type_zone as string;
		const libelle = properties.libelle as string;
		const libelleLong = properties.libelle_long as string;
		const year = properties.year as number | null;
		const zonageSurface = properties.zonage_surface as number;
		const toUnit = (m2: number) => unit === "ha" ? m2 / 10000 : m2;
		const unitLabel = unit === "ha" ? "ha" : "m²";
		const zonageSurfaceDisplay = zonageSurface ? toUnit(zonageSurface) : 0;

		const percentField = mode === "artif" ? "artif_percent" : "imper_percent";
		const surfaceField = mode === "artif" ? "artif_surface" : "imper_surface";
		const percent = properties[percentField] as number | null;
		const surface = properties[surfaceField] as number | null;
		const surfaceDisplay = surface ? toUnit(surface) : null;

		const couvertureField = mode === "artif" ? "artif_couverture_composition" : "imper_couverture_composition";
		const usageField = mode === "artif" ? "artif_usage_composition" : "imper_usage_composition";
		const couvertureItems = parseComposition(properties[couvertureField]);
		const usageItems = parseComposition(properties[usageField]);

		const fluxYearOld = properties.flux_year_old as number | null;
		const fluxYearNew = properties.flux_year_new as number | null;
		const fluxArtif = properties.flux_artif as number | null;
		const fluxDesartif = properties.flux_desartif as number | null;
		const fluxArtifNet = properties.flux_artif_net as number | null;
		const hasFlux = fluxArtif != null && (fluxArtif !== 0 || fluxDesartif !== 0);

		const fluxCouvertureItems = parseComposition(properties.flux_artif_couverture_composition);
		const fluxUsageItems = parseComposition(properties.flux_artif_usage_composition);

		return (
			<SidePanelContent>
				<SidePanelHeader>
					<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", paddingRight: "24px" }}>
						<div>
							<ZoneTypeBadge $color={ZONE_TYPE_COLORS[typeZone] || "#999"}>
								{typeZone}
							</ZoneTypeBadge>
							<strong>{ZonageType[typeZone as keyof typeof ZonageType] || typeZone}</strong>
							{libelle && (
								<span style={{ color: "#666" }}> — {libelle}</span>
							)}
						</div>
						<SegmentedControl
							small
							hideLegend
							legend="Unité"
							segments={[
								{
									label: "ha",
									nativeInputProps: {
										checked: unit === "ha",
										onChange: () => setUnit("ha"),
									},
								},
								{
									label: "m²",
									nativeInputProps: {
										checked: unit === "m2",
										onChange: () => setUnit("m2"),
									},
								},
							]}
						/>
					</div>
					{libelleLong && libelleLong !== libelle && (
						<LibelleLong>{libelleLong}</LibelleLong>
					)}
				</SidePanelHeader>

				<InfoRow>
					<InfoLabel><strong>Taux d'{modeLabel}</strong></InfoLabel>
					<InfoValue>
						{percent != null ? `${formatNumber({ number: percent })} %` : "—"}
					</InfoValue>
				</InfoRow>

				{percent != null && (
					<PercentBar>
						<PercentBarTrack>
							<PercentBarFill $percent={percent} $color={gradientColor} />
						</PercentBarTrack>
					</PercentBar>
				)}

				<InfoRow>
					<InfoLabel>Surface</InfoLabel>
					<InfoValue>
						{surfaceDisplay != null ? `${formatNumber({ number: surfaceDisplay })} ${unitLabel}` : "—"} / {zonageSurface ? `${formatNumber({ number: zonageSurfaceDisplay })} ${unitLabel}` : "—"}
					</InfoValue>
				</InfoRow>

				{hasFlux && (
					<>
					<Separator />
					<InfoRow>
						<InfoLabel><strong>Evolution{fluxYearOld && fluxYearNew ? ` entre ${fluxYearOld} et ${fluxYearNew}` : ""}</strong></InfoLabel>
					</InfoRow>

					<InfoRow>
						<InfoLabel>{mode === "artif" ? "Artificialisation" : "Imperméabilisation"}</InfoLabel>
						<InfoValue style={{ color: "#E63946" }}>+{formatNumber({ number: toUnit(fluxArtif ?? 0), decimals: 2 })} {unitLabel}</InfoValue>
					</InfoRow>

					<InfoRow>
						<InfoLabel>{mode === "artif" ? "Désartificialisation" : "Désimperméabilisation"}</InfoLabel>
						<InfoValue style={{ color: "#2A9D8F" }}>-{formatNumber({ number: toUnit(fluxDesartif ?? 0), decimals: 2 })} {unitLabel}</InfoValue>
					</InfoRow>

					<InfoRow style={{ borderTop: "1px solid #999", paddingTop: "3px", marginTop: "2px" }}>
						<InfoLabel><strong>{mode === "artif" ? "Artificialisation" : "Imperméabilisation"} nette</strong></InfoLabel>
						<InfoValue style={{ color: (fluxArtifNet ?? 0) > 0 ? "#E63946" : (fluxArtifNet ?? 0) < 0 ? "#2A9D8F" : undefined, fontWeight: 700 }}>
							{(fluxArtifNet ?? 0) >= 0 ? "+" : ""}{formatNumber({ number: toUnit(fluxArtifNet ?? 0), decimals: 2 })} {unitLabel}
						</InfoValue>
					</InfoRow>
					</>
				)}

				{nomenclature === "couverture" && couvertureItems.length > 0 && (
					<>
					<Separator />
					<PieSection>
						<SectionTitle>Détail de l'{modeLabel} par couverture{year ? ` (${year})` : ""}</SectionTitle>
						{renderPieChart(couvertureItems, getCouvertureLabel, COUVERTURE_COLORS as Record<string, string>, hasFlux ? fluxCouvertureItems : undefined, unit)}
					</PieSection>
					</>
				)}

				{nomenclature === "usage" && usageItems.length > 0 && (
					<>
					<Separator />
					<PieSection>
						<SectionTitle>Détail de l'{modeLabel} par usage{year ? ` (${year})` : ""}</SectionTitle>
						{renderPieChart(usageItems, getUsageLabel, USAGE_COLORS as Record<string, string>, hasFlux ? fluxUsageItems : undefined, unit)}
					</PieSection>
					</>
				)}
			</SidePanelContent>
		);
	};

	return (
		<>
		<MapRow className="fr-grid-row fr-grid-row--gutters">
			<div className="fr-col-12 fr-col-lg-8" ref={leftColRef}>
				<BaseMap
					id={`zonage-urbanisme-${mode}-map`}
					config={config}
					landData={landData}
					noControl={noControl}
					onMapLoad={handleMapLoad}
					onControlsReady={handleControlsReady}
				/>
			</div>
			<div className="fr-col-12 fr-col-lg-4" ref={rightColRef} style={{ display: "flex", flexDirection: "column" }}>
				<SidePanel>
					{lockedFeature && !noControl && (
						<CloseButton
							title="Désélectionner la zone"
							onClick={() => {
								lockedChecksumRef.current = null;
								setLockedFeature(null);
								if (mapRef.current) {
									updateOutline(mapRef.current, null);
									if (landData.bounds) {
										mapRef.current.fitBounds(landData.bounds as [number, number, number, number], { padding: 80 });
									}
								}
							}}
						>
							✕
						</CloseButton>
					)}
					{renderSidePanelContent()}
				</SidePanel>
			</div>
		</MapRow>
		<ChartDetails
			sources={['ocsge', 'gpu']}
			chartId={`zonage-urbanisme-${mode}-map-details`}
			customTable={zonageTable}
		>
			<div>
				<h3 className="fr-mb-0">Calcul</h3>
				<p className="fr-text--sm">
					{mode === "artif"
						? "Qualifier l'artificialisation de chaque parcelle OCS GE via la matrice d'artificialisation. Puis croiser les parcelles avec les zonages d'urbanisme (PLU/GPU) pour mesurer le taux d'artificialisation de chaque zone."
						: "Qualifier l'imperméabilisation de chaque parcelle OCS GE via la nomenclature OCS GE. Puis croiser les parcelles avec les zonages d'urbanisme (PLU/GPU) pour mesurer le taux d'imperméabilisation de chaque zone."
					}
				</p>
			</div>
		</ChartDetails>
		</>
	);
};
