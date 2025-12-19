import React, { useState } from "react";
import { OcsgeGraph } from "@components/charts/ocsge/OcsgeGraph";
import { LandDetailResultType, LandType } from "@services/types/land";
import styled from "styled-components";
import { formatNumber } from "@utils/formatUtils";
import { getLandTypeLabel } from "@utils/landUtils";
import { LandMillesimeTable } from "@components/features/ocsge/LandMillesimeTable";
import { SeuilsSchemas } from "@components/features/ocsge/SeuilsSchemas";
import { MillesimeDisplay } from "@components/features/ocsge/MillesimeDisplay";
import { ArtificialisationZonage } from "@components/features/ocsge/ArtificialisationZonage";
import { OcsgeMillesimeSelector } from "@components/features/ocsge/OcsgeMillesimeSelector";
import { DepartmentSelector } from "@components/features/ocsge/DepartmentSelector";
import { useArtificialisation } from "@hooks/useArtificialisation";
import { useArtificialisationZonage } from "@hooks/useArtificialisationZonage";
import OcsgeMatricePNG from '@images/ocsge_matrice_passage.png';
import { DetailsCalculationOcsge } from "@components/features/ocsge/DetailsCalculationOcsge";
import Guide from "@components/ui/Guide";
import GuideContent from "@components/ui/GuideContent";
import Card from "@components/ui/Card";
import { ArtificialisationMap } from "@components/map/ui/ArtificialisationMap";
import { ArtificialisationDiffMap } from "@components/map/ui/ArtificialisationDiffMap";

export const BigNumber = styled.div`
	font-size: 3rem;
	font-weight: bold;
	line-height: 3rem;
`;

interface ArtificialisationProps {
	landData: LandDetailResultType;
}

export const Artificialisation: React.FC<ArtificialisationProps> = ({
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
		landArtifStockIndex,
		isLoading,
		error
	} = useArtificialisation({
		landData
	});

	// États séparés pour chaque section
	const [byDepartementFlux, setByDepartementFlux] = useState(false);
	const [byDepartementNetFlux, setByDepartementNetFlux] = useState(false);
	const [byDepartementRepartition, setByDepartementRepartition] = useState(false);

	const { artifZonageIndex } = useArtificialisationZonage({
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
                    title="Qu'est-ce que l'artificialisation des sols ?"
                >
                    <p className="fr-text--sm">
						L'artificialisation est définie dans l'<a href='https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000043957221' target='_blank' rel="noopener noreferrer">
						article 192 de la loi Climat et Resilience</a> comme «<strong>l'altération durable de tout ou partie des fonctions écologiques d'un sol, en particulier de ses fonctions biologiques, hydriques et climatiques</strong>, ainsi que de son potentiel agronomique par son occupation ou son usage.»
						Elle entraîne une perte de biodiversité, réduit la capacité des sols à absorber l'eau et contribue au réchauffement climatique.
					</p>
                </Guide>
				<div className="fr-grid-row fr-grid-row--gutters">
					<div className="fr-col-12 fr-col-md-6">
						<Card
							icon="bi-droplet"
							badgeClass="fr-badge--error"
							badgeLabel="Artificialisation nette"
							value={`${formatNumber({ number: landArtifStockIndex.flux_surface, addSymbol: true })} ha`}
							label={
								<MillesimeDisplay
									is_interdepartemental={is_interdepartemental}
									landArtifStockIndex={landArtifStockIndex}
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
							badgeLabel="Surfaces artificialisées"
							value={`${formatNumber({ number: landArtifStockIndex.surface })} ha`}
							label={
								<>
									{formatNumber({ number: landArtifStockIndex.percent })}% du territoire{' - '}
									<MillesimeDisplay
										is_interdepartemental={is_interdepartemental}
										landArtifStockIndex={landArtifStockIndex}
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
								La mesure de l'artificialisation d'un territoire repose sur la
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
					Artificialisation nette des sols
					{" "}
					<MillesimeDisplay
						is_interdepartemental={is_interdepartemental}
						landArtifStockIndex={landArtifStockIndex}
						between={true}
					/>
				</h2>
				{land_type !== LandType.REGION && (
					<ArtificialisationDiffMap landData={landData} />
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
										<OcsgeGraph
											id="artif_net_flux"
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
									id="artif_net_flux"
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
				<div className="bg-white fr-p-4w rounded fr-mt-5w">
					<h3>
						Quels sont les objectifs nationaux de réduction de
						l'artificialisation ?
					</h3>
					<div className="fr-highlight fr-highlight--no-margin">
						<p className="fr-text--sm">
							Afin de préserver les sols naturels, agricoles et forestiers, la
							loi Climat et Résilience fixe à partir de 2031 un cap clair
							:&nbsp;<strong>atteindre l'équilibre entre les surfaces artificialisées et désartificialisées</strong>, c'est-à-dire un objectif de <strong>« zéro artificialisation nette »</strong> des
							sols, à horizon 2050.
						</p>
					</div>
				</div>
			</div>

			<div className="fr-mb-7w">
				<h2 className="fr-mt-7w">
					Surfaces artificialisées par type de couverture et d'usage
				</h2>
				{land_type !== LandType.REGION && (
					<ArtificialisationMap landData={landData} />
				)}
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
											id="pie_artif_by_couverture"
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
											id="pie_artif_by_usage"
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
										id="pie_artif_by_couverture"
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
										id="pie_artif_by_usage"
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
					Artificialisation par type de couverture et d'usage
					{" "}
					<MillesimeDisplay 
						is_interdepartemental={is_interdepartemental}
						landArtifStockIndex={landArtifStockIndex}
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
											id="artif_flux_by_couverture"
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
											id="artif_flux_by_usage"
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
										id="artif_flux_by_couverture"
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
										id="artif_flux_by_usage"
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
					<h2>Artificialisation des {getLandTypeLabel(childLandType, true)}</h2>
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
												aria-label={`Sélectionner ${getLandTypeLabel(child_land_type)}`}
											>
												{getLandTypeLabel(child_land_type)}
											</button>
										))}
									</div>
								)}
								<OcsgeGraph
									isMap
									id="artif_map"
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
								<p>Cette carte permet de visualiser la proportion de sols artificialisés sur un territoire, représentée par l'intensité de la couleur de fond : plus la teinte est foncée, plus la part de sols artificialisés est élevée.</p>
								<p>L'évolution entre les deux millésimes est illustrée par des cercles, dont la taille est proportionnelle au flux d'artificialisation. La couleur des cercles indique le sens de ce flux : vert pour une désartificialisation nette, rouge pour une artificialisation nette.</p>
							</GuideContent>
						</div>
					</div>
				</div>
			)}

			{has_zonage && (
				<ArtificialisationZonage
					artifZonageIndex={artifZonageIndex}
					is_interdepartemental={is_interdepartemental}
					landArtifStockIndex={landArtifStockIndex}
				/>
			)}

			<div className="fr-mb-7w">
				<h2>Calcul de l'artificialisation des sols</h2>
				<div className="bg-white fr-p-4w fr-mb-7w rounded">
					<p className="fr-text--sm">
						La mesure de l'artificialisation est obtenue à partir de la donnée OCS
						GE, en s'appuyant en particulier sur un tableau de croisement
						couverture / usage. Par exemple, les couvertures de zones bâties à usage résidentiel
						ou les couvertures de formations herbacées à usage tertaire sont considérées comme
						des surfaces artificialisées. L'ensemble des croisements d'usage et de
						couverture du sol définissant les espaces artificialisés est
						consultable dans la matrice OCS GE ci-dessous.
					</p>
					<section className="fr-accordion fr-mb-3w">
						<h3 className="fr-accordion__title">
							<button
								className="fr-accordion__btn"
								aria-expanded="false"
								aria-controls="accordion-106"
							>
								Croisements d'usage et de couverture correspondant à l'artificialisation
							</button>
						</h3>
						<div className="fr-collapse" id="accordion-106">
							<img
								width="100%"
								src={OcsgeMatricePNG}
								alt="Matrice de croisements d'usage et de couverture d'après la nomenclature OCS GE qui détermine la composition de l'artificialisation"
							/>
						</div>
					</section>
					<h3 className="fr-mt-5w">Les seuils d'interprétation</h3>
					<p className="fr-text--sm">
						Une fois les espaces qualifiés en artificiels ou non-artificiels à
						partir du tableau de croisement,{" "}
						<strong>des seuils d'interprétation sont appliqués</strong>, comme
						défini dans le{" "}
						<a
							target="_blank"
							rel="noopener noreferrer"
							href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048465959#:~:text=Enfin%2C%20sont%20int%C3%A9gr%C3%A9s,agronomique%20du%20sol."
						>
							décret du 27 novembre 2023
						</a>
						. Ces seuils indiquent que des surfaces de moins de 2500 m² ne peuvent
						pas être comptabilisées comme artificialisées ou désartificialisées, à
						l'exception des espaces bâtis.
					</p>
					<p className="fr-text--sm">
						De fait, l'application de ces seuils{" "}
						<strong>
							permet de densifier en zone construite sans augmenter la mesure de
							l'artificialisation du territoire
						</strong>
						.<br /><br />
						Ci-dessous les trois cas de figure possibles&nbsp;:
					</p>
					<SeuilsSchemas />
					<p className="fr-text--sm">
						Le détail de la méthode de calcul de l'artificlisation avec les seuils
						d'interprétation est disponible sur le portail de l'artificialisation
						:&nbsp;{" "}
						<a
							className="fr-link fr-text--sm"
							target="_blank"
							rel="noopener noreferrer"
							href="https://artificialisation.developpement-durable.gouv.fr/calcul-lartificialisation-des-sols"
						>
							https://artificialisation.developpement-durable.gouv.fr/calcul-lartificialisation-des-sols
						</a>
					</p>
					<h3 className="fr-mt-5w">Les exemptions facultatives</h3>
					<p className="fr-text--sm">
						Le décret du 27 novembre 2023 introduit deux cas d'exemption facultative du calcul de l'artificialisation des sols. Les collectivités peuvent ainsi, si elles le souhaitent, exclure du décompte des surfaces artificialisées :
					</p>
					<ul>
						<li className="fr-text--sm">
							Les installations photovoltaïques au sol implantées sur des espaces agricoles ou naturels, à condition qu'elles n'affectent pas durablement les fonctions écologiques ou agronomiques du sol. En revanche, celles situées en forêt restent systématiquement comptabilisées.
							<a
								className="fr-link fr-text--sm fr-ml-1w"
								target="_blank"
								rel="noopener noreferrer"
								href="https://artificialisation.developpement-durable.gouv.fr/mesurer-lartificialisation-avec-locsge/photovoltaique"
							>
								En savoir plus
							</a>
						</li>
						<li className="fr-text--sm">
							Les surfaces végétalisées à usage de parc ou jardin public, qu'elles soient boisées ou herbacées, dès lors qu'elles couvrent une superficie supérieure à 2 500 m², valorisant ainsi ces espaces de nature en ville.
							<a
								className="fr-link fr-text--sm fr-ml-1w"
								target="_blank"
								rel="noopener noreferrer"
								href="https://artificialisation.developpement-durable.gouv.fr/exemption-des-parcs-et-jardins-publics"
							>
								En savoir plus
							</a>
						</li>
					</ul>
					<div className="fr-notice fr-notice--info">
						<div className="fr-px-2w">
							<div className="fr-notice__body">
								<p>
									<span className="fr-notice__title fr-text--sm">
										L'IGN est actuellement en cours de production d'une base de données nationale intégrant les exemptions prévues pour les installations photovoltaïques au sol et les parcs ou jardins publics. Les données affichées sur la plateforme ne prennent pas encore en compte ces exemptions.
									</span>
									<a className="fr-notice__desc fr-text--sm" target="_blank" href="/newsletter/inscription">
										{" "}
										Inscrivez-vous à notre lettre d'infos pour être prévenu(e) de la
										disponibilité de ces données
									</a>
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
