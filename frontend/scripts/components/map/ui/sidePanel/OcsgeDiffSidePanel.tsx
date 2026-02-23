import React, { useRef, useLayoutEffect } from "react";
import styled from "styled-components";
import type maplibregl from "maplibre-gl";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { formatNumber } from "@utils/formatUtils";
import { getCouvertureLabel, getUsageLabel } from "../../utils/ocsge";
import { COUVERTURE_COLORS, USAGE_COLORS, ALL_OCSGE_COUVERTURE_CODES, ALL_OCSGE_USAGE_CODES } from "../../constants/ocsge_nomenclatures";
import { SidePanelPlaceholder, CloseButton, InfoRow, InfoLabel, InfoValue, ColorDot } from "./SidePanelPrimitives";
import { Tooltip } from "react-tooltip";

export interface OcsgeDiffConfig {
	id: string;
	positiveField: string;
	negativeField: string;
	positiveLabel: string;
	negativeLabel: string;
	matrix: Record<string, string[]>;
	matrixPositiveLabel: string;
	matrixNegativeLabel: string;
	seuilText: (oldPositive: boolean, isPositive: boolean) => string;
}

export interface OcsgeDiffSidePanelProps {
	feature: maplibregl.MapGeoJSONFeature | null;
	isLocked: boolean;
	onClose: () => void;
	config: OcsgeDiffConfig;
}

const SectionTitle = styled.div`
	font-weight: 600;
	font-size: 0.8rem;
	color: #333;
`;

const Separator = styled.div`
	border-top: 1px solid #ddd;
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

const DiffChip = styled.span`
	display: inline-flex;
	align-items: center;
	gap: 3px;
`;

const MiniMatrixWrapper = styled.div`
	margin-top: 4px;
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

const MiniMatrixCell = styled.div<{ $positive: boolean; $variant: "before" | "after" | "none" }>`
	aspect-ratio: 1;
	border-radius: 1px;
	background-color: ${({ $positive }) => $positive ? "#FA4B42" : "#2A9D8F"};
	opacity: ${({ $variant }) => $variant !== "none" ? 1 : 0.25};
	outline: ${({ $variant }) =>
		$variant === "before" ? "2px dashed #000"
		: $variant === "after" ? "2px solid #000"
		: "none"};
	outline-offset: -1px;
	transition: opacity 0.2s ease, outline 0.2s ease;
	position: relative;
	z-index: ${({ $variant }) => $variant !== "none" ? 1 : 0};
`;

const ArrowSvg = styled.svg`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
	z-index: 2;
`;

const MiniMatrixLegend = styled.div`
	display: flex;
	gap: 10px;
	margin-top: 4px;
	font-size: 0.65rem;
	color: #666;
	flex-wrap: wrap;
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

const MiniMatrixLegendOutline = styled.span<{ $dashed?: boolean }>`
	display: inline-block;
	width: 8px;
	height: 8px;
	border-radius: 1px;
	border: 1.5px ${({ $dashed }) => $dashed ? "dashed" : "solid"} #000;
`;

export const OcsgeDiffSidePanel: React.FC<OcsgeDiffSidePanelProps> = ({
	feature,
	isLocked,
	onClose,
	config,
}) => {
	const { id, positiveField, negativeField, positiveLabel, negativeLabel, matrix, matrixPositiveLabel, matrixNegativeLabel, seuilText } = config;
	const tooltipId = `${id}-diff-matrix-tooltip`;
	const arrowheadId = `${id}-diff-arrowhead`;

	const wrapperRef = useRef<HTMLDivElement>(null);
	const beforeRef = useRef<HTMLDivElement>(null);
	const afterRef = useRef<HTMLDivElement>(null);
	const lineRef = useRef<SVGLineElement>(null);

	useLayoutEffect(() => {
		const wrapper = wrapperRef.current;
		const beforeEl = beforeRef.current;
		const afterEl = afterRef.current;
		const line = lineRef.current;
		if (!wrapper || !beforeEl || !afterEl || !line) return;
		const wr = wrapper.getBoundingClientRect();
		const br = beforeEl.getBoundingClientRect();
		const ar = afterEl.getBoundingClientRect();
		const x1 = br.left + br.width / 2 - wr.left;
		const y1 = br.top + br.height / 2 - wr.top;
		const x2 = ar.left + ar.width / 2 - wr.left;
		const y2 = ar.top + ar.height / 2 - wr.top;
		const dx = x2 - x1;
		const dy = y2 - y1;
		const dist = Math.sqrt(dx * dx + dy * dy);
		const startMargin = Math.max(br.width, br.height) / 2 + 2;
		const endMargin = Math.max(ar.width, ar.height) / 2 + 4;
		const startRatio = dist > startMargin ? startMargin / dist : 0;
		const endRatio = dist > endMargin ? (dist - endMargin) / dist : 0;
		line.setAttribute("x1", `${x1 + dx * startRatio}`);
		line.setAttribute("y1", `${y1 + dy * startRatio}`);
		line.setAttribute("x2", `${x1 + dx * endRatio}`);
		line.setAttribute("y2", `${y1 + dy * endRatio}`);
	});

	if (!feature) {
		return (
			<SidePanelPlaceholder>
				Survolez ou cliquez sur un objet pour afficher ses informations
			</SidePanelPlaceholder>
		);
	}

	const properties = feature.properties;
	if (!properties) return null;

	const isPositive = properties[positiveField] === true || properties[positiveField] === "true";
	const isNegative = properties[negativeField] === true || properties[negativeField] === "true";
	const surface = (properties.surface as number) || 0;

	const csOld = properties.cs_old as string;
	const csNew = properties.cs_new as string;
	const usOld = properties.us_old as string;
	const usNew = properties.us_new as string;

	const csOldColor = (COUVERTURE_COLORS as Record<string, string>)[csOld] || "#ccc";
	const csNewColor = (COUVERTURE_COLORS as Record<string, string>)[csNew] || "#ccc";
	const usOldColor = (USAGE_COLORS as Record<string, string>)[usOld] || "#ccc";
	const usNewColor = (USAGE_COLORS as Record<string, string>)[usNew] || "#ccc";

	const hasMatrix = csOld && csNew && usOld && usNew;
	const isSameCell = csOld === csNew && usOld === usNew;

	const oldByMatrix = hasMatrix && ((matrix as Record<string, string[]>)[csOld]?.includes(usOld) ?? false);
	const newByMatrix = hasMatrix && ((matrix as Record<string, string[]>)[csNew]?.includes(usNew) ?? false);
	const sameMatrixClass = oldByMatrix === newByMatrix;
	const isBySeuil = hasMatrix && (isPositive || isNegative) && sameMatrixClass;

	return (
		<>
			{isLocked && (
				<CloseButton title="Désélectionner l'objet" onClick={onClose}>
					✕
				</CloseButton>
			)}
			<SidePanelContent>
				<Section>
					<InfoRow>
						<InfoLabel>Type</InfoLabel>
						<InfoValue>
							<Badge
								noIcon
								severity={isPositive ? "error" : isNegative ? "success" : "info"}
								small
							>
								{isPositive ? positiveLabel : isNegative ? negativeLabel : "Inconnu"}
							</Badge>
						</InfoValue>
					</InfoRow>
					<InfoRow>
						<InfoLabel>Surface</InfoLabel>
						<InfoValue>
							{surface > 0
								? `${formatNumber({ number: surface / 10000 })} ha (${formatNumber({ number: surface })} m²)`
								: "\u2014"}
						</InfoValue>
					</InfoRow>
					{csOld && csNew && (
						<>
							<InfoRow>
								<InfoLabel>Couverture avant</InfoLabel>
								<InfoValue><DiffChip><ColorDot $color={csOldColor} />{getCouvertureLabel(csOld)}</DiffChip></InfoValue>
							</InfoRow>
							<InfoRow>
								<InfoLabel>Couverture après</InfoLabel>
								<InfoValue><DiffChip><ColorDot $color={csNewColor} />{getCouvertureLabel(csNew)}</DiffChip></InfoValue>
							</InfoRow>
						</>
					)}
					{usOld && usNew && (
						<>
							<InfoRow>
								<InfoLabel>Usage avant</InfoLabel>
								<InfoValue><DiffChip><ColorDot $color={usOldColor} />{getUsageLabel(usOld)}</DiffChip></InfoValue>
							</InfoRow>
							<InfoRow>
								<InfoLabel>Usage après</InfoLabel>
								<InfoValue><DiffChip><ColorDot $color={usNewColor} />{getUsageLabel(usNew)}</DiffChip></InfoValue>
							</InfoRow>
						</>
					)}
				</Section>

				{isBySeuil && (
					<div className="fr-alert fr-alert--warning fr-alert--sm">
						<p className="fr-text--xs fr-mb-0">
							{seuilText(oldByMatrix, isPositive)}
							{" "}
							<a target="_blank" rel="noopener noreferrer" href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048465959#:~:text=Enfin%2C%20sont%20int%C3%A9gr%C3%A9s,agronomique%20du%20sol.">seuils d&apos;interprétation</a>.
						</p>
					</div>
				)}

				{hasMatrix && (
					<>
						<Separator />
						<Section>
							<SectionTitle>Matrice de passage</SectionTitle>
							<MiniMatrixWrapper ref={wrapperRef}>
								<MiniMatrixLabel>Couverture</MiniMatrixLabel>
								<MiniMatrixOuter>
									<MiniMatrixRowLabel>Usage</MiniMatrixRowLabel>
									<MiniMatrixGrid>
										<div />
										{ALL_OCSGE_COUVERTURE_CODES.map(cs => (
											<MiniMatrixHeaderCell
												key={`h-${cs}`}
												$color={(COUVERTURE_COLORS as Record<string, string>)[cs]}
												$highlight={cs === csOld || cs === csNew}
												data-tooltip-id={tooltipId}
												data-tooltip-content={getCouvertureLabel(cs)}
											/>
										))}
										{ALL_OCSGE_USAGE_CODES.map(us => (
											<React.Fragment key={us}>
												<MiniMatrixHeaderCell
													$color={(USAGE_COLORS as Record<string, string>)[us]}
													$highlight={us === usOld || us === usNew}
													data-tooltip-id={tooltipId}
													data-tooltip-content={getUsageLabel(us)}
												/>
												{ALL_OCSGE_COUVERTURE_CODES.map(cs => {
													const isBefore = cs === csOld && us === usOld;
													const isAfter = cs === csNew && us === usNew;
													const variant = isBefore && !isAfter ? "before" : isAfter && !isBefore ? "after" : isBefore && isAfter ? "before" : "none";
													const inMatrix = matrix[cs]?.includes(us) ?? false;
													return (
														<MiniMatrixCell
															key={`${cs}-${us}`}
															ref={isBefore ? beforeRef : isAfter ? afterRef : undefined}
															$positive={inMatrix}
															$variant={variant}
															data-tooltip-id={tooltipId}
															data-tooltip-html={`<span style="display:inline-block;width:8px;height:8px;background:${(COUVERTURE_COLORS as Record<string, string>)[cs] || '#ccc'};margin-right:4px;vertical-align:middle;border-radius:1px"></span>${getCouvertureLabel(cs)}<br/><span style="display:inline-block;width:8px;height:8px;background:${(USAGE_COLORS as Record<string, string>)[us] || '#ccc'};margin-right:4px;vertical-align:middle;border-radius:1px"></span>${getUsageLabel(us)}<br/><b>${inMatrix ? matrixPositiveLabel : matrixNegativeLabel}</b>${isBefore ? "<br/><i>Avant</i>" : ""}${isAfter ? "<br/><i>Après</i>" : ""}`}
														/>
													);
												})}
											</React.Fragment>
										))}
									</MiniMatrixGrid>
								</MiniMatrixOuter>
								{!isSameCell && (
									<ArrowSvg>
										<defs>
											<marker id={arrowheadId} markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
												<polygon points="0 0, 6 2.5, 0 5" fill="#000" />
											</marker>
										</defs>
										<line
											ref={lineRef}
											stroke="#000"
											strokeWidth="1.5"
											markerEnd={`url(#${arrowheadId})`}
										/>
									</ArrowSvg>
								)}
								<Tooltip id={tooltipId} className="fr-text--xs" />
								<MiniMatrixLegend>
									<MiniMatrixLegendItem>
										<MiniMatrixLegendDot $color="#FA4B42" />
										{matrixPositiveLabel}
									</MiniMatrixLegendItem>
									<MiniMatrixLegendItem>
										<MiniMatrixLegendDot $color="#2A9D8F" />
										{matrixNegativeLabel}
									</MiniMatrixLegendItem>
									<MiniMatrixLegendItem>
										<MiniMatrixLegendOutline $dashed />
										Avant
									</MiniMatrixLegendItem>
									<MiniMatrixLegendItem>
										<MiniMatrixLegendOutline />
										Après
									</MiniMatrixLegendItem>
								</MiniMatrixLegend>
							</MiniMatrixWrapper>
						</Section>
					</>
				)}
			</SidePanelContent>
		</>
	);
};
