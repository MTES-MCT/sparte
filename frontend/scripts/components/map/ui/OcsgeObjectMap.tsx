import React, { useRef, useCallback, useState } from "react";
import styled from "styled-components";
import type maplibregl from "maplibre-gl";
import type { GeoJSONSource } from "maplibre-gl";
import { BaseMap } from "./BaseMap";
import { defineMapConfig } from "../types/builder";
import { LandDetailResultType } from "@services/types/land";
import { BASE_SOURCES, BASE_LAYERS, BASE_CONTROLS } from "../constants/presets";
import { getLastMillesimeIndex, getFirstDepartement, getCouvertureLabel, getUsageLabel } from "../utils/ocsge";
import { OCSGE_LAYER_NOMENCLATURES, COUVERTURE_COLORS, USAGE_COLORS, ARTIFICIALISATION_MATRIX, IMPERMEABILISATION_MATRIX, ALL_OCSGE_COUVERTURE_CODES, ALL_OCSGE_USAGE_CODES, isArtifMatrice } from "../constants/ocsge_nomenclatures";
import { NomenclatureType, Couverture, Usage } from "../types/ocsge";
import { formatNumber } from "@utils/formatUtils";
import { bbox } from "@turf/turf";
import type { ZonageUrbanismeMode } from "../layers/zonageUrbanismeLayer";
import { Tooltip } from "react-tooltip";

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

const ColorDot = styled.span<{ $color: string }>`
	display: inline-block;
	width: 10px;
	height: 10px;
	border-radius: 2px;
	background-color: ${({ $color }) => $color};
	margin-right: 6px;
	vertical-align: middle;
	flex-shrink: 0;
`;

const MiniMatrixWrapper = styled.div`
	margin-top: 8px;
	position: relative;
`;

const MiniMatrixLabel = styled.div`
	font-size: 0.6rem;
	color: #666;
	text-align: center;
`;

const MiniMatrixRowLabel = styled.div`
	font-size: 0.6rem;
	color: #666;
	writing-mode: vertical-lr;
	transform: rotate(180deg);
	display: flex;
	align-items: center;
	justify-content: center;
`;

const MiniMatrixOuter = styled.div`
	display: flex;
	gap: 3px;
	max-width: 245px;
`;

const MiniMatrixGrid = styled.div`
	display: grid;
	grid-template-columns: auto repeat(${ALL_OCSGE_COUVERTURE_CODES.length}, 1fr);
	gap: 1px;
	flex: 1;
	min-width: 0;
`;

const MiniMatrixHeaderCell = styled.div<{ $color: string; $highlight?: boolean }>`
	aspect-ratio: 1;
	border-radius: 1px;
	background-color: ${({ $color }) => $color};
	${({ $highlight }) => $highlight && "outline: 1.5px solid #000;"}
	transition: outline 0.2s ease;
`;

const MiniMatrixCell = styled.div<{ $artif: boolean; $active: boolean }>`
	aspect-ratio: 1;
	border-radius: 1px;
	background-color: ${({ $artif }) => $artif ? "#FA4B42" : "#2A9D8F"};
	opacity: ${({ $active }) => $active ? 1 : 0.25};
	${({ $active }) => $active && "outline: 1.5px solid #000;"}
	transition: opacity 0.2s ease, outline 0.2s ease;
`;

const MiniMatrixLegend = styled.div`
	display: flex;
	gap: 10px;
	margin-top: 4px;
	font-size: 0.65rem;
	color: #666;
`;

const MiniMatrixLegendItem = styled.div`
	display: flex;
	align-items: center;
	gap: 3px;
`;

const MiniMatrixLegendDot = styled.span<{ $color: string }>`
	display: inline-block;
	width: 8px;
	height: 8px;
	border-radius: 1px;
	background-color: ${({ $color }) => $color};
`;

const OCSGE_HIGHLIGHT_SOURCE = "ocsge-highlight-source";
const OCSGE_HIGHLIGHT_LAYER = "ocsge-highlight-layer";
const emptyFC: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };

interface OcsgeObjectMapProps {
	landData: LandDetailResultType;
	mode: ZonageUrbanismeMode;
	noControl?: boolean;
	onMapReady?: (map: maplibregl.Map) => void;
}

export const OcsgeObjectMap: React.FC<OcsgeObjectMapProps> = ({
	landData,
	mode,
	noControl = false,
	onMapReady,
}) => {
	const nomenclature: NomenclatureType = "couverture";
	const lastMillesimeIndex = getLastMillesimeIndex(landData.millesimes);
	const firstDepartement = getFirstDepartement(landData.departements);
	const mapRef = useRef<maplibregl.Map | null>(null);
	const [hoveredFeature, setHoveredFeature] = useState<maplibregl.MapGeoJSONFeature | null>(null);
	const [lockedFeature, setLockedFeature] = useState<maplibregl.MapGeoJSONFeature | null>(null);
	const lockedOcsgeFeatureRef = useRef<maplibregl.MapGeoJSONFeature | null>(null);
	const ocsgeLayerType = mode === "artif" ? "artificialisation" : "impermeabilisation";

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

		const ocsgeId = `${mode === "artif" ? "artificialisation" : "impermeabilisation"}-layer`;

		map.on("mousemove", ocsgeId, (e) => {
			map.getCanvas().style.cursor = "pointer";
			if (e.features && e.features.length > 0) {
				const feature = e.features[0];
				setHoveredFeature(feature);
				updateOcsgeHighlight(map, feature);
			}
		});

		map.on("mouseleave", ocsgeId, () => {
			map.getCanvas().style.cursor = "";
			setHoveredFeature(null);
			updateOcsgeHighlight(map, null);
		});

		map.on("click", ocsgeId, (e) => {
			if (e.features && e.features.length > 0) {
				const feature = e.features[0];
				lockedOcsgeFeatureRef.current = feature;
				setLockedFeature(feature);
				const bounds = bbox(feature) as [number, number, number, number];
				map.fitBounds(bounds, { padding: 80, maxZoom: 17 });
				updateOcsgeHighlight(map, feature);
			}
		});

		// Click on empty area
		map.on("click", (e) => {
			const ocsgeFeats = map.queryRenderedFeatures(e.point, { layers: [ocsgeId] });
			if (!ocsgeFeats || ocsgeFeats.length === 0) {
				lockedOcsgeFeatureRef.current = null;
				setLockedFeature(null);
				updateOcsgeHighlight(map, null);
				if (landData.bounds) {
					map.fitBounds(landData.bounds as [number, number, number, number], { padding: 80 });
				}
			}
		});
	}, [landData.bounds, updateOcsgeHighlight, onMapReady, mode]);

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
		],
		layers: [
			...BASE_LAYERS,
			{ type: ocsgeLayerType, nomenclature, stats: true },
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
		],
		infoPanels: [],
	});

	const displayedFeature = lockedFeature ?? hoveredFeature;

	const renderSidePanelContent = () => {
		if (!displayedFeature) {
			return (
				<SidePanelPlaceholder>
					Survolez ou cliquez sur un objet pour afficher ses informations
				</SidePanelPlaceholder>
			);
		}

		const properties = displayedFeature.properties;
		if (!properties) return null;

		const surface = (properties.surface as number) || 0;
		const codeCs = properties.code_cs as string;
		const codeUs = properties.code_us as string;
		const isArtificial = properties.is_artificial;
		const isArtifByMatrice = codeCs && codeUs && isArtifMatrice(codeCs as Couverture, codeUs as Usage);
		const isArtifBySeuil = isArtificial && !isArtifByMatrice;

		return (
			<div style={{ paddingTop: 8 }}>
				<InfoRow>
					<InfoLabel>Surface</InfoLabel>
					<InfoValue>
						{surface > 0 ? `${formatNumber({ number: surface })} m²` : "\u2014"}
					</InfoValue>
				</InfoRow>

				{nomenclature === "couverture" ? (
					<>
						{codeCs && (
							<InfoRow>
								<InfoLabel>Couverture</InfoLabel>
								<InfoValue>
									<ColorDot $color={(COUVERTURE_COLORS as Record<string, string>)[codeCs] || "#ccc"} />
									{getCouvertureLabel(codeCs)}
								</InfoValue>
							</InfoRow>
						)}
						{codeUs && (
							<InfoRow>
								<InfoLabel>Usage</InfoLabel>
								<InfoValue>
									<ColorDot $color={(USAGE_COLORS as Record<string, string>)[codeUs] || "#ccc"} />
									{getUsageLabel(codeUs)}
								</InfoValue>
							</InfoRow>
						)}
					</>
				) : (
					<>
						{codeUs && (
							<InfoRow>
								<InfoLabel>Usage</InfoLabel>
								<InfoValue>
									<ColorDot $color={(USAGE_COLORS as Record<string, string>)[codeUs] || "#ccc"} />
									{getUsageLabel(codeUs)}
								</InfoValue>
							</InfoRow>
						)}
						{codeCs && (
							<InfoRow>
								<InfoLabel>Couverture</InfoLabel>
								<InfoValue>
									<ColorDot $color={(COUVERTURE_COLORS as Record<string, string>)[codeCs] || "#ccc"} />
									{getCouvertureLabel(codeCs)}
								</InfoValue>
							</InfoRow>
						)}
					</>
				)}

				{mode === "artif" && isArtifBySeuil && (
					<div className="fr-alert fr-alert--warning fr-alert--sm fr-mt-1w">
						<p className="fr-text--xs fr-mb-0">
							Le croisement de couverture et d'usage de cet objet ne correspond pas à de l'artificialisation selon la matrice OCS GE, mais il est classé artificialisé par application des seuils d'interprétation (<a target="_blank" rel="noopener noreferrer" href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048465959#:~:text=Enfin%2C%20sont%20int%C3%A9gr%C3%A9s,agronomique%20du%20sol.">décret du 27 novembre 2023</a>).
						</p>
					</div>
				)}

				{codeCs && codeUs && (() => {
					const matrix = mode === "artif" ? ARTIFICIALISATION_MATRIX : IMPERMEABILISATION_MATRIX;
					const labelPositif = mode === "artif" ? "Artificialisé" : "Imperméable";
					const labelNegatif = mode === "artif" ? "Non artificialisé" : "Non imperméable";
					return (
						<MiniMatrixWrapper>
							<MiniMatrixLabel>Couverture</MiniMatrixLabel>
							<MiniMatrixOuter>
								<MiniMatrixRowLabel>Usage</MiniMatrixRowLabel>
								<MiniMatrixGrid>
									<div />
									{ALL_OCSGE_COUVERTURE_CODES.map(cs => (
									<MiniMatrixHeaderCell
										key={`h-${cs}`}
										$color={(COUVERTURE_COLORS as Record<string, string>)[cs]}
										$highlight={cs === codeCs}
										data-tooltip-id="matrix-tooltip"
										data-tooltip-content={getCouvertureLabel(cs)}
									/>
								))}
								{ALL_OCSGE_USAGE_CODES.map(us => (
									<React.Fragment key={us}>
										<MiniMatrixHeaderCell
											$color={(USAGE_COLORS as Record<string, string>)[us]}
											$highlight={us === codeUs}
											data-tooltip-id="matrix-tooltip"
											data-tooltip-content={getUsageLabel(us)}
										/>
										{ALL_OCSGE_COUVERTURE_CODES.map(cs => {
											const isActive = cs === codeCs && us === codeUs;
											const positif = matrix[cs]?.includes(us) ?? false;
											return (
												<MiniMatrixCell
													key={`${cs}-${us}`}
													$artif={positif}
													$active={isActive}
													data-tooltip-id="matrix-tooltip"
													data-tooltip-html={`${getCouvertureLabel(cs)}<br/>${getUsageLabel(us)}<br/><b>${positif ? labelPositif : labelNegatif}</b>`}
												/>
											);
										})}
									</React.Fragment>
								))}
							</MiniMatrixGrid>
							</MiniMatrixOuter>
							<Tooltip id="matrix-tooltip" className="fr-text--xs" />
							<MiniMatrixLegend>
								<MiniMatrixLegendItem>
									<MiniMatrixLegendDot $color="#FA4B42" />
									{labelPositif}
								</MiniMatrixLegendItem>
								<MiniMatrixLegendItem>
									<MiniMatrixLegendDot $color="#2A9D8F" />
									{labelNegatif}
								</MiniMatrixLegendItem>
							</MiniMatrixLegend>
						</MiniMatrixWrapper>
					);
				})()}
			</div>
		);
	};

	return (
		<MapRow className="fr-grid-row fr-grid-row--gutters">
			<div className="fr-col-12 fr-col-lg-8">
				<BaseMap
					id={`ocsge-object-${mode}-map`}
					config={config}
					landData={landData}
					onMapLoad={handleMapLoad}
				/>
			</div>
			<div className="fr-col-12 fr-col-lg-4">
				<SidePanel>
					{lockedFeature && !noControl && (
						<CloseButton
							title="Désélectionner l'objet"
							onClick={() => {
								lockedOcsgeFeatureRef.current = null;
								setLockedFeature(null);
								if (mapRef.current) {
									updateOcsgeHighlight(mapRef.current, null);
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
