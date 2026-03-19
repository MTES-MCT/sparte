import React from "react";
import styled from "styled-components";
import { formatNumber } from "@utils/formatUtils";
import { ZonageType } from "scripts/types/ZonageType";
import { ZoneTypeBadge } from "@components/ui/ZoneTypeBadge";

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

export interface ImperZonageData {
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
	imperZonageIndex: ImperZonageData[];
}

export const ImpermeabilisationZonage: React.FC<ImpermeabilisationZonageProps> = ({
	imperZonageIndex,
}) => {
	return (
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
										<tr key={`${a.zonage_type}_${a.millesime_index}`}>
											<td>
												<ZoneTypeBadge type={a.zonage_type} />{" "}
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
	);
};
