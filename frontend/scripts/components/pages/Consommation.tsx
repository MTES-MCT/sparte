import React from "react";
import Guide from "@components/ui/Guide";
import { ConsoGraph } from "@components/charts/conso/ConsoGraph";
import { LandDetailResultType } from "@services/types/land";
import { formatNumber } from "@utils/formatUtils";
import Card from "@components/ui/Card";
import { useGetLandConsoStatsQuery, useGetLandPopStatsQuery } from "@services/api";

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
			{/* Sélecteur de période */}
			<div className="fr-mb-5w">
				<div className="bg-white fr-p-3w rounded">
					<h4 className="fr-mb-3w">Période d'analyse</h4>
					<div className="fr-grid-row fr-grid-row--gutters">
						<div className="fr-col-12 fr-col-md-6">
							<div className="fr-select-group">
								<label className="fr-label" htmlFor="start-year">
									Année de début
								</label>
								<select
									className="fr-select"
									id="start-year"
									value={startYear}
									onChange={(e) => setStartYear(Number(e.target.value))}
								>
									{yearOptions.map((year) => (
										<option key={year} value={year} disabled={year >= endYear}>
											{year}
										</option>
									))}
								</select>
							</div>
						</div>
						<div className="fr-col-12 fr-col-md-6">
							<div className="fr-select-group">
								<label className="fr-label" htmlFor="end-year">
									Année de fin
								</label>
								<select
									className="fr-select"
									id="end-year"
									value={endYear}
									onChange={(e) => setEndYear(Number(e.target.value))}
								>
									{yearOptions.map((year) => (
										<option key={year} value={year} disabled={year <= startYear}>
											{year}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>
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
						<DetailsCalculationFichiersFonciers />
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
								<DetailsCalculationFichiersFonciers />
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
								<DetailsCalculationFichiersFonciers />
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
		</div>
	);
};

export default Consommation;
