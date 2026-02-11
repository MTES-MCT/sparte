import React from "react";
import styled from "styled-components";
import { formatNumber } from "@utils/formatUtils";
import { ZonageType } from "scripts/types/ZonageType";
import ChartDetails from "@components/charts/ChartDetails";
import { MillesimeDisplay } from "@components/features/ocsge/MillesimeDisplay";
import { LandImperStockIndex } from "@services/types/landimperstockindex";

const ZONE_TYPE_COLORS: Record<string, string> = {
	U: "#E63946",
	AU: "#F4A261",
	N: "#2A9D8F",
	A: "#E9C46A",
};

const ZoneTypeBadge = styled.span<{ $color: string }>`
	display: inline-block;
	padding: 2px 6px;
	border-radius: 3px;
	background-color: ${({ $color }) => $color};
	color: white;
	font-weight: 600;
	font-size: 0.8rem;
	margin-right: 6px;
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

const PercentCell = styled.td`
	vertical-align: middle;
`;

interface ZonageData {
	zonage_type: keyof typeof ZonageType;
	zonage_surface: number;
	impermeable_surface: number;
	impermeable_percent: number;
	zonage_count: number;
	departements: string[];
	years: number[];
	millesime_index: number;
}

interface ImpermeabilisationZonageProps {
	imperZonageIndex: ZonageData[];
	is_interdepartemental: boolean;
	landImperStockIndex: LandImperStockIndex;
	onHoverZoneType?: (zoneType: string | null) => void;
}

export const ImpermeabilisationZonage: React.FC<ImpermeabilisationZonageProps> = ({
	imperZonageIndex,
	is_interdepartemental,
	landImperStockIndex,
	onHoverZoneType,
}) => {
	return (
		<div className="fr-mb-7w">
			<h2>Imperméabilisation des zonages d'urbanisme <MillesimeDisplay is_interdepartemental={is_interdepartemental} landArtifStockIndex={landImperStockIndex} /></h2>
			<div className="bg-white fr-p-4w rounded">
				<div className="fr-table fr-mb-0">
					<div className="fr-table__wrapper">
						<div className="fr-table__container">
							<div className="fr-table__content">
								<table>
									<thead>
										<tr>
											<th scope="col">Type de zonage</th>
											<th scope="col">Surface de zonage (ha)</th>
											<th scope="col">Surface imperméable (ha)</th>
											<th scope="col">Taux d'imperméabilisation (%)</th>
											<th scope="col">Nombre de zones</th>
										</tr>
									</thead>
									<tbody>
										{imperZonageIndex
											?.filter((a: ZonageData) => a && typeof a.zonage_surface === 'number')
											?.sort(
												(a: ZonageData, b: ZonageData) => b.zonage_surface - a.zonage_surface
											)
											.map((a: ZonageData) => (
												<tr
													key={`${a.zonage_type}_${a.millesime_index}`}
													onMouseEnter={() => onHoverZoneType?.(a.zonage_type)}
													onMouseLeave={() => onHoverZoneType?.(null)}
													style={{ cursor: "pointer" }}
												>
													<td>
														<ZoneTypeBadge $color={ZONE_TYPE_COLORS[a.zonage_type] || "#999"}>
															{a.zonage_type}
														</ZoneTypeBadge>
														<b>{ZonageType[a.zonage_type]}</b>
													</td>
													<td>
														{formatNumber({ number: a.zonage_surface })}
													</td>
													<td>
														{formatNumber({ number: a.impermeable_surface })}
													</td>
													<PercentCell>
														<div>{formatNumber({ number: a.impermeable_percent })}%</div>
														<PercentBarTrack>
															<PercentBarFill
																$percent={a.impermeable_percent}
																$color="#3A7EC2"
															/>
														</PercentBarTrack>
													</PercentCell>
													<td>{a.zonage_count}</td>
												</tr>
											))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
				<ChartDetails sources={['ocsge', 'gpu']} chartId="impermeabilisation-zonage-tableau">
					<div>
						<h3 className="fr-mb-0">Calcul</h3>
						<p className="fr-text--sm fr-mb-0">Qualifier l'imperméabilisation de chaque parcelle OCS GE via la nomenclature OCS GE. Puis comparer la surface totale des parcelles imperméables dans chaque zonage d'urbanisme à la surface de la zone pour connaître le taux d'occupation.</p>
					</div>
				</ChartDetails>
			</div>
		</div>
	);
};
