import React from "react";
import styled from "styled-components";
import type maplibregl from "maplibre-gl";
import { formatNumber } from "@utils/formatUtils";
import { getCouvertureLabel, getUsageLabel } from "../../utils/ocsge";
import { COUVERTURE_COLORS, USAGE_COLORS } from "../../constants/ocsge_nomenclatures";
import { NomenclatureType } from "../../types/ocsge";
import { ZonageType } from "scripts/types/ZonageType";
import type { ZonageUrbanismeMode } from "../../layers/zonageUrbanismeLayer";
import type { LandDetailResultType } from "@services/types/land";
import { MODE_CONFIG } from "../../constants/modeConfig";
import { ZoneTypeBadge } from "@components/ui/ZoneTypeBadge";
import { SegmentedControl } from "@codegouvfr/react-dsfr/SegmentedControl";
import { SidePanelPlaceholder, CloseButton, InfoRow, InfoLabel, InfoValue } from "./SidePanelPrimitives";
import { renderPieChart } from "./PieChart";
import { parseComposition, getFluxNetColor } from "./utils";
import type { SurfaceUnit } from "./types";

const SidePanelHeader = styled.div`
	padding-bottom: 0.5rem;
	border-bottom: 1px solid #ddd;
`;

const HeaderRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	padding-right: 24px;
`;

const SectionTitle = styled.div`
	font-weight: 600;
	font-size: 0.8rem;
	color: #333;
`;

const Separator = styled.div`
	border-top: 1px solid #ddd;
`;

const LibelleLong = styled.div`
	font-size: 0.72rem;
	color: #888;
	margin-top: 2px;
`;

const SidePanelContent = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	flex: 1;
	min-height: 0;
`;

const Section = styled.div`
	display: flex;
	flex-direction: column;
	gap: 2px;
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

const FluxNetRow = styled(InfoRow)`
	border-top: 1px solid #999;
	padding-top: 3px;
`;

export interface ZonageUrbanismeSidePanelProps {
	feature: maplibregl.MapGeoJSONFeature | null;
	isLocked: boolean;
	onClose: () => void;
	nomenclature: NomenclatureType;
	unit: SurfaceUnit;
	onUnitChange: (unit: SurfaceUnit) => void;
	mode: ZonageUrbanismeMode;
	landData: LandDetailResultType;
}

export const ZonageUrbanismeSidePanel: React.FC<ZonageUrbanismeSidePanelProps> = ({
	feature,
	isLocked,
	onClose,
	nomenclature,
	unit,
	onUnitChange,
	mode,
	landData,
}) => {
	const {
		gradientColor, label: modeLabel, labelCap: modeLabelCap,
		desLabel, props: modeProps,
	} = MODE_CONFIG[mode];

	if (!feature) {
		return (
			<SidePanelPlaceholder>
				Cliquez sur un zonage pour afficher ses informations
			</SidePanelPlaceholder>
		);
	}

	const properties = feature.properties;
	if (!properties) return null;

	// Extraire département et année depuis le source-layer
	let featureDept: string | null = null;
	let featureYear: number | null = null;
	if (landData.is_interdepartemental && feature.sourceLayer) {
		const parts = feature.sourceLayer.split('_');
		featureDept = parts[parts.length - 1];
		const featureIndex = Number.parseInt(parts[parts.length - 2], 10);
		const millesime = landData.millesimes.find(m => m.departement === featureDept && m.index === featureIndex);
		featureYear = millesime?.year ?? null;
	}

	const typeZone = properties.type_zone as string;
	const libelle = properties.libelle as string;
	const libelleLong = properties.libelle_long as string;
	const year = properties.year as number | null;
	const zonageSurface = properties.zonage_surface as number;
	const toUnit = (m2: number) => unit === "ha" ? m2 / 10000 : m2;
	const unitLabel = unit === "ha" ? "ha" : "m²";
	const zonageSurfaceDisplay = zonageSurface ? toUnit(zonageSurface) : 0;

	const percent = properties[modeProps.percent] as number | null;
	const surface = properties[modeProps.surface] as number | null;
	const surfaceDisplay = surface ? toUnit(surface) : null;

	const couvertureItems = parseComposition(properties[modeProps.couvertureComposition]);
	const usageItems = parseComposition(properties[modeProps.usageComposition]);

	const fluxYearOld = properties.flux_year_old as number | null;
	const fluxYearNew = properties.flux_year_new as number | null;
	const fluxPlus = properties[modeProps.flux] as number | null;
	const fluxMinus = properties[modeProps.fluxDes] as number | null;
	const fluxNet = properties[modeProps.fluxNet] as number | null;
	const hasFlux = fluxPlus != null && (fluxPlus !== 0 || fluxMinus !== 0);

	const fluxCouvertureItems = parseComposition(properties[modeProps.fluxCouvertureComposition]);
	const fluxUsageItems = parseComposition(properties[modeProps.fluxUsageComposition]);

	return (
		<>
			{isLocked && (
				<CloseButton title="Désélectionner la zone" onClick={onClose}>
					✕
				</CloseButton>
			)}
			<SidePanelContent>
				<SidePanelHeader>
					<HeaderRow>
						<div>
							<ZoneTypeBadge type={typeZone} />{" "}
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
										defaultChecked: true,
										checked: unit === "ha",
										onChange: () => onUnitChange("ha"),
									},
								},
								{
									label: "m²",
									nativeInputProps: {
										checked: unit === "m2",
										onChange: () => onUnitChange("m2"),
									},
								},
							]}
						/>
					</HeaderRow>
					{libelleLong && libelleLong !== libelle && (
						<LibelleLong>{libelleLong}</LibelleLong>
					)}
					{landData.is_interdepartemental && featureDept && (
						<span style={{ fontSize: "0.8rem", color: "#666" }}>
							{landData.millesimes.find(m => m.departement === featureDept)?.departement_name || featureDept}
							{featureYear && ` (${featureYear})`}
						</span>
					)}
				</SidePanelHeader>

				<Section>
					<InfoRow>
						<InfoLabel><strong>Taux d&apos;{modeLabel}</strong></InfoLabel>
						<InfoValue>
							{percent != null ? `${formatNumber({ number: percent })} %` : "—"}
						</InfoValue>
					</InfoRow>

					{percent != null && (
						<PercentBarTrack>
							<PercentBarFill $percent={percent} $color={gradientColor} />
						</PercentBarTrack>
					)}

					<InfoRow>
						<InfoLabel>Surface</InfoLabel>
						<InfoValue>
							{surfaceDisplay != null ? `${formatNumber({ number: surfaceDisplay })} ${unitLabel}` : "—"} / {zonageSurface ? `${formatNumber({ number: zonageSurfaceDisplay })} ${unitLabel}` : "—"}
						</InfoValue>
					</InfoRow>
				</Section>

				{hasFlux && (
					<>
						<Separator />
						<Section>
							<InfoRow>
								<InfoLabel><strong>Evolution{fluxYearOld && fluxYearNew ? ` entre ${fluxYearOld} et ${fluxYearNew}` : ""}</strong></InfoLabel>
							</InfoRow>
							<InfoRow>
								<InfoLabel>{modeLabelCap}</InfoLabel>
								<InfoValue style={{ color: "#E63946" }}>+{formatNumber({ number: toUnit(fluxPlus ?? 0), decimals: 2 })} {unitLabel}</InfoValue>
							</InfoRow>
							<InfoRow>
								<InfoLabel>{desLabel}</InfoLabel>
								<InfoValue style={{ color: "#2A9D8F" }}>-{formatNumber({ number: toUnit(fluxMinus ?? 0), decimals: 2 })} {unitLabel}</InfoValue>
							</InfoRow>
							<FluxNetRow>
								<InfoLabel><strong>{modeLabelCap} nette</strong></InfoLabel>
								<InfoValue style={{ color: getFluxNetColor(fluxNet ?? 0), fontWeight: 700 }}>
									{(fluxNet ?? 0) >= 0 ? "+" : ""}{formatNumber({ number: toUnit(fluxNet ?? 0), decimals: 2 })} {unitLabel}
								</InfoValue>
							</FluxNetRow>
						</Section>
					</>
				)}

				{nomenclature === "couverture" && couvertureItems.length > 0 && (
					<>
						<Separator />
						<Section>
							<SectionTitle>Détail de l&apos;{modeLabel} par couverture{year ? ` (${year})` : ""}</SectionTitle>
							{renderPieChart(couvertureItems, getCouvertureLabel, COUVERTURE_COLORS as Record<string, string>, hasFlux ? fluxCouvertureItems : undefined, unit)}
						</Section>
					</>
				)}

				{nomenclature === "usage" && usageItems.length > 0 && (
					<>
						<Separator />
						<Section>
							<SectionTitle>Détail de l&apos;{modeLabel} par usage{year ? ` (${year})` : ""}</SectionTitle>
							{renderPieChart(usageItems, getUsageLabel, USAGE_COLORS as Record<string, string>, hasFlux ? fluxUsageItems : undefined, unit)}
						</Section>
					</>
				)}
			</SidePanelContent>
		</>
	);
};
