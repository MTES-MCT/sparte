import React, { useRef, useCallback, useState, useEffect } from "react";
import styled from "styled-components";
import type maplibregl from "maplibre-gl";
import { BaseMap } from "./BaseMap";
import { defineMapConfig } from "../types/builder";
import { LandDetailResultType } from "@services/types/land";
import { BASE_SOURCES, BASE_LAYERS, BASE_CONTROLS } from "../constants/presets";
import { getLastMillesimeIndex, getFirstDepartement, getCouvertureLabel, getUsageLabel } from "../utils/ocsge";
import { COUVERTURE_COLORS, USAGE_COLORS } from "../constants/ocsge_nomenclatures";
import { ZonageType } from "scripts/types/ZonageType";
import { formatNumber } from "@utils/formatUtils";
import { bbox } from "@turf/turf";
import type { ZonageUrbanismeMode } from "../layers/zonageUrbanismeLayer";

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
	height: calc(65vh + 18px);
	font-size: 0.85rem;
	overflow: hidden;
	display: flex;
	flex-direction: column;
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
	margin: 10px 0;
`;


const MetaText = styled.div`
	font-size: 0.72rem;
	color: #888;
	line-height: 1.4;
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
): React.ReactNode {
	if (items.length === 0) return null;

	const totalSurface = items.reduce((acc, item) => acc + item.surface, 0);
	if (totalSurface === 0) return null;

	const withPercent = items
		.map((item) => ({
			code: item.code,
			percent: (item.surface / totalSurface) * 100,
		}))
		.filter((item) => item.percent >= 0.5);

	return (
		<PieChartContainer>
			<PieSvgWrapper>
				<PieChart items={withPercent} colorMap={colorMap} />
			</PieSvgWrapper>
			<LegendList>
				{withPercent.map((item) => (
					<LegendItem key={item.code}>
						<LegendColor $color={colorMap[item.code] || "#ccc"} />
						<span>{formatNumber({ number: item.percent })}% {labelFn(item.code)}</span>
					</LegendItem>
				))}
			</LegendList>
		</PieChartContainer>
	);
}

function formatDate(raw: unknown): string | null {
	if (!raw) return null;
	const str = String(raw);
	try {
		const d = new Date(str);
		if (Number.isNaN(d.getTime())) return str;
		return d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
	} catch {
		return str;
	}
}

interface ZonageUrbanismeMapProps {
	landData: LandDetailResultType;
	mode: ZonageUrbanismeMode;
	highlightedZoneType?: string | null;
}

export const ZonageUrbanismeMap: React.FC<ZonageUrbanismeMapProps> = ({
	landData,
	mode,
	highlightedZoneType,
}) => {
	const lastMillesimeIndex = getLastMillesimeIndex(landData.millesimes);
	const firstDepartement = getFirstDepartement(landData.departements);
	const mapRef = useRef<maplibregl.Map | null>(null);
	const [hoveredFeature, setHoveredFeature] = useState<maplibregl.MapGeoJSONFeature | null>(null);
	const [lockedFeature, setLockedFeature] = useState<maplibregl.MapGeoJSONFeature | null>(null);
	const lockedChecksumRef = useRef<string | null>(null);

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

		const layerId = "zonage-urbanisme-layer";

		map.on("mousemove", layerId, (e) => {
			if (e.features && e.features.length > 0) {
				const feature = e.features[0];
				setHoveredFeature(feature);
				updateOutline(map, feature.properties?.checksum ?? null);
			}
		});

		map.on("mouseleave", layerId, () => {
			setHoveredFeature(null);
			updateOutline(map, null);
		});

		map.on("click", layerId, (e) => {
			if (e.features && e.features.length > 0) {
				const feature = e.features[0];
				const checksum = feature.properties?.checksum ?? null;
				lockedChecksumRef.current = checksum;
				setLockedFeature(feature);
				const bounds = bbox(feature) as [number, number, number, number];
				map.fitBounds(bounds, { padding: 80, maxZoom: 17 });
				updateOutline(map, checksum);
			}
		});

		map.on("click", (e) => {
			const features = map.queryRenderedFeatures(e.point, { layers: [layerId] });
			if (!features || features.length === 0) {
				lockedChecksumRef.current = null;
				setLockedFeature(null);
				updateOutline(map, null);
				if (landData.bounds) {
					map.fitBounds(landData.bounds as [number, number, number, number], { padding: 80 });
				}
			}
		});
	}, [landData.bounds, updateOutline]);

	const ocsgeLayerType = mode === "artif" ? "artificialisation" : "impermeabilisation";

	const config = defineMapConfig({
		sources: [
			...BASE_SOURCES,
			{ type: "ocsge" },
			{ type: "zonage-urbanisme" },
		],
		layers: [
			...BASE_LAYERS,
			{ type: ocsgeLayerType, nomenclature: "couverture", stats: true },
			{ type: "zonage-urbanisme", mode },
		],
		controlGroups: [
			...BASE_CONTROLS,
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
					},
				],
			},
		],
		infoPanels: [],
	});

	useEffect(() => {
		const map = mapRef.current;
		if (!map || !map.isStyleLoaded()) return;
		const outlineId = "zonage-urbanisme-layer-outline";
		try {
			if (highlightedZoneType) {
				map.setPaintProperty(outlineId, "line-width", [
					"case",
					["==", ["get", "type_zone"], highlightedZoneType],
					3,
					0.5,
				]);
				map.setPaintProperty(outlineId, "line-color", [
					"case",
					["==", ["get", "type_zone"], highlightedZoneType],
					ZONE_TYPE_COLORS[highlightedZoneType] || "#000",
					"#000000",
				]);
			} else {
				map.setPaintProperty(outlineId, "line-width", 1);
				map.setPaintProperty(outlineId, "line-color", "#000000");
			}
		} catch {
			// layer not yet ready
		}
	}, [highlightedZoneType]);

	const gradientColor = mode === "artif" ? "#FA4B42" : "#3A7EC2";
	const modeLabel = mode === "artif" ? "artificialisation" : "imperméabilisation";

	const displayedFeature = lockedFeature ?? hoveredFeature;

	const renderSidePanelContent = () => {
		if (!displayedFeature) {
			return (
				<SidePanelPlaceholder>
					Survolez ou cliquez sur un zonage pour afficher ses informations
				</SidePanelPlaceholder>
			);
		}

		const properties = displayedFeature.properties;
		if (!properties) return null;

		const typeZone = properties.type_zone as string;
		const libelle = properties.libelle as string;
		const libelleLong = properties.libelle_long as string;
		const destinationDominante = properties.destination_dominante as string;
		const dateApprobation = formatDate(properties.date_approbation);
		const dateValidation = formatDate(properties.date_validation);
		const year = properties.year as number | null;
		const zonageSurface = properties.zonage_surface as number;
		const zonageSurfaceHa = zonageSurface ? zonageSurface / 10000 : 0;

		const percentField = mode === "artif" ? "artif_percent" : "imper_percent";
		const surfaceField = mode === "artif" ? "artif_surface" : "imper_surface";
		const percent = properties[percentField] as number | null;
		const surface = properties[surfaceField] as number | null;
		const surfaceHa = surface ? surface / 10000 : null;

		const couvertureField = mode === "artif" ? "artif_couverture_composition" : "imper_couverture_composition";
		const usageField = mode === "artif" ? "artif_usage_composition" : "imper_usage_composition";
		const couvertureItems = parseComposition(properties[couvertureField]);
		const usageItems = parseComposition(properties[usageField]);

		return (
			<SidePanelContent>
				<SidePanelHeader>
					<div>
						<ZoneTypeBadge $color={ZONE_TYPE_COLORS[typeZone] || "#999"}>
							{typeZone}
						</ZoneTypeBadge>
						<strong>{ZonageType[typeZone as keyof typeof ZonageType] || typeZone}</strong>
						{libelle && (
							<span style={{ color: "#666" }}> — {libelle}</span>
						)}
					</div>
					{libelleLong && libelleLong !== libelle && (
						<div style={{ fontSize: "0.72rem", color: "#888", marginTop: 2 }}>
							{libelleLong}
						</div>
					)}
				</SidePanelHeader>

				{destinationDominante && (
					<InfoRow>
						<InfoLabel>Destination dominante</InfoLabel>
						<InfoValue>{destinationDominante}</InfoValue>
					</InfoRow>
				)}

			<InfoRow>
					<InfoLabel>Taux d'{modeLabel}</InfoLabel>
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
						{surfaceHa != null ? `${formatNumber({ number: surfaceHa })} ha` : "—"} / {zonageSurface ? `${formatNumber({ number: zonageSurfaceHa })} ha` : "—"}
					</InfoValue>
				</InfoRow>

				{(couvertureItems.length > 0 || usageItems.length > 0) && <Separator />}

				{couvertureItems.length > 0 && (
					<PieSection>
						<SectionTitle>Surfaces {mode === "artif" ? "artificialisées" : "imperméables"} par couverture{year ? ` (${year})` : ""}</SectionTitle>
						{renderPieChart(couvertureItems, getCouvertureLabel, COUVERTURE_COLORS as Record<string, string>)}
					</PieSection>
				)}

				{usageItems.length > 0 && (
					<PieSection>
						<SectionTitle>Surfaces {mode === "artif" ? "artificialisées" : "imperméables"} par usage{year ? ` (${year})` : ""}</SectionTitle>
						{renderPieChart(usageItems, getUsageLabel, USAGE_COLORS as Record<string, string>)}
					</PieSection>
				)}

				{(dateApprobation || dateValidation) && (
					<>
						<Separator />
						<MetaText>
							{dateApprobation && (
								<div>Approuvé le {dateApprobation}</div>
							)}
							{dateValidation && (
								<div>Validé le {dateValidation}</div>
							)}
						</MetaText>
					</>
				)}
			</SidePanelContent>
		);
	};

	return (
		<MapRow className="fr-grid-row fr-grid-row--gutters">
			<div className="fr-col-12 fr-col-lg-8">
				<BaseMap
					id={`zonage-urbanisme-${mode}-map`}
					config={config}
					landData={landData}
					onMapLoad={handleMapLoad}
				/>
			</div>
			<div className="fr-col-12 fr-col-lg-4">
				<SidePanel>
					{lockedFeature && (
						<CloseButton
							title="Désélectionner le zonage"
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
	);
};
