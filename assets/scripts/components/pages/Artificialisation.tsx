import React, { useMemo } from "react";
import Guide from "@components/ui/Guide";
import { useGetArtifZonageIndexQuery, useGetLandArtifStockIndexQuery } from "@services/api";
import { OcsgeGraph } from "@components/charts/ocsge/OcsgeGraph";
import { ProjectDetailResultType } from "@services/types/project";
import { LandDetailResultType, MillesimeByIndex } from "@services/types/land";
import { OcsgeMapContainer } from "@components/map/ocsge/OcsgeMapContainer";
import styled, { css } from "styled-components";
import { ArtifPercentRate } from "@components/charts/artificialisation/ArtifPercentRate";
import { formatNumber } from "@utils/formatUtils";
import { LandMillesimeTable } from "@components/widgets/LandMillesimeTable";
import { defautLandArtifStockIndex, LandArtifStockIndex } from "@services/types/landartifstockindex";
import { SeuilsSchemas } from "@components/features/SeuilsSchemas";
import { ZonageType } from "scripts/types/ZonageType";
import ChartSource from "@components/charts/ChartSource";

export const BigNumber = styled.div`
	font-size: 3rem;
	font-weight: bold;
	line-height: 3rem;
`;

interface OcsgeMillesimeSelectorProps {
	index: number;
	setIndex: (index: number) => void;
	byDepartement: boolean;
	setByDepartement: (byDepartement: boolean) => void;
	millesimes_by_index: MillesimeByIndex[];
	shouldDisplayByDepartementBtn: boolean;
}

interface ArtificialisationProps {
	projectData: ProjectDetailResultType;
	landData: LandDetailResultType;
}

interface Millesime {
	year: number;
	index: number;
	departement: string;
}

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

interface MillesimeDisplayProps {
	is_interdepartemental: boolean;
	landArtifStockIndex: LandArtifStockIndex;
	between?: boolean;
	className?: string;
}

const MillesimeDisplay: React.FC<MillesimeDisplayProps> = ({ 
	is_interdepartemental, 
	landArtifStockIndex,
	between,
	className
}) => (
	<span className={className}>
		{is_interdepartemental ? (
			between ? (
				<>entre le <a href="#millesimes-table">millésime n°{landArtifStockIndex.millesime_index - 1}</a> et le <a href="#millesimes-table">millésime n°{landArtifStockIndex.millesime_index}</a></>
			) : (
				<>au <a href="#millesimes-table">millésime n°{landArtifStockIndex.millesime_index}</a></>
			)
		) : (
			between ? (
				<>entre {landArtifStockIndex.flux_previous_years?.[0]} et {landArtifStockIndex.years?.[0]}</>
			) : (
				`en ${landArtifStockIndex.years?.[0]}`
			)
		)}
	</span>
);

const OcsgeMillesimeSelector: React.FC<OcsgeMillesimeSelectorProps> = React.memo(({
	index,
	setIndex,
	byDepartement,
	setByDepartement,
	millesimes_by_index,
	shouldDisplayByDepartementBtn,
}) => (
	<ul className="fr-btns-group fr-btns-group--inline-sm">
		{millesimes_by_index.map((m) => (
			<li key={m.years}>
				<button
					type="button"
					className={`fr-btn ${m.index !== index ? "fr-btn--tertiary" : ""}`}
					onClick={() => setIndex(m.index)}
					title={m.years}
				>
					{shouldDisplayByDepartementBtn ? `Millésime n°${m.index}` : m.years}
				</button>
			</li>
		))}
		{shouldDisplayByDepartementBtn && (
			<li>
				<button
					onClick={() => setByDepartement(!byDepartement)}
					type="button"
					className="fr-btn fr-btn--tertiary"
				>
					<p>
						<span>
							{byDepartement
								? "Afficher par groupe de millésime"
								: "Afficher par département"}
						</span>
						&nbsp;
						<i
							className="bi bi-info-circle"
							aria-describedby="tooltip-multi-dpt"
							data-fr-js-tooltip-referent="true"
						/>
						<span 
							id="tooltip-multi-dpt" 
							className="fr-tooltip fr-placement" 
							role="tooltip" 
							aria-hidden="true"
						>
							{byDepartement
								? "Ce mode rassemble les données par groupe d'années, ce qui permet d'afficher une vue d'ensemble"
								: "Ce mode distingue les données par département, ce qui permet de ne pas mélanger les données issues d'années différentes"
							}
						</span>
					</p>
				</button>
			</li>
		)}
	</ul>
));

const CadreReglementaireSection = () => (
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
);

const ArtifLastMillesimeSection: React.FC<{
	landArtifStockIndex: LandArtifStockIndex;
	name: string;
	is_interdepartemental: boolean;
	surface: number;
	years_artif: number[];
}> = React.memo(({ landArtifStockIndex, name, is_interdepartemental, surface, years_artif }) => (
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
								landArtifStockIndex={landArtifStockIndex}
								between={true}
								className="fr-text--sm fr-ml-1w"
							/>
							<BigNumber className="fr-mt-3w">
								{formatNumber({ number: landArtifStockIndex.percent })}%
							</BigNumber>
							<p>du territoire est artificialisé</p>
						</div>
					</div>
					<ChartSource sources={['ocsge']} chartId="artificialisation-tableau" />
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
						landArtifStockIndex={landArtifStockIndex}
						between={true}
					/></strong>.</p>
				</Guide>
			</div>
		</div>
	</div>
));

const MillesimesTable: React.FC<{
	millesimes: Millesime[];
	projectData: ProjectDetailResultType;
	is_interdepartemental: boolean;
}> = React.memo(({ millesimes, projectData, is_interdepartemental }) => (
	<div className="bg-white fr-p-4w rounded fr-mt-5w" id="millesimes-table" style={{ scrollMarginTop: '200px' }}>
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
		<div className="fr-alert fr-alert--info">
			<h6 className="fr-alert__title">
				Millésimes disponibles pour le territoire de{" "}
				<strong>{projectData?.territory_name}</strong>
			</h6>
			{is_interdepartemental ? (
				<div className="fr-grid-row fr-grid-row--gutters fr-mt-2w fr-mb-1w">
					<LandMillesimeTable millesimes={millesimes} />
				</div>
			) : (
				<>
					{millesimes
						.map((m) => m.year)
						.toSorted((a, b) => a - b)
						.map((year) => (
							<div key={year} className="fr-badge fr-mr-1w">{year}</div>
						))
					}
				</>
			)}
		</div>
	</div>
));

const ZonageTable: React.FC<{
	artifZonageIndex: ZonageData[];
	is_interdepartemental: boolean;
}> = React.memo(({ artifZonageIndex }) => (
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
));

const CalculDetailsSection: React.FC = React.memo(() => (
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
					src="http://localhost:3000/assets/images/fee8522683da78dec22f.png"
					alt="Matrice de passage OCS GE"
				/>
			</div>
		</section>
		<h6 className="fr-mt-5w">Les seuils d'interprétation</h6>
		<p className="fr-text--sm">
			Une fois les espaces qualifiés en artificiels ou non-artificiels à
			partir du tableau de croisement,{" "}
			<strong>des seuils d'interprétation sont appliqués</strong>, comme
			définis dans le{" "}
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048465959#:~:text=Enfin%2C%20sont%20int%C3%A9gr%C3%A9s,agronomique%20du%20sol."
			>
				décret du 27 novembre 2023
			</a>
			. Ces seuils indiquent que des surfaces de moins de 2500m2 ne peuvent
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
			d'interprétation est disponibles sur le portail de l'artificialisation
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
							Inscrivez-vous à la newsletter pour être prévenu(e) de la
							disponibilité de ces données
						</a>
					</p>
				</div>
			</div>
		</div>
	</div>
));

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
	
	const defaultStockIndex = useMemo(() => 
		millesimes_by_index.length > 0
			? Math.max(...millesimes_by_index.map((e) => e.index))
			: 2,
		[millesimes_by_index]
	);

	const [stockIndex, setStockIndex] = React.useState(defaultStockIndex);
	const [byDepartement, setByDepartement] = React.useState(false);
	const [childLandType, setChildLandType] = React.useState(
		child_land_types ? child_land_types[0] : undefined
	);

	const { data: artifZonageIndex } = useGetArtifZonageIndexQuery({
		land_type: land_type,
		land_id: land_id,
		millesime_index: stockIndex,
	});

	const { data: landArtifStockIndexes } = useGetLandArtifStockIndexQuery({
		land_type: land_type,
		land_id: land_id,
		millesime_index: defaultStockIndex,
	});

	const landArtifStockIndex: LandArtifStockIndex = useMemo(() =>
		landArtifStockIndexes?.find(
			(e: LandArtifStockIndex) => e.millesime_index === defaultStockIndex
		) ?? defautLandArtifStockIndex,
		[landArtifStockIndexes, defaultStockIndex]
	);

	return (
		<div className="fr-container--fluid fr-p-3w">
			<CadreReglementaireSection />
			<h2>
				Artificialisation des sols de {name}
				{" "}
				<MillesimeDisplay 
					is_interdepartemental={is_interdepartemental}
					landArtifStockIndex={landArtifStockIndex}
				/>
			</h2>
			<ArtifLastMillesimeSection 
				landArtifStockIndex={landArtifStockIndex}
				name={name}
				is_interdepartemental={is_interdepartemental}
				surface={surface}
				years_artif={years_artif}
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
										/>
										<OcsgeGraph
											id="pie_artif_by_usage"
											land_id={land_id}
											land_type={land_type}
											params={{
												index: m.index,
												departement: m.departement,
											}}
											sources={['ocsge']}
										/>
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
									/>
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
									/>
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
										index: stockIndex,
										previous_index: stockIndex - 1,
										child_land_type: childLandType,
									}}
									sources={['ocsge']}
								/>
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
			<div className="fr-mb-7w">
				<h2>Artificialisation des zonages d'urbanisme <MillesimeDisplay is_interdepartemental={is_interdepartemental} landArtifStockIndex={landArtifStockIndex} /></h2>
				<div className="bg-white fr-p-4w rounded">
					<p className="fr-text--sm">
						Ce tableau résume le détail de l'artificialisation des zonages
						d'urbanisme présent sur le territoire.
					</p>
					<ZonageTable 
						artifZonageIndex={artifZonageIndex}
						is_interdepartemental={is_interdepartemental}
					/>
					<ChartSource sources={['ocsge', 'gpu']} chartId="artificialisation-zonage-tableau" />
				</div>
			</div>
			<h2>Calcul de l'artificialisation des sols</h2>
			<CalculDetailsSection />
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
