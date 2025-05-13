import React from "react";
import { formatNumber } from "@utils/formatUtils";
import { ZonageType } from "scripts/types/ZonageType";
import ChartDataWrapper from "@components/ui/ChartDataWrapper";
import { MillesimeDisplay } from "@components/features/ocsge/MillesimeDisplay";
import { LandArtifStockIndex } from "@services/types/landartifstockindex";

interface ZonageData {
	zonage_type: keyof typeof ZonageType;
	zonage_surface: number;
	artificial_surface: number;
	artificial_percent: number;
	zonage_count: number;
	departements: string[];
	years: number[];
	millesime_index: number;
}

interface ArtificialisationZonageProps {
	artifZonageIndex: ZonageData[];
	is_interdepartemental: boolean;
	landArtifStockIndex: LandArtifStockIndex;
}

export const ArtificialisationZonage: React.FC<ArtificialisationZonageProps> = ({
	artifZonageIndex,
	is_interdepartemental,
	landArtifStockIndex,
}) => {
	return (
		<div className="fr-mb-7w">
			<h2>Artificialisation des zonages d'urbanisme <MillesimeDisplay is_interdepartemental={is_interdepartemental} landArtifStockIndex={landArtifStockIndex} /></h2>
			<div className="bg-white fr-p-4w rounded">
				<p className="fr-text--sm">
					Ce tableau résume le détail de l'artificialisation des zonages
					d'urbanisme présent sur le territoire.
				</p>
				<div className="fr-table fr-mb-0">
					<div className="fr-table__wrapper">
						<div className="fr-table__container">
							<div className="fr-table__content">
								<table>
									<thead>
										<tr>
											<th scope="col">Type de zonage</th>
											<th scope="col">Surface de zonage (ha)</th>
											<th scope="col">Surface artificialisée (ha)</th>
											<th scope="col">Taux d'artificialisation (%)</th>
											<th scope="col">Nombre de zones</th>
										</tr>
									</thead>
									<tbody>
										{artifZonageIndex
											?.toSorted(
												(a, b) => b.zonage_surface - a.zonage_surface
											)
											.map((a) => (
												<tr key={`${a.zonage_type}_${a.millesime_index}`}>
													<td>
														<b>
															{ZonageType[a.zonage_type]} ({a.zonage_type})
														</b>
													</td>
													<td>
														{formatNumber({ number: a.zonage_surface })}
													</td>
													<td>
														{formatNumber({ number: a.artificial_surface })}
													</td>
													<td>
														<div className="progress-bar-container">
															<div
																className={`progress-bar-indicator w-${Math.round(
																	a.artificial_percent
																)}`}
															/>
															<div className="progress-bar-value">
																{formatNumber({
																	number: a.artificial_percent,
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
				<ChartDataWrapper sources={['ocsge', 'gpu']} chartId="artificialisation-zonage-tableau" />
			</div>
		</div>
	);
}; 