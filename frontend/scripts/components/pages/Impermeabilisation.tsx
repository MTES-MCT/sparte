import React, { useState } from "react";
import { OcsgeGraph } from "@components/charts/ocsge/OcsgeGraph";
import { LandDetailResultType } from "@services/types/land";
import styled from "styled-components";
import { formatNumber } from "@utils/formatUtils";
import { LandMillesimeTable } from "@components/features/ocsge/LandMillesimeTable";
import { MillesimeDisplay } from "@components/features/ocsge/MillesimeDisplay";
import { ImpermeabilisationZonage } from "@components/features/ocsge/ImpermeabilisationZonage";
import { OcsgeMillesimeSelector } from "@components/features/ocsge/OcsgeMillesimeSelector";
import { DepartmentSelector } from "@components/features/ocsge/DepartmentSelector";
import { useImpermeabilisation } from "@hooks/useImpermeabilisation";
import { useImpermeabilisationZonage } from "@hooks/useImpermeabilisationZonage";
import Card from "@components/ui/Card";
import { ImpermeabilisationMap } from "@components/map_v2/ui/ImpermeabilisationMap";
import { ImpermeabilisationDiffMap } from "@components/map_v2/ui/ImpermeabilisationDiffMap";
import { DetailsCalculationOcsge } from "@components/features/ocsge/DetailsCalculationOcsge";
import Guide from "@components/ui/Guide";
import GuideContent from "@components/ui/GuideContent";

export const BigNumber = styled.div`
	font-size: 3rem;
	font-weight: bold;
	line-height: 3rem;
`;

interface ImpermeabilisationProps {
	landData: LandDetailResultType;
}

export const Impermeabilisation: React.FC<ImpermeabilisationProps> = ({
	landData,
}) => {
	const {
		land_id,
		land_type,
		millesimes_by_index,
		millesimes,
		child_land_types,
		name,
		is_interdepartemental,
	} = landData || {};

	const {
		selectedIndex,
		setSelectedIndex,
		defaultStockIndex,
		childLandType,
		setChildLandType,
		landImperStockIndex,
		isLoading,
		error
	} = useImpermeabilisation({
		landData
	});

	// États séparés pour chaque section
	const [byDepartementFlux, setByDepartementFlux] = useState(false);
	const [byDepartementNetFlux, setByDepartementNetFlux] = useState(false);
	const [byDepartementRepartition, setByDepartementRepartition] = useState(false);

	const { imperZonageIndex } = useImpermeabilisationZonage({
		landData,
		defaultStockIndex
	});

	const { has_zonage } = landData;

	if (isLoading) return <div role="status" aria-live="polite">Chargement...</div>;
	if (error) return <div role="alert" aria-live="assertive">Erreur : {error}</div>;
	if (!landData) return <div role="status" aria-live="polite">Données non disponibles</div>;

	return (
		<div className="fr-container--fluid fr-p-3w">
			<div className="fr-mb-5w">
				<Guide
                    title="Qu'est-ce que l'imperméabilisation des sols ?"
                >
                    <p className="fr-text--sm">
						L'imperméabilisation des sols est définie comme :
					</p>
					<ul className="fr-text--sm">
						<li>1° Surfaces dont les sols sont imperméabilisés en <strong>raison du bâti</strong> (constructions, aménagements, ouvrages ou installations).</li>
						<li>2° Surfaces dont les sols sont imperméabilisés en <strong>raison d'un revêtement</strong> (Imperméable, asphalté, bétonné, couvert de pavés ou de dalles).</li>
					</ul>
                </Guide>
				<div className="fr-grid-row fr-grid-row--gutters">
					<div className="fr-col-12 fr-col-md-6">
						<Card
							icon="bi-droplet"
							badgeClass="fr-badge--error"
							badgeLabel="Imperméabilisation nette"
							value={`${formatNumber({ number: landImperStockIndex.flux_surface, addSymbol: true })} ha`}
							label={
								<MillesimeDisplay
									is_interdepartemental={is_interdepartemental}
									landArtifStockIndex={landImperStockIndex}
									between={true}
								/>
							}
							isHighlighted={true}
							highlightBadge="Donnée clé"
						/>
					</div>
					<div className="fr-col-12 fr-col-md-6">
						<Card
							icon="bi-droplet"
							badgeClass="fr-badge--info"
							badgeLabel="Surface imperméabilisée"
							value={`${formatNumber({ number: landImperStockIndex.surface })} ha`}
							label={
								<>
									{formatNumber({ number: landImperStockIndex.percent })}% du territoire{' - '}
									<MillesimeDisplay
										is_interdepartemental={is_interdepartemental}
										landArtifStockIndex={landImperStockIndex}
										between={false}
									/>
								</>
							}
							isHighlighted={false}
						/>
					</div>
				</div>
				<div className="fr-grid-row fr-mt-4w">
					<div className="fr-col-12">
						<div className="bg-white fr-p-3w rounded">
							<h2>D'où proviennent ces données&nbsp;?</h2>
							<p className="fr-text--sm fr-mb-2w">
								La mesure de l'imperméabilisation d'un territoire repose sur la
								donnée{" "}
								<strong>OCS GE (Occupation du Sol à Grande Echelle)</strong>,
								actuellement en cours de production par l'IGN. Cette donnée est
								produite tous les 3 ans par département. Chaque production est
								appelée un <strong>millésime</strong>.
							</p>
							<LandMillesimeTable
								millesimes={millesimes}
								territory_name={name}
								is_interdepartemental={is_interdepartemental}
							/>
							<p className="fr-text--xs fr-mt-1w fr-mb-0">
								Ces données sont disponibles en téléchargement sur le site de l'IGN
								:&nbsp;<a
									className="fr-link fr-text--sm"
									href="https://geoservices.ign.fr/artificialisation-ocs-ge#telechargement"
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Télécharger les données OCS GE sur le site de l'IGN (ouvre dans un nouvel onglet)"
								>
									https://geoservices.ign.fr/artificialisation-ocs-ge#telechargement
								</a>
							</p>
						</div>
					</div>
				</div>
			</div>

			<div className="fr-mb-7w">
				<h2 className="fr-mt-7w">
					Imperméabilisation nette des sols
					{" "}
					<MillesimeDisplay 
						is_interdepartemental={is_interdepartemental}
						landArtifStockIndex={landImperStockIndex}
						between={true}
					/>
				</h2>
				<ImpermeabilisationDiffMap landData={landData} />
				<div className="bg-white fr-px-4w fr-pt-4w fr-mt-4w rounded">
					{
						is_interdepartemental && (
							<DepartmentSelector
								byDepartement={byDepartementNetFlux}
								setByDepartement={setByDepartementNetFlux}
							/>
						)
					}
					<div className="fr-grid-row fr-grid-row--gutters fr-mt-1w">
						{byDepartementNetFlux ? (
							millesimes
								.filter((e) => e.index === Math.max(...millesimes.map(m => m.index)))
								.map((m) => (
									<div
										key={`${m.index}_${m.departement}`}
										className="fr-col-12"
									>
										<OcsgeGraph
											id="imper_net_flux"
											land_id={land_id}
											land_type={land_type}
											params={{
												millesime_new_index: Math.max(...millesimes.map(m => m.index)),
												millesime_old_index: Math.max(...millesimes.map(m => m.index)) - 1,
												departement: m.departement,
											}}
											sources={['ocsge']}
											showDataTable={true}
										>
											<DetailsCalculationOcsge />
										</OcsgeGraph>
									</div>
								))
						) : (
							<div className="fr-col-12">
								<OcsgeGraph
									id="imper_net_flux"
									land_id={land_id}
									land_type={land_type}
									params={{
										millesime_new_index: Math.max(...millesimes.map(m => m.index)),
										millesime_old_index: Math.max(...millesimes.map(m => m.index)) - 1,
									}}
									sources={['ocsge']}
									showDataTable={true}
								>
									<DetailsCalculationOcsge />
								</OcsgeGraph>
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="fr-mb-7w">
				<h2 className="fr-mt-7w">
					Surfaces imperméabilisées par type de couverture et
					d'usage
				</h2>
				<ImpermeabilisationMap landData={landData} />
				<div className="bg-white fr-px-4w fr-pt-4w fr-mt-4w fr-mb-5w rounded">
					<div className="d-flex gap-4">
						<OcsgeMillesimeSelector
							millesimes_by_index={millesimes_by_index}
							index={selectedIndex}
							setIndex={setSelectedIndex}
							isDepartemental={is_interdepartemental}
						/>
						{
							is_interdepartemental && (
								<DepartmentSelector
									byDepartement={byDepartementRepartition}
									setByDepartement={setByDepartementRepartition}
								/>
							)
						}
					</div>
					<div className="fr-grid-row fr-grid-row--gutters fr-mt-1w">
						{byDepartementRepartition ? (
							millesimes
								.filter((e) => e.index === selectedIndex)
								.map((m) => (
									<div
										key={`${m.index}_${m.departement}`}
										className="fr-col-12 fr-col-lg-6 gap-4 d-flex flex-column"
									>
										<OcsgeGraph
											id="pie_imper_by_couverture"
											land_id={land_id}
											land_type={land_type}
											params={{
												index: m.index,
												departement: m.departement,
											}}
											sources={['ocsge']}
											showDataTable={true}
										>
											<DetailsCalculationOcsge />
										</OcsgeGraph>
										<OcsgeGraph
											id="pie_imper_by_usage"
											land_id={land_id}
											land_type={land_type}
											params={{
												index: m.index,
												departement: m.departement,
											}}
											sources={['ocsge']}
											showDataTable={true}
										>
											<DetailsCalculationOcsge />
										</OcsgeGraph>
									</div>
								))
						) : (
							<>
								<div className="fr-col-12 fr-col-lg-6">
									<OcsgeGraph
										id="pie_imper_by_couverture"
										land_id={land_id}
										land_type={land_type}
										params={{
											index: selectedIndex,
										}}
										sources={['ocsge']}
										showDataTable={true}
									>
										<DetailsCalculationOcsge />
									</OcsgeGraph>
								</div>
								<div className="fr-col-12 fr-col-lg-6">
									<OcsgeGraph
										id="pie_imper_by_usage"
										land_id={land_id}
										land_type={land_type}
										params={{
											index: selectedIndex,
										}}
										sources={['ocsge']}
										showDataTable={true}
									>
										<DetailsCalculationOcsge />
									</OcsgeGraph>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
			
			<div className="fr-mb-7w">
				<h2 className="fr-mt-7w">
					Imperméabilisation par type de couverture et d'usage
					{" "}
					<MillesimeDisplay 
						is_interdepartemental={is_interdepartemental}
						landArtifStockIndex={landImperStockIndex}
						between={true}
					/>
				</h2>
				<div className="bg-white fr-px-4w fr-pt-4w fr-mb-5w rounded">
					{
						is_interdepartemental && (
							<DepartmentSelector
								byDepartement={byDepartementFlux}
								setByDepartement={setByDepartementFlux}
							/>
						)
					}
					<div className="fr-grid-row fr-grid-row--gutters fr-mt-1w">
						{byDepartementFlux ? (
							millesimes
								.filter((e) => e.index === Math.max(...millesimes.map(m => m.index)))
								.map((m) => (
									<div
										key={`${m.index}_${m.departement}`}
										className="fr-col-12 gap-4 d-flex flex-column"
									>
										<OcsgeGraph
											id="imper_flux_by_couverture"
											land_id={land_id}
											land_type={land_type}
											params={{
												millesime_new_index: Math.max(...millesimes.map(m => m.index)),
												millesime_old_index: Math.max(...millesimes.map(m => m.index)) - 1,
												departement: m.departement,
											}}
											sources={['ocsge']}
											showDataTable={true}
										>
											<DetailsCalculationOcsge />
										</OcsgeGraph>
										<OcsgeGraph
											id="imper_flux_by_usage"
											land_id={land_id}
											land_type={land_type}
											params={{
												millesime_new_index: Math.max(...millesimes.map(m => m.index)),
												millesime_old_index: Math.max(...millesimes.map(m => m.index)) - 1,
												departement: m.departement,
											}}
											sources={['ocsge']}
											showDataTable={true}
										>
											<DetailsCalculationOcsge />
										</OcsgeGraph>
									</div>
								))
						) : (
							<>
								<div className="fr-col-12">
									<OcsgeGraph
										id="imper_flux_by_couverture"
										land_id={land_id}
										land_type={land_type}
										params={{
											millesime_new_index: Math.max(...millesimes.map(m => m.index)),
											millesime_old_index: Math.max(...millesimes.map(m => m.index)) - 1,
										}}
										sources={['ocsge']}
										showDataTable={true}
									>
										<DetailsCalculationOcsge />
									</OcsgeGraph>
								</div>
								<div className="fr-col-12">
									<OcsgeGraph
										id="imper_flux_by_usage"
										land_id={land_id}
										land_type={land_type}
										params={{
											millesime_new_index: Math.max(...millesimes.map(m => m.index)),
											millesime_old_index: Math.max(...millesimes.map(m => m.index)) - 1,
										}}
										sources={['ocsge']}
										showDataTable={true}
									>
										<DetailsCalculationOcsge />
									</OcsgeGraph>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
			
			{child_land_types && (
				<div className="fr-mb-7w">
					<h2>Proportion des surfaces imperméabilisées</h2>
					<div className="fr-grid-row fr-grid-row--gutters">
						<div className="fr-col-12 fr-col-lg-8">
							<div className="bg-white fr-p-2w h-100 rounded">
								{child_land_types.length > 1 && (
									<div role="tablist" aria-label="Sélection du type de territoire">
										{child_land_types.map((child_land_type) => (
											<button
												className={`fr-btn  ${
													childLandType === child_land_type
														? "fr-btn--primary"
														: "fr-btn--tertiary"
												}`}
												key={child_land_type}
												onClick={() => setChildLandType(child_land_type)}
												role="tab"
												aria-selected={childLandType === child_land_type}
												aria-label={`Sélectionner ${child_land_type}`}
											>
												{child_land_type}
											</button>
										))}
									</div>
								)}
								<OcsgeGraph
									isMap
									id="imper_map"
									land_id={land_id}
									land_type={land_type}
									containerProps={{
										style: {
											height: "500px",
											width: "100%",
										}
									}}
									params={{
										index: defaultStockIndex,
										previous_index: defaultStockIndex - 1,
										child_land_type: childLandType,
									}}
									sources={['ocsge']}
									showDataTable={true}
								>
									<DetailsCalculationOcsge />
								</OcsgeGraph>
							</div>
						</div>
						<div className="fr-col-12 fr-col-lg-4">
							<GuideContent
								title="Comprendre les données"
								column
							>
								<p>Cette carte permet de visualiser la proportion de surfaces imperméabilisées sur un territoire, représentée par l'intensité de la couleur de fond : plus la teinte est foncée, plus la part de surfaces imperméabilisées est élevée.</p>
								<p>L'évolution entre les deux millésimes est illustrée par des cercles, dont la taille est proportionnelle à l'imperméabilisation. La couleur des cercles indique le sens de ce flux : vert pour une désimperméabilisation nette, rouge pour une imperméabilisation nette.</p>
							</GuideContent>
						</div>
					</div>
				</div>
			)}

			{has_zonage && (
				<ImpermeabilisationZonage 
					imperZonageIndex={imperZonageIndex}
					is_interdepartemental={is_interdepartemental}
					landImperStockIndex={landImperStockIndex}
				/>
			)}
		</div>
	);
};

