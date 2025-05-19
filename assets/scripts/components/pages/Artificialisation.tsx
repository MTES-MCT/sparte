import React from "react";
import Guide from "@components/ui/Guide";
import { OcsgeGraph } from "@components/charts/ocsge/OcsgeGraph";
import { ProjectDetailResultType } from "@services/types/project";
import { LandDetailResultType } from "@services/types/land";
import { OcsgeMapContainer } from "@components/map/ocsge/OcsgeMapContainer";
import styled from "styled-components";
import { ArtifPercentRate } from "@components/charts/artificialisation/ArtifPercentRate";
import { formatNumber } from "@utils/formatUtils";
import { LandMillesimeTable } from "@components/features/ocsge/LandMillesimeTable";
import { SeuilsSchemas } from "@components/features/ocsge/SeuilsSchemas";
import { MillesimeDisplay } from "@components/features/ocsge/MillesimeDisplay";
import { ArtificialisationZonage } from "@components/features/ocsge/ArtificialisationZonage";
import { OcsgeMillesimeSelector } from "@components/features/ocsge/OcsgeMillesimeSelector";
import { useArtificialisation } from "@hooks/useArtificialisation";
import { useArtificialisationZonage } from "@hooks/useArtificialisationZonage";
import { LandArtifStockIndex } from "@services/types/landartifstockindex";
import OcsgeMatricePNG from '@images/ocsge_matrice_passage.png';
import ChartDetails from "@components/charts/ChartDetails";

export const BigNumber = styled.div`
	font-size: 3rem;
	font-weight: bold;
	line-height: 3rem;
`;

interface ArtificialisationProps {
	projectData: ProjectDetailResultType;
	landData: LandDetailResultType;
}

interface Millesime {
	year: number;
	index: number;
	departement: string;
}

const DetaislCalculationOcsge: React.FC = () => (
	<div>
		<h6 className="fr-mb-0">Calcul</h6>
		<p className="fr-text--sm fr-mb-0">OCS GE traduite grâce à la matrice de passage.</p>
	</div>
)

const ArtifLastMillesimeSection: React.FC<{
	landArtifStockIndex: LandArtifStockIndex;
	name: string;
	is_interdepartemental: boolean;
	surface: number;
	years_artif: number[];
	defaultStockIndex: number;
}> = ({ landArtifStockIndex, name, is_interdepartemental, surface, years_artif, defaultStockIndex }) => (
	<div className="fr-mb-5w">
		<div className="fr-grid-row fr-grid-row--gutters">
			<div className="fr-col-12 fr-col-lg-8">
				<div className="bg-white fr-p-2w h-100 rounded">
					<div className="fr-grid-row fr-grid-row--gutters">
						<div className="fr-col-12 fr-col-md-7">
							<ArtifPercentRate
								percentageArtificialized={landArtifStockIndex.percent}
							/>
						</div>
						<div className="fr-col-12 fr-col-md-5">
							<BigNumber className="fr-mt-3w">
								{formatNumber({ number: landArtifStockIndex.surface })} ha
							</BigNumber>
							<span
								style={{textTransform: 'lowercase'}}
								className={`fr-badge ${
									landArtifStockIndex.flux_surface >= 0
										? "fr-badge--error"
										: "fr-badge--success"
								} fr-badge--error fr-badge--sm fr-badge--no-icon`}
							>
								{formatNumber({
									number: landArtifStockIndex.flux_surface,
									addSymbol: true,
								})}{" "}
								ha
								{landArtifStockIndex.flux_surface >= 0 ? (
									<i className="bi bi-arrow-up-right fr-ml-1w" />
								) : (
									<i className="bi bi-arrow-down-right fr-ml-1w" />
								)}
							</span>
							<MillesimeDisplay 
								is_interdepartemental={is_interdepartemental}
								landArtifStockIndex={{
									...landArtifStockIndex,
									millesime_index: defaultStockIndex
								}}
								between={true}
								className="fr-text--sm fr-ml-1w"
							/>
							<BigNumber className="fr-mt-3w">
								{formatNumber({ number: landArtifStockIndex.percent })}%
							</BigNumber>
							<p>du territoire est artificialisé</p>
						</div>
					</div>
					<ChartDetails
						sources={['ocsge']}
						chartId="artif_last_millesime"
					/>
				</div>
			</div>
			<div className="fr-col-12 fr-col-lg-4">
				<Guide
					title="Comprendre les données"
					column
				>
					<p>En {years_artif.join(", ")}, sur le territoire de {name}, <strong>{formatNumber(
						{ number: landArtifStockIndex.surface }
					)} ha</strong> étaient artificialisés, ce qui correspond à <strong>{formatNumber(
						{ number: landArtifStockIndex.percent }
					)}%</strong> de la surface totale ({formatNumber({
						number: surface,
					})} ha) du territoire.</p>
					<p>La surface artificialisée a {
						landArtifStockIndex.flux_surface >= 0
							? "augmenté"
							: "diminué"
					} de <strong>{formatNumber({
						number: landArtifStockIndex.flux_surface,
					})} ha <MillesimeDisplay 
						is_interdepartemental={is_interdepartemental}
						landArtifStockIndex={{
							...landArtifStockIndex,
							millesime_index: defaultStockIndex
						}}
						between={true}
					/></strong>.</p>
				</Guide>
			</div>
		</div>
	</div>
);

const MillesimesTable: React.FC<{
	millesimes: Millesime[];
	projectData: ProjectDetailResultType;
	is_interdepartemental: boolean;
}> = ({ millesimes, projectData, is_interdepartemental }) => (
	<div className="bg-white fr-p-4w rounded fr-mt-5w">
		<h6>D'où proviennent ces données&nbsp;?</h6>
		<div className="fr-highlight fr-highlight--no-margin">
			<p className="fr-text--sm">
				La mesure de l'artificialisation d'un territoire repose sur la
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
			>
				https://geoservices.ign.fr/artificialisation-ocs-ge#telechargement
			</a>
		</p>
		<LandMillesimeTable 
			millesimes={millesimes} 
			territory_name={projectData?.territory_name}
			is_interdepartemental={is_interdepartemental}
		/>
	</div>
);

export const Artificialisation: React.FC<ArtificialisationProps> = ({
	projectData,
	landData,
}) => {
	const { land_id, land_type } = projectData;
	const {
		surface,
		millesimes_by_index,
		millesimes,
		years_artif,
		child_land_types,
		name,
		is_interdepartemental,
	} = landData || {};
	
	const {
		stockIndex,
		setStockIndex,
		defaultStockIndex,
		byDepartement,
		setByDepartement,
		childLandType,
		setChildLandType,
		landArtifStockIndex,
		isLoading,
		error
	} = useArtificialisation({
		landData
	});

	const { artifZonageIndex } = useArtificialisationZonage({
		projectData,
		defaultStockIndex
	});

	if (isLoading) return <div>Chargement...</div>;
	if (error) return <div>Erreur : {error}</div>;

	return (
		<div className="fr-container--fluid fr-p-3w">
			<div className="fr-mb-7w">
				<div className="fr-grid-row fr-grid-row--gutters">
					<div className="fr-col-12">
						<Guide
							title="Qu'est-ce que l'artificialisation des sols ?"
						>
							L'artificialisation est définie dans l'<a href='https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000043957221' target='_blank'>
							article 192 de la loi Climat et Resilience</a> comme «<strong>l'altération durable de tout ou partie des fonctions écologiques d'un sol, en particulier de ses fonctions biologiques, hydriques et climatiques</strong>, ainsi que de son potentiel agronomique par son occupation ou son usage.»
							<br />
							Elle entraîne une perte de biodiversité, réduit la capacité des sols à absorber l'eau et contribue au réchauffement climatique.
						</Guide>
					</div>
				</div>
				<div className="bg-white fr-p-4w rounded">
					<h6>
						Quels sont les objectifs nationaux de réduction de
						l'artificialisation ?
					</h6>
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
			<h2>
				Artificialisation des sols de {name}
				{" "}
				<MillesimeDisplay 
					is_interdepartemental={is_interdepartemental}
					landArtifStockIndex={{
						...landArtifStockIndex,
						millesime_index: defaultStockIndex
					}}
				/>
			</h2>
			<ArtifLastMillesimeSection 
				landArtifStockIndex={landArtifStockIndex}
				name={name}
				is_interdepartemental={is_interdepartemental}
				surface={surface}
				years_artif={years_artif}
				defaultStockIndex={defaultStockIndex}
			/>
			<MillesimesTable 
				millesimes={millesimes}
				projectData={projectData}
				is_interdepartemental={is_interdepartemental}
			/>
			<div className="fr-mb-7w">
				<h2 className="fr-mt-7w">
					Répartition des surfaces artificialisées par type de couverture et
					d'usage
				</h2>
				<div className="bg-white fr-px-4w fr-pt-4w rounded">
					<OcsgeMillesimeSelector
						millesimes_by_index={millesimes_by_index}
						index={stockIndex}
						setIndex={setStockIndex}
						byDepartement={byDepartement}
						setByDepartement={setByDepartement}
						shouldDisplayByDepartementBtn={is_interdepartemental}
					/>
					<div className="fr-grid-row fr-grid-row--gutters fr-mt-1w">
						{byDepartement ? (
							millesimes
								.filter((e) => e.index === stockIndex)
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
											<DetaislCalculationOcsge />
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
											<DetaislCalculationOcsge />
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
											index: stockIndex,
										}}
										sources={['ocsge']}
										showDataTable={true}
									>
										<DetaislCalculationOcsge />
									</OcsgeGraph>
								</div>
								<div className="fr-col-12 fr-col-lg-6">
									<OcsgeGraph
										id="pie_artif_by_usage"
										land_id={land_id}
										land_type={land_type}
										params={{
											index: stockIndex,
										}}
										sources={['ocsge']}
										showDataTable={true}
									>
										<DetaislCalculationOcsge />
									</OcsgeGraph>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
			{child_land_types && (
				<div className="fr-mb-7w">
					<h2>Proportion des sols artificialisés</h2>
					<div className="fr-grid-row fr-grid-row--gutters">
						<div className="fr-col-12 fr-col-lg-8">
							<div className="bg-white fr-p-2w h-100 rounded">
								{child_land_types.length > 1 &&
									child_land_types.map((child_land_type) => (
										<button
											className={`fr-btn  ${
												childLandType === child_land_type
													? "fr-btn--primary"
													: "fr-btn--tertiary"
											}`}
											key={child_land_type}
											onClick={() => setChildLandType(child_land_type)}
										>
											{child_land_type}
										</button>
									))}
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
									<DetaislCalculationOcsge />
								</OcsgeGraph>
							</div>
						</div>
						<div className="fr-col-12 fr-col-lg-4">
							<Guide
								title="Comprendre les données"
								column
							>
								<p>Cette carte permet de visualiser la proportion de sols artificialisés sur un territoire, représentée par l'intensité de la couleur de fond : plus la teinte est foncée, plus la part de sols artificialisés est élevée.</p>
								<p>L'évolution entre les deux millésimes est illustrée par des cercles, dont la taille est proportionnelle au flux d'artificialisation. La couleur des cercles indique le sens de ce flux : vert pour une désartificialisation nette, rouge pour une artificialisation nette.</p>
							</Guide>
						</div>
					</div>
				</div>
			)}
			<div className="fr-mb-7w">
				<h2>Carte des sols artificialisés</h2>
				<div className="bg-white fr-p-4w rounded">
					<p className="fr-text--sm">
						Cette cartographie permet d'explorer les couvertures et les usages
						des surfaces artificialisées du territoire, en fonction des
						millésimes disponibles de la donnée OCS GE.
					</p>
					{projectData && (
						<OcsgeMapContainer
							projectData={projectData}
							landData={landData}
							globalFilter={["==", ["get", "is_artificial"], true]}
						/>
					)}
				</div>
			</div>
			<ArtificialisationZonage 
				artifZonageIndex={artifZonageIndex}
				is_interdepartemental={is_interdepartemental}
				landArtifStockIndex={{
					...landArtifStockIndex,
					millesime_index: defaultStockIndex
				}}
			/>
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
				<h6 className="fr-mt-5w">Les seuils d'interprétation</h6>
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
				<h6 className="fr-mt-5w">Les exemptions facultatives</h6>
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
			<div className="fr-mb-7w">
				<h2>
					Détail de l'évolution de l'artificialisation des sols du territoire
				</h2>
				<div className="fr-notice fr-notice--warning">
					<div className="fr-px-2w">
						<div className="fr-notice__body">
							<p>
								<span className="fr-notice__title fr-text--sm">
									Certains indicateurs liés à l'évolution de l'artificialisation
									d'un millésime à l'autre ne sont pas encore disponibles sur
									Mon Diagnostic Artificialisation.{" "}
								</span>
								<span className="fr-notice__desc fr-text--sm">
									En effet, ceux-ci reposent sur des données encore en cours de
									production. Leur publication est prévue dans les prochaines
									semaines.
								</span>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
