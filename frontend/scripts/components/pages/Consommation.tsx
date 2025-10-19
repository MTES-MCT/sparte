import React from "react";
import Guide from "@components/ui/Guide";
import { ConsoGraph } from "@components/charts/conso/ConsoGraph";
import { LandDetailResultType } from "@services/types/land";
import { formatNumber } from "@utils/formatUtils";
import Card from "@components/ui/Card";
import { useGetLandConsoStatsQuery, useGetLandPopStatsQuery, useGetSimilarTerritoriesQuery } from "@services/api";
import SearchBar, { Territory } from "@components/ui/SearchBar";

interface ConsommationProps {
	landData: LandDetailResultType;
}

const DetailsCalculationFichiersFonciers: React.FC = () => (
	<div>
		<h6 className="fr-mb-0">Calcul</h6>
		<p className="fr-text--sm fr-mb-0">Données brutes, sans calcul</p>
	</div>
);

// Dates par défaut pour l'analyse
const DEFAULT_START_YEAR = 2011;
const DEFAULT_END_YEAR = 2023;

export const Consommation: React.FC<ConsommationProps> = ({
	landData,
}) => {
	const { land_id, land_type, name, surface } = landData || {};

	// State local pour gérer les années sélectionnées
	const [startYear, setStartYear] = React.useState(DEFAULT_START_YEAR);
	const [endYear, setEndYear] = React.useState(DEFAULT_END_YEAR);

	// State pour gérer les territoires de comparaison additionnels
	const [additionalTerritories, setAdditionalTerritories] = React.useState<Territory[]>([]);

	// Fonctions pour gérer les territoires additionnels
	const handleAddTerritory = (territory: Territory) => {
		// Vérifier si le territoire n'est pas déjà dans la liste et n'est pas le territoire actuel
		if (
			!additionalTerritories.find(t => t.source_id === territory.source_id && t.land_type === territory.land_type) &&
			!(territory.source_id === land_id && territory.land_type === land_type)
		) {
			setAdditionalTerritories([...additionalTerritories, territory]);
		}
	};

	const handleRemoveTerritory = (territory: Territory) => {
		setAdditionalTerritories(
			additionalTerritories.filter(t => !(t.source_id === territory.source_id && t.land_type === territory.land_type))
		);
	};

	const handleResetToSuggestedTerritories = () => {
		// Vider la liste des territoires additionnels pour revenir aux territoires suggérés par défaut
		setAdditionalTerritories([]);
	};

	// Vérifier si la sélection correspond exactement aux territoires suggérés
	const isDefaultSelection = React.useMemo(() => {
		// S'il n'y a pas de territoires ajoutés, c'est la sélection par défaut
		if (additionalTerritories.length === 0) {
			return true;
		}

		// S'il y a des territoires ajoutés, ce n'est plus la sélection par défaut
		return false;
	}, [additionalTerritories]);

	// Construire la liste des territoires de comparaison pour les graphiques
	const comparisonLandIds = additionalTerritories.length > 0
		? additionalTerritories.map(t => `${t.land_type}_${t.source_id}`).join(',')
		: null;

	// Récupérer la consommation totale de la période
	const { data: consoStats, isLoading: isLoadingConsoStats, isFetching: isFetchingConsoStats } = useGetLandConsoStatsQuery({
		land_id,
		land_type,
		from_year: startYear,
		to_year: endYear,
	});

	// Récupérer les statistiques de population
	const { data: popStats, isLoading: isLoadingPopStats, isFetching: isFetchingPopStats } = useGetLandPopStatsQuery({
		land_id,
		land_type,
		from_year: startYear,
		to_year: endYear,
	});

	// Récupérer les territoires similaires pour suggestions
	const { data: similarTerritoriesData } = useGetSimilarTerritoriesQuery({
		land_id,
		land_type,
	});

	// Convertir m² en ha (diviser par 10000)
	const totalConsoHa = consoStats?.[0]?.total ? consoStats[0].total / 10000 : null;

	// Récupérer l'évolution de la population
	const populationEvolution = popStats?.[0]?.evolution || null;
	const populationEvolutionPercent = popStats?.[0]?.evolution_percent || null;

	// Afficher "..." pendant le chargement initial ou le refetch
	const isLoadingConso = isLoadingConsoStats || isFetchingConsoStats;
	const isLoadingPop = isLoadingPopStats || isFetchingPopStats;

	// Générer les options d'années (2009 à 2023 par exemple)
	const minYear = 2009;
	const maxYear = 2023;
	const yearOptions = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

	if (!landData) return <div role="status" aria-live="polite">Données non disponibles</div>;

	return (
		<div className="fr-container--fluid fr-p-3w">
			{/* Sélecteur de période sticky */}
			<div
				style={{
					position: 'fixed',
					bottom: '24px',
					right: '24px',
					zIndex: 1000,
					maxWidth: '320px',
				}}
			>
				<div
					className="bg-white rounded"
					style={{
						boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
						border: '1px solid #e5e5e5',
						padding: '1.25rem',
					}}
				>
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
						<span className="fr-icon-calendar-line" style={{ color: '#6a6af4', fontSize: '1.25rem' }} aria-hidden="true"></span>
						<h6 className="fr-mb-0" style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#161616' }}>
							Période d'analyse
						</h6>
					</div>

					<div className="fr-grid-row fr-grid-row--gutters" style={{ marginBottom: '0.75rem' }}>
						<div className="fr-col-6">
							<label className="fr-label" htmlFor="start-year" style={{ fontSize: '0.75rem', marginBottom: '0.375rem', fontWeight: 500 }}>
								Début
							</label>
							<select
								className="fr-select"
								id="start-year"
								value={startYear}
								onChange={(e) => setStartYear(Number(e.target.value))}
								style={{
									fontSize: '0.875rem',
									padding: '0.375rem 0.5rem',
									borderColor: '#6a6af4',
								}}
							>
								{yearOptions.map((year) => (
									<option key={year} value={year} disabled={year >= endYear}>
										{year}
									</option>
								))}
							</select>
						</div>
						<div className="fr-col-6">
							<label className="fr-label" htmlFor="end-year" style={{ fontSize: '0.75rem', marginBottom: '0.375rem', fontWeight: 500 }}>
								Fin
							</label>
							<select
								className="fr-select"
								id="end-year"
								value={endYear}
								onChange={(e) => setEndYear(Number(e.target.value))}
								style={{
									fontSize: '0.875rem',
									padding: '0.375rem 0.5rem',
									borderColor: '#6a6af4',
								}}
							>
								{yearOptions.map((year) => (
									<option key={year} value={year} disabled={year <= startYear}>
										{year}
									</option>
								))}
							</select>
						</div>
					</div>

					{(startYear !== DEFAULT_START_YEAR || endYear !== DEFAULT_END_YEAR) && (
						<button
							onClick={() => {
								setStartYear(DEFAULT_START_YEAR);
								setEndYear(DEFAULT_END_YEAR);
							}}
							className="fr-btn fr-btn--sm fr-btn--tertiary-no-outline"
							style={{
								width: '100%',
								fontSize: '0.75rem',
								padding: '0.375rem',
							}}
						>
							<span className="fr-icon-refresh-line" aria-hidden="true" style={{ marginRight: '0.25rem' }}></span>
							Réinitialiser ({DEFAULT_START_YEAR}-{DEFAULT_END_YEAR})
						</button>
					)}
				</div>
			</div>

			{/* Section statistiques principales */}
			<div className="fr-grid-row fr-grid-row--gutters fr-mb-5w">
				<div className="fr-col-12 fr-col-md-6">
					<Card
						icon="bi-geo-alt"
						badgeClass="fr-badge--info"
						badgeLabel="Surface du territoire"
						value={`${formatNumber({ number: surface })} ha`}
						label={name}
					/>
				</div>
				<div className="fr-col-12 fr-col-md-6">
					<Card
						icon="bi-graph-up"
						badgeClass="fr-badge--warning"
						badgeLabel="Consommation d'espaces NAF"
						value={isLoadingConso || totalConsoHa === null ? '...' : `${formatNumber({ number: totalConsoHa })} ha`}
						label={`Période d'analyse ${startYear} - ${endYear}`}
					/>
				</div>
			</div>

			{/* Consommation annuelle */}
			<div className="fr-mt-7w">
				<h3 id="conso-annuelle">Consommation d'espaces NAF annuelle sur le territoire</h3>

				<div className="bg-white fr-p-2w rounded">
					<ConsoGraph
						id="annual_total_conso_chart"
						land_id={land_id}
						land_type={land_type}
						params={{
							start_date: String(startYear),
							end_date: String(endYear),
						}}
						sources={['majic']}
						showDataTable={true}
					>
						<div>
							<h6 className="fr-mb-0">Source</h6>
							<p className="fr-text--sm fr-mb-0">
								Les données proviennent des <strong>fichiers fonciers</strong> (Cerema, d'après DGFiP),
								millésimes 2009 à 2023. Il s'agit d'une photographie du territoire au 1er janvier de chaque année.
							</p>
							<h6 className="fr-mb-2w fr-mt-2w">Calcul</h6>
							<p className="fr-text--sm fr-mb-0">Données brutes, sans calcul</p>
						</div>
					</ConsoGraph>
				</div>
			</div>

			{/* Destinations de la consommation */}
			<div className="fr-mt-7w">
				<h3 id="determinants-conso">Destinations de la consommation d'espaces NAF</h3>

				<div className="fr-grid-row fr-grid-row--gutters">
					<div className="fr-col-12 fr-col-lg-4">
						<div className="bg-white fr-p-2w rounded h-100">
							<ConsoGraph
								id="pie_determinant"
								land_id={land_id}
								land_type={land_type}
								params={{
									start_date: String(startYear),
									end_date: String(endYear),
								}}
								sources={['majic']}
								showDataTable={true}
							>
								<div>
									<h6 className="fr-mb-0">Source</h6>
									<p className="fr-text--sm fr-mb-0">
										Les données proviennent des <strong>fichiers fonciers</strong> (Cerema, d'après DGFiP).
									</p>
									<p className="fr-text--sm fr-mb-0">
										La ligne "inconnu" comprend les éléments dont la destination n'est pas définie dans les fichiers fonciers.
									</p>
									<h6 className="fr-mb-2w fr-mt-2w">Calcul</h6>
									<p className="fr-text--sm fr-mb-0">Données brutes, sans calcul</p>
								</div>
							</ConsoGraph>
						</div>
					</div>
					<div className="fr-col-12 fr-col-lg-8">
						<div className="bg-white fr-p-2w rounded h-100">
							<ConsoGraph
								id="chart_determinant"
								land_id={land_id}
								land_type={land_type}
								params={{
									start_date: String(startYear),
									end_date: String(endYear),
								}}
								sources={['majic']}
								showDataTable={true}
							>
								<div>
									<h6 className="fr-mb-0">Source</h6>
									<p className="fr-text--sm fr-mb-0">
										Les données proviennent des <strong>fichiers fonciers</strong> (Cerema, d'après DGFiP).
									</p>
									<p className="fr-text--sm fr-mb-0">
										La ligne "inconnu" comprend les éléments dont la destination n'est pas définie dans les fichiers fonciers.
									</p>
									<h6 className="fr-mb-2w fr-mt-2w">Calcul</h6>
									<p className="fr-text--sm fr-mb-0">Données brutes, sans calcul</p>
								</div>
							</ConsoGraph>
						</div>
					</div>
				</div>
			</div>

			{/* Consommation et démographie */}
			<div className="fr-mt-7w">
				<h3 id="conso-demographie">Consommation d'espaces NAF et démographie</h3>

				{/* Cards statistiques démographie et consommation */}
				<div className="fr-grid-row fr-grid-row--gutters fr-mb-5w">
					<div className="fr-col-12 fr-col-md-6">
						<Card
							icon="bi-people"
							badgeClass="fr-badge--success"
							badgeLabel="Évolution de la population"
							value={
								isLoadingPop || populationEvolution === null
									? '...'
									: `${populationEvolution > 0 ? '+' : ''}${formatNumber({ number: populationEvolution })} hab${
										populationEvolutionPercent !== null
											? ` (${populationEvolutionPercent > 0 ? '+' : ''}${formatNumber({ number: populationEvolutionPercent, decimals: 1 })}%)`
											: ''
									}`
							}
							label={`Période d'analyse ${startYear} - ${endYear}`}
						/>
					</div>
					<div className="fr-col-12 fr-col-md-6">
						<Card
							icon="bi-graph-up"
							badgeClass="fr-badge--warning"
							badgeLabel="Consommation totale"
							value={isLoadingConso || totalConsoHa === null ? '...' : `${formatNumber({ number: totalConsoHa })} ha`}
							label={`Période d'analyse ${startYear} - ${endYear}`}
						/>
					</div>
				</div>

				<div className="fr-grid-row fr-grid-row--gutters">
					<div className="fr-col-12 fr-col-lg-8">
						<div className="bg-white fr-p-2w rounded">
							<ConsoGraph
								id="population_density_chart"
								land_id={land_id}
								land_type={land_type}
								params={{
									start_date: String(DEFAULT_START_YEAR),
									end_date: String(DEFAULT_END_YEAR),
								}}
								sources={['majic', 'insee']}
								showDataTable={true}
							>
								<div>
									<h6 className="fr-mb-0">Calcul</h6>
									<p className="fr-text--sm fr-mb-0">
										La densité de population est le rapport entre l'effectif de population du territoire et sa superficie.
									</p>
								</div>
							</ConsoGraph>
						</div>
					</div>

					<div className="fr-col-12 fr-col-lg-4">
						<Guide
							title="Comprendre les données"
							column
						>
							<p>
								La densité de population est le rapport entre l'effectif de population du territoire et sa superficie.
								Par souci de cohérence avec le reste des indicateurs, nous avons choisi de l'exprimer en habitants par hectare.
							</p>
						</Guide>
					</div>
				</div>

				<div className="fr-mt-5w">
					<div className="bg-white fr-p-2w rounded">
						<ConsoGraph
							id="population_conso_progression_chart"
							land_id={land_id}
							land_type={land_type}
							params={{
								start_date: String(startYear),
								end_date: String(endYear),
							}}
							sources={['majic', 'insee']}
							showDataTable={true}
						>
							<div>
								<h6 className="fr-mb-0">Calcul</h6>
								<p className="fr-text--sm fr-mb-0">Données brutes, sans calcul</p>
								<p className="fr-text--sm fr-mb-0">
									Évolution estimée = (somme des évolutions annuelles de la population) / (nombre d'années)
								</p>
							</div>
						</ConsoGraph>
					</div>
				</div>
			</div>

			{/* Comparaison avec les territoires similaires */}
			<div className="fr-mt-7w">
				<h3 id="conso-comparaison">Comparaison avec les territoires similaires</h3>

				<div className="fr-notice fr-notice--info fr-mb-3w">
					<div className="fr-container">
						<div className="fr-notice__body">
							<p className="fr-notice__title">À propos des territoires similaires</p>
							<p className="fr-text--sm fr-mb-0">
								Les territoires présentés ci-dessous ont été automatiquement sélectionnés en fonction de leur similarité avec {name}.
								La sélection se base sur deux critères principaux : la population (critère prioritaire) et la proximité géographique.
								Pour les communes de moins de 100 000 habitants, seuls les territoires du même département sont comparés.
							</p>
						</div>
					</div>
				</div>

				{/* Sélecteur de territoires additionnels */}
				<div className="bg-white fr-p-3w rounded fr-mb-3w">
					<h5 className="fr-mb-2w">Ajouter des territoires à la comparaison</h5>
					<p className="fr-text--sm fr-mb-2w" style={{ color: '#666' }}>
						Recherchez et ajoutez d'autres territoires pour enrichir la comparaison
					</p>
					<SearchBar
						onTerritorySelect={handleAddTerritory}
						excludeTerritoryId={land_id}
						excludeLandType={land_type}
					/>

					{/* Territoires similaires suggérés */}
					{similarTerritoriesData && similarTerritoriesData.length > 0 && (
						<div className="fr-mt-3w">
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
								<p className="fr-text--sm fr-mb-0" style={{ fontWeight: 500, color: '#666' }}>
									Territoires similaires suggérés :
								</p>
								{!isDefaultSelection && (
									<button
										onClick={handleResetToSuggestedTerritories}
										className="fr-btn fr-btn--sm fr-btn--secondary"
										style={{
											padding: '0.25rem 0.75rem',
											fontSize: '0.75rem',
										}}
									>
										Réinitialiser les territoires suggérés
									</button>
								)}
							</div>
							<div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
								{similarTerritoriesData
									.filter((st: any) => st.similar_land_id !== land_id) // Exclure le territoire actuel
									.map((st: any) => {
										const territory: Territory = {
											id: 0,
											source_id: st.similar_land_id,
											land_type: land_type,
											name: st.similar_land_name,
											public_key: '',
											area: 0,
											land_type_label: '',
										};
										const isAlreadyAdded = additionalTerritories.find(
											t => t.source_id === territory.source_id && t.land_type === territory.land_type
										);
										return (
											<button
												key={`${st.similar_land_id}`}
												onClick={() => handleAddTerritory(territory)}
												disabled={!!isAlreadyAdded}
												className="fr-badge fr-badge--sm"
												style={{
													background: isAlreadyAdded ? '#e5e5e5' : '#f5f5fe',
													color: isAlreadyAdded ? '#929292' : '#6a6af4',
													border: isAlreadyAdded ? '1px solid #e5e5e5' : '1px solid #e3e3fd',
													cursor: isAlreadyAdded ? 'not-allowed' : 'pointer',
													padding: '0.25rem 0.5rem',
													fontSize: '0.75rem',
													display: 'flex',
													alignItems: 'center',
													gap: '0.25rem'
												}}
												aria-label={`Ajouter ${territory.name} à la comparaison`}
											>
												{!isAlreadyAdded && <span style={{ fontSize: '0.875rem' }}>+</span>}
												<span>{territory.name}</span>
											</button>
										);
									}
								)}
							</div>
						</div>
					)}

					{/* Liste des territoires ajoutés */}
					{additionalTerritories.length > 0 && (
						<div className="fr-mt-3w">
							<p className="fr-text--sm fr-mb-1w" style={{ fontWeight: 500 }}>
								Territoires additionnels ({additionalTerritories.length}) :
							</p>
							<div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
								{additionalTerritories.map((territory) => (
									<div
										key={`${territory.land_type}_${territory.source_id}`}
										className="fr-badge fr-badge--sm"
										style={{
											background: '#e3e3fd',
											color: '#4318FF',
											display: 'flex',
											alignItems: 'center',
											gap: '0.5rem',
											padding: '0.25rem 0.5rem'
										}}
									>
										<span>{territory.name}</span>
										<button
											onClick={() => handleRemoveTerritory(territory)}
											style={{
												background: 'none',
												border: 'none',
												cursor: 'pointer',
												padding: 0,
												color: '#4318FF',
												fontSize: '1rem',
												lineHeight: 1
											}}
											aria-label={`Retirer ${territory.name}`}
										>
											×
										</button>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				<div className="fr-grid-row fr-grid-row--gutters">
					<div className="fr-col-12 fr-col-lg-6">
						<div className="bg-white fr-p-2w rounded h-100">
							<ConsoGraph
								id="comparison_chart"
								land_id={land_id}
								land_type={land_type}
								params={{
									start_date: String(startYear),
									end_date: String(endYear),
									...(comparisonLandIds && { comparison_lands: comparisonLandIds }),
								}}
								sources={['majic']}
								showDataTable={true}
							>
								<div>
									<h6 className="fr-mb-0">À propos</h6>
									<p className="fr-text--sm fr-mb-0">
										Ce graphique compare la consommation d'espaces NAF de votre territoire avec celle de territoires similaires,
										sélectionnés en fonction de leur population et de leur proximité géographique.
									</p>
									<p className="fr-text--sm fr-mb-0">
										Cliquez sur un territoire pour voir le détail année par année de sa consommation.
									</p>
								</div>
							</ConsoGraph>
						</div>
					</div>
					<div className="fr-col-12 fr-col-lg-6">
						<div className="bg-white fr-p-2w rounded h-100">
							<ConsoGraph
								id="surface_proportional_chart"
								land_id={land_id}
								land_type={land_type}
								params={{
									start_date: String(startYear),
									end_date: String(endYear),
									...(comparisonLandIds && { comparison_lands: comparisonLandIds }),
								}}
								sources={['majic']}
								showDataTable={true}
							>
								<div>
									<h6 className="fr-mb-0">À propos</h6>
									<p className="fr-text--sm fr-mb-0">
										Ce graphique compare la consommation d'espaces NAF proportionnelle à la surface totale du territoire.
										Les territoires sont représentés sous forme de treemap où la taille reflète la surface du territoire.
									</p>
								</div>
							</ConsoGraph>
						</div>
					</div>
				</div>

				<div className="fr-mt-5w">
					<div className="bg-white fr-p-2w rounded">
						<ConsoGraph
							id="population_conso_comparison_chart"
							land_id={land_id}
							land_type={land_type}
							params={{
								start_date: String(startYear),
								end_date: String(endYear),
								...(comparisonLandIds && { comparison_lands: comparisonLandIds }),
							}}
							sources={['majic', 'insee']}
							showDataTable={true}
						>
							<div>
								<h6 className="fr-mb-0">À propos</h6>
								<p className="fr-text--sm fr-mb-0">
									Ce graphique compare la consommation d'espaces NAF au regard de l'évolution démographique.
									La taille des bulles représente la population totale de chaque territoire.
									La ligne médiane indique le ratio médian entre évolution démographique et consommation d'espaces.
								</p>
							</div>
						</ConsoGraph>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Consommation;
