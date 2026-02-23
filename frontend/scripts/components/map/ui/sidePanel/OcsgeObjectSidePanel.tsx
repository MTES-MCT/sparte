import React from "react";
import styled from "styled-components";
import type maplibregl from "maplibre-gl";
import { formatNumber } from "@utils/formatUtils";
import { getCouvertureLabel, getUsageLabel } from "../../utils/ocsge";
import { COUVERTURE_COLORS, USAGE_COLORS, ARTIFICIALISATION_MATRIX, IMPERMEABILISATION_MATRIX, ALL_OCSGE_COUVERTURE_CODES, ALL_OCSGE_USAGE_CODES, isArtifMatrice } from "../../constants/ocsge_nomenclatures";
import { Couverture, Usage } from "../../types/ocsge";
import type { ZonageUrbanismeMode } from "../../layers/zonageUrbanismeLayer";
import type { LandDetailResultType } from "@services/types/land";
import { MODE_CONFIG } from "../../constants/modeConfig";
import { SidePanelPlaceholder, CloseButton, InfoRow, InfoLabel, InfoValue, ColorDot } from "./SidePanelPrimitives";
import { Tooltip } from "react-tooltip";

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
	max-width: 90%;
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

export interface OcsgeObjectSidePanelProps {
	feature: maplibregl.MapGeoJSONFeature | null;
	isLocked: boolean;
	onClose: () => void;
	mode: ZonageUrbanismeMode;
	landData: LandDetailResultType;
}

export const OcsgeObjectSidePanel: React.FC<OcsgeObjectSidePanelProps> = ({
	feature,
	isLocked,
	onClose,
	mode,
	landData,
}) => {
	const { matrixLabelPositif, matrixLabelNegatif } = MODE_CONFIG[mode];
	const matrix = mode === "artif" ? ARTIFICIALISATION_MATRIX : IMPERMEABILISATION_MATRIX;

	if (!feature) {
		return (
			<SidePanelPlaceholder>
				Survolez ou cliquez sur un objet pour afficher ses informations
			</SidePanelPlaceholder>
		);
	}

	const properties = feature.properties;
	if (!properties) return null;

	const surface = (properties.surface as number) || 0;
	const codeCs = properties.code_cs as string;
	const codeUs = properties.code_us as string;
	const isArtificial = properties.is_artificial;
	const isArtifByMatrice = codeCs && codeUs && isArtifMatrice(codeCs as Couverture, codeUs as Usage);
	const isArtifBySeuil = isArtificial && !isArtifByMatrice;

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

	return (
		<>
			{isLocked && (
				<CloseButton title="Désélectionner l'objet" onClick={onClose}>
					✕
				</CloseButton>
			)}
			<div style={{ paddingTop: 8 }}>
				{landData.is_interdepartemental && featureDept && (
					<InfoRow>
						<InfoLabel>Département</InfoLabel>
						<InfoValue>
							{landData.millesimes.find(m => m.departement === featureDept)?.departement_name || featureDept}
							{featureYear && ` (${featureYear})`}
						</InfoValue>
					</InfoRow>
				)}
				<InfoRow>
					<InfoLabel>Surface</InfoLabel>
					<InfoValue>
						{surface > 0 ? `${formatNumber({ number: surface / 10000 })} ha (${formatNumber({ number: surface })} m²)` : "\u2014"}
					</InfoValue>
				</InfoRow>

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

				{mode === "artif" && isArtifBySeuil && (
					<div className="fr-alert fr-alert--warning fr-alert--sm fr-mt-1w">
						<p className="fr-text--xs fr-mb-0">
							Classé artificialisé par les <a target="_blank" rel="noopener noreferrer" href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048465959#:~:text=Enfin%2C%20sont%20int%C3%A9gr%C3%A9s,agronomique%20du%20sol.">seuils d'interprétation</a>, et non par la matrice OCS GE.
						</p>
					</div>
				)}

				{codeCs && codeUs && (
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
													{...(isActive ? { id: "matrix-active-cell", "data-tooltip-id": "matrix-active-tooltip" } : { "data-tooltip-id": "matrix-tooltip" })}
													data-tooltip-html={`<span style="display:inline-block;width:8px;height:8px;background:${(COUVERTURE_COLORS as Record<string, string>)[cs] || '#ccc'};margin-right:4px;vertical-align:middle;border-radius:1px"></span>${getCouvertureLabel(cs)}<br/><span style="display:inline-block;width:8px;height:8px;background:${(USAGE_COLORS as Record<string, string>)[us] || '#ccc'};margin-right:4px;vertical-align:middle;border-radius:1px"></span>${getUsageLabel(us)}<br/><b>${positif ? matrixLabelPositif : matrixLabelNegatif}</b>`}
												/>
											);
										})}
									</React.Fragment>
								))}
							</MiniMatrixGrid>
						</MiniMatrixOuter>
						<Tooltip id="matrix-tooltip" className="fr-text--xs" />
						<Tooltip
							key={`${codeCs}-${codeUs}`}
							id="matrix-active-tooltip"
							className="fr-text--xs"
							isOpen={true}
							anchorSelect="#matrix-active-cell"
						/>
						<MiniMatrixLegend>
							<MiniMatrixLegendItem>
								<MiniMatrixLegendDot $color="#FA4B42" />
								{matrixLabelPositif}
							</MiniMatrixLegendItem>
							<MiniMatrixLegendItem>
								<MiniMatrixLegendDot $color="#2A9D8F" />
								{matrixLabelNegatif}
							</MiniMatrixLegendItem>
						</MiniMatrixLegend>
					</MiniMatrixWrapper>
				)}
			</div>
		</>
	);
};
