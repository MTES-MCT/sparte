import React from "react";
import Guide from "@components/ui/Guide";
import { OcsgeGraph } from "@components/charts/ocsge/OcsgeGraph";
import { ProjectDetailResultType } from "@services/types/project";
import { LandDetailResultType } from "@services/types/land";
import { OcsgeMapContainer } from "@components/map/ocsge/OcsgeMapContainer";
import styled from "styled-components";
import { formatNumber } from "@utils/formatUtils";
import { LandMillesimeTable } from "@components/features/ocsge/LandMillesimeTable";
import { MillesimeDisplay } from "@components/features/ocsge/MillesimeDisplay";
import { ImpermeabilisationZonage } from "@components/features/ocsge/ImpermeabilisationZonage";
import { OcsgeMillesimeSelector } from "@components/features/ocsge/OcsgeMillesimeSelector";
import { useImpermeabilisation } from "@hooks/useImpermeabilisation";
import { useImpermeabilisationZonage } from "@hooks/useImpermeabilisationZonage";
import { LandImperStockIndex } from "@services/types/landimperstockindex";
import ChartDetails from "@components/charts/ChartDetails";

export const BigNumber = styled.div`
	font-size: 3rem;
	font-weight: bold;
	line-height: 3rem;
`;

interface ImpermeabilisationProps {
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
		<p className="fr-text--sm fr-mb-0">OCS GE traduite grâce à la nomenclature OCS GE.</p>
	</div>
)

const ImperLastMillesimeSection: React.FC<{
	landImperStockIndex: LandImperStockIndex;
	name: string;
	is_interdepartemental: boolean;
	surface: number;
	years_artif: number[];
}> = ({ landImperStockIndex, name, is_interdepartemental, surface, years_artif }) => (
	<div className="fr-mb-5w">
		<div className="fr-grid-row fr-grid-row--gutters">
			<div className="fr-col-12 fr-col-lg-8">
				<div className="bg-white fr-p-2w h-100 rounded">
					<div className="fr-grid-row fr-grid-row--gutters">
						<div className="fr-col-12 fr-col-md-7">
                        <BigNumber className="fr-mt-3w">
								{formatNumber({ number: landImperStockIndex.surface })} ha
							</BigNumber>
							<span
								style={{textTransform: 'lowercase'}}
								className={`fr-badge ${
									landImperStockIndex.flux_surface >= 0
										? "fr-badge--error"
										: "fr-badge--success"
								} fr-badge--error fr-badge--sm fr-badge--no-icon`}
							>
								{formatNumber({
									number: landImperStockIndex.flux_surface,
									addSymbol: true,
								})}{" "}
								ha
								{landImperStockIndex.flux_surface >= 0 ? (
									<i className="bi bi-arrow-up-right fr-ml-1w" />
								) : (
									<i className="bi bi-arrow-down-right fr-ml-1w" />
								)}
							</span>
						</div>
						<div className="fr-col-12 fr-col-md-5">
							<MillesimeDisplay 
								is_interdepartemental={is_interdepartemental}
								landArtifStockIndex={landImperStockIndex}
								between={true}
								className="fr-text--sm fr-ml-1w"
							/>
							<BigNumber className="fr-mt-3w">
								{formatNumber({ number: landImperStockIndex.percent })}%
							</BigNumber>
							<p>du territoire est imperméabilisé</p>
						</div>
					</div>
					<ChartDetails
						sources={['ocsge']}
						chartId="imper_last_millesime"
					/>
				</div>
			</div>
			<div className="fr-col-12 fr-col-lg-4">
				<Guide
					title="Comprendre les données"
					column
				>
					<p>En {years_artif.join(", ")}, sur le territoire de {name}, <strong>{formatNumber(
						{ number: landImperStockIndex.surface }
					)} ha</strong> étaient imperméabilisés, ce qui correspond à <strong>{formatNumber(
						{ number: landImperStockIndex.percent }
					)}%</strong> de la surface totale ({formatNumber({
						number: surface,
					})} ha) du territoire.</p>
					<p>La surface imperméabilisée a {
						landImperStockIndex.flux_surface >= 0
							? "augmenté"
							: "diminué"
					} de <strong>{formatNumber({
						number: landImperStockIndex.flux_surface,
					})} ha <MillesimeDisplay 
						is_interdepartemental={is_interdepartemental}
						landArtifStockIndex={landImperStockIndex}
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

export const Impermeabilisation: React.FC<ImpermeabilisationProps> = ({
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
		selectedIndex,
		setSelectedIndex,
		defaultStockIndex,
		byDepartement,
		setByDepartement,
		childLandType,
		setChildLandType,
		landImperStockIndex,
		isLoading,
		error
	} = useImpermeabilisation({
		landData
	});

	const { imperZonageIndex } = useImpermeabilisationZonage({
		landData,
		defaultStockIndex
	});

	const { has_zonage } = landData;

	if (isLoading) return <div>Chargement...</div>;
	if (error) return <div>Erreur : {error}</div>;
	if (!landData) return <div>Données non disponibles</div>;

	return (
		<div className="fr-container--fluid fr-p-3w">
			<div className="fr-mb-7w">
				<div className="fr-grid-row fr-grid-row--gutters">
					<div className="fr-col-12">
						<Guide
							title="Cadre réglementaire"
							DrawerTitle="Cadre Réglementaire"
							drawerChildren={
								<>
									<p className="fr-text--sm mb-3">Le <a rel="noopener noreferrer" target="_blank" href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048465959">Décret n° 2023-1096 du 27 novembre 2023 relatif à l'évaluation et au suivi de l'Imperméabilisation des sols</a> précise que le rapport relatif à l'Imperméabilisation des sols prévu à l'article L. 2231-1 présente, pour les années civiles sur lesquelles il porte et au moins tous les trois ans, les indicateurs et données suivants:</p>
									<ul className="fr-text--sm mb-3">
										<li>« 1° La consommation des espaces naturels, agricoles et forestiers, exprimée en nombre d'hectares, le cas échéant en la différenciant entre ces types d'espaces, et en pourcentage au regard de la superficie du territoire couvert. Sur le même territoire, le rapport peut préciser également la transformation effective d'espaces urbanisés ou construits en espaces naturels, agricoles et forestiers du fait d'une désimperméabilisation ;</li>
										<li>« 2° Le solde entre les surfaces imperméabilisées et les surfaces désimperméabilisées, telles que définies dans la nomenclature annexée à l'<a rel="noopener noreferrer" target="_blank" href="https://www.legifrance.gouv.fr/affichCodeArticle.do?cidTexte=LEGITEXT000006074075&idArticle=LEGIARTI000045729062&dateTexte=&categorieLien=cid">article R. 101-1 du code de l'urbanisme</a> ;</li>
										<li>« 3° Les surfaces dont les sols ont été rendus imperméables, au sens des 1° et 2° de la nomenclature annexée à l'<a rel="noopener noreferrer" target="_blank" href="https://www.legifrance.gouv.fr/affichCodeArticle.do?cidTexte=LEGITEXT000006074075&idArticle=LEGIARTI000045729062&dateTexte=&categorieLien=cid">article R. 101-1 du code de l'urbanisme</a> ;</li>
										<li>« 4° L'évaluation du respect des objectifs de réduction de la consommation d'espaces naturels, agricoles et forestiers et de lutte contre l'imperméabilisation des sols fixés dans les documents de planification et d'urbanisme. Les documents de planification sont ceux énumérés au <a rel="noopener noreferrer" target="_blank" href="https://www.legifrance.gouv.fr/affichCodeArticle.do?cidTexte=LEGITEXT000006074075&idArticle=LEGIARTI000045729062&dateTexte=&categorieLien=cid">III de l'article R. 101-1 du code de l'urbanisme</a>.</li>
									</ul>
									<p className="fr-text--sm mb-3">
										L'imperméabilisation des sols est donc définie comme:
									</p>
									<ul className="fr-text--sm mb-3">
										<li>1° Surfaces dont les sols sont imperméabilisés en raison du bâti (constructions, aménagements, ouvrages ou installations).</li>
										<li>2° Surfaces dont les sols sont imperméabilisés en raison d'un revêtement (Impericiel, asphalté, bétonné, couvert de pavés ou de dalles).</li>
									</ul>
									<p className="fr-text--sm mb-3">
										Au niveau national, l'imperméabilisation est mesurée par l'occupation des sols à grande échelle (OCS GE), en cours d'élaboration, dont la production sera engagée sur l'ensemble du territoire national d'ici mi 2025.
									</p>
									<p className="fr-text--sm mb-3">
										Dans la nomenclature OCS GE, les zones imperméables correspondent aux deux classes commençant par le code CS1.1.1
									</p>
								</>
							}
						>
							L'imperméabilisation des sols est définie comme: 
							<ul>
								<li>1° Surfaces dont les sols sont imperméabilisés en raison du bâti (constructions, aménagements, ouvrages ou installations).</li>
								<li>2° Surfaces dont les sols sont imperméabilisés en raison d'un revêtement (Impericiel, asphalté, bétonné, couvert de pavés ou de dalles).</li>
							</ul>
						</Guide>
					</div>
				</div>
			</div>
			<h2>
				Imperméabilisation des sols de {name}
				{" "}
				<MillesimeDisplay 
					is_interdepartemental={is_interdepartemental}
					landArtifStockIndex={landImperStockIndex}
				/>
			</h2>
			<ImperLastMillesimeSection 
				landImperStockIndex={landImperStockIndex}
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
					Répartition des surfaces imperméabilisées par type de couverture et
					d'usage
				</h2>
				<div className="bg-white fr-px-4w fr-pt-4w rounded">
					<OcsgeMillesimeSelector
						millesimes_by_index={millesimes_by_index}
						index={selectedIndex}
						setIndex={setSelectedIndex}
						byDepartement={byDepartement}
						setByDepartement={setByDepartement}
						shouldDisplayByDepartementBtn={is_interdepartemental}
					/>
					<div className="fr-grid-row fr-grid-row--gutters fr-mt-1w">
						{byDepartement ? (
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
											<DetaislCalculationOcsge />
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
											<DetaislCalculationOcsge />
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
										<DetaislCalculationOcsge />
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
					<h2>Proportion des sols imperméabilisés</h2>
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
									<DetaislCalculationOcsge />
								</OcsgeGraph>
							</div>
						</div>
						<div className="fr-col-12 fr-col-lg-4">
							<Guide
								title="Comprendre les données"
								column
							>
								<p>Cette carte permet de visualiser la proportion de sols imperméabilisés sur un territoire, représentée par l'intensité de la couleur de fond : plus la teinte est foncée, plus la part de sols imperméabilisés est élevée.</p>
								<p>L'évolution entre les deux millésimes est illustrée par des cercles, dont la taille est proportionnelle au flux d'imperméabilisation. La couleur des cercles indique le sens de ce flux : vert pour une désimperméabilisation nette, rouge pour une imperméabilisation nette.</p>
							</Guide>
						</div>
					</div>
				</div>
			)}
			<div className="fr-mb-7w">
				<h2>Carte des sols imperméabilisés</h2>
				<div className="bg-white fr-p-4w rounded">
					<p className="fr-text--sm">
						Cette cartographie permet d'explorer les couvertures et les usages
						des surfaces imperméabilisées du territoire, en fonction des
						millésimes disponibles de la donnée OCS GE.
					</p>
					{projectData && (
						<OcsgeMapContainer
							landData={landData}
							globalFilter={["==", ["get", "is_impermeable"], true]}
						/>
					)}
				</div>
			</div>
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

