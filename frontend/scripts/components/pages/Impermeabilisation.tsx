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
import { LandImperStockIndex } from "@services/types/landimperstockindex";
import { DataCards } from "@components/features/ocsge/DataCards";

export const BigNumber = styled.div`
	font-size: 3rem;
	font-weight: bold;
	line-height: 3rem;
`;

interface ImpermeabilisationProps {
	landData: LandDetailResultType;
}

interface Millesime {
	year: number;
	index: number;
	departement: string;
}

const DetailsCalculationOcsge: React.FC = () => (
	<div>
		<h6 className="fr-mb-0">Calcul</h6>
		<p className="fr-text--sm fr-mb-0">OCS GE traduite grâce à la nomenclature OCS GE.</p>
	</div>
)

const ImperLastMillesimeSection: React.FC<{
	landImperStockIndex: LandImperStockIndex;
	is_interdepartemental: boolean;
	millesimes: Millesime[];
	territory_name: string;
}> = ({ landImperStockIndex, is_interdepartemental, millesimes, territory_name }) => (
	<div className="fr-mb-5w">
		<div className="fr-grid-row fr-grid-row--gutters">
			<div className="fr-col-12 fr-col-md-6">
				<div className="bg-white fr-p-4w rounded h-100">
					<h6>Qu'est-ce que l'imperméabilisation des sols ?</h6>
					<p className="fr-text--sm">
						L'imperméabilisation des sols est définie comme :
					</p>
					<ul className="fr-text--sm">
						<li>1° Surfaces dont les sols sont imperméabilisés en <strong>raison du bâti</strong> (constructions, aménagements, ouvrages ou installations).</li>
						<li>2° Surfaces dont les sols sont imperméabilisés en <strong>raison d'un revêtement</strong> (Imperméable, asphalté, bétonné, couvert de pavés ou de dalles).</li>
					</ul>
				</div>
			</div>
			<DataCards
				icon="bi-droplet"
				fluxBadgeLabel="Imperméabilisation"
				stockBadgeLabel="Surface imperméabilisée"
				fluxValue={landImperStockIndex.flux_surface}
				fluxLabel={
					<MillesimeDisplay
						is_interdepartemental={is_interdepartemental}
						landArtifStockIndex={landImperStockIndex}
						between={true}
					/>
				}
				stockValue={`${formatNumber({ number: landImperStockIndex.surface })} ha`}
				stockLabel={
					<>
						{formatNumber({ number: landImperStockIndex.percent })}% du territoire{' - '}
						<MillesimeDisplay
							is_interdepartemental={is_interdepartemental}
							landArtifStockIndex={landImperStockIndex}
							between={false}
						/>
					</>
				}
			/>

		</div>
		<div className="fr-grid-row fr-mt-3w">
			<div className="fr-col-12">
				<div className="bg-white fr-p-4w rounded">
					<h6>D'où proviennent ces données&nbsp;?</h6>
					<div className="fr-highlight fr-highlight--no-margin">
						<p className="fr-text--sm">
							La mesure de l'imperméabilisation d'un territoire repose sur la
							donnée{" "}
							<strong>OCS GE (Occupation du Sol à Grande Echelle)</strong>,
							actuellement en cours de production par l'IGN. Cette donnée est
							produite tous les 3 ans par département. Chaque production est
							appelée un <strong>millésime</strong>.
						</p>
					</div>
					<p className="fr-mt-2w fr-text--sm">
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
					<LandMillesimeTable
						millesimes={millesimes}
						territory_name={territory_name}
						is_interdepartemental={is_interdepartemental}
					/>
				</div>
			</div>
		</div>
	</div>
);

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
			<ImperLastMillesimeSection
				landImperStockIndex={landImperStockIndex}
				is_interdepartemental={is_interdepartemental}
				millesimes={millesimes}
				territory_name={name}
			/>

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
				<div className="bg-white fr-px-4w fr-pt-4w rounded">
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
					Répartition des surfaces imperméabilisées par type de couverture et
					d'usage
				</h2>
				<div className="bg-white fr-px-4w fr-pt-4w rounded">
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
				<div className="bg-white fr-px-4w fr-pt-4w rounded">
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
					<div className="bg-white fr-p-2w rounded">
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
							<div>
								<h6>Comprendre les données</h6>
								<p>Cette carte permet de visualiser la proportion de sols imperméabilisés sur un territoire, représentée par l'intensité de la couleur de fond : plus la teinte est foncée, plus la part de sols imperméabilisés est élevée.</p>
								<p>L'évolution entre les deux millésimes est illustrée par des cercles, dont la taille est proportionnelle à l'imperméabilisation. La couleur des cercles indique le sens de ce flux : vert pour une désimperméabilisation nette, rouge pour une imperméabilisation nette.</p>
							</div>
							<DetailsCalculationOcsge />
						</OcsgeGraph>
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

