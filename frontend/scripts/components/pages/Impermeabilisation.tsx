import React, { useState, useCallback } from "react";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import GenericChart from "@components/charts/GenericChart";
import { LandDetailResultType, LandType } from "@services/types/land";
import styled from "styled-components";
import { formatNumber } from "@utils/formatUtils";
import { getLandTypeLabel } from "@utils/landUtils";
import { LandMillesimeTable } from "@components/features/ocsge/LandMillesimeTable";
import { MillesimeDisplay } from "@components/features/ocsge/MillesimeDisplay";
import { ImpermeabilisationZonage } from "@components/features/ocsge/ImpermeabilisationZonage";
import { OcsgeMillesimeSelector } from "@components/features/ocsge/OcsgeMillesimeSelector";
import { DepartmentSelector } from "@components/features/ocsge/DepartmentSelector";
import { useImpermeabilisation } from "@hooks/useImpermeabilisation";
import { useImpermeabilisationZonage } from "@hooks/useImpermeabilisationZonage";
import Card from "@components/ui/Card";
import { ImpermeabilisationDiffMap } from "@components/map/ui/ImpermeabilisationDiffMap";
import { OcsgeObjectMap } from "@components/map/ui/OcsgeObjectMap";
import { ZonageUrbanismeMap } from "@components/map/ui/ZonageUrbanismeMap";
import { DetailsCalculationOcsge } from "@components/features/ocsge/DetailsCalculationOcsge";
import Guide from "@components/ui/Guide";
import GuideContent from "@components/ui/GuideContent";
import { ZoneTypeBadge } from "@components/ui/ZoneTypeBadge";

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

	// Navigation dans la carte des sous-territoires
	const CHILD_LAND_TYPE_MAP: Record<string, string> = {
		REGION: 'DEPART',
		DEPART: 'EPCI',
		SCOT: 'COMM',
		EPCI: 'COMM',
	}

	const [mapNavStack, setMapNavStack] = useState<{ land_id: string; land_type: string; name: string; child_land_type: string }[]>([])

	const handleMapPointClick = useCallback((point: { land_id: string; land_type: string; name: string }) => {
		const nextChildType = CHILD_LAND_TYPE_MAP[point.land_type]
		if (!nextChildType) return
		setMapNavStack((prev) => [...prev, {
			land_id: point.land_id,
			land_type: point.land_type,
			name: point.name,
			child_land_type: nextChildType,
		}])
	}, [])

	const handleMapBreadcrumbClick = useCallback((index: number) => {
		setMapNavStack((prev) => prev.slice(0, index))
	}, [])

	const currentMapLand = mapNavStack.length > 0
		? mapNavStack[mapNavStack.length - 1]
		: null
	const mapLandId = currentMapLand?.land_id ?? land_id
	const mapLandType = currentMapLand?.land_type ?? land_type
	const mapChildLandType = currentMapLand?.child_land_type ?? childLandType

	const handleChildLandTypeChange = useCallback((newType: string) => {
		setChildLandType(newType)
		setMapNavStack([])
	}, [setChildLandType])

	// États séparés pour chaque section
	const [byDepartementFlux, setByDepartementFlux] = useState(false);
	const [byDepartementNetFlux, setByDepartementNetFlux] = useState(false);
	const [byDepartementRepartition, setByDepartementRepartition] = useState(false);

	const { imperZonageIndex } = useImpermeabilisationZonage({
		landData,
		defaultStockIndex
	});

	const { has_zonage } = landData;
	if (isLoading) return <div className="fr-container--fluid fr-p-3w" role="status" aria-live="polite">Chargement...</div>;
	if (error) return <div className="fr-container--fluid fr-p-3w" role="alert" aria-live="assertive">Erreur : {error}</div>;
	if (!landData) return <div className="fr-container--fluid fr-p-3w" role="status" aria-live="polite">Données non disponibles</div>;

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
						<li>2° Surfaces dont les sols sont imperméabilisés en <strong>raison d'un revêtement</strong> (artificiel, asphalté, bétonné, couvert de pavés ou de dalles).</li>
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
							badgeLabel="Surfaces imperméables"
							value={`${formatNumber({ number: landImperStockIndex.surface })} ha`}
							label={
								<>
									{formatNumber({ number: landImperStockIndex.percent })}% du territoire{' - '}
									<MillesimeDisplay
										is_interdepartemental={is_interdepartemental}
										landArtifStockIndex={landImperStockIndex}
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
				{land_type !== LandType.REGION && (
					<ImpermeabilisationDiffMap landData={landData} />
				)}
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
										<GenericChart
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
										</GenericChart>
									</div>
								))
						) : (
							<div className="fr-col-12">
								<GenericChart
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
								</GenericChart>
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="fr-mb-7w">
				<h2 className="fr-mt-7w">
					Imperméabilisation des zonages d'urbanisme
				</h2>
				<p className="fr-text--sm fr-mb-2w">
					Le tableau ci-dessous et la carte associée croisent les zonages d'urbanisme (PLU/PLUi) avec les données OCS GE pour mesurer le taux d'imperméabilisation de chaque zone.
				</p>
				<ImpermeabilisationZonage
					imperZonageIndex={imperZonageIndex}
				/>
				<div className="fr-mt-4w" />
				<p className="fr-text--sm fr-mb-2w">
					La carte superpose les zonages d'urbanisme et l'occupation du sol. Les zonages sont colorés par type&nbsp;:
					{" "}<ZoneTypeBadge type="U" /> <ZoneTypeBadge type="AU" /> <ZoneTypeBadge type="N" /> <ZoneTypeBadge type="A" />.
					<br />Cliquez sur un zonage pour révéler l'occupation du sol en dessous et survolez les objets OCS GE pour identifier leur couverture ou usage.
				</p>
				{land_type !== LandType.REGION && has_zonage && (
					<ZonageUrbanismeMap
						landData={landData}
						mode="imper"
					/>
				)}
				<h2 className="fr-mt-4w">
					Imperméabilisation par type de couverture et d'usage
					{" "}
					<MillesimeDisplay
						is_interdepartemental={is_interdepartemental}
						landArtifStockIndex={landImperStockIndex}
						between={true}
					/>
				</h2>
				<div className="bg-white fr-px-4w fr-pt-4w fr-mt-2w fr-mb-5w rounded">
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
										<GenericChart
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
										</GenericChart>
										<GenericChart
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
										</GenericChart>
									</div>
								))
						) : (
							<>
								<div className="fr-col-12 fr-col-lg-6">
									<GenericChart
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
									</GenericChart>
								</div>
								<div className="fr-col-12 fr-col-lg-6">
									<GenericChart
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
									</GenericChart>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
			
			<div className="fr-mb-7w">
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
										<GenericChart
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
										</GenericChart>
										<GenericChart
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
										</GenericChart>
									</div>
								))
						) : (
							<>
								<div className="fr-col-12">
									<GenericChart
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
									</GenericChart>
								</div>
								<div className="fr-col-12">
									<GenericChart
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
									</GenericChart>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
			
			{child_land_types && (
				<div className="fr-mb-7w">
					<h2>Imperméabilisation des {getLandTypeLabel(childLandType, true)}</h2>
					<div className="fr-grid-row fr-grid-row--gutters">
						<div className="fr-col-12 fr-col-lg-8">
							<div className="bg-white fr-p-2w h-100 rounded">
								<div className="fr-mb-2w d-flex align-items-center gap-2">
									{child_land_types.length > 1 && child_land_types.map((child_land_type) => (
										<button
											key={child_land_type}
											className={`fr-btn ${childLandType === child_land_type ? "fr-btn--primary" : "fr-btn--tertiary"} fr-btn--sm`}
											onClick={() => handleChildLandTypeChange(child_land_type)}
										>
											{getLandTypeLabel(child_land_type)}
										</button>
									))}
								</div>
								{mapNavStack.length > 0 && (
									<Breadcrumb
										className="fr-mb-1w"
										segments={[
											{ label: name, linkProps: { href: '#', onClick: (e: React.MouseEvent) => { e.preventDefault(); handleMapBreadcrumbClick(0) } } },
											...mapNavStack.slice(0, -1).map((entry, i) => ({
												label: entry.name,
												linkProps: { href: '#', onClick: (e: React.MouseEvent) => { e.preventDefault(); handleMapBreadcrumbClick(i + 1) } },
											})),
										]}
										currentPageLabel={mapNavStack[mapNavStack.length - 1].name}
									/>
								)}
								<GenericChart
									key={`imper_map_${mapLandType}_${mapLandId}_${mapChildLandType}`}
									isMap
									id="imper_map"
									land_id={mapLandId}
									land_type={mapLandType}
									containerProps={{
										style: {
											height: "500px",
											width: "100%",
										}
									}}
									params={{
										index: defaultStockIndex,
										previous_index: defaultStockIndex - 1,
										child_land_type: mapChildLandType,
									}}
									sources={['ocsge']}
									showDataTable={true}
									onPointClick={CHILD_LAND_TYPE_MAP[mapChildLandType] ? handleMapPointClick : undefined}
								>
									<DetailsCalculationOcsge />
								</GenericChart>
							</div>
						</div>
						<div className="fr-col-12 fr-col-lg-4">
							<GuideContent
								title="Comprendre les données"
								column
							>
								<p>La couleur de fond indique le <strong>taux d'imperméabilisation</strong> de chaque territoire : plus la teinte <strong style={{color: "#6a6af4"}}>violette</strong> est intense, plus la part imperméabilisée est élevée.</p>
								<p>Les cercles représentent l'<strong>évolution</strong> entre les deux millésimes : <strong style={{color: "#FC9292"}}>rouge</strong> pour une imperméabilisation nette, <strong style={{color: "#7ec974"}}>vert</strong> pour une désimperméabilisation nette. Leur taille est proportionnelle à la surface concernée.</p>
								<p>Cliquez sur un territoire pour afficher le détail de ses sous-territoires. Le fil d'Ariane en haut de la carte permet de revenir au niveau précédent.</p>
							</GuideContent>
						</div>
					</div>
				</div>
			)}

			{land_type !== LandType.REGION && (
				<div className="fr-mb-7w">
					<h2>Explorateur des objets OCS GE imperméabilisés</h2>
					<p className="fr-text--sm fr-mb-2w">
						Cette carte permet d'explorer individuellement les objets OCS GE imperméabilisés du territoire. Chaque objet est caractérisé par un croisement couverture / usage qui détermine s'il est imperméabilisé ou non.
						Sélectionnez un objet sur la carte pour consulter sa couverture, son usage et son statut d'imperméabilisation.
						<br />
						<br />Exemple : un objet de couverture <span style={{display: "inline-block", width: 10, height: 10, background: "rgb(255, 55, 122)", marginRight: 3, verticalAlign: "middle"}} /> <strong>Zones bâties</strong> est considéré comme <strong style={{color: "#E63946"}}>imperméabilisé</strong>.
						À l'inverse, un objet de couverture <span style={{display: "inline-block", width: 10, height: 10, background: "rgb(0, 128, 64)", marginRight: 3, verticalAlign: "middle"}} /> <strong>Formations herbacées</strong> est considéré comme <strong style={{color: "#2A9D8F"}}>non imperméabilisé</strong>.
					</p>
					<OcsgeObjectMap
						landData={landData}
						mode="imper"
					/>
				</div>
			)}

			</div>
	);
};

