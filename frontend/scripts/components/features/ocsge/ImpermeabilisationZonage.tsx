import React from "react";
import { formatNumber } from "@utils/formatUtils";
import { ZonageType } from "scripts/types/ZonageType";
import ChartDetails from "@components/charts/ChartDetails";
import { MillesimeDisplay } from "@components/features/ocsge/MillesimeDisplay";
import { LandImperStockIndex } from "@services/types/landimperstockindex";

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
}

export const ImpermeabilisationZonage: React.FC<ImpermeabilisationZonageProps> = ({
	imperZonageIndex,
	is_interdepartemental,
	landImperStockIndex,
}) => {
	return (
		<div className="fr-mb-7w">
			<h2>Imperméabilisation des zonages d'urbanisme en <MillesimeDisplay is_interdepartemental={is_interdepartemental} landArtifStockIndex={landImperStockIndex} /></h2>
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
											<th scope="col">Surface imperméabilisée (ha)</th>
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
														<b>
															{ZonageType[a.zonage_type as keyof typeof ZonageType]} ({a.zonage_type})
														</b>
													</td>
													<td>
														{formatNumber({ number: a.zonage_surface })}
													</td>
													<td>
														{formatNumber({ number: a.impermeable_surface })}
													</td>
													<td>
														<div className="progress-bar-container">
															<div
																className={`progress-bar-indicator w-${Math.round(
																	a.impermeable_percent
																)}`}
															/>
															<div className="progress-bar-value">
																{formatNumber({
																	number: a.impermeable_percent,
																})}
																%
															</div>
														</div>
													</td>
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
						<h6 className="fr-mb-0">Calcul</h6>
						<p className="fr-text--sm fr-mb-0">Qualifier l'imperméabilisation de chaque parcelle OCS GE via la nomenclature OCS GE. Puis comparer la surface totale des parcelles imperméabilisées dans chaque zonage d'urbanisme à la surface de la zone pour connaître le taux d'occupation.</p>
					</div>
				</ChartDetails>
			</div>
		</div>
	);
};
